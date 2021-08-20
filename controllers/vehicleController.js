const knex = require('../db/knex');
const pg = require('../db/pg');

const { vehicleTableFields } = require('../library/tableFields');
const {
  validateRequestBody,
  gatherTableUpdateableFields,
} = require('../utilities/requestBodyUtilities');

const updateableVehicleFields = gatherTableUpdateableFields(vehicleTableFields);

// @desc Get all vehicles
// @route Get /api/vehicle
// @access Private
exports.getAllVehicles = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { rows } = await pg.query('SELECT * FROM vehicle WHERE user_id = $1', [userId]);
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

// @desc Get a vehicle
// @route Get /api/vehicle/:vehicleId
// @access Private
exports.getOneVehicle = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { vehicleId } = req.params;
    const { rows } = await pg.query('SELECT * FROM vehicle WHERE user_id = $1 AND vehicle_id = $2', [userId, vehicleId]);
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

// @desc Create a vehicles
// @route POST /api/vehicle/
// @access Private
exports.createVehicle = async (req, res, next) => {
  try {
    const error = validateRequestBody(req, vehicleTableFields, next);
    if (error instanceof Error) {
      return next(error);
    }

    const { user_id } = req.user;
    const newVehicle = { user_id };

    for (const [key, value] of Object.entries(req.body)) {
      newVehicle[key] = value;
    }

    knex
      .insert(newVehicle)
      .into('vehicle')
      .returning('*')
      .then((result) => {
        const results = result[0];
        res
          .status(201)
          .location(`${req.originalUrl}/${results.vehicle_id}`)
          .json(results);
      })
      .catch((error) => {
        next(error);
      });
  } catch (error) {
    next(error);
  }
};

// @desc Update a vehicles
// @route Put /api/vehicle/:vehicleId
// @access Private
exports.updateVehicle = (req, res, next) => {
  try {
    const error = validateRequestBody(req, vehicleTableFields, next);
    if (error instanceof Error) {
      return next(error);
    }

    const userId = req.user.user_id;
    const { vehicleId } = req.params;
    const toUpdate = {};

    updateableVehicleFields.forEach((field) => {
      if (field in req.body) {
        toUpdate[field] = req.body[field];
      }
    });

    toUpdate.modified_on = new Date(Date.now()).toISOString();

    knex('vehicle')
      .returning('*')
      .where({
        user_id: userId,
        vehicle_id: vehicleId,
      })
      .update(toUpdate)
      .then((results) => {
        const result = results[0];
        res
          .status(200)
          .location(`${req.originalUrl}/${result.fuel_purchase_id}`)
          .json(result);
      })
      .catch((error) => {
        next(error);
      });
  } catch (error) {
    next(error);
  }
};

// @desc Delete a vehicles
// @route Delete /api/vehicle/:vehicleId
// @access Private
exports.deleteVehicle = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;

    // //CHECK TO MAKE SURE VEHICLE_ID IS A NUMBER
    if (isNaN(vehicleId)) {
      const error = new Error('Invalid vehicle id.');
      error.status = 400;
      return next(error);
    }

    const { rowCount } = await pg.query('DELETE FROM vehicle WHERE vehicle_id = $1', [vehicleId]);
    if (rowCount === 1) {
      res
        .status(204)
        .json({ message: 'Vehicle deleted.' });
    } else {
      const error = new Error(
        `Could not find a vehicle with vehicle_id: ${vehicleId}.`,
      );
      error.status = 406;
      return next(error);
    }
  } catch (error) {
    next(error);
  }
};
