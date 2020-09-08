'use strict';

const express = require('express');
const router = express.Router();

const { vehicleController } = require('../controllers');

router.route('/')
	.get(vehicleController.getAllVehicles)
	.post(vehicleController.createVehicle);

router.route('/:vehicleId')
	.get(vehicleController.getOneVehicle)
	.put(vehicleController.updateVehicle)
	.delete(vehicleController.deleteVehicle);

module.exports = router;
