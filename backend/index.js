const express = require('express');

const { PORT } = require('./constants');

const { connect_database } = require('./models');
const { logger, limiter, helmet, compression, myCorsPolicy } = require('./middlewares');
const { welcome, errorHandler, routeNotFound } = require('./errors');
const routes = require('./routes');

const port = PORT;

const app = express();

const apiBase = '/api';

app.use(logger());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(myCorsPolicy());
app.use(compression());
app.use(limiter());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

app.all('/', welcome);

app.use(`${apiBase}`, routes);

app.use(errorHandler);
app.use(routeNotFound);

app.listen(port, () => {
  console.log(`POS SERVER RUNNING AT PORT http://localhost:${PORT}`);
  connect_database();
});

module.exports = { app };
