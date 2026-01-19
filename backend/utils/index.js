const { getReasonPhrase } = require('http-status-codes');
const Bcrypt = require('bcrypt');
const { Types, isValidObjectId } = require('mongoose');

const sendResponse = (response, type, code, message, data = null) => {
  response.status(code).json({
    status: type,
    code: code,
    statusMessage: getReasonPhrase(code),
    message: message,
    result: data,
  });
};

const castToMongoID = (ID) => {
  return Types.ObjectId(ID);
};

const isMongoID = (ID) => {
  return isValidObjectId(ID);
};

const isEmpty = (value) => {
  return typeof value == 'undefined' || value === undefined || value == null || value.length <= 0 ? true : false;
};

const isError = (object) => {
  return Object.prototype.toString.call(object) === '[object Error]';
};

const generatePassword = async (password) => {
  return await Bcrypt.hash(password, 8);
};

const isPasswordMatched = async (actualPassword, password) => {
  const isMatched = await Bcrypt.compare(password, actualPassword);
  return isMatched;
};

const validationError = (errors) => {
  const errorMessage = errors.details[0].message;
  console.log('Validation Error = >', errorMessage);
  return errorMessage.split('"').join('');
};

module.exports = {
  sendResponse,
  isMongoID,
  isEmpty,
  isError,
  generatePassword,
  isPasswordMatched,
  castToMongoID,
  validationError,
};
