"use strict";

module.exports = function unlesspost(text, value) {
  if (this.post && this.post.id) {
    return value;
  } else {
    return text;
  }
};