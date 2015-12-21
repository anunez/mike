'use strict';

/**
 * Task Constructor.
 *
 * @param {string} name
 * @param {Object} [body={}]
 * @param {string|string[]} [body.pre=[]]
 * @param {string|string[]} [body.cmd=[]]
 * @param {string|string[]} [body.out=[]]
 * @param {boolean} [body.spawn=false]
 * @constructor
 */
var Task = function(name, body) {
  this.name = name;

  body = body || {};
  this.pre = body.pre || [];
  this.cmd = body.cmd || [];
  this.out = body.out || [];
  this.spawn = body.spawn || false;
};

/**
 * Returns the name of the task.
 *
 * @returns {string}
 */
Task.prototype.getName = function() {
  return this.name;
};

/**
 * Returns the list of task names that need to be ran before
 * this task.
 *
 * @returns {string[]}
 */
Task.prototype.getPreconditions = function() {
  return Array.isArray(this.pre) ? this.pre : [this.pre];
};

/**
 * Returns the list of commands that compose this task.
 *
 * @returns {string[]}
 */
Task.prototype.getCommands = function() {
  return Array.isArray(this.cmd) ? this.cmd : [this.cmd];
};

/**
 * Returns the list of output files and folders that this
 * task generates.
 *
 * @returns {string[]}
 */
Task.prototype.getOutputs = function() {
  return Array.isArray(this.out) ? this.out : [this.out];
};

/**
 * Returns true if the task must be spawned.
 *
 * @returns {boolean}
 */
Task.prototype.isSpawnable = function() {
  return !!this.spawn;
};

module.exports = Task;
