"use strict";

module.exports = function(app) {
  require('./yamb')(app);
  require('./admin')(app);
};