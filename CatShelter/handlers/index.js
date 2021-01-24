const homeHandler = require('./home');
const staticHandler = require('./static-handler');
const catHandler = require('./cat')

module.exports = [homeHandler, staticHandler, catHandler];