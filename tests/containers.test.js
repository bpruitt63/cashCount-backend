const request = require("supertest");

const app = require("../app");

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

    test('fails unauth', async function() {
        const resp = await request(app)
            .post("/containers/testco/new")
            .send({name: "newContainer",
                    target: 650.00,
                    posThreshold: 7.50,
                    negThreshold: 3.00});
        expect(resp.statusCode).toEqual(401);
    });

    test('fails bad company code', async function() {
        const resp = await request(app)
            .post("/containers/nope/new")
            .send({name: "newContainer",
                    target: 650.00,
                    posThreshold: 7.50,
                    negThreshold: 3.00})
            .set("authorization", `Bearer ${bobToken}`);
        expect(resp.statusCode).toEqual(500);
    });
});


describe('GET /containers/:companyCode/all', function(){
    test('works', async function(){
        const resp = await request(app)
            .get('/containers/testco/all');
        expect(resp.body).toEqual({containers:
                                    [{  id: testContainerIds[0],
                                        name: 'testContainer1',
                                        companyCode: 'testco',
                                        target: '500.00',
                                        posThreshold: '5.00',
                                        negThreshold: '2.00'
                                    },
                                    {  id: testContainerIds[1],
                                        name: 'testContainer2',
                                        companyCode: 'testco',
                                        target: '550.00',
                                        posThreshold: '5.50',
                                        negThreshold: '2.50'
                                    }]});
    });
});


describe('POST /:containerId/count', function() {
    const time = new Date();
    const timestamp = time.getTime();
    test('works', async function(){
        const resp = await request(app)
            .post(`/containers/${testContainerIds[0]}/count`)
            .send({userId: 'test3',
                    cash: 400.00,
                    time,
                    timestamp,
                    note: null});
        expect(resp.body).toEqual({count: {
                                    id: expect.any(Number),
                                    containerId: testContainerIds[0],
                                    cash: '400.00',
                                    time: expect.any(String),
                                    timestamp: timestamp.toString(),
                                    note: null,
                                    userId: 'test3'
                                    }});
    });

    test('works admin', async function(){
        const resp = await request(app)
            .post(`/containers/${testContainerIds[0]}/count`)
            .send({userId: 'test2',
                    cash: 400.00,
                    time,
                    timestamp,
                    note: null});
        expect(resp.body).toEqual({count: {
                                    id: expect.any(Number),
                                    containerId: testContainerIds[0],
                                    cash: '400.00',
                                    time: expect.any(String),
                                    timestamp: timestamp.toString(),
                                    note: null,
                                    userId: 'test2'
                                    }});
    });

    test('works super admin', async function(){
        const resp = await request(app)
            .post(`/containers/${testContainerIds[0]}/count`)
            .send({userId: 'test1',
                    cash: 400.00,
                    time,
                    timestamp,
                    note: null});
        expect(resp.body).toEqual({count: {
                                    id: expect.any(Number),
                                    containerId: testContainerIds[0],
                                    cash: '400.00',
                                    time: expect.any(String),
                                    timestamp: timestamp.toString(),
                                    note: null,
                                    userId: 'test1'
                                    }});
    });

    test('fails fake user', async function() {
        const resp = await request(app)
            .post(`/containers/${testContainerIds[0]}/count`)
            .send({userId: 'nope',
                    cash: 400.00,
                    time,
                    timestamp,
                    note: null});
        expect(resp.statusCode).toEqual(404);
    });

    test('fails inactive user', async function() {
        const resp = await request(app)
            .post(`/containers/${testContainerIds[0]}/count`)
            .send({userId: 'test4',
                    cash: 400.00,
                    time,
                    timestamp,
                    note: null});
        expect(resp.statusCode).toEqual(401);
    });

    test('fails other company user', async function() {
        const resp = await request(app)
            .post(`/containers/${testContainerIds[0]}/count`)
            .send({userId: 'test5',
                    cash: 400.00,
                    time,
                    timestamp,
                    note: null});
        expect(resp.statusCode).toEqual(401);
    });
});
