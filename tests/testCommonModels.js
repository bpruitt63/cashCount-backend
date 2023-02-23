const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

async function commonBeforeAll() {
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM containers");
    await db.query("DELETE FROM counts");
    await db.query("DELETE FROM notes");

    await db.query(`
    INSERT INTO users (email, password, first_name, last_name, active, admin)
    VALUES ('test1@test.com',
            $1,
            'Bob',
            'Testy',
            TRUE,
            TRUE),
            ('test2@test.com',
            $1,
            'Barb',
            'Tasty',
            TRUE,
            FALSE),
            ('test3@test.com',
            $1,
            'Bulb',
            'Toasty',
            FALSE,
            FALSE)`,
            [await bcrypt.hash("password", BCRYPT_WORK_FACTOR)]);
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
    commonAfterEach
};