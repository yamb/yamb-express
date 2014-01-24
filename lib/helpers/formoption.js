"use strict";

var util = require('util'),

template = '<option value="%s"%s>%s</option>';

module.exports = function formoption(arr) {
  var html = '', related = false, select;

  if (this.post && this.post.related && this.post.related.length > 0) {
    related = this.post.related;
  }

  for (var i=0, length=arr.length; i<length; i++) {
    if (related && related.indexOf('' + arr[i].id) != -1) {
      select = ' selected';
    } else {
      select = '';
    }

    html += util.format(template, arr[i].id, select, arr[i].title);
  }

  return html;
};