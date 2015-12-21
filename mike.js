#!/usr/bin/env node

'use strict';
var child_process = require('child_process');
var colors = require('colors/safe');
var fs = require('fs');
var program = require('commander');

var TaskMap = require('./task-map');

var TASKS_FILE = 'mikefile.js';

var rootTask = 'default';

program
  .version('0.0.1')
  .arguments('<task>')
  .option('-f, --force', 'Force rebuilding already created outputs')
  .option('-m --mute', 'Mute stderr output from tasks')
  .option('-a, --all', 'Display all stdout output from tasks')
  .action(function(task) {
    if (task) {
      rootTask = task;
    }
  })
  .parse(process.argv);

// Load the tasks file
var tasksFile = process.cwd() + '/' + TASKS_FILE;
try {
  var tasks = new TaskMap(require(tasksFile));
} catch (e) {
  fail(e.message);
}

console.log('Using file ' + colors.magenta(tasksFile));

if (!tasks.contains(rootTask)) {
  console.log(colors.yellow('Available tasks: '));

  tasks.names().map(function(task) {
    console.log('  ' + task);
  });

  fail(rootTask + ' task is not defined');
}

// All of the promises will be stored in this object, so that tasks that are
// required multiple times in the task tree are reused and only ran once.
var promiseCache = {};

var totalTime = process.hrtime();

execute(rootTask).then(function() {
  logTime(colors.green('All done') + ' after ' + colors.magenta(duration(totalTime) + ' seconds'));
});

/**
 * Executes a task:
 *   1. If there is any existing file or directory that is listed in 'out',
 *      the task will be resolved immediately, unless the --force parameter
 *      is passed.
 *   2. Executes all tasks specified in the 'pre' field, in parallel.
 *   3. Executes all shell scripts specified in 'cmd', sequentially. If the
 *      'spawn' option is set to true, it will use spawn instead of exec.
 * @param {string} taskName The name of the task to run.
 * @returns {Promise}
 */
function execute(taskName) {
  try {
    var task = tasks.get(taskName);
  } catch (e) {
    fail(e.message);
  }

  return new Promise(function(resolve, reject) {
    var preconditions = [];

    task.getPreconditions().forEach(function(preTask) {
      if (promiseCache.hasOwnProperty(preTask)) {
        preconditions.push(promiseCache[preTask]);
      } else {
        var prePromise = execute(preTask);
        promiseCache[preTask] = prePromise;
        preconditions.push(prePromise);
      }
    });

    Promise.all(preconditions).then(function() {
      if (!program.force) {
        var outputs = task.getOutputs();
        for (var i = 0; i < outputs.length; i++) {
          var stats = fs.statSync(outputs[i]);
          if (stats.isFile() || stats.isDirectory()) {
            resolve();
            return;
          }
        }
      }

      var taskCommands = task.getCommands();

      if (!taskCommands.length) {
        resolve();
        return;
      }

      logTime('Starting ' + colors.cyan.bold(taskName) + '...');

      var taskTime = process.hrtime();

      var commands = taskCommands.map(function(cmd) {
        return function(resolveCommand, rejectCommand) {
          if (task.isSpawnable()) {
            var isInitialData = true;
            var shell = child_process.spawn('sh');

            shell.stdout.on('data', function(data) {
              if (isInitialData) {
                logTime(colors.cyan(taskName) + ' ' + colors.magenta(cmd));
                isInitialData = false;
              }
              process.stdout.write(data);
            });

            shell.stderr.on('data', function(data) {
              if (isInitialData) {
                logTime(colors.cyan(taskName) + ' ' + colors.magenta(cmd));
                isInitialData = false;
              }
              process.stderr.write(data);
            });

            shell.on('close', function(code) {
              if (code === 0) {
                resolve();
              } else {
                rejectCommand();
              }
            });

            shell.stdin.write(cmd);
            shell.stdin.end();
          } else {
            child_process.exec(cmd, function(err, out, stderr) {
              var headerPrinted = false;

              if (err instanceof Error || program.all && out.length > 0) {
                logTime(colors.cyan(taskName) + ' ' + colors.magenta(cmd));
                headerPrinted = true;
                out.trim().split('\n').map(function(line) {
                  console.log(colors.white(line));
                });
              }

              if (err instanceof Error || !program.mute && stderr.length > 0) {
                if (!headerPrinted) {
                  logTime(colors.cyan(taskName) + ' ' + colors.magenta(cmd));
                }
                stderr.trim().split('\n').map(function(line) {
                  console.log(colors.yellow(line));
                });
              }

              if (err instanceof Error) {
                fail('failure when executing task ' + taskName);
              }

              resolveCommand();
            });
          }
        };
      });

      // Execute commands sequentially
      commands.reduce(function(cur, next) {
        return cur.then(function() {
          return new Promise(next);
        });
      }, Promise.resolve()).then(function() {
        logTime('Finished ' + colors.cyan.bold(taskName) + ' after ' + colors.magenta(duration(taskTime) + ' seconds'));
        resolve();
      }).catch(reject);
    });
  });
}

/**
 * Returns the number of seconds passed since startTime,
 * with 2 decimals.
 * @param {number} startTime
 * @returns {number}
 */
function duration(startTime) {
  var diff = process.hrtime(startTime);
  var seconds = diff[0] + (diff[1] / 1e9);
  return seconds.toFixed(2);
}

/**
 * Logs a message to console including the current time.
 * @param {string} message
 */
function logTime(message) {
  var date = new Date();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  var time = ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2);
  console.log('[' + colors.gray(time) + '] ' + message);
}

/**
 * Displays a failure message and terminates the process with
 * an error code.
 *
 * @param {string} message
 */
function fail(message) {
  console.error('\n' + colors.red('ERROR: ' + message));
  process.exit(1);
}
