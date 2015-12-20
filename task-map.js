'use strict';

var Task = require('./task');

/**
 * TaskMap Constructor.
 *
 * @constructor
 */
var TaskMap = function() {
  this.tasks = {};
};

/**
 * Adds a task to the TaskMap.
 *
 * @param {string} name
 * @param {Object} body
 */
TaskMap.prototype.add = function(name, body) {
  this.tasks[name] = new Task(name, body);
};

/**
 * Returns an alphabetically sorted list of defined task names.
 *
 * @returns {string[]}
 */
TaskMap.prototype.getTaskNames = function() {
  return Object.keys(this.tasks).sort();
};

/**
 * Returns true if the task exists.
 *
 * @param {string} taskName
 * @returns {boolean}
 */
TaskMap.prototype.contains = function(taskName) {
  return this.tasks.hasOwnProperty(taskName);
};

/**
 * Returns a Task given its name.
 *
 * @param {string} taskName
 * @returns {Task}
 */
TaskMap.prototype.get = function(taskName) {
  if (!this.contains(taskName)) {
    throw new Error('task ' + taskName + ' is not defined');
  }

  return new Task(taskName, this.tasks[taskName]);
};

module.exports = TaskMap;
