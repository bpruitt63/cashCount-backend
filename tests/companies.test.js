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

describe('POST /companies/new', function() {
    test('works super admin', async function() {
        const resp = await request(app)
            .post("/companies/new")
            .send({companyCode: "newCompany"})
            .set("authorization", `Bearer ${bobToken}`);
        expect(resp.body).toEqual({company: {companyCode: "newCompany"}});
    });

    test('fails company admin', async function() {
        const resp = await request(app)
            .post("/companies/new")
            .send({companyCode: "newCompany"})
            .set("authorization", `Bearer ${barbToken}`);
        expect(resp.statusCode).toEqual(401);
    });

    test('fails missing info', async function() {
        const resp = await request(app)
            .post("/companies/new")
            .send({})
            .set("authorization", `Bearer ${bobToken}`);
        expect(resp.statusCode).toEqual(400);
    });
});