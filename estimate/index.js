const estimates = require('./route');

function initEstimate(app) {
  app.use('/estimates', estimates);
}

module.exports = initEstimate;
