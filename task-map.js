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
 * Loads a tasks configuration into the TaskMap.
 *
 * @param {Object.<string, Object>} config
 */
TaskMap.prototype.load = function(config) {
  Object.keys(config).map(function(taskName) {
    this.tasks[taskName] = new Task(taskName, config[taskName]);
  }.bind(this));
};

/**
 * Returns an alphabetically sorted list of task names
 * defined in the TaskMap.
 *
 * @returns {string[]}
 */
TaskMap.prototype.names = function() {
  return Object.keys(this.tasks).sort();
};

/**
 * Returns true if a task is defined in the TaskMap.
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

  return this.tasks[taskName];
};

module.exports = TaskMap;
