"use strict";

exports.index = function *(req, res) {
  var posts = yield res.yamb.fetchAll();

  res.render('admin/index', {
    posts: posts
  });
};

exports.create = function *(req, res) {
  var related = yield res.yamb.fetchAll(null, {sort: 'name'});

  res.render('admin/show', {
    post: {},
    related: related
  });
};

exports.save = function *(req, res) {
  var post = res.yamb.create(req.body);

  try {
    yield post.save();
  } catch (err) {
    return res.redirect('/yamb/create?error=' + err.message);
  }

  res.redirect('/yamb/' + post.id);
};

exports.show = function *(req, res) {
  var related = yield res.yamb.fetchAll({id: {$ne: res.post.id}}, {sort: 'name'});

  console.log(res.post.json());

  res.render('admin/show', {
    related: related
  });
};

exports.update = function *(req, res) {
  if (!req.body.related) {
    req.body.related = [];
  }

  var post = res.post.update(req.body);

  try {
    yield post.save();
  } catch (err) {
    return res.redirect('/yamb/' + post.id + '?error=' + err.message);
  }

  res.redirect('/yamb/' + post.id);
};

exports.remove = function *(req, res) {
  var result = yield res.post.remove();

  res.redirect('/yamb?result=' + result);
};