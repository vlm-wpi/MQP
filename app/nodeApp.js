// Simple node.js script which uses sharedModule.js

// Get module.exports of sharedModule
const in_data = require('./data');
global.data = in_data['data'];

// configure as you want...
global.data.max['AdultBackpack'] = 0;
global.data.max['AdultBike'] = 0;
global.data.max['Adult'] = 0;

// SKIP the GUI!
global.gui = {}
global.gui.headless = true;

const heap = require('./heap');
global.heap = heap['heap'];

const astar = require('./astar');
global.astar = astar['astar'];

const final = require('./final');
global.final = astar['final'];
const lzw = require('./LZWEncoder');
const nq = require('./NeuQuant');
const gife = require('./GIFEncoder');
const b64 = require('./b64');

function process_all() {
   console.log(final.get_state().population);
   console.log("DONE");
}

// run for 100 steps...
final.start_simulation(10, process_all);

