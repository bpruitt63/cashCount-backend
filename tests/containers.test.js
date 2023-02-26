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


describe('POST /containers/:companyCode/new', function() {
    test('works super admin', async function() {
        const resp = await request(app)
            .post("/containers/testco/new")
            .send({name: "newContainer",
                    target: 650.00,
                    posThreshold: 7.50,
                    negThreshold: 3.00})
            .set("authorization", `Bearer ${bobToken}`);
        expect(resp.body).toEqual({container:
                                    {id: expect.any(Number),
                                    companyCode: 'testco',
                                    name: "newContainer",
                                    target: '650.00',
                                    posThreshold: '7.50',
                                    negThreshold: '3.00'}});
    });

    test('works company admin', async function() {
        const resp = await request(app)
            .post("/containers/testco/new")
            .send({name: "newContainer",
                    target: 650.00,
                    posThreshold: 7.50,
                    negThreshold: 3.00})
            .set("authorization", `Bearer ${barbToken}`);
        expect(resp.body).toEqual({container:
                                    {id: expect.any(Number),
                                    companyCode: 'testco',
                                    name: "newContainer",
                                    target: '650.00',
                                    posThreshold: '7.50',
                                    negThreshold: '3.00'}});
    });

    test('fails missing info', async function() {
        const resp = await request(app)
            .post("/containers/testco/new")
            .send({name: 'newContainer'})
            .set("authorization", `Bearer ${barbToken}`);
        expect(resp.statusCode).toEqual(400);
    });
});


describe('GET /containers/:companyCode/all', function(){
    test('works', async function(){
        const resp = await request(app)
            .get('/containers/testco/all');
        expect(resp.body).toEqual({containers:
                                    [{  id: expect.any(Number),
                                        name: 'testContainer',
                                        companyCode: 'testco',
                                        target: '500.00',
                                        posThreshold: '5.00',
                                        negThreshold: '2.00'
                                    }]});
    });
});