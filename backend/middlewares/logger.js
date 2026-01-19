const path = require('path');
const fs = require('fs');
const morgan = require('morgan');

morgan.token('date', () => {
  return new Date().toISOString();
});

const logger = () => {
  return morgan('dev');
};

const log_saver = () => {
  const logsDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  return morgan(':method :status ( :url ) ( :date ) :response-time ms', {
    stream: fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' }),
  });
};

module.exports = { logger, log_saver };
