const db = require("../db.js");
const User = require("../models/user");
const Company = require('../models/company');
const Container = require('../models/container');
const { createToken } = require("../helpers");


let testContainerIds = [];

async function commonBeforeAll() {
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM companies");
    await db.query("DELETE FROM company_admins");
    await db.query("DELETE FROM company_users");
    await db.query("DELETE FROM containers");
    await db.query("DELETE FROM counts");


    await Company.create('testco');
    await Company.create('otherTestco')

    await User.create({
        id: 'test1',
        email: "test1@test.com",
        firstName: "Bob",
        lastName: "Testy",
        password: "password1",
        superAdmin: true
    });
    await User.create({
        id: 'test2',
        email: "test2@test.com",
        firstName: "Barb",
        lastName: "Tasty",
        password: "password1",
        superAdmin: false,
        userCompanyCode: 'testco',
        active: true,
        companyAdmin: true,
        emailReceiver: true
    });
    await User.create({
        id: 'test3',
        firstName: "Bulb",
        lastName: "Toasty",
        superAdmin: false,
        userCompanyCode: 'testco'
    });
    await User.create({
        id: 'test4',
        firstName: "Breb",
        lastName: "Touchy",
        superAdmin: false,
        userCompanyCode: 'testco',
        password: 'password1',
        active: false
    });
    await User.create({
        id: 'test5',
        firstName: "Bib",
        lastName: "Trappy",
        superAdmin: false,
        userCompanyCode: 'otherTestco',
        active: true
    });

    const testContainer1 = (await Container.create({
        name: 'testContainer1',
        companyCode: 'testco',
        target: 500.00,
        posThreshold: 5.00,
        negThreshold: 2.00
    })).id;

    const testContainer2 = (await Container.create({
        name: 'testContainer2',
        companyCode: 'testco',
        target: 550.00,
        posThreshold: 5.50,
        negThreshold: 2.50
    })).id;

    const testContainer3 = (await Container.create({
        name: 'testContainer3',
        companyCode: 'otherTestco',
        target: 550.00,
        posThreshold: 5.50,
        negThreshold: 2.50
    })).id;
    testContainerIds.push(testContainer1, testContainer2, testContainer3);
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


const bobToken = createToken({id: 'test1',
                                email: "test1@test.com",
                                firstName: "Bob",
                                lastName: "Testy",
                                password: "password1",
                                superAdmin: true});
const barbToken = createToken({id: 'test2',
                                email: "test2@test.com",
                                firstName: "Barb",
                                lastName: "Tasty",
                                password: "password1",
                                superAdmin: false,
                                userCompanyCode: 'testco',
                                adminCompanyCode: 'testco',
                                active: true,
                                emailReceiver: true});


module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testContainerIds,
    bobToken,
    barbToken
};