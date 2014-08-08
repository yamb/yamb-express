"use strict";

var wrap = require('co-express');
var thunks = {};

thunks.index = function *(req, res) {
  var posts = yield res.yamb.fetchAll({active: true});

  res.render('yamb/index', {
    posts: posts
  });
};

thunks.show = function *(req, res) {
  var uri = [
    req.params.year,
    req.params.month,
    req.params.slug
  ];

  var post = yield res.yamb.fetch({uri: '/' + uri.join('/')});
  var related = yield post.similar();

  res.render('yamb/show', {
    post: post,
    related: related
  });
};

for (var name in thunks) {
  if (thunks.hasOwnProperty(name)) {
    exports[name] = wrap(thunks[name]);
  }
}