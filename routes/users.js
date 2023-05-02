const express = require("express");
const jsonschema = require('jsonschema');
const User = require('../models/user');
const loginSchema = require('../schemas/loginSchema.json');
const adminNewSchema = require('../schemas/adminNew.json');
const userNewSchema = require('../schemas/userNew.json');
const adminUpdateSchema = require('../schemas/adminUpdate.json');
const userUpdateSchema = require('../schemas/userUpdate.json');
const { BadRequestError } = require("../expressError");
const { createToken, generatePassword } = require("../helpers");
const { sendPasswordReset } = require('../email');
const { ensureAdmin,
        ensureSuperAdmin } = require("../middleware/auth");

const router = new express.Router();


router.post('/login', async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, loginSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        };

        const {id, password} = req.body;
        let user = await User.login(id, password);
        const token = createToken(user);

        return res.json({token});

    } catch(err) {
        return next(err);
    };
});


router.post('/createAdmin', ensureSuperAdmin, async function(req, res, next){
    try{
        const validator = jsonschema.validate(req.body, adminNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        };

        const {id, email, password, firstName, lastName, superAdmin} = req.body;
        let user = await User.create({id, email, password, firstName, lastName, superAdmin});
        return res.json({user});
    } catch(err) {
        return next(err);
    };
});


router.post('/create/:companyCode', ensureAdmin, async function(req, res, next){
    try{
        const validator = jsonschema.validate(req.body, userNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        };

        const {id, email, password, firstName, lastName, companyAdmin,
                active, emailReceiver} = req.body;
        const superAdmin = false;
        const userCompanyCode = req.params.companyCode;
        let user = await User.create({id, email, password, firstName, 
                                    lastName, companyAdmin, active, 
                                    userCompanyCode, superAdmin, emailReceiver});
        return res.json({user});
    } catch(err) {
        return next(err);
    };
});


// Update super admin
router.patch('/:id', ensureSuperAdmin, async function(req, res, next){
    try {
        const validator = jsonschema.validate(req.body, adminUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        };

        const user = await User.updateUserInfo(req.params.id, req.body);

        let token;

        //Update token if user is editing self
        if (res.locals.cashCountUser.id === req.params.id) {
            token = createToken(user);
        };
        return res.json({user, token});
    } catch(err) {
        return next(err);
    };
});


// Update company level user or admin
router.patch('/:id/company/:companyCode', ensureAdmin, async function(req, res, next){
    try {
        const validator = jsonschema.validate(req.body, userUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        };

        const {id, companyCode} = req.params;

        const userPrevData = await User.get(id);
        const superAdmin = userPrevData.superAdmin;

        const {email, firstName, lastName, password, companyAdmin} = req.body;
        let {emailReceiver, active} = req.body;

        const userData = {email, password, firstName, lastName, superAdmin};
        for (let key of Object.keys(userData)) {
            if (userData[key] === undefined) delete userData[key];
        };

        const user = await User.updateUserInfo(id, userData);

        if (active === undefined) {
            active = 'active' in userPrevData ? userPrevData.active : true;
        };
        if (emailReceiver === undefined) {
            emailReceiver = 'emailReceiver' in userPrevData ? userPrevData.emailReceiver : false;
        };

        if (companyAdmin) {
            const hasPassword = await User.hasPassword(id);
            if (!user.email || !hasPassword) {
                throw new BadRequestError('Email and password are required for admin');
            };
            if (emailReceiver === null) emailReceiver = false;
            let admin;
            if (userPrevData.adminCompanyCode) {
                admin = await User.updateCompanyAdmin(id, companyCode, emailReceiver);
            } else {
                admin = await User.addCompanyAdmin(id, companyCode, emailReceiver);
            };
            user.userCompanyCode = admin.adminCompanyCode;
            user.adminCompanyCode = admin.adminCompanyCode;
            user.emailReceiver = admin.emailReceiver;
            user.active = true;
        } else {
            let companyUser;
            if (userPrevData.adminCompanyCode) {
                companyUser = await User.removeCompanyAdmin(id, companyCode, active);
            } else {
                companyUser = await User.updateCompanyUser(id, companyCode, active);
            };
            user.userCompanyCode = companyUser.userCompanyCode;
            user.active = companyUser.active;
        };

        return res.json({user});
    } catch(err) {
        return next(err);
    };
});


// Reset forgotten password
router.patch('/:id/reset_password', async function(req, res, next){
    try {
        let user = await User.get(req.params.id);
        if (user.email !== req.body.email) throw new BadRequestError(`Incorrect email for ${req.params.id}`);
        const resetPassword = generatePassword();
        user = await User.updateUserInfo(user.id, {password: resetPassword});
        await sendPasswordReset(user, {password: resetPassword});
        return res.json({user});
    } catch(err) {
        return next(err);
    };
});


router.get('/:companyCode/:id', ensureAdmin, async function(req, res, next){
    try {
        const user = await User.get(req.params.id);
        return res.json({user});
    } catch(err) {
        return next(err);
    };
});


router.get('/:companyCode', ensureAdmin, async function(req, res, next){
    try {
        const users = await User.getAll(req.params.companyCode);
        return res.json({users});
    } catch(err) {
        return next(err);
    };
});

module.exports = router;