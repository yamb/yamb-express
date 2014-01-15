"use strict";

function NotFound(message) {
  this.name = 'NotFound';
  this.message = message;
}

NotFound.prototype = new Error();
NotFound.prototype.constructor = NotFound;

module.exports = NotFound;