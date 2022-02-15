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


const random = require('./random');
global.random = random['random'];
global.random.create(1234);  // SEED IT NOW

const pop = require('./pop');
global.pop = pop['pop'];

const heap = require('./heap');
global.heap = heap['heap'];

const conflict = require('./conflict');
global.conflict = conflict['conflict'];

const astar = require('./astar');
global.astar = astar['astar'];

const layout = require('./layout');
global.layout = layout['layout'];

const metrics = require('./metrics');
global.metrics = metrics['metrics'];

const voronoi = require('./voronoi');
global.voronoi = voronoi['voronoi'];

// has to be named 'final' because of dependencies between graph.js and final (?? why there ??)
const final = require('./final');
global.final = final['final'];

// d3 as part of gui
//const graph = require('./graph');
//global.graph = graph['graph'];

const lzw = require('./LZWEncoder');
const nq = require('./NeuQuant');
const gife = require('./GIFEncoder');
const b64 = require('./b64');

final.final.resolution_strategy = global.conflict.factory('ChooseDifferentExit', 8);

function process_all() {
   console.log(final.final.get_state().population);
   console.log("DONE");
   var things = global.pop.types();

   for (i = 0; i < things.length; i++) {
     var tpe = things[i];
     console.log(tpe + ": " + final.final.collisions_total[tpe]);
   }
}

// run for 100 steps...
console.log(final);
final.final.start_simulation(10, process_all);
