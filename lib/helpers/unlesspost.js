"use strict";

module.exports = function unlesspost(text, value, options) {
  if (this.post && this.post.id) {
    return value;
  } else {
    return text;
  }
};