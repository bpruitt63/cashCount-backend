const express = require("express");
const jsonschema = require('jsonschema');
const User = require('../models/user');
const loginSchema = require('../schemas/loginSchema.json');
const adminNewSchema = require('../schemas/adminNew.json');
const userNewSchema = require('../schemas/userNew.json');
const userUpdateSchema = require('../schemas/userUpdate.json');
const { BadRequestError } = require("../expressError");
const { createToken } = require("../helpers");
const { ensureAdmin,
        ensureCorrectUserOrAdmin,
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


// router.patch('/:email', ensureCorrectUserOrAdmin, async function(req, res, next){
//     try {
//         const validator = jsonschema.validate(req.body, userUpdateSchema);
//         if (!validator.valid) {
//             const errs = validator.errors.map(e => e.stack);
//             throw new BadRequestError(errs);
//         };
//         if (req.body.admin && !res.locals.user.admin) {
//             throw new UnauthorizedError("Only admins can grant admin permissions");
//         };
//         if (req.body.active && !res.locals.user.active) {
//             throw new UnauthorizedError("Only admins can make users active");
//         };
//         let user = await User.update(req.params.email, req.body);

//         let token;

//         //Update token if user is editing self
//         if (res.locals.user.email === req.params.email) {
//             user = await User.get(user.email);
//             token = createToken(user);
//         };
//         return res.json({user, token});
//     } catch(err) {
//         return next(err);
//     };
// });


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