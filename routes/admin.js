"use strict";

module.exports = function(server) {
  var action = require('./../controllers/admin');

  server.get('/yamb', action.index);
  server.get('/yamb/:yamb', action.show);
  server.post('/yamb/:yamb', action.update);
  server.post('/yamb/:yamb/remove', action.remove);
};