const db = require("../db");
const bcrypt = require("bcrypt");
//const { sqlForPartialUpdate } = require("../helpers");
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
            const adminResult = await db.query(
                `INSERT INTO company_admins
                        (user_id, company_code, email_receiver)
                VALUES ($1, $2, $3)
                RETURNING company_code AS "companyCode", email_receiver AS "emailReceiver"`,
                [id, userCompanyCode, emailReceiver]
            );

            user.userCompanyCode = adminResult.rows[0].companyCode;
            user.adminCompanyCode = adminResult.rows[0].companyCode;
            user.emailReceiver = adminResult.rows[0].emailReceiver;

        } else if (userCompanyCode) {
            const companyResult = await db.query(
                `INSERT INTO company_users
                        (user_id, company_code, active)
                VALUES ($1, $2, $3)
                RETURNING company_code AS "companyCode", active`,
                [id, userCompanyCode, active]
            );
            user.userCompanyCode = companyResult.rows[0].companyCode;
            user.active = companyResult.rows[0].active;
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


    // static async update(email, data) {
    //     if (data.password) {
    //         data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    //     };

    //     const { setCols, values } = sqlForPartialUpdate(
    //         data,
    //         {   firstName: "first_name",
    //             lastName: "last_name"
    //         });
    //     const emailVarIdx = "$" + (values.length + 1);

    //     const querySql = `UPDATE users 
    //                   SET ${setCols} 
    //                   WHERE email = ${emailVarIdx} 
    //                   RETURNING email,
    //                             first_name AS "firstName",
    //                             last_name AS "lastName",
    //                             active,
    //                             admin`;
    //     const result = await db.query(querySql, [...values, email]);
    //     const user = result.rows[0];
                            
    //     if (!user) throw new NotFoundError(`No user with email: ${email}`);
                            
    //     return user;
    // };
};

module.exports = User;