const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

function authenticateJWT(req, res, next) {
    try {
        const authHeader = req.headers && req.headers.authorization;
        if (authHeader) {
            const token = authHeader.replace(/^[Bb]earer /, "").trim();
            res.locals = jwt.verify(token, SECRET_KEY);
        };
        return next();
    } catch (err) {
        return next();
    };
};

function ensureLoggedIn(req, res, next) {
    try {
        if (!res.locals.user) throw new UnauthorizedError();
        return next();
    } catch (err) {
        return next(err);
    };
};

function ensureAdmin(req, res, next) {
    try {
        const user = res.locals.user;
        if (!user) throw new UnauthorizedError();
        if (!(user.superAdmin || user.adminCompanyCode === req.params.companyCode)) {
            throw new UnauthorizedError();
        };
        return next();
    } catch (err) {
        return next(err);
    };
};

function ensureCorrectUserOrAdmin(req, res, next) {
    try {
        const user = res.locals.user;
        if (!user) throw new UnauthorizedError();
        const admin = user.superAdmin || user.adminCompanyCode === req.params.companyCode;
        if (!(admin || user.email === req.params.email)) {
            throw new UnauthorizedError();
        };
        return next();
    } catch (err) {
        return next(err);
    };
};

function ensureSuperAdmin(req, res, next) {
    try {
        if (!(res.locals.user && res.locals.user.superAdmin)) {
            throw new UnauthorizedError();
        };
        return next();
    } catch (err) {
        return next(err);
    };
};

module.exports = {
    authenticateJWT,
    ensureLoggedIn, 
    ensureAdmin,
    ensureCorrectUserOrAdmin,
    ensureSuperAdmin
};