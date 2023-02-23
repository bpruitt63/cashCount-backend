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


    static async login(email, password) {
        const result = await db.query(
            `SELECT users.email,
                    password,
                    first_name AS "firstName",
                    last_name AS "lastName",
                    active,
                    admin
            FROM users WHERE users.email = $1`,
            [email]
        );

        let user = result.rows[0];

        if (user && !user.active) throw new UnauthorizedError("User is inactive");
        
        if (user) {
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid === true) {
                delete user.password;
                return user;
            };
        };

        throw new UnauthorizedError("Invalid email/password");
    };


    static async create({email, password, firstName, lastName, active=true, admin=false}) {

        //Check for duplicate email
        const isDupe = await db.query(
            `SELECT email
            FROM users
            WHERE email = $1`,
            [email]
        );

        if (isDupe.rows[0]) {
            throw new BadRequestError(`There is already an account
                                        associated with ${email}`);
        };

        const hashedPwd = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

        const result = await db.query(
            `INSERT INTO users
                    (email,
                    password,
                    first_name,
                    last_name,
                    active,
                    admin)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING email, first_name AS "firstName", 
                    last_name AS "lastName", active, admin`,
            [email, hashedPwd, firstName, lastName, active, admin]
        );

        const user = result.rows[0];
        return user;
    };


    static async get(email) {
        const result = await db.query(
            `SELECT users.email,
                    first_name AS "firstName",
                    last_name AS "lastName",
                    active,
                    admin
            FROM users WHERE users.email = $1`,
            [email]
        );
        const user = result.rows[0];
        if (!user) throw new NotFoundError(`No user with email ${email}`);
        return user;
    };


    static async getAll() {
        const result = await db.query(
            `SELECT users.email,
                    first_name AS "firstName",
                    last_name AS "lastName",
                    active,
                    admin
            FROM users`
        );
        const users = result.rows;

        if (!users[0]) throw new NotFoundError("No users found");
        
        return users;
    };


    static async update(email, data) {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
        };

        const { setCols, values } = sqlForPartialUpdate(
            data,
            {   firstName: "first_name",
                lastName: "last_name"
            });
        const emailVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE email = ${emailVarIdx} 
                      RETURNING email,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                active,
                                admin`;
        const result = await db.query(querySql, [...values, email]);
        const user = result.rows[0];
                            
        if (!user) throw new NotFoundError(`No user with email: ${email}`);
                            
        return user;
    };
};

module.exports = User;