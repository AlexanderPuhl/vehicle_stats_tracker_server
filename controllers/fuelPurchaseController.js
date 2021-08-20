const knex = require('../db/knex');
const pg = require('../db/pg');

const { fuelPurchaseTableFields } = require('../library/tableFields');
const {
  validateRequestBody,
  gatherTableUpdateableFields,
} = require('../utilities/requestBodyUtilities');

const updateableFuelPurchaseFields = gatherTableUpdateableFields(fuelPurchaseTableFields);

// @desc Get all fuel purchases
// @route Get /api/fuel_purchase
// @access Private
exports.getAllFuelPurchases = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { rows } = await pg.query('SELECT * FROM fuel_purchase WHERE user_id = $1 ORDER BY date_of_fill_up DESC', [userId]);
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

// @desc Get a fuel purchase
// @route Get /api/fuel_purchase/:fuelPurchaseId
// @access Private
exports.getOneFuelPurchase = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { fuelPurchaseId } = req.params;
    const { rows } = await pg.query('SELECT * FROM fuel_purchase WHERE user_id = $1 AND fuel_purchase_id = $2', [userId, fuelPurchaseId]);
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

// @desc Create a fuel purchase
// @route Post /api/fuel_purchase
// @access Private
exports.createFuelPurchase = async (req, res, next) => {
  try {
    const error = validateRequestBody(req, fuelPurchaseTableFields, next);
    if (error instanceof Error) {
      return next(error);
    }

    const { user_id } = req.user;
    const newFuelPurchase = { user_id };

    for (const [key, value] of Object.entries(req.body)) {
      newFuelPurchase[key] = value;
    }

    knex
      .insert(newFuelPurchase)
      .into('fuel_purchase')
      .returning('*')
      .then((result) => {
        const results = result[0];
        res
          .status(201)
          .location(`${req.originalUrl}/${results.fuel_purchase_id}`)
          .json(results);
      })
      .catch((error) => {
        next(error);
      });
  } catch (error) {
    next(error);
  }
};

// @desc Update a fuel purchase
// @route PUT /api/fuel_purchase/:fuelPurchaseId
// @access Private
exports.updateFuelPurchase = (req, res, next) => {
  try {
    const error = validateRequestBody(req, fuelPurchaseTableFields, next);
    if (error instanceof Error) {
      return next(error);
    }

    const userId = req.user.user_id;
    const { fuelPurchaseId } = req.params;
    const toUpdate = {};

    updateableFuelPurchaseFields.forEach((field) => {
      if (field in req.body) {
        toUpdate[field] = req.body[field];
      }
    });

    toUpdate.modified_on = new Date(Date.now()).toISOString();

    knex('fuel_purchase')
      .returning('*')
      .where({
        user_id: userId,
        fuel_purchase_id: fuelPurchaseId,
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

// @desc Delete a fuel purchase
// @route DELETE /api/fuel_purchase/:fuelPurchaseId
// @access Private
exports.deleteFuelPurchase = async (req, res, next) => {
  try {
    const { fuelPurchaseId } = req.params;

    // //CHECK TO MAKE SURE FUEL_PURCHASE_ID IS A NUMBER
    if (isNaN(fuelPurchaseId)) {
      const error = new Error('Invalid fuel purchase id.');
      error.status = 400;
      return next(error);
    }

    const { rowCount } = await pg.query('DELETE FROM fuel_purchase WHERE fuel_purchase_id = $1', [fuelPurchaseId]);
    if (rowCount === 1) {
      res
        .status(204)
        .json({ message: 'Fuel purchase deleted.' });
    } else {
      const error = new Error(
        `Could not find a fuel purchase with fuel_purchase_id: ${fuelPurchaseId}.`,
      );
      error.status = 406;
      return next(error);
    }
  } catch (error) {
    next(error);
  }
};
