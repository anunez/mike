'use strict';

jest.dontMock('../task');
var Task = require('../task');

describe('task', function() {
  describe('constructor', function() {
    it('should create a task with an empty body', function() {
      var task = new Task('something');
      expect(task.getName()).toEqual('something');
    });
  });

  describe('getName()', function() {
    it('should return the task name', function() {
      var task = new Task('something', {});
      expect(task.getName()).toEqual('something');
    });
  });

  describe('getPreconditions()', function() {
    it('should return the preconditions', function() {
      var preconditions = ['pre1', 'pre2'];
      var task = new Task('something', {'pre': preconditions});
      expect(task.getPreconditions()).toEqual(preconditions);
    });

    it('should return an array when initialized with a string', function() {
      var task = new Task('something', {'pre': 'pre1'});
      expect(task.getPreconditions()).toEqual(['pre1']);
    });
  });

  describe('getCommands()', function() {
    it('should return the commands', function() {
      var commands = ['cmd1', 'cmd2'];
      var task = new Task('something', {'cmd': commands});
      expect(task.getCommands()).toEqual(commands);
    });

    it('should return an array when initialized with a string', function() {
      var task = new Task('something', {'cmd': 'cmd1'});
      expect(task.getCommands()).toEqual(['cmd1']);
    });
  });

  describe('getOutputs()', function() {
    it('should return the outputs', function() {
      var outputs = ['out1', 'out2'];
      var task = new Task('something', {'out': outputs});
      expect(task.getOutputs()).toEqual(outputs);
    });

    it('should return an array when initialized with a string', function() {
      var task = new Task('something', {'out': 'out1'});
      expect(task.getOutputs()).toEqual(['out1']);
    });
  });

  describe('isSpawnable()', function() {
    it('should return false by default', function() {
      var task = new Task('something', {});
      expect(task.isSpawnable()).toBe(false);
    });

    it('should return true if it is spawnable', function() {
      var task = new Task('something', {'spawn': true});
      expect(task.isSpawnable()).toBe(true);
    });

    it('should return true if it is not spawnable', function() {
      var task = new Task('something', {'spawn': false});
      expect(task.isSpawnable()).toBe(false);
    });
  });
});
