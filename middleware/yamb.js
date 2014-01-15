"use strict";

// middleware for :yamb param in route
module.exports = function *(req, res, next, id) {
  var post = yield res.yamb.fetch({id: id});

  if (!post) {
    next(new res.error('Failed to load post'));
  } else {
    res.post = res.locals.post = post;
    next();
  }
};