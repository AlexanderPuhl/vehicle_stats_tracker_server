'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');

const localStrategy = require('../passport/localStrategy');
const jwtStrategy = require('../passport/jwt');

const userRoute = require('./userRoute');
const vehicleRoute = require('./vehicleRoute');
const fuelPurchaseRoute = require('./fuelPurchaseRoute')

passport.use(localStrategy);
passport.use(jwtStrategy);

// Protect endpoints using JWT Strategy
const jwtAuth = passport.authenticate('jwt', {
	session: false,
	failWithError: true,
});

router.use('/api/user', userRoute);
router.use('/api/vehicle', jwtAuth, vehicleRoute);
router.use('/api/fuel_purchase', jwtAuth, fuelPurchaseRoute);

module.exports = router;
