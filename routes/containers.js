const express = require("express");
const jsonschema = require('jsonschema');
const Container = require('../models/container');
const Count = require('../models/count');
const User = require('../models/user');
const containerNewSchema = require('../schemas/containerNew.json');
const containerUpdateSchema = require('../schemas/containerUpdate.json');
const countSchema = require('../schemas/countSchema.json');
const { BadRequestError, UnauthorizedError } = require('../expressError');
const { ensureAdmin } = require("../middleware/auth");
const sendVarianceEmail = require('../email.js');


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
});

router.post('/:containerId/count', async function(req, res, next) {
    try {
        const {containerId} = req.params;
        const data = req.body;
        const {userCompanyCode, superAdmin, active,
                firstName, lastName} = await User.get(data.userId);
        const {companyCode, target, name,
                posThreshold, negThreshold} = await Container.get(containerId);
        if (!(superAdmin || (active && (userCompanyCode === companyCode)))){
            throw new UnauthorizedError('User is not authorized to post at this company');
        };

        const validator = jsonschema.validate(req.body, countSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        };

        const count = await Count.addCount({...data, containerId});

        let variance = req.body.cash - +target;
        if (variance >= +posThreshold || variance <= -negThreshold) {
            variance = (Math.round(variance * 100) / 100).toFixed(2);
            const emailData = {target, posThreshold, negThreshold, variance,
                                countData: req.body, containerName: name,
                                userName: `${firstName} ${lastName}`};
            await sendVarianceEmail(variance, companyCode, emailData);
        };

        return res.json({count});
    } catch(err) {
        return next(err);
    };
});

router.get('/:containerId/counts', async function(req, res, next) {
    try {
        const {containerId} = req.params;
        const startTime = req.query.startTime;
        const endTime = req.query.endTime;
        const counts = await Count.getCounts(containerId, startTime, endTime);
        return res.json({counts});
    } catch(err) {
        return next(err);
    };
});

router.patch('/:containerId/company/:companyCode', ensureAdmin, async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, containerUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        };

        const containerCompany = (await Container.get(req.params.containerId)).companyCode;
        if (req.params.companyCode !== containerCompany) {
            throw new UnauthorizedError('Container does not belong to this company');
        };

        const container = await Container.update(req.params.containerId, req.body);
        return res.json({container});
    } catch(err) {
        return next(err);
    };
});


module.exports = router;