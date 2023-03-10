const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const { BCRYPT_WORK_FACTOR } = require("../config");

class User {


    static async login(id, password) {

        const superAdmin = await db.query(
            `SELECT id,
                    email,
                    password,
                    first_name AS "firstName",
                    last_name AS "lastName",
                    super_admin AS "superAdmin"
            FROM users WHERE id = $1`,
            [id]
        );

        let user = superAdmin.rows[0];

        if (user && !user.superAdmin) {
            const result = await db.query(
                `SELECT company_code AS "companyCode",
                        email_receiver AS "emailReceiver"
                FROM company_admins WHERE user_id = $1`,
                [id]
            );

            if (!result.rows[0]) throw new UnauthorizedError('User is not admin');

            user.adminCompanyCode = result.rows[0].companyCode;
            user.userCompanyCode = result.rows[0].companyCode;
            user.emailReceiver = result.rows[0].emailReceiver;
            user.active = true;
        };
        
        if (user) {
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid === true) {
                delete user.password;
                return user;
            };
        };

        throw new UnauthorizedError("Invalid email/password");
    };


    static async create({id, email=null, password=null, firstName, 
                        lastName, userCompanyCode=null, superAdmin=false,
                        companyAdmin=false, emailReceiver=false, active=true}) {

        //Check for duplicate id
        const isDupe = await db.query(
            `SELECT id
            FROM users
            WHERE id = $1`,
            [id]
        );

        if (isDupe.rows[0]) {
            throw new BadRequestError(`There is already a
                                        user with id: ${id}`);
        };

        let hashedPwd = null;
        if (password) {
            hashedPwd = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
        };

        const result = await db.query(
            `INSERT INTO users
                    (id,
                    email,
                    password,
                    first_name,
                    last_name,
                    super_admin)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, email, first_name AS "firstName", 
                    last_name AS "lastName", super_admin AS "superAdmin"`,
            [id, email, hashedPwd, firstName, lastName, superAdmin]
        );

        const user = result.rows[0];

        if (companyAdmin) {

            const adminResult = await this.addCompanyAdmin(id, userCompanyCode, emailReceiver);

            user.userCompanyCode = adminResult.adminCompanyCode;
            user.adminCompanyCode = adminResult.adminCompanyCode;
            user.emailReceiver = adminResult.emailReceiver;
            user.active = true;

        } else if (userCompanyCode) {

            const companyResult = await this.addCompanyUser(id, userCompanyCode, active);

            user.userCompanyCode = companyResult.userCompanyCode;
            user.active = companyResult.active;
        };

        return user;
    };


    static async get(id) {

        const result = await db.query(
            `SELECT users.id,
                    email,
                    first_name AS "firstName",
                    last_name AS "lastName",
                    super_admin AS "superAdmin",
                    company_admins.company_code AS "adminCompanyCode",
                    email_receiver AS "emailReceiver",
                    company_users.company_code AS "userCompanyCode",
                    active
            FROM users LEFT JOIN company_admins ON
                users.id = company_admins.user_id
                LEFT JOIN company_users on company_users.user_id = users.id
                WHERE users.id = $1`,
            [id]
        );
        const user = result.rows[0];
        if (!user) throw new NotFoundError(`No user with id: ${id}`);

        if (user.adminCompanyCode) {
            user.userCompanyCode = user.adminCompanyCode;
            user.active = true;
        };

        return user;
    };


    static async getAll(companyCode) {
        const result = await db.query(
            `SELECT users.id,
                    email,
                    first_name AS "firstName",
                    last_name AS "lastName",
                    super_admin AS "superAdmin",
                    company_admins.company_code AS "adminCompanyCode",
                    email_receiver AS "emailReceiver",
                    company_users.company_code AS "userCompanyCode",
                    active
            FROM users LEFT JOIN company_users ON 
                users.id = company_users.user_id 
                LEFT JOIN company_admins ON company_admins.user_id =
                users.id WHERE company_users.company_code = $1
                OR company_admins.company_code = $1`,
            [companyCode]
        );
        const users = result.rows;
        for (let user of users) {
            if (user.adminCompanyCode) {
                user.userCompanyCode = user.adminCompanyCode;
                user.active = true;
            };
        };

        if (!users[0]) throw new NotFoundError("No users found");
        
        return users;
    };


    static async updateUserInfo(id, data) {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
        };

        const { setCols, values } = sqlForPartialUpdate(
            data,
            {   firstName: "first_name",
                lastName: "last_name",
                superAdmin: "super_admin"
            });
        const idVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id,
                                email,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                super_admin AS "superAdmin"`;
        const result = await db.query(querySql, [...values, id]);
        const user = result.rows[0];
                            
        if (!user) throw new NotFoundError(`No user with id: ${id}`);
                            
        return user;
    };

    static async addCompanyAdmin(id, companyCode, emailReceiver) {
        
        const result = await db.query(
            `INSERT INTO company_admins
                    (user_id, company_code, email_receiver)
            VALUES ($1, $2, $3)
            RETURNING user_id AS "id",
                    company_code AS "adminCompanyCode", 
                    email_receiver AS "emailReceiver"`,
            [id, companyCode, emailReceiver]
        );

        const companyAdmin = result.rows[0];
        if (!companyAdmin) throw new BadRequestError('Failed to add admin to company');

        await db.query(
            `DELETE FROM company_users
            WHERE user_id = $1 AND company_code = $2`,
            [id, companyCode]
        );

        return companyAdmin;
    };

    static async addCompanyUser(id, companyCode, active) {

        const result = await db.query(
            `INSERT INTO company_users
                    (user_id, company_code, active)
            VALUES ($1, $2, $3)
            RETURNING user_id AS "id", company_code AS "userCompanyCode", active`,
            [id, companyCode, active]
        );

        const companyUser = result.rows[0];
        if (!companyUser) throw new BadRequestError('Failed to add user to company');

        return companyUser;
    };

    static async removeCompanyAdmin(id, companyCode, active) {

        await db.query(
            `DELETE FROM company_admins
            WHERE user_id = $1 AND company_code = $2`,
            [id, companyCode]
        );

        const user = await this.addCompanyUser(id, companyCode, active);
        return user;
    };

    static async updateCompanyAdmin(id, companyCode, emailReceiver) {

        const results = await db.query(
            `UPDATE company_admins
            SET email_receiver = $1
            WHERE user_id = $2 AND company_code = $3
            RETURNING user_id AS "id", email_receiver AS "emailReceiver",
            company_code AS "adminCompanyCode"`,
            [emailReceiver, id, companyCode]
        );

        const updated = results.rows[0];
        if (!updated) throw new BadRequestError('Failed to update user');
        return updated;
    };

    static async updateCompanyUser(id, companyCode, active) {

        const results = await db.query(
            `UPDATE company_users
            SET active = $1
            WHERE user_id = $2 AND company_code = $3
            RETURNING user_id AS "id", active,
            company_code AS "userCompanyCode"`,
            [active, id, companyCode]
        );

        const updated = results.rows[0];
        if (!updated) throw new BadRequestError('Failed to update user');
        return updated;
    };

    static async hasPassword(id) {

        const results = await db.query(
            `SELECT password FROM users
            WHERE id = $1`,
            [id]
        );
        const password = results.rows[0];
        return password ? true : false;
    };
};

module.exports = User;