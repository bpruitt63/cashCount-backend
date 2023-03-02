const db = require('../db');
const { BadRequestError } = require('../expressError');

class Count {

    static async addCount(data) {
        const {containerId, cash, time, timestamp, notes, userId} = data;

        const result = await db.query(
            `INSERT INTO counts (container_id, cash, time, timestamp, note, user_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, container_id AS "containerId", cash,
                time, timestamp, note, user_id AS "userId"`,
            [containerId, cash, time, timestamp, notes, userId]
        );

        const count = result.rows[0];
        if (!count) throw new BadRequestError('Count not recorded');
        return count;
    };

    static async getCounts(containerId, startTime, endTime) {
        const result = await db.query(
            `SELECT counts.id, container_id AS "containerId", cash,
                time, timestamp, note, user_id AS "userId",
                first_name AS "firstName", last_name AS "lastName"
            FROM counts JOIN users ON user_id = users.id
            WHERE container_id = $1 AND
                timestamp >= $2 AND timestamp <= $3
            ORDER BY timestamp DESC`,
            [containerId, startTime, endTime]
        );

        const counts = result.rows;
        return counts;
    };

};

module.exports = Count;