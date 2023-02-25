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
    commonAfterAll,
    testCompanyIds
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
            companyId: testCompanyIds[0],
            emailReceiver: true
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
        id: 'test4',
        firstName: "Bub",
        lastName: "Tester",
        superAdmin: false,
    };

    test("works", async function () {
        let user = await User.create(newUser);
        expect(user).toEqual({...newUser, email: null});
        const found = await db.query("SELECT * FROM users WHERE id = 'test4'");
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
        const found = await db.query("SELECT * FROM users WHERE id = 'test4'");
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].super_admin).toEqual(true);
        expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
    });

    test("works: adds company user", async function () {
        const user = await User.create({
            ...newUser,
            companyId: testCompanyIds[0]
        });
        expect(user).toEqual({ ...newUser, email: null,
                                companyId: testCompanyIds[0],
                                active: true });
        const found = await db.query("SELECT * FROM users WHERE id = 'test4'");
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
            companyId: testCompanyIds[0],
            emailReceiver: true
        });
        expect(user).toEqual({ ...newUser, 
                                companyId: testCompanyIds[0],
                                email: 'test4@test.com',
                                emailReceiver: true });
        const found = await db.query("SELECT * FROM users WHERE id = 'test4'");
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].super_admin).toEqual(false);
        expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
    });

    test("bad request with dup data", async function () {
        try {
            await User.create({
            ...newUser,
            password: "password",
            });
            await User.create({
            ...newUser,
            password: "password",
            });
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
                adminCompanyId: null,
                userCompanyId: null,
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
                adminCompanyId: null,
                userCompanyId: testCompanyIds[0],
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
                active: null,
                superAdmin: false,
                adminCompanyId: testCompanyIds[0],
                userCompanyId: null,
                emailReceiver: true
            });
    });

    test("fails no user", async function(){
        try {
            await User.get("nope@nope.com");
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

//Get all
describe("getAll", function(){
    test("works", async function(){
        const users = await User.getAll(testCompanyIds[0]);
        expect(users).toEqual([{
                id: 'test2',
                email: "test2@test.com",
                firstName: "Barb",
                lastName: "Tasty",
                active: null,
                superAdmin: false,
                adminCompanyId: testCompanyIds[0],
                userCompanyId: null,
                emailReceiver: true
        },
        {
                id: 'test3',
                email: null,
                firstName: "Bulb",
                lastName: "Toasty",
                active: true,
                superAdmin: false,
                adminCompanyId: null,
                userCompanyId: testCompanyIds[0],
                emailReceiver: null
        }]);
    });
});

// //Update
// describe("update", function () {
//     const updateData = {
//         email: "new@test.com",
//         firstName: "NewF",
//         lastName: "NewL",
//         active: true,
//         admin: false
//     };

//     test("works", async function () {
//         const user = await User.update("test1@test.com", updateData);
//         expect(user).toEqual({
//             email: "new@test.com",
//             firstName: "NewF",
//             lastName: "NewL",
//             active: true,
//             admin: false
//         });
//     });

//     test("works: set password", async function () {
//         const user = await User.update("test1@test.com", {
//             password: "newnew",
//         });
//         expect(user).toEqual({
//             email: "test1@test.com",
//             firstName: "Bob",
//             lastName: "Testy",
//             active: true,
//             admin: true
//         });
//         const found = await db.query("SELECT * FROM users WHERE email = 'test1@test.com'");
//         expect(found.rows.length).toEqual(1);
//         expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
//     });

//     test("not found if no such user", async function () {
//         try {
//             await User.update("nope", {
//             firstName: "test",
//             });
//             fail();
//         } catch (err) {
//             expect(err instanceof NotFoundError).toBeTruthy();
//         }
//     });

//     test("bad request if no data", async function () {
//         expect.assertions(1);
//         try {
//             await User.update("test1@test.com", {});
//             fail();
//         } catch (err) {
//             expect(err instanceof BadRequestError).toBeTruthy();
//         };
//     });
// });