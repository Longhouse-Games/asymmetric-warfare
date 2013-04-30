var requirejs = require('requirejs');
requirejs.config({
  nodeRequire: require
//  baseUrl: 'js'
});

//make define available globally like it is in the browser
global.define = require('requirejs');

//make jasmine available globally like it is in the browser
// global.describe = require('./lib/jasmine-1.1.0.rc1/jasmine').describe;
// global.it = require('./lib/jasmine-1.1.0.rc1/jasmine').it;
// global.expect = require('./lib/jasmine-1.1.0.rc1/jasmine').expect;
global.describe = require('./vendor/jasmine-1.2.0/jasmine').describe;
global.it = require('./vendor/jasmine-1.2.0/jasmine').it;
global.expect = require('./vendor/jasmine-1.2.0/jasmine').expect;
global.beforeEach = require('./vendor/jasmine-1.2.0/jasmine').beforeEach;


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
      './spec/lib/infowar.spec'
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
