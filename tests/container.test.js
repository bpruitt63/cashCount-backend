const Container = require('../models/container');
const { BadRequestError } = require('../expressError');
const {
        commonBeforeAll,
        commonBeforeEach,
        commonAfterEach,
        commonAfterAll,
        testCompanyCodes,
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
        const container = await Container.create({...newContainer, companyCode: testCompanyCodes[0]});
        expect(container).toEqual({ id: expect.any(Number),
                                    name: 'testContainer',
                                    companyCode: testCompanyCodes[0],
                                    target: '100.00',
                                    posThreshold: '2.50',
                                    negThreshold: '5.00'});
    });
});

describe('get', function() {
    test('works', async function() {
        const container = await Container.get(testContainerIds[0]);
        expect(container).toEqual({ id: testContainerIds[0],
                                    name: 'testContainer1',
                                    companyCode: testCompanyCodes[0],
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
        const containers = await Container.getAll(testCompanyCodes[0]);
        expect(containers).toEqual([{ id: testContainerIds[0],
                                    name: 'testContainer1',
                                    companyCode: testCompanyCodes[0],
                                    target: '100.00',
                                    posThreshold: '5.00',
                                    negThreshold: '2.00'
                                    },
                                    { 
                                    id: testContainerIds[1],
                                    name: 'testContainer2',
                                    companyCode: testCompanyCodes[0],
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