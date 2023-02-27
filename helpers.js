const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("./config");
const { BadRequestError } = require("./expressError");


/** Creates jsonwebtoken with user information */
function createToken(user) {
    let payload = {cashCountUser: user};
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

function formatCompany(companyData) {
    const company = {};
    company.companyCode = companyData[0].companyCode;
    company.containers = {};
    for (let co of companyData) {
        company.containers[co.id] = {name: co.name,
                                target: co.target,
                                posThreshold: co.posThreshold,
                                negThreshold: co.negThreshold}
    };
    return company;
};

module.exports = {
    createToken,
    sqlForPartialUpdate,
    formatCompany
};