const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("./config");


/** Creates jsonwebtoken with user information */
function createToken(user) {
    let payload = {
        user: {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            active: user.active || false,
            admin: user.admin || false
        }
    };
    return jwt.sign(payload, SECRET_KEY);
};

/** Formats data for update queries that may include partial info */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
    const keys = Object.keys(dataToUpdate);
    if (keys.length === 0) throw new BadRequestError("No data");
  
    const cols = keys.map((colName, idx) =>
        `"${jsToSql[colName] || colName}"=$${idx + 1}`,
    );
  
    return {
      setCols: cols.join(", "),
      values: Object.values(dataToUpdate),
    };
};

module.exports = {
    createToken,
    sqlForPartialUpdate
};