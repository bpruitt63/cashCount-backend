const express = require("express");
const jsonschema = require('jsonschema');
const User = require('../models/user');
const loginSchema = require('../schemas/loginSchema.json');
const userNewSchema = require('../schemas/userNew.json');
const userUpdateSchema = require('../schemas/userUpdate.json');
const { BadRequestError } = require("../expressError");
const { createToken } = require("../helpers");
const { ensureAdmin } = require("../middleware/auth");

const router = new express.Router();


router.post('/login', async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, loginSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        };

        const {email, password} = req.body;
        let user = await User.login(email, password);
        const token = createToken(user);

        return res.json({token});

    } catch(err) {
        return next(err);
    };
});


router.post('/create', ensureAdmin, async function(req, res, next){
    try{
        const validator = jsonschema.validate(req.body, userNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        };

        const {email, password, firstName, lastName, active, admin} = req.body;
        let user = await User.create({email, pwd, firstName, lastName, active, admin});
        return res.json({user});
    } catch(err) {
        return next(err);
    };
});

/** TODO: correct user middleware needed
 * self can't change active or admin
 * how to reset password
  */

// router.patch('/:email', ensureCorrectUserOrSuperAdmin, async function(req, res, next){
//     try {
//         const validator = jsonschema.validate(req.body, userUpdateSchema);
//         if (!validator.valid) {
//             const errs = validator.errors.map(e => e.stack);
//             throw new BadRequestError(errs);
//         };
//         if (req.body.superAdmin && !res.locals.user.superAdmin) {
//             throw new UnauthorizedError("Only Super Admins can grant Super Admin permissions");
//         };
//         let user = await User.update(req.params.email, req.body);

//         let token;

//         //Update token if user is editing self
//         if (res.locals.user.email === req.params.email) {
//             user = await User.get(user.email);
//             user = formatUserInfo(user);
//             token = createToken(user);
//         };
//         return res.json({user, token});
//     } catch(err) {
//         return next(err);
//     };
// });


/** TODO:  same shit as above, correct user middleware */

// router.get('/:email', ensureCorrectUserOrLocalAdmin, async function(req, res, next){
//     try {
//         let user = await User.get(req.params.email);
//         return res.json({user});
//     } catch(err) {
//         return next(err);
//     };
// });


router.get('/all', ensureAdmin, async function(req, res, next){
    try {
        const users = await User.getAll();
        return res.json({users});
    } catch(err) {
        return next(err);
    };
});

module.exports = router;