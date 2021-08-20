const bcrypt = require('bcryptjs');
const knex = require('../db/knex');
const pg = require('../db/pg');

const { userTableFields } = require('../library/tableFields');
const { createAuthToken } = require('../utilities/jwtUtilities');
const {
  validateRequestBody,
  gatherTableUpdateableFields,
} = require('../utilities/requestBodyUtilities');

const updateableUserFields = gatherTableUpdateableFields(userTableFields);

// @desc Login a user
// @route POST /api/user/login
// @access Public
exports.loginUser = (req, res, next) => {
  const authToken = createAuthToken(req.user);
  res.json({ authToken });
};

// @desc Refresh a JWT Token for a logged in user
// @route POST /api/user/refresh
// @access Private
exports.refreshToken = (req, res, next) => {
  const authToken = createAuthToken(req.user);
  res.json({ authToken });
};

// @desc Create in user
// @route POST /api/user/create
// @access Public
exports.createUser = async (req, res, next) => {
  try {
    const error = validateRequestBody(req, userTableFields, next);
    if (error instanceof Error) {
      return next(error);
    }

    const {
      username, password, email, name,
    } = req.body;

    const { rows } = await pg.query('SELECT * FROM public.user WHERE username = $1 or email = $2', [username, email]);
    if (rows.length === 0) {
      const query = 'INSERT INTO public.user(username, password, email, name) VALUES($1, $2, $3, $4) RETURNING *';
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = [username, hashedPassword, email, name];
      const { rows } = await pg.query(query, newUser);
      const result = rows[0];
      const response = {
        user_id: result.user_id,
        name: result.name,
        email: result.email,
        username: result.username,
        onboarding: result.onboarding,
        selected_vehicle_id: result.selected_vehicle_id,
        reset_token: result.reset_token,
        reset_token_expiration: result.reset_token_expiration,
      };
      res
        .status(201)
        .location(`${req.originalUrl}/${response.user_id}`)
        .json(response);
    } else {
      const error = new Error('The username or email already exists.');
      error.status = 400;
      error.reason = 'ValidationError';
      next(error);
    }
  } catch (error) {
    next(error);
  }
};

// @desc Update a user
// @route POST /api/user/update
// @access Private
exports.updateUser = (req, res, next) => {
  const error = validateRequestBody(req, userTableFields, next);
    if (error instanceof Error) {
      return next(error);
    }

  const userId = req.user.user_id;
  const toUpdate = {};

  updateableUserFields.forEach((field) => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  toUpdate.modified_on = new Date(Date.now()).toISOString();

  knex('user')
    .returning('*')
    .where({ user_id: userId })
    .update(toUpdate)
    .then((results) => {
      const result = results[0];
      const user = {};
      for (const property in result) {
        user[property] = result[property];
      }
      delete user.password;
      res.status(200).json(user);
    })
    .catch((error) => {
      next(error);
    });
};

// @desc Delete a user
// @route POST /api/user/delete
// @access Private
exports.deleteUser = async (req, res, next) => {
  try {
    const { user_id } = req.user;
    const { rowCount } = await pg.query('DELETE FROM public.user WHERE user_id = $1', [user_id]);
    if (rowCount === 1) {
      res
        .status(204)
        .json({ message: 'User account deleted.' });
    }
  } catch (error) {
    next(error);
  }
};

//* ***************************************************************************************************************//
//* *****************************************//TEST UTILITY CONTROLLERS//******************************************//
//* ***************************************************************************************************************//
exports.findOne = async (username) => {
  try {
    const { rows } = await pg.query('select * from public.user WHERE username = $1', [username]);
    return rows[0];
  } catch (error) {
    return error;
  }
};
