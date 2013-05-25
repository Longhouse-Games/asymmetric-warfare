var requirejs = require('requirejs');
requirejs.config({
  nodeRequire: require
//  baseUrl: 'js'
});

//make define available globally like it is in the browser
global.define = require('requirejs');

//make jasmine available globally like it is in the browser
jasmine = require('./vendor/jasmine-1.2.0/jasmine');
global.describe = jasmine.describe;
global.it = jasmine.it;
global.expect = jasmine.expect;
global.beforeEach = jasmine.beforeEach;
global.spyOn = jasmine.spyOn;
global.jasmine = jasmine.jasmine;

//bring in and list all the tests to be run
requirejs(
    [
      './spec/lib/state_move.spec',
      './spec/lib/state_turn.spec',
      './spec/lib/insurgent_move.spec',
      './spec/lib/insurgent_turn.spec',
      './spec/lib/position.spec',
      './spec/lib/board.spec',
      './spec/lib/pieces.spec',
      './spec/lib/constants.spec',
      './spec/lib/history.spec',
      './spec/lib/infowar.spec',
      './spec/lib/raven/bridge.spec',
      './spec/lib/kill.spec'
    ],
    function() {
  for (var i = 0; i < arguments.length; i++) {
    console.log('Running spec: '+ arguments[i].name);
  }
  var jasmine = require('./vendor/jasmine-1.2.0/jasmine').jasmine;
  var ConsoleJasmineReporter2 = require('./vendor/runner/consoleJasmineReporter2').ConsoleJasmineReporter;
  jasmine.getEnv().addReporter(new ConsoleJasmineReporter2());
  jasmine.getEnv().execute();
});
