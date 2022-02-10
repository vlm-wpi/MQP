// Simple node.js script which uses sharedModule.js

// Get module.exports of sharedModule
const in_data = require('./data');
global.data = in_data['data'];

// configure as you want...
global.data.max['AdultBackpack'] = 0;
global.data.max['AdultBike'] = 0;
global.data.max['Adult'] = 500;
global.data.max['Child'] = 0;

// SKIP the GUI!
global.gui = {}
global.gui.headless = true;

const pop = require('./pop');
global.pop = pop['pop'];

const heap = require('./heap');
global.heap = heap['heap'];

const conflict = require('./conflict');
global.conflict = astar['conflict'];

final.resolution_strategy = conflict.factory('ChooseDifferentExit', 8);

const astar = require('./astar');
global.astar = astar['astar'];

const voronoi = require('./voronoi');
global.voronoi = voronoi['voronoi'];

const app = require('./final');
global.app = astar['final'];
const lzw = require('./LZWEncoder');
const nq = require('./NeuQuant');
const gife = require('./GIFEncoder');
const b64 = require('./b64');

function process_all() {
   console.log(app.final.get_state().population);
   console.log("DONE");
   var things = global.pop.types();

   for (i = 0; i < things.length; i++) {
     var tpe = things[i];
     console.log(tpe + ": " + app.final.collisions_total[tpe]);
   }
}

// run for 100 steps...
console.log(app);
app.final.start_simulation(10, process_all);

//https://www.npmjs.com/package/random-seed//used this site for random seed info
var rand = require('random-seed').create(); //random seed
var n = rand(1000); // generate a number between 0 and 999
console.log('n: ' + n);

