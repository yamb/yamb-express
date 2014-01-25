"use strict";

exports.index = function *(req, res) {
  var posts = yield res.yamb.fetchAll({active: true});

  res.render('yamb/index', {
    posts: posts
  });
};

exports.show = function *(req, res) {
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