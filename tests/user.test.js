const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");
const db = require("../db");
const User = require("../models/user");
const {
        commonBeforeAll,
        commonBeforeEach,
        commonAfterEach,
        commonAfterAll
    } = require("./testCommonModels");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// Login
describe("login", function () {

    test("works", async function () {
        const user = await User.login("test2", "password");
        expect(user).toEqual({
            id: 'test2',
            email: "test2@test.com",
            firstName: "Barb",
            lastName: "Tasty",
            superAdmin: false,
            userCompanyCode: 'testco',
            adminCompanyCode: 'testco',
            emailReceiver: true,
            active: true
        });
    });

    test("works superAdmin", async function () {
        const user = await User.login("test1", "password");
        expect(user).toEqual({
            id: 'test1',
            email: "test1@test.com",
            firstName: "Bob",
            lastName: "Testy",
            superAdmin: true
        });
    });

    test("unauth if no such user", async function () {
        try {
            await User.login("nope@nope.com", "password");
            fail();
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });

    test("unauth if wrong password", async function () {
        try {
            await User.login("test1@test.com", "wrong");
            fail();
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });

    test("unauth if non-admin", async function () {
        try {
            await User.login("test3@test.com", "password");
            fail();
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });
});

//Create
describe("create", function () {
    const newUser = {
        id: 'newb',
        firstName: "Bub",
        lastName: "Tester",
        superAdmin: false
    };

    test("works", async function () {
        let user = await User.create(newUser);
        expect(user).toEqual({...newUser, email: null});
        const found = await db.query("SELECT * FROM users WHERE id = 'newb'");
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].super_admin).toEqual(false);
        expect(found.rows[0].password).toBeNull();
    });

    test("works: adds super admin", async function () {
        const user = await User.create({
            ...newUser,
            superAdmin: true,
            email: 'test4@test.com',
            password: 'password'
        });
        expect(user).toEqual({ ...newUser, 
                                superAdmin: true,
                                email: 'test4@test.com' });
        const found = await db.query("SELECT * FROM users WHERE id = 'newb'");
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].super_admin).toEqual(true);
        expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
    });

    test("works: adds company user", async function () {
        const user = await User.create({
            ...newUser,
            userCompanyCode: 'testco'
        });
        expect(user).toEqual({ ...newUser, email: null,
                                userCompanyCode: 'testco',
                                active: true });
        const found = await db.query("SELECT * FROM users WHERE id = 'newb'");
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].super_admin).toEqual(false);
        expect(found.rows[0].password).toBeNull();
    });

    test("works: adds company admin", async function () {
        const user = await User.create({
            ...newUser,
            companyAdmin: true,
            email: 'test4@test.com',
            password: 'password',
            userCompanyCode: 'testco',
            emailReceiver: true
        });
        expect(user).toEqual({ ...newUser, 
                                userCompanyCode: 'testco',
                                adminCompanyCode: 'testco',
                                email: 'test4@test.com',
                                emailReceiver: true,
                                active: true });
        const found = await db.query("SELECT * FROM users WHERE id = 'newb'");
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].super_admin).toEqual(false);
        expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
    });

    test("bad request with dup data", async function () {
        try {
            await User.create(newUser);
            await User.create(newUser);
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

//Get
describe("get", function(){
    test("works", async function(){
        const user = await User.get('test1');
        expect(user).toEqual(
            {
                id: 'test1',
                email: "test1@test.com",
                firstName: "Bob",
                lastName: "Testy",
                superAdmin: true,
                active: null,
                adminCompanyCode: null,
                userCompanyCode: null,
                emailReceiver: null
            });
    });

    test("works company user", async function(){
        const user = await User.get('test3');
        expect(user).toEqual(
            {
                id: 'test3',
                email: null,
                firstName: "Bulb",
                lastName: "Toasty",
                active: true,
                superAdmin: false,
                adminCompanyCode: null,
                userCompanyCode: 'testco',
                emailReceiver: null
            });
    });

    test("works company admin", async function(){
        const user = await User.get('test2');
        expect(user).toEqual(
            {
                id: 'test2',
                email: "test2@test.com",
                firstName: "Barb",
                lastName: "Tasty",
                active: true,
                superAdmin: false,
                adminCompanyCode: 'testco',
                userCompanyCode: 'testco',
                emailReceiver: true
            });
    });

    test("fails no user", async function(){
        try {
            await User.get("nope");
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

//Get all
describe("getAll", function(){
    test("works", async function(){
        const users = await User.getAll('testco');
        expect(users).toEqual([{
                id: 'test2',
                email: "test2@test.com",
                firstName: "Barb",
                lastName: "Tasty",
                active: true,
                superAdmin: false,
                adminCompanyCode: 'testco',
                userCompanyCode: 'testco',
                emailReceiver: true
        },
        {
                id: 'test3',
                email: null,
                firstName: "Bulb",
                lastName: "Toasty",
                active: true,
                superAdmin: false,
                adminCompanyCode: null,
                userCompanyCode: 'testco',
                emailReceiver: null
        }]);
    });
});

//Update
describe("updateUserInfo", function () {
    const updateData = {
        email: "new@test.com",
        firstName: "NewF",
        lastName: "NewL",
        superAdmin: false
    };

    test("works", async function () {
        const user = await User.updateUserInfo("test4", updateData);
        expect(user).toEqual({
            id: 'test4',
            email: "new@test.com",
            firstName: "NewF",
            lastName: "NewL",
            superAdmin: false
        });
    });

    test("works: set password", async function () {
        const user = await User.updateUserInfo("test4", {
            password: "newnew",
        });
        expect(user).toEqual({
            id: 'test4',
            email: null,
            firstName: "Bib",
            lastName: "Tippy",
            superAdmin: false
        });
        const found = await db.query("SELECT * FROM users WHERE id = 'test4'");
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
    });

    test("not found if no such user", async function () {
        try {
            await User.updateUserInfo("nope", {
            firstName: "test",
            });
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("bad request if no data", async function () {
        expect.assertions(1);
        try {
            await User.updateUserInfo("test4", {});
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        };
    });
});


//add company admin
describe('addCompanyadmin', function() {
    test('works', async function() {
        const newAdmin = await User.addCompanyAdmin('test3', 'testco', true);
        expect(newAdmin).toEqual({id: 'test3',
                                adminCompanyCode: 'testco',
                                emailReceiver: true});
    });

    test('removes user from company_users', async function() {
        await User.addCompanyAdmin('test3', 'testco', true);
        const users = await db.query(`SELECT * from company_users WHERE 
                        user_id = 'test3' AND company_code = 'testco'`);
        expect(users.rows.length).toEqual(0);
    });

    test('fails fake user', async function() {
        try {
            await User.addCompanyAdmin('nope', 'testco', true);
            fail();
        } catch (err) {
            expect(err).toBeTruthy();
        };
    });

    test('fails bad company', async function() {
        try {
            await User.addCompanyAdmin('test3', 'nope', true);
            fail();
        } catch (err) {
            expect(err).toBeTruthy();
        };
    });
});


//add company user
describe('addCompanyUser', function() {
    test('works', async function() {
        const newUser = await User.addCompanyUser('test4', 'testco', true);
        expect(newUser).toEqual({id: 'test4',
                                userCompanyCode: 'testco',
                                active: true});
    });
    
    test('fails fake user', async function() {
        try {
            await User.addCompanyUser('nope', 'testco', true);
            fail();
        } catch (err) {
            expect(err).toBeTruthy();
        };
    });

    test('fails bad company', async function() {
        try {
            await User.addCompanyUser('test3', 'nope', true);
            fail();
        } catch (err) {
            expect(err).toBeTruthy();
        };
    });
});

//remove company admin
describe('removeCompanyAdmin', function() {
    test('works user is added to company_users', async function() {
        const removed = await User.removeCompanyAdmin('test2', 'testco', true);
        expect(removed).toEqual({id: 'test2',
                                userCompanyCode: 'testco',
                                active: true});
    });

    test('works user is removed from company_admins', async function() {
        await User.removeCompanyAdmin('test2', 'testco', true);
        const user = await User.get('test2');
        expect(user).toEqual({id: 'test2',
                            email: "test2@test.com",
                            firstName: "Barb",
                            lastName: "Tasty",
                            active: true,
                            superAdmin: false,
                            adminCompanyCode: null,
                            userCompanyCode: 'testco',
                            emailReceiver: null})
    });
});