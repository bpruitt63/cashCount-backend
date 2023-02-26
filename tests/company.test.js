const Company = require('../models/company');
const { BadRequestError } = require('../expressError');
const {
        commonBeforeAll,
        commonBeforeEach,
        commonAfterEach,
        commonAfterAll
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