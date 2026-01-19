const cors = require('cors');

const whiteList = ['http://localhost:5174'];

const corsOptions = {
  origin: whiteList,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200,
  credentials: true,
};

const myCorsPolicy = () => cors(corsOptions);

module.exports = { myCorsPolicy };
