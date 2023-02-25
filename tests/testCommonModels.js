const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

let testCompanyIds = [];

async function commonBeforeAll() {
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM companies");
    await db.query("DELETE FROM company_admins");
    await db.query("DELETE FROM company_users");
    await db.query("DELETE FROM containers");
    await db.query("DELETE FROM counts");
    await db.query("DELETE FROM notes");


    const company = await db.query(`INSERT INTO companies (name) 
                                    VALUES ('testco')
                                    RETURNING id`);
    testCompanyIds.splice(0, 0, ...company.rows.map(r => r.id));

    await db.query(`
    INSERT INTO users (id, email, password, first_name, last_name, super_admin)
    VALUES ('test1',
            'test1@test.com',
            $1,
            'Bob',
            'Testy',
            TRUE),
            ('test2',
            'test2@test.com',
            $1,
            'Barb',
            'Tasty',
            FALSE),
            ('test3',
            null,
            null,
            'Bulb',
            'Toasty',
            FALSE)`,
            [await bcrypt.hash("password", BCRYPT_WORK_FACTOR)]);

    await db.query(`
    INSERT INTO company_admins (user_id, company_id, email_receiver)
    VALUES ('test2', $1, TRUE)`, [testCompanyIds[0]]);

    await db.query(`
    INSERT INTO company_users (user_id, company_id, active)
    VALUES ('test3', $1, TRUE)`, [testCompanyIds[0]]);

};

async function commonBeforeEach() {
    await db.query("BEGIN");
};
    
async function commonAfterEach() {
    await db.query("ROLLBACK");
};
    
async function commonAfterAll() {
    await db.end();
};

module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterAll,
    commonAfterEach,
    testCompanyIds
};