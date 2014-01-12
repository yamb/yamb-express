"use strict";

exports.index = function *(req, res) {
  var posts = yield res.yamb.fetchAll();
  var html = 'ОКОКОК (' + posts.length + ')<br><br>';

  posts.forEach(function(post) {
    html += post.title + '<br>';
  });

  res.send(html);
};