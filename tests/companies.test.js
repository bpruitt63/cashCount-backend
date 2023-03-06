const request = require("supertest");

const app = require("../app");
const { BadRequestError } = require("../expressError");

const {
        commonBeforeAll,
        commonBeforeEach,
        commonAfterEach,
        commonAfterAll,
        testContainerIds,
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


describe('GET /companies/:companyCode', function() {
    test('works', async function() {
        const resp = await request(app).get('/companies/testco');
        expect(resp.body).toEqual({company: {companyCode: 'testco',
                                            containers: {[testContainerIds[0]]:
                                                {
                                                name: 'testContainer1',
                                                target: '500.00',
                                                posThreshold: '5.00',
                                                negThreshold: '2.00'
                                                },
                                                [testContainerIds[1]]: {
                                                name: 'testContainer2',
                                                target: '550.00',
                                                posThreshold: '5.50',
                                                negThreshold: '2.50'
                                                }}}});
    });

    test('fails bad companyCode', async function() {
        try {
            await request(app).get('/companies/nope');
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        };
    });
});