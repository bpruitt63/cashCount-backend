const db = require('../db');
const { BadRequestError } = require('../expressError');

class Count {

    static async addCount(data) {
        const {containerId, cash, time, timestamp, notes} = data;

        const result = await db.query(
            `INSERT INTO counts (container_id, cash, time, timestamp, note)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, container_id AS "containerId", cash,
                time, timestamp, note`,
            [containerId, cash, time, timestamp, notes]
        );

        const count = result.rows[0];
        if (!count) throw new BadRequestError('Count not recorded');
        return count;
    };

    static async getCounts(containerId, startTime, endTime) {
        const result = await db.query(
            `SELECT id, container_id AS "containerId", cash,
                time, timestamp, note
            FROM counts WHERE container_id = $1 AND
                timestamp >= $2 AND timestamp <= $3
            ORDER BY timestamp DESC`,
            [containerId, startTime, endTime]
        );

        const counts = result.rows;
        if (!counts[0]) throw new BadRequestError('No counts match the given parameters');
        return counts;
    };

};

module.exports = Count;