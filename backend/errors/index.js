const { sendResponse } = require('../utils');

const routeNotFound = (req, res) => {
  return sendResponse(res, 'error', 404, 'Route not found');
};

const welcome = (req, res) => {
  return sendResponse(res, 'success', 200, 'Welcome to POS System API');
};

const errorHandler = (error, req, res, next) => {
  console.log('Error Name', error.name);
  console.log(error);
  switch (error.name) {
    case 'MongoServerError': // Or MongoError
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        const message = field.toUpperCase() + ' is duplicate';
        console.log('Error = > ', message);
        return sendResponse(res, 'fail', 409, message);
      }
      break;
    default:
      break;
  }

  const status = error.status || 500;
  console.log('Error = > ', error.message);
  return sendResponse(res, 'error', status, error.message);
};

module.exports = {
  routeNotFound,
  errorHandler,
  welcome,
};
