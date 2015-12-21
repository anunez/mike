'use strict';

jest.dontMock('../task-map');
jest.dontMock('./fixtures/mikefile');

var TaskMap = require('../task-map');
var Task = require('../task');

describe('TaskMap', function() {
  describe('load()', function() {
    it('should load a config into the task map', function() {
      var config = require('./fixtures/mikefile');
      var taskMap = new TaskMap();
      taskMap.load(config);
      expect(taskMap.names().length).toEqual(Object.keys(config).length);
    });
  });

  describe('names()', function() {
    it('should return the task names in the task map', function() {
      var taskMap = new TaskMap();
      taskMap.load({'something':{}, 'another': {}});
      expect(taskMap.names()).toEqual(['another', 'something']);
    });
  });

  describe('contains()', function() {
    var taskMap = new TaskMap();
    taskMap.load({'something':{}, 'another': {}});

    it('should return true when it contains a task', function() {
      expect(taskMap.contains('another')).toBe(true);
    });

    it('should return false when it does not contain a task', function() {
      expect(taskMap.contains('invented')).toBe(false);
    });
  });

  describe('get()', function() {
    var taskMap = new TaskMap();
    taskMap.load({'something':{}, 'another': {}});

    it('should return a task', function() {
      expect(taskMap.get('something') instanceof Task).toBeTruthy();
    });

    it('should raise an exception when getting a non defined task', function() {
      expect(function() {
        taskMap.get('invented')
      }).toThrow();
    })
  });
});
