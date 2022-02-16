// Simple node.js script which uses sharedModule.js
//var argv = process.argv.slice(2)
//var seed = parseInt(argv[0]);   // TODO: simplistic

// https://nodejs.org/en/knowledge/command-line/how-to-parse-command-line-arguments/
// very powerful! Consider following as input:
//
//    node yarg.js –language=javascript –ide=GFG_IDE command1 command2 –b –v
//
// which produces:
//
// {
//  _ : [ 'command1', 'command2' ],
//  language: 'javascript',
//  ide: 'GFG_IDE',
//  b: true,
//  v: true,
//  '$0': 'yarg.js'
// }
//

// Get module.exports of sharedModule
const in_data = require('./data');
global.data = in_data['data'];

const yargs = require('yargs');
const argv = yargs
   .command('nodeApp.js', 'Launch a single execution of the simulation', {
	   
   })
   .option('seed', {
		description: 'Set the seed to use',
		type: 'int'
   })
   .option('adultBackpack', {
	   alias: 'abp',
	   description: '# of initial adult backpacks',
	   type: 'int'
   })
   .option('adult', {
	   alias: 'a',
	   description: '# of initial adult',
	   type: 'int'
   })
   .option('child', {
	   alias: 'c',
	   description: '# of initial child',
	   type: 'int'
   })
   .option('bike', {
	   alias: 'b',
	   description: '# of initial bikes',
	   type: 'int'
   })
   .option('debug', {
	   description: 'whether to show debug messages',
	   type: 'boolean'
   })
   .option('width', {
	   description: 'width of the simulation (at least 25)',
	   type: 'int'
   })
   .option('height', {
	   description: 'height of the simulation (at least 25)',
	   type: 'int'
   })
   .help()
   .alias('help', 'h').argv;

// process input   
// -------------------------------------------
seed = 0
if (typeof argv.seed !== 'undefined') {
	seed = argv.seed
}

// Default configuration
global.data.max['AdultBackpack'] = 0;
global.data.max['AdultBike'] = 0;
global.data.max['Adult'] = 500;
global.data.max['Child'] = 0;

// populate based on inputs
if (typeof argv.abp !== 'undefined') {
	global.data.max['AdultBackpack'] = argv.abp
}
if (typeof argv.a !== 'undefined') {
	global.data.max['Adult'] = argv.a
}
if (typeof argv.c !== 'undefined') {
	global.data.max['Child'] = argv.c
}
if (typeof argv.ab !== 'undefined') {
	global.data.max['AdultBike'] = argv.ab
}

// change size of simulation (NOTE: not compatible if room layouts are selected!)
if (typeof argv.width !== 'undefined') {
	global.data.width_i = argv.width
}
if (typeof argv.height !== 'undefined') {
	global.data.width_ii = argv.height
}

console.log(global.data.max);

// SKIP the GUI!
global.gui = {}
global.gui.headless = true;

const debug = require('./debug');
global.debug = debug['debug'];
global.debug.active = false;   // disable debug messages
if (typeof argv.debug !== 'undefined') {
	global.debug.active = argv.debug
}

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

const lzw = require('./LZWEncoder');
const nq = require('./NeuQuant');
const gife = require('./GIFEncoder');
const b64 = require('./b64');

final.final.resolution_strategy = global.conflict.factory('ChooseDifferentExit', 8);

function process_all() {
   console.log(seed + "," + final.final.total_exit_time);
}

// If hasn't stopped after 5,000 generations, that is it
final.final.start_simulation(5000, process_all);
