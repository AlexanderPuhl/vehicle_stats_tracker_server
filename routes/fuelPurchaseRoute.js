'use strict';

const express = require('express');
const router = express.Router();

const { fuelController } = require('../controllers');

router.route('/').get(fuelController.getAllFuelPurchases);
router.route('/:fuelPurchaseId').get(fuelController.getOneFuelPurchase);
router.route('/').post(fuelController.createFuelPurchase);
router.route('/:fuelPurchaseId').put(fuelController.updateFuelPurchase);
router.route('/:fuelPurchaseId').delete(fuelController.deleteFuelPurchase);

module.exports = router;
