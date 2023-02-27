const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

let testCompanyCodes = [];
let testContainerIds = [];

const date1 = new Date('26 February 2023 13:00:00');
const date2 = new Date('1 March 2023 5:00:00');
const date3 = new Date('8 March 2023 18:00:00');
const stamp1 = date1.getTime();
const stamp2 = date2.getTime();
const stamp3 = date3.getTime();

async function commonBeforeAll() {
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM companies");
    await db.query("DELETE FROM company_admins");
    await db.query("DELETE FROM company_users");
    await db.query("DELETE FROM containers");
    await db.query("DELETE FROM counts");


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

    await db.query(`
    INSERT INTO counts (container_id, cash, time, timestamp, note, user_id)
    VALUES ($1, 500, $2, $3, 'testNote', 'test1')`,[testContainerIds[0], date1, stamp1]);

    await db.query(`
    INSERT INTO counts (container_id, cash, time, timestamp, note, user_id)
    VALUES ($1, 550, $2, $3, null, 'test2')`,[testContainerIds[0], date2, stamp2]);

    await db.query(`
    INSERT INTO counts (container_id, cash, time, timestamp, note, user_id)
    VALUES ($1, 70, $2, $3, null, 'test3')`,[testContainerIds[0], date3, stamp3]);

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
    testContainerIds,
    stamp1,
    stamp2,
    stamp3
};