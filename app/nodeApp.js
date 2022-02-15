// Simple node.js script which uses sharedModule.js
var argv = process.argv.slice(2)
var seed = parseInt(argv[0]);   // TODO: simplistic

// https://nodejs.org/en/knowledge/command-line/how-to-parse-command-line-arguments/

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

const debug = require('./debug');
global.debug = debug['debug'];
global.debug.active = false;   // disable debug messages

const random = require('./random');
global.random = random['random'];
global.random.create(seed);  // SEED IT NOW

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
   console.log(seed + "," + final.final.total_exit_time);
}

// run until stops....
final.final.start_simulation(undefined, process_all);
