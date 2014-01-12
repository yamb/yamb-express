"use strict";

module.exports = function(server) {
  require('./yamb')(server);
  require('./admin')(server);
};