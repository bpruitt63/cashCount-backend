const express = require("express");
const jsonschema = require('jsonschema');
const Container = require('../models/container');
const containerNewSchema = require('../schemas/containerNew.json');
const { BadRequestError } = require('../expressError');
const { ensureAdmin } = require("../middleware/auth");


const router = new express.Router();

router.post('/:companyCode/new', ensureAdmin, async function(req, res, next){
    try {
        const validator = jsonschema.validate(req.body, containerNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        };

        const data = {...req.body, companyCode: req.params.companyCode};
        const container = await Container.create(data);
        return res.json({container});
    } catch(err) {
        return next(err);
    };
});

router.get('/:companyCode/all', async function(req, res, next){
    try {
        const {companyCode} = req.params;
        const containers = await Container.getAll(companyCode);
        return res.json({containers});
    } catch(err) {
        return next(err);
    };
})


module.exports = router;