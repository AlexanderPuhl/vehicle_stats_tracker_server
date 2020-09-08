'use strict';

const express = require('express');
const router = express.Router();

const { vehicleController } = require('../controllers');

router.route('/').get(vehicleController.getAllVehicles);
router.route('/:vehicleId').get(vehicleController.getOneVehicle);
router.route('/').post(vehicleController.createVehicle);
router.route('/:vehicleId').put(vehicleController.updateVehicle);
router.route('/:vehicleId').delete(vehicleController.deleteVehicle);

module.exports = router;
