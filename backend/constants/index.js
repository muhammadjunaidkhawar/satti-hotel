require('dotenv').config({ quiet: true });

const requiredEnvVars = ['PORT', 'MONGO_URI', 'JWT_SECRET_KEY'];

const missing = requiredEnvVars.filter((v) => !process.env[v]);

if (missing.length > 0) {
  throw new Error(`❌ Missing required environment variables: ${missing.join(', ')}`);
}

const PORT = parseInt(process.env.PORT, 10) || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

module.exports = {
  PORT,
  MONGO_URI,
  JWT_SECRET_KEY,
};
