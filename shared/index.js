/**
 * Shared modules - API client, config.
 * Use: const { postSensors, getSensors } = require('./shared');
 */
const config = require('./config');
const apiClient = require('./apiClient');

module.exports = {
  ...config,
  ...apiClient,
};
