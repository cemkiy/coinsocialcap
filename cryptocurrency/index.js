const cryptocurrencies = require('./route');

function initUser(app) {
  app.use('/cc', cryptocurrencies);
}

module.exports = initCryptocurrency;
