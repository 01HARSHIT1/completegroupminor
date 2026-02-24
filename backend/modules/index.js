/**
 * Backend modules - single import for all
 */
const config = require('./config');
const store = require('./store');
const csvSimulation = require('./csvSimulation');
const websocket = require('./websocket');
const routes = require('./routes');

module.exports = {
  config,
  store,
  csvSimulation,
  websocket,
  routes,
};
