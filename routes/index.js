var controllers = require('./../controllers');

module.exports = function(server) {

  server.get('/', controllers.index);

};