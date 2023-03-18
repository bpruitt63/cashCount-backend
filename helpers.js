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

function formatTime(time){
    console.log(time)
    time = time.split(' ');
    let ampm = 'am';
    let readableTime = time[4];
    const hour = readableTime.substring(0, 2)
    if (hour === '00') {
        readableTime = `12${readableTime.substring(2)}`;
    } else if (hour === '12') {
        ampm = 'pm';
    } else if (+hour > 12){
        readableTime = `${+hour - 12}${readableTime.substring(2)}`;
        ampm = 'pm';
    }
    const formatted = `${time[0]}, ${time[1]} ${time[2]}, ${time[3]} ${readableTime} ${ampm}`;
    return formatted;
};

module.exports = {
    createToken,
    sqlForPartialUpdate,
    formatCompany,
    formatTime
};