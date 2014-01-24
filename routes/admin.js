"use strict";

module.exports = function(app, middleware) {
  var action = require('./../controllers/admin');

  app.get('/yamb', action.index);

  app.get('/yamb/create', action.create);
  app.post('/yamb/create', action.save);

  app.get('/yamb/:yamb', action.show);
  app.post('/yamb/:yamb', action.update);

  app.get('/yamb/:yamb/remove', action.remove);
};