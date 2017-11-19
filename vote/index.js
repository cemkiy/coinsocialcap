const votes = require('./route');

function initVote(app) {
  app.use('/votes', votes);
}

module.exports = initVote;
