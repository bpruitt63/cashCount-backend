const Company = require('../models/company');
const { BadRequestError } = require('../expressError');
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
    test('works', async function() {
        const company = await Company.create('testCompany');
        expect(company).toEqual({companyCode: 'testCompany'});
    });

    test('fails dupe', async function() {
        try {
            await Company.create('testCompany');
            await Company.create('testCompany');
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        };
    });
});


describe('get', function() {
    test('works', async function() {
        const company = await Company.get('testco');
        expect(company).toEqual([{companyCode: 'testco',
                                id: testContainerIds[0],
                                name: 'testContainer1',
                                target: '100.00',
                                posThreshold: '5.00',
                                negThreshold: '2.00'
                                },
                                {
                                    companyCode: 'testco',
                                id: testContainerIds[1],
                                name: 'testContainer2',
                                target: '150.00',
                                posThreshold: '5.00',
                                negThreshold: '2.25'}]);
    });

    test('fails no such company', async function() {
        try {
            await Company.get('nope');
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        };
    })
});