const db = require('../db');
const { BadRequestError } = require('../expressError');


class Company {

    static async create(companyCode) {

        //Check for duplicate company code
        const isDupe = await db.query(
            `SELECT company_code
            FROM companies
            WHERE company_code = $1`,
            [companyCode]
        );

        if (isDupe.rows[0]) {
            throw new BadRequestError(`Company code ${companyCode}
                                        is already being used`);
        };

        const result = await db.query(
            `INSERT INTO companies (company_code)
            VALUES ($1) RETURNING company_code AS "companyCode"`,
            [companyCode]
        );

        return result.rows[0];
    };

    static async get(companyCode) {

        const result = await db.query(
            `SELECT companies.company_code AS "companyCode", id, name, target,
            pos_threshold AS "posThreshold", neg_threshold AS "negThreshold"
            FROM companies
            LEFT JOIN containers ON containers.company_code = companies.company_code
            WHERE companies.company_code = $1`,
            [companyCode]
        );

        const company = result.rows;
        if (!company[0]) throw new BadRequestError(`Company ${companyCode} not found`);
        return company;
    };

};

module.exports = Company;