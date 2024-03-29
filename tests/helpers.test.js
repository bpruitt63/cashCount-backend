const { createToken, sqlForPartialUpdate, generatePassword } = require("../helpers");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

describe("createToken", function () {
    test("works: super admin", function () {
        const token = createToken({ id: 'test',
                                    email: 'test@test.com',
                                    firstName: "test", 
                                    lastName: "name",
                                    superAdmin: true });
        const payload = jwt.verify(token, SECRET_KEY);
        expect(payload).toEqual({
            iat: expect.any(Number),
            cashCountUser: {
                id: 'test',
                email: 'test@test.com',
                firstName: "test",
                lastName: "name",
                superAdmin: true
            }});
    });
  
    test("works: admin", function () {
        const token = createToken({ id: 'test',
                                    email: 'test@test.com',
                                    firstName: "test", 
                                    lastName: "name",
                                    active: true,
                                    superAdmin: false,
                                    userCompanyCode: 'testco',
                                    adminCompanyCode: 'testco',
                                    emailReceiver: true });
        const payload = jwt.verify(token, SECRET_KEY);
        expect(payload).toEqual({
            iat: expect.any(Number),
            cashCountUser: { id: 'test',
                    email: 'test@test.com',
                    firstName: "test", 
                    lastName: "name",
                    active: true,
                    superAdmin: false,
                    userCompanyCode: 'testco',
                    adminCompanyCode: 'testco',
                    emailReceiver: true
            }});
    });
});


describe("sqlForPartialUpdate", function () {
    test("works: 1 item", function () {
        const result = sqlForPartialUpdate(
            { f1: "v1" },
            { f1: "f1", fF2: "f2" });
        expect(result).toEqual({
            setCols: "\"f1\"=$1",
            values: ["v1"],
        });
    });
  
    test("works: 2 items", function () {
        const result = sqlForPartialUpdate(
            { f1: "v1", jsF2: "v2" },
            { jsF2: "f2" });
        expect(result).toEqual({
            setCols: "\"f1\"=$1, \"f2\"=$2",
            values: ["v1", "v2"],
        });
    });
});


describe('generatePassword', function() {
    test('works', function() {
        const result = generatePassword();
        const resultSet = new Set(result);
        expect(result.length).toEqual(10);
        expect(resultSet.size).toBeGreaterThan(1);
    });

    test('creates different password each time', function() {
        const result = generatePassword();
        const result2 = generatePassword();
        expect(result).not.toEqual(result2);
    });
});