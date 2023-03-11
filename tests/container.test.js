const Container = require('../models/container');
const { BadRequestError, NotFoundError } = require('../expressError');
const {
        commonBeforeAll,
        commonBeforeEach,
        commonAfterEach,
        commonAfterAll,
        testContainerIds
    } = require("./testCommonModels");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe('create', function() {
    const newContainer = {name: 'testContainer',
                        target: 100.00,
                        posThreshold: 2.50,
                        negThreshold: 5.00}

    test('works', async function() {
        const container = await Container.create({...newContainer, companyCode: 'testco'});
        expect(container).toEqual({ id: expect.any(Number),
                                    name: 'testContainer',
                                    companyCode: 'testco',
                                    target: '100.00',
                                    posThreshold: '2.50',
                                    negThreshold: '5.00'});
    });

    test('fails no companyCode', async function() {
        try {
            await Container.create(newContainer);
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        };
    });

    test('fails bad companyCode', async function() {
        try {
            await Container.create({...newContainer, companyCode: 'nope'});
        } catch (err) {
            expect(err).toBeTruthy();
        };
    });
});

describe('get', function() {
    test('works', async function() {
        const container = await Container.get(testContainerIds[0]);
        expect(container).toEqual({ id: testContainerIds[0],
                                    name: 'testContainer1',
                                    companyCode: 'testco',
                                    target: '100.00',
                                    posThreshold: '5.00',
                                    negThreshold: '2.00'});
    });

    test('fails bad id', async function() {
        try {
            await Container.get(-1);
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        };
    });
});

describe('getAll', function() {
    test('works', async function() {
        const containers = await Container.getAll('testco');
        expect(containers).toEqual([{ id: testContainerIds[0],
                                    name: 'testContainer1',
                                    companyCode: 'testco',
                                    target: '100.00',
                                    posThreshold: '5.00',
                                    negThreshold: '2.00'
                                    },
                                    { 
                                    id: testContainerIds[1],
                                    name: 'testContainer2',
                                    companyCode: 'testco',
                                    target: '150.00',
                                    posThreshold: '5.00',
                                    negThreshold: '2.25'}])
    });

    test('fails bad id', async function() {
        try {
            await Container.getAll(-1);
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        };
    });
});


describe('update', function() {
    test('works', async function() {
        const container = await Container.update(testContainerIds[0], {name: 'new'});
        expect(container).toEqual({id: testContainerIds[0],
                                    name: 'new',
                                    companyCode: 'testco',
                                    target: '100.00',
                                    posThreshold: '5.00',
                                    negThreshold: '2.00'});
    });

    test('updates numbers', async function() {
        const container = await Container.update(testContainerIds[0], {target: 120.50});
        expect(container).toEqual({id: testContainerIds[0],
                                    name: 'testContainer1',
                                    companyCode: 'testco',
                                    target: '120.50',
                                    posThreshold: '5.00',
                                    negThreshold: '2.00'});
    });

    test('fails no data', async function() {
        try {
            await Container.update(testContainerIds[0], {});
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        };
    });

    test('fails bad container', async function() {
        try {
            await Container.update(-1, {name: 'new'});
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        };
    });

    test('fails wrong data type', async function() {
        try {
            await Container.update(testContainerIds[0], {target: 'new'});
            fail();
        } catch (err) {
            expect(err).toBeTruthy();
        };
    });
});