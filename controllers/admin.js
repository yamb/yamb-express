"use strict";

var wrap = require('co-express');
var thunks = {};

thunks.index = function *(req, res) {
  var posts = yield res.yamb.fetchAll();

  res.render('admin/index', {
    posts: posts
  });
};

thunks.create = function *(req, res) {
  var related = yield res.yamb.fetchAll(null, {sort: 'name'});

  res.render('admin/show', {
    post: {},
    related: related
  });
};

thunks.save = function *(req, res) {
  var post = res.yamb.create(req.body);

  try {
    yield post.save();
  } catch (err) {
    return res.redirect('/yamb/create?error=' + err.message);
  }

  res.redirect('/yamb/' + post.id);
};

thunks.show = function *(req, res) {
  var related = yield res.yamb.fetchAll({id: {$ne: res.post.id}}, {sort: 'name'});

  res.render('admin/show', {
    related: related
  });
};

thunks.update = function *(req, res) {
  if (!req.body.related) {
    req.body.related = [];
  }
  if (!req.body.active) {
    req.body.active = false;
  }

  var post = res.post.update(req.body);

  try {
    yield post.save();
  } catch (err) {
    return res.redirect('/yamb/' + post.id + '?error=' + err.message);
  }

  res.redirect('/yamb/' + post.id);
};

thunks.remove = function *(req, res) {
  var result = yield res.post.remove();
  delete res.post;

  res.redirect('/yamb?result=' + result);
};

for (var name in thunks) {
  if (thunks.hasOwnProperty(name)) {
    exports[name] = wrap(thunks[name]);
  }
}