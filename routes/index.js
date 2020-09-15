'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');

const localStrategy = require('../passport/localStrategy');
const jwtStrategy = require('../passport/jwt');

passport.use(localStrategy);
passport.use(jwtStrategy);

// Protect endpoints using JWT Strategy
const jwtAuth = passport.authenticate('jwt', {
	session: false,
	failWithError: true,
});

router.use('/api/user', require('./userRoute'));
router.use('/api/vehicle', jwtAuth, require('./vehicleRoute'));
router.use('/api/fuel_purchase', jwtAuth, require('./fuelPurchaseRoute'));

module.exports = router;
