const db = require('../db');
const { BadRequestError } = require('../expressError');

class Container {

    static async create(data) {

        const {name, companyCode, target, posThreshold, negThreshold} = data;

        const result = await db.query(
            `INSERT INTO containers 
                (name, company_code, target, pos_threshold, neg_threshold)
                VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, company_code AS "companyCode", target,
                pos_threshold AS "posThreshold", neg_threshold AS "negThreshold"`,
            [name, companyCode, target, posThreshold, negThreshold]
        );

        const container = result.rows[0];
        if (!container) throw new BadRequestError('Failed to add container');

        return container;
    };

    static async get(id) {
        const result = await db.query(
            `SELECT id, name, company_code AS "companyCode", target,
                pos_threshold AS "posThreshold", neg_threshold AS "negThreshold"
            FROM containers WHERE id = $1`,
            [id]
        );

        const container = result.rows[0];
        if (!container) throw new BadRequestError('Container not found');

        return container;
    };

    static async getAll(companyCode) {
        const result = await db.query(
            `SELECT id, name, company_code AS "companyCode", target,
                pos_threshold AS "posThreshold", neg_threshold AS "negThreshold"
            FROM containers WHERE company_code = $1`,
            [companyCode]
        );

        const containers = result.rows;
        if (!containers[0]) throw new BadRequestError('No containers found');

        return containers;
    };
};

module.exports = Container;