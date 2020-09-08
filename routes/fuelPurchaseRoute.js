'use strict';

const express = require('express');
const router = express.Router();

const { fuelController } = require('../controllers');

router.route('/')
	.get(fuelController.getAllFuelPurchases)
	.post(fuelController.createFuelPurchase);

router.route('/:fuelPurchaseId')
	.get(fuelController.getOneFuelPurchase)
	.put(fuelController.updateFuelPurchase)
	.delete(fuelController.deleteFuelPurchase);

module.exports = router;
