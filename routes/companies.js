const express = require("express");
const jsonschema = require('jsonschema');
const Company = require('../models/company');
const companyNewSchema = require('../schemas/companyNew.json');
const { BadRequestError } = require('../expressError');
const { ensureSuperAdmin } = require("../middleware/auth");

const router = new express.Router();


router.post('/new', ensureSuperAdmin, async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, companyNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        };

        const company = await Company.create(req.body.companyCode);
        return res.json(company);
    } catch(err) {
        return next(err);
    };
});

module.exports = router;