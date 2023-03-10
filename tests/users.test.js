const request = require("supertest");

const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    bobToken,
    barbToken
} = require("./testCommonRoutes");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


// POST /users/login
describe("POST /users/login", function () {
    test("works super admin", async function () {
        const resp = await request(app)
            .post("/users/login")
            .send({
                id: "test1",
                password: "password1",
            });
        expect(resp.body).toEqual({
            "token": expect.any(String)
        });
    });

    test("works company admin", async function () {
        const resp = await request(app)
            .post("/users/login")
            .send({
                id: "test2",
                password: "password1",
            });
        expect(resp.body).toEqual({
            "token": expect.any(String)
        });
    });

    test("unauth with non-admin", async function () {
        const resp = await request(app)
            .post("/users/login")
            .send({
                id: "test4",
                password: "password1",
            });
        expect(resp.statusCode).toEqual(401);
    });
  
    test("unauth with non-existent user", async function () {
        const resp = await request(app)
            .post("/users/login")
            .send({
                id: "nope",
                password: "password1",
            });
        expect(resp.statusCode).toEqual(401);
    });
  
    test("unauth with wrong password", async function () {
        const resp = await request(app)
            .post("/users/login")
            .send({
                id: "test1",
                password: "nopers",
            });
        expect(resp.statusCode).toEqual(401);
    });
  
    test("bad request with missing data", async function () {
        const resp = await request(app)
            .post("/users/login")
            .send({
                id: "test1",
            });
        expect(resp.statusCode).toEqual(400);
    });
});

describe("POST /createAdmin", function(){
    test("works", async function(){
        const resp = await request(app)
            .post('/users/createAdmin')
            .send({
                id: 'new',
                email: 'new@test.com',
                password: 'password',
                firstName: 'New',
                lastName: 'Name',
                superAdmin: true
            })
            .set("authorization", `Bearer ${bobToken}`);
        expect(resp.body).toEqual({user: {id: 'new',
                                            email: 'new@test.com',
                                            firstName: 'New',
                                            lastName: 'Name',
                                            superAdmin: true
        }});
    });

    test("fails dupe", async function(){
        const resp = await request(app)
            .post('/users/createAdmin')
            .send({
                id: 'test1',
                email: 'test9@test.com',
                password: 'password',
                firstName: 'New',
                lastName: 'Name',
                superAdmin: true
            })
            .set("authorization", `Bearer ${bobToken}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("fails company admin", async function(){
        const resp = await request(app)
            .post('/users/createAdmin')
            .send({
                id: 'new1',
                email: 'new@test.com',
                password: 'password',
                firstName: 'New',
                lastName: 'Name',
                superAdmin: false
            })
            .set("authorization", `Bearer ${barbToken}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("fails unauth", async function(){
        const resp = await request(app)
            .post('/users/createAdmin')
            .send({
                id: 'new1',
                email: 'new@test.com',
                password: 'password',
                firstName: 'New',
                lastName: 'Name',
                superAdmin: false
            });
        expect(resp.statusCode).toEqual(401);
    });

    test("requires email and password", async function(){
        const resp = await request(app)
            .post('/users/createAdmin')
            .send({
                id: 'new1',
                firstName: 'New',
                lastName: 'Name',
                superAdmin: true
            })
            .set("authorization", `Bearer ${bobToken}`);
        expect(resp.statusCode).toEqual(400);
    });
});

describe("POST /create/:companyCode", function(){
    test("works for super admin", async function(){
        const resp = await request(app)
            .post('/users/create/testco')
            .send({
                id: 'new1',
                firstName: 'New',
                lastName: 'Name',
                superAdmin: false,
                companyAdmin: false,
                emailReceiver: false,
                email: 'test5@test.com',
                password: 'password',
                active: true
            })
            .set("authorization", `Bearer ${bobToken}`);
        expect(resp.body).toEqual({user: {
                                id: 'new1',
                                firstName: 'New',
                                lastName: 'Name',
                                superAdmin: false,
                                email: 'test5@test.com',
                                userCompanyCode: 'testco',
                                active: true
        }});
    });

    test("works for company admin", async function(){
        const resp = await request(app)
            .post('/users/create/testco')
            .send({
                id: 'new1',
                firstName: 'New',
                lastName: 'Name',
                superAdmin: false,
                companyAdmin: false,
                emailReceiver: false,
                email: 'test5@test.com',
                password: 'password',
                active: true
            })
            .set("authorization", `Bearer ${barbToken}`);
        expect(resp.body).toEqual({user: {
                                id: 'new1',
                                firstName: 'New',
                                lastName: 'Name',
                                superAdmin: false,
                                email: 'test5@test.com',
                                userCompanyCode: 'testco',
                                active: true
        }});
    });

    test("works with partial info", async function(){
        const resp = await request(app)
            .post('/users/create/testco')
            .send({
                id: 'new1',
                firstName: 'New',
                lastName: 'Name'
            })
            .set("authorization", `Bearer ${barbToken}`);
        expect(resp.body).toEqual({user: {
                                id: 'new1',
                                firstName: 'New',
                                lastName: 'Name',
                                superAdmin: false,
                                email: null,
                                userCompanyCode: 'testco',
                                active: true
        }});
    });

    test("works, create admin", async function(){
        const resp = await request(app)
            .post('/users/create/testco')
            .send({
                id: 'new1',
                firstName: 'New',
                lastName: 'Name',
                superAdmin: false,
                companyAdmin: true,
                emailReceiver: false,
                email: 'test5@test.com',
                password: 'password',
                active: true
            })
            .set("authorization", `Bearer ${barbToken}`);
        expect(resp.body).toEqual({user: {
                                id: 'new1',
                                firstName: 'New',
                                lastName: 'Name',
                                superAdmin: false,
                                emailReceiver: false,
                                email: 'test5@test.com',
                                userCompanyCode: 'testco',
                                adminCompanyCode: 'testco',
                                active: true
        }});
    });

    test("fails dupe", async function(){
        const resp = await request(app)
            .post('/users/create/testco')
            .send({
                id: 'test1',
                firstName: 'New',
                lastName: 'Name',
                superAdmin: false,
                companyAdmin: false,
                emailReceiver: false,
                email: 'test5@test.com',
                password: 'password'
            })
            .set("authorization", `Bearer ${barbToken}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("fails unauth", async function(){
        const resp = await request(app)
            .post('/users/create/testco')
            .send({
                id: 'new1',
                firstName: 'New',
                lastName: 'Name',
                superAdmin: false,
                companyAdmin: false,
                emailReceiver: false,
                email: 'test5@test.com',
                password: 'password'
            });
        expect(resp.statusCode).toEqual(401);
    });

    test("doesn't create super admin", async function(){
        const resp = await request(app)
            .post('/users/create/testco')
            .send({
                id: 'new1',
                firstName: 'New',
                lastName: 'Name',
                superAdmin: true,
                companyAdmin: false,
                emailReceiver: false,
                email: 'test5@test.com',
                password: 'password'
            })
            .set("authorization", `Bearer ${bobToken}`);
        expect(resp.body).toEqual({user: {
                                id: 'new1',
                                firstName: 'New',
                                lastName: 'Name',
                                superAdmin: false,
                                email: 'test5@test.com',
                                userCompanyCode: 'testco',
                                active: true
        }});
    });
});


describe('PATCH /:id', function() {
    test('works', async function() {
        const resp = await request(app)
            .patch('/users/test1')
            .send({firstName: 'new'})
            .set("authorization", `Bearer ${bobToken}`);
        expect(resp.body).toEqual({user: {
                                        id: 'test1',
                                        firstName: 'new',
                                        lastName: 'Testy',
                                        email: 'test1@test.com',
                                        superAdmin: true
                                        },
                                    token: expect.any(String)});
    });

    test('creates super admin', async function() {
        const resp = await request(app)
            .patch('/users/test2')
            .send({superAdmin: true})
            .set("authorization", `Bearer ${bobToken}`);
        expect(resp.body).toEqual({user: {
                                    id: 'test2',
                                    firstName: 'Barb',
                                    lastName: 'Tasty',
                                    email: 'test2@test.com',
                                    superAdmin: true
                                    }});
    });

    test('fails if not super admin', async function() {
        const resp = await request(app)
            .patch('/users/test1')
            .send({firstName: 'new'})
            .set("authorization", `Bearer ${barbToken}`);
        expect(resp.statusCode).toEqual(401);
    });
});


describe('PATCH /:id/company/:companyCode', function() {
    test('works company user', async function() {
        const resp = await request(app)
            .patch('/users/test3/company/testco')
            .send({firstName: 'new',
                    companyAdmin: false})
            .set("authorization", `Bearer ${barbToken}`);
        expect(resp.body).toEqual({user: {
                                    id: 'test3',
                                    firstName: 'new',
                                    lastName: 'Toasty',
                                    email: null,
                                    superAdmin: false,
                                    userCompanyCode: 'testco',
                                    active: true
                                    }});
    });

    test('works company admin', async function() {
        const resp = await request(app)
            .patch('/users/test2/company/testco')
            .send({firstName: 'new',
                    companyAdmin: true})
            .set("authorization", `Bearer ${barbToken}`);
        expect(resp.body).toEqual({user: {
                                    id: 'test2',
                                    firstName: 'new',
                                    lastName: 'Tasty',
                                    email: 'test2@test.com',
                                    superAdmin: false,
                                    userCompanyCode: 'testco',
                                    adminCompanyCode: 'testco',
                                    active: true,
                                    emailReceiver: true
                                    }});
    });

    test('works updates active', async function() {
        const resp = await request(app)
            .patch('/users/test3/company/testco')
            .send({active: false,
                    companyAdmin: false})
            .set("authorization", `Bearer ${barbToken}`);
        expect(resp.body).toEqual({user: {
                                    id: 'test3',
                                    firstName: 'Bulb',
                                    lastName: 'Toasty',
                                    email: null,
                                    superAdmin: false,
                                    userCompanyCode: 'testco',
                                    active: false
                                    }});
    });

    test('works updates emailReceiver', async function() {
        const resp = await request(app)
            .patch('/users/test2/company/testco')
            .send({emailReceiver: false,
                    companyAdmin: true})
            .set("authorization", `Bearer ${barbToken}`);
        expect(resp.body).toEqual({user: {
                                    id: 'test2',
                                    firstName: 'Barb',
                                    lastName: 'Tasty',
                                    email: 'test2@test.com',
                                    superAdmin: false,
                                    userCompanyCode: 'testco',
                                    adminCompanyCode: 'testco',
                                    active: true,
                                    emailReceiver: false
                                    }});
    });

    test('works changes user to admin', async function() {
        const resp = await request(app)
            .patch('/users/test3/company/testco')
            .send({companyAdmin: true,
                    email: 'new@test.com',
                    password: 'password'})
            .set("authorization", `Bearer ${barbToken}`);
        expect(resp.body).toEqual({user: {
                                    id: 'test3',
                                    firstName: 'Bulb',
                                    lastName: 'Toasty',
                                    email: 'new@test.com',
                                    superAdmin: false,
                                    userCompanyCode: 'testco',
                                    adminCompanyCode: 'testco',
                                    active: true,
                                    emailReceiver: false
                                    }});
    });

    test('super admin can access', async function() {
        const resp = await request(app)
            .patch('/users/test3/company/testco')
            .send({companyAdmin: true,
                    email: 'new@test.com',
                    password: 'password'})
            .set("authorization", `Bearer ${bobToken}`);
        expect(resp.body).toEqual({user: {
                                    id: 'test3',
                                    firstName: 'Bulb',
                                    lastName: 'Toasty',
                                    email: 'new@test.com',
                                    superAdmin: false,
                                    userCompanyCode: 'testco',
                                    adminCompanyCode: 'testco',
                                    active: true,
                                    emailReceiver: false
                                    }});
    });

    test('works changes admin to user', async function() {
        const resp = await request(app)
            .patch('/users/test2/company/testco')
            .send({companyAdmin: false})
            .set("authorization", `Bearer ${bobToken}`);
        expect(resp.body).toEqual({user: {
                                    id: 'test2',
                                    firstName: 'Barb',
                                    lastName: 'Tasty',
                                    email: 'test2@test.com',
                                    superAdmin: false,
                                    userCompanyCode: 'testco',
                                    active: true
                                    }});
    });

    test("doesn't add super admin", async function() {
        const resp = await request(app)
            .patch('/users/test2/company/testco')
            .send({superAdmin: true,
                    companyAdmin: true})
            .set("authorization", `Bearer ${barbToken}`);
        expect(resp.body).toEqual({user: {
                                    id: 'test2',
                                    firstName: 'Barb',
                                    lastName: 'Tasty',
                                    email: 'test2@test.com',
                                    superAdmin: false,
                                    userCompanyCode: 'testco',
                                    adminCompanyCode: 'testco',
                                    active: true,
                                    emailReceiver: true
                                    }});
    });
});


describe("GET /:companyCode/:id", function() {
    test("works super admin", async function(){
        const resp = await request(app)
            .get(`/users/testco/test2`)
            .set("authorization", `Bearer ${bobToken}`);
        expect(resp.body).toEqual({user: {
                                    id: 'test2',
                                    email: "test2@test.com",
                                    firstName: "Barb",
                                    lastName: "Tasty",
                                    superAdmin: false,
                                    adminCompanyCode: 'testco',
                                    userCompanyCode: 'testco',
                                    active: true,
                                    emailReceiver: true
            }});
    });

    test("works company admin", async function(){
        const resp = await request(app)
            .get(`/users/testco/test3`)
            .set("authorization", `Bearer ${barbToken}`);
        expect(resp.body).toEqual({user: {
                                    id: 'test3',
                                    email: null,
                                    firstName: "Bulb",
                                    lastName: "Toasty",
                                    superAdmin: false,
                                    adminCompanyCode: null,
                                    userCompanyCode: 'testco',
                                    active: true,
                                    emailReceiver: null
        }});
    });

    test("unauth anon", async function(){
        const resp = await request(app)
            .get(`/users/testco/test3`);
        expect(resp.statusCode).toEqual(401);
    });
});


describe("GET /:companyCode", function() {
    test("works super admin", async function(){
        const resp = await request(app)
            .get(`/users/testco`)
            .set("authorization", `Bearer ${bobToken}`);
        expect(resp.body).toEqual({users: [ 
            {
                id: 'test2',
                email: "test2@test.com",
                firstName: "Barb",
                lastName: "Tasty",
                superAdmin: false,
                userCompanyCode: 'testco',
                adminCompanyCode: 'testco',
                active: true,
                emailReceiver: true
            },
            {
                id: 'test3',
                email: null,
                firstName: "Bulb",
                lastName: "Toasty",
                superAdmin: false,
                userCompanyCode: 'testco',
                adminCompanyCode: null,
                active: true,
                emailReceiver: null
            },
            {
                id: 'test4',
                email: null,
                firstName: "Breb",
                lastName: "Touchy",
                superAdmin: false,
                userCompanyCode: 'testco',
                adminCompanyCode: null,
                active: false,
                emailReceiver: null
            }
        ]});
    });

    test("works company admin", async function(){
        const resp = await request(app)
            .get(`/users/testco`)
            .set("authorization", `Bearer ${barbToken}`);
        expect(resp.body).toEqual({users: [ 
            {
                id: 'test2',
                email: "test2@test.com",
                firstName: "Barb",
                lastName: "Tasty",
                superAdmin: false,
                userCompanyCode: 'testco',
                adminCompanyCode: 'testco',
                active: true,
                emailReceiver: true
            },
            {
                id: 'test3',
                email: null,
                firstName: "Bulb",
                lastName: "Toasty",
                superAdmin: false,
                userCompanyCode: 'testco',
                adminCompanyCode: null,
                active: true,
                emailReceiver: null
            },
            {
                id: 'test4',
                email: null,
                firstName: "Breb",
                lastName: "Touchy",
                superAdmin: false,
                userCompanyCode: 'testco',
                adminCompanyCode: null,
                active: false,
                emailReceiver: null
            }
        ]});
    });

    test("unauth anon", async function(){
        const resp = await request(app)
            .get(`/users/testco`);
        expect(resp.statusCode).toEqual(401);
    });
});