const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const { authenticateJWT, 
        ensureLoggedIn,
        ensureAdmin,
        ensureCorrectUserOrAdmin,
        ensureSuperAdmin } = require("../middleware/auth");


const { SECRET_KEY } = require("../config");
const testPayload = { email: 'test@test.com',
                    firstName: 'Bob',
                    lastName: 'Testy',
                    active: true,
                    admin: false };
const testJwt = jwt.sign(testPayload, SECRET_KEY);
const badJwt = jwt.sign(testPayload, "wrong");


describe("authenticateJWT", function () {
    test("works: via header", function () {
        expect.assertions(2);
        const req = { headers: { authorization: `Bearer ${testJwt}` } };
        const res = { locals: {} };
        const next = function (err) {
            expect(err).toBeFalsy();
        };
        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({
            iat: expect.any(Number),
            email: 'test@test.com',
            firstName: "Bob",
            lastName: "Testy",
            active: true,
            admin: false });
    });
  
    test("works: no header", function () {
        expect.assertions(2);
        const req = {};
        const res = { locals: {} };
        const next = function (err) {
            expect(err).toBeFalsy();
        };
        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({});
    });
  
    test("works: invalid token", function () {
        expect.assertions(2);
        const req = { headers: { authorization: `Bearer ${badJwt}` } };
        const res = { locals: {} };
        const next = function (err) {
            expect(err).toBeFalsy();
        };
        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({});
    });
});

describe("ensureLoggedIn", function () {
    test("works", function () {
        expect.assertions(1);
        const req = {};
        const res = { locals: { cashCountUser: { email: 'test@test.com',
                                firstName: "Bob",
                                lastName: "Testy",
                                active: true,
                                admin: false }}};
        const next = function (err) {
            expect(err).toBeFalsy();
        };
        ensureLoggedIn(req, res, next);
    });
  
    test("unauth if no login", function () {
        expect.assertions(1);
        const req = {};
        const res = { locals: {} };
        const next = function (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        };
        ensureLoggedIn(req, res, next);
    });
});


describe("ensureAdmin", function () {
    test("works", function () {
        expect.assertions(1);
        const req = {};
        const res = { locals: { cashCountUser: { id: 'test',
                                email: 'test@test.com',
                                firstName: "Bob",
                                lastName: "Testy",
                                superAdmin: true }}};
        const next = function (err) {
            expect(err).toBeFalsy();
        };
        ensureAdmin(req, res, next);
    });
  
    test("unauth if not admin", function () {
        expect.assertions(1);
        const req = { params: {companyCode: 'testco'} };
        const res = { locals: { cashCountUser: { id: 'test',
                                email: 'test@test.com',
                                firstName: "Bob",
                                lastName: "Testy",
                                superAdmin: false }}};
        const next = function (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        };
        ensureAdmin(req, res, next);
    });
  
    test("unauth if anon", function () {
        expect.assertions(1);
        const req = {};
        const res = { locals: {} };
        const next = function (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        };
        ensureAdmin(req, res, next);
    });
});


describe("ensureCorrectUserOrAdmin", function () {
    test("works: admin", function () {
        expect.assertions(1);
        const req = { params: {companyCode: 'testco'} };
        const res = { locals: { cashCountUser: { id: 'test',
                                email: 'test@test.com',
                                firstName: "Bob",
                                lastName: "Testy",
                                superAdmin: true }}};
        const next = function (err) {
            expect(err).toBeFalsy();
        };
        ensureCorrectUserOrAdmin(req, res, next);
    });
  
    test("works: correct user", function () {
        expect.assertions(1);
        const req = { params: {companyCode: 'testco', email: 'test@test.com' }};
        const res = { locals: { cashCountUser: { id: 'test',
                                email: 'test@test.com',
                                firstName: "Bob",
                                lastName: "Testy",
                                superAdmin: false }}};
        const next = function (err) {
            expect(err).toBeFalsy();
        };
        ensureCorrectUserOrAdmin(req, res, next);
    });
  
    test("unauth: wrong user", function () {
        expect.assertions(1);
        const req = { params: { companyCode: 'testco', email: 'nope@test.com'} };
        const res = { locals: { cashCountUser: { id: 'test',
                                email: 'test@test.com',
                                firstName: "Bob",
                                lastName: "Testy",
                                superAdmin: false}}};
        const next = function (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        };
        ensureCorrectUserOrAdmin(req, res, next);
    });
  
    test("unauth: if anon", function () {
        expect.assertions(1);
        const req = { params: { companyCode: 'testco' } };
        const res = { locals: {} };
        const next = function (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        };
        ensureCorrectUserOrAdmin(req, res, next);
    });
});


describe("ensureSuperAdmin", function () {
    test("works", function () {
        expect.assertions(1);
        const req = {};
        const res = { locals: { cashCountUser: { id: 'test',
                                email: 'test@test.com',
                                firstName: "Bob",
                                lastName: "Testy",
                                superAdmin: true }}};
        const next = function (err) {
            expect(err).toBeFalsy();
        };
        ensureSuperAdmin(req, res, next);
    });
  
    test("unauth if not super admin", function () {
        expect.assertions(1);
        const req = { params: {companyCode: 'testco'} };
        const res = { locals: { cashCountUser: { id: 'test',
                                email: 'test@test.com',
                                firstName: "Bob",
                                lastName: "Testy",
                                superAdmin: false,
                                userCompanyCode: 'testco',
                                adminCompanyCode: 'testco',
                                emailReceiver: true,
                                active: true }}};
        const next = function (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        };
        ensureSuperAdmin(req, res, next);
    });
  
    test("unauth if anon", function () {
        expect.assertions(1);
        const req = {};
        const res = { locals: {} };
        const next = function (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        };
        ensureSuperAdmin(req, res, next);
    });
});