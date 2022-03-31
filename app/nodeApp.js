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
//  _ : [ 'command1', 'command2' ],    // ALL UNBOUND arguments go here...
//  language: 'javascript',             
//  ide: 'GFG_IDE',
//  b: true,
//  v: true,
//  '$0': 'yarg.js'
// }
//
// So all desired outputs appear as "module.field", thus the total_exit_time
// is 'final.total_exit_time'

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
      alias: 'ab',
      description: '# of initial bikes',
      type: 'int'
   })
   .option('obstacles', {
      alias: 'o',
      description: '# of obstacles',
      type: 'int'
   })
   .option('exits', {
      alias: 'e',
      description: '# of exits',
      type: 'int'
   })
   .option('debug', {
      description: 'whether to show debug messages',
      type: 'boolean'
   })
   .option('save_path', {
      description: 'whether to save the path for each pedestrian',
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
   .option('conflict1', {
      // "ChooseDifferentExit-17"
      description: 'Conflict Strategy #1 (see knownStrategies. Add Threshold after dash)',
      type: 'string'
   })
   .option('conflict2', {
      description: 'Conflict Strategy #2 (see knownStrategies. Add Threshold after dash)',
      type: 'string'
   })
   .option('conflict3', {
      description: 'Conflict Strategy #3 (see knownStrategies. Add Threshold after dash)',
      type: 'string'
   })
   .option('conflict4', {
      description: 'Conflict Strategy #4 (see knownStrategies. Add Threshold after dash)',
      type: 'string'
   })
   .option('layout', {
      description: 'Layout to use (see layout. Cannot Choose MyFile for now)',
      type: 'string'
   })
   .option('heuristic', {
      description: 'manhattan, euclidean, diagonal)  => make them boolean',
      type: 'string'
   })
   .option('output', {
      description: 'Allows the user to name the output file',
      type: 'string'
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
// global.data.max['AdultBackpack'] = 0;
// global.data.max['AdultBike'] = 0;
// global.data.max['Adult'] = 0;
// global.data.max['Child'] = 0;

// populate based on inputs
if (typeof argv.abp !== 'undefined') {
   global.data.max['AdultBackpack'] = argv.abp;
   global.data.current['AdultBackpack'] = argv.abp;
}
if (typeof argv.a !== 'undefined') {
   global.data.max['Adult'] = argv.a;
   global.data.current['Adult'] = argv.a;
}
if (typeof argv.c !== 'undefined') {
   global.data.max['Child'] = argv.c;
   global.data.current['Child'] = argv.c;
}
if (typeof argv.ab !== 'undefined') {
   global.data.max['AdultBike'] = argv.ab;
   global.data.current['AdultBike'] = argv.ab;
}
if (typeof argv.abp == 'undefined') {
   global.data.max['AdultBackpack'] = 0;
   global.data.current['AdultBackpack'] = 0;
}
if (typeof argv.a == 'undefined') {
   global.data.max['Adult'] = 0;
   global.data.current['Adult'] = 0;
}
if (typeof argv.c == 'undefined') {
   global.data.max['Child'] = 0;
   global.data.current['Child'] = 0;
}
if (typeof argv.ab == 'undefined') {
   global.data.max['AdultBike'] = 0;
   global.data.current['AdultBike'] = 0;
}

// set layout....
if (typeof argv.layout !== 'undefined') {
   global.data.layout = argv.layout
}

// change size of simulation (NOTE: not compatible if room layouts are selected!)
if (typeof argv.width !== 'undefined') {
   global.data.width_i = argv.width;
}
if (typeof argv.height !== 'undefined') {
   global.data.width_ii = argv.height;
}

// change the number of obstacles and exits
if (typeof argv.o !== 'undefined') {
   global.data.max['Obstacle'] = argv.o;
   global.data.current['Obstacle'] = argv.o;
}
if (typeof argv.e !== 'undefined') {
   global.data.max['Exit'] = argv.e;
   global.data.current['Exit'] = argv.e;
}
if (typeof argv.save_path !== 'undefined') {
   global.data.save_path = argv.save_path;
}
if (typeof argv.save_path == 'undefined') {
   global.data.save_path = false;
}
if (typeof argv.output !== 'undefined') {
   argv.output = argv.output;
}

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

// deal with heuristics
if (typeof argv.heuristic !== 'undefined') {
   // three choices: euclidean, diagonal, manhattan
   metrics.euclidean = false;
   metrics.diagonal = false;
   metrics.manhattan = false;
   if (argv.heuristic == 'euclidean') {
      metrics.euclidean = true;
   } else if (argv.heuristic == 'diagonal') {
      metrics.diagonal = true;
   } else if (argv.heuristic == 'manhattan') {
      metrics.manhtattan = true;
   } else {
      throw arg.heuristic + ' is not a valid heuristic!';
   }
}

const voronoi = require('./voronoi');
global.voronoi = voronoi['voronoi'];

// has to be named 'final' because of dependencies between graph.js and final (?? why there ??)
const final = require('./final');
global.final = final['final'];

const lzw = require('./LZWEncoder');
const nq = require('./NeuQuant');
const gife = require('./GIFEncoder');
const b64 = require('./b64');
const fs = require('fs');

///final.final.resolution_strategy = global.conflict.factory('ChooseDifferentExit', 8);

global.data.resolve1 = 'NullConflictStrategy';
global.data.resolve2 = 'NullConflictStrategy';
global.data.resolve3 = 'NullConflictStrategy';
global.data.resolve4 = 'NullConflictStrategy';

if (typeof argv.conflict1 !== 'undefined') {
   entries = argv.conflict1.split("-");
   global.data.resolve1 = entries[0];
   global.data.threshold1 = parseInt(entries[1]);
}

if (typeof argv.conflict2 !== 'undefined') {
   entries = argv.conflict2.split("-");
   global.data.resolve2 = entries[0];
   global.data.threshold2 = parseInt(entries[1]);
}

if (typeof argv.conflict3 !== 'undefined') {
   entries = argv.conflict3.split("-");
   global.data.resolve3 = entries[0];
   global.data.threshold3 = parseInt(entries[1]);
}

if (typeof argv.conflict4 !== 'undefined') {
   entries = argv.conflict4.split("-");
   global.data.resolve4 = entries[0];
   global.data.threshold4 = parseInt(entries[1]);
}

function process_all() {
   output=''

   for (var elt in argv) {
      if ((elt != '_') && (elt != '$0')) { 
         if (output != '') {output += ';'; }
         output += elt + '=' + argv[elt];
      }
   }

   // argv._ is a list of all attributes requested to output, where each one is
   // of the form "module.attribute".  This code separates left-hand-side from right
   // side (to determine the module and attribute) then uses the Reflect capability
   // to dynamically find the actual attribute value.
   argv._.forEach(elt => {
       const pairs = elt.split(".");    
       const lhs = Reflect.get(global, pairs[0]);      // find in global name space
       if (typeof lhs === 'undefined') {
           console.log('*** ' + elt + ' is an invalid input');
       } else {
           var chosenValue = Reflect.get(lhs, pairs[1]);
        
           if ((typeof chosenValue === 'object') && (!Array.isArray(chosenValue))) {
               // dictionary
               for (var key in chosenValue) {
         output += ';' + pairs[1] + '[' + key + ']=' + chosenValue[key];
               }
           } else {
               output += ';' + pairs[1] + '=' + Reflect.get(lhs, pairs[1]);  // the attribute
           }
       }
   });

   console.log(output);
   // writeFile function with filename, content and callback function (using inputted name)
	if(typeof argv.output !== 'undefined') {
	fs.appendFile(argv.output, output + '\n', function (err) {
	  if (err) throw err;
	  // console.log('File is created successfully.');
	});}
}

// If hasn't stopped after 5,000 generations, that is it
final.final.start_simulation(1000, process_all);