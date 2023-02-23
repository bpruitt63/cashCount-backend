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
        const user = await User.login("test2@test.com", "password");
        expect(user).toEqual({
            email: "test2@test.com",
            firstName: "Barb",
            lastName: "Tasty",
            active: true,
            admin: false
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

    test("unauth if inactive", async function () {
        try {
            await User.login("test3@test.com", "password");
            fail();
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });
});

// Create
describe("create", function () {
    const newUser = {
        email: "test4@test.com",
        firstName: "Bub",
        lastName: "Tester",
        active: true,
        admin: false,
    };

    test("works", async function () {
        let user = await User.create({
            ...newUser,
            password: "password"
        });
        expect(user).toEqual(newUser);
        const found = await db.query("SELECT * FROM users WHERE email = 'test4@test.com'");
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].admin).toEqual(false);
        expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
    });

    test("works: adds admin", async function () {
        const user = await User.create({
            ...newUser,
            password: "password",
            admin: true,
        });
        expect(user).toEqual({ ...newUser, admin: true });
        const found = await db.query("SELECT * FROM users WHERE email = 'test4@test.com'");
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].admin).toEqual(true);
        expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
    });

    test("default non admin, active", async function () {
        const testUser = {...newUser};
        delete testUser.active;
        delete testUser.admin;
        const user = await User.create({
            ...testUser,
            password: "password"
        });
        expect(user).toEqual(newUser);
        const found = await db.query("SELECT * FROM users WHERE email = 'test4@test.com'");
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].admin).toEqual(false);
        expect(found.rows[0].active).toEqual(true);
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
        const user = await User.get('test2@test.com');
        expect(user).toEqual(
            {
                email: "test2@test.com",
                firstName: "Barb",
                lastName: "Tasty",
                active: true,
                admin: false
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
        const users = await User.getAll();
        expect(users).toEqual([{
            email: "test1@test.com",
            firstName: "Bob",
            lastName: "Testy",
            active: true,
            admin: true
        },
        {
            email: "test2@test.com",
            firstName: "Barb",
            lastName: "Tasty",
            active: true,
            admin: false
        },
        {
            email: "test3@test.com",
            firstName: "Bulb",
            lastName: "Toasty",
            active: false,
            admin: false
        }]);
    });
});

//Update
describe("update", function () {
    const updateData = {
        email: "new@test.com",
        firstName: "NewF",
        lastName: "NewL",
        active: true,
        admin: false
    };

    test("works", async function () {
        const user = await User.update("test1@test.com", updateData);
        expect(user).toEqual({
            email: "new@test.com",
            firstName: "NewF",
            lastName: "NewL",
            active: true,
            admin: false
        });
    });

    test("works: set password", async function () {
        const user = await User.update("test1@test.com", {
            password: "newnew",
        });
        expect(user).toEqual({
            email: "test1@test.com",
            firstName: "Bob",
            lastName: "Testy",
            active: true,
            admin: true
        });
        const found = await db.query("SELECT * FROM users WHERE email = 'test1@test.com'");
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
    });

    test("not found if no such user", async function () {
        try {
            await User.update("nope", {
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
            await User.update("test1@test.com", {});
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        };
    });
});