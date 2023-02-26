const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

let testCompanyCodes = [];
let testContainerIds = [];

async function commonBeforeAll() {
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM companies");
    await db.query("DELETE FROM company_admins");
    await db.query("DELETE FROM company_users");
    await db.query("DELETE FROM containers");
    await db.query("DELETE FROM counts");
    await db.query("DELETE FROM notes");


    const company = await db.query(`INSERT INTO companies (company_code) 
                                    VALUES ('testco')
                                    RETURNING company_code`);
    testCompanyCodes.splice(0, 0, ...company.rows.map(r => r.company_code));

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
    INSERT INTO company_admins (user_id, company_code, email_receiver)
    VALUES ('test2', $1, TRUE)`, [testCompanyCodes[0]]);

    await db.query(`
    INSERT INTO company_users (user_id, company_code, active)
    VALUES ('test3', $1, TRUE)`, [testCompanyCodes[0]]);

    const resultContainers = await db.query(`
    INSERT INTO containers (name, company_code, target, pos_threshold, neg_threshold)
    VALUES ('testContainer1', $1, 100.00, 5.00, 2.00),
    ('testContainer2', $1, 150.00, 5.00, 2.25) RETURNING id`, [testCompanyCodes[0]]);
    testContainerIds.splice(0, 0, ...resultContainers.rows.map(r => r.id));

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
    testCompanyCodes,
    testContainerIds
};