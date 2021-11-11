// GUi state from prior update
var _data; 

var UP = 180;
var DOWN = 90;

var LEFT = 270;
var RIGHT = 0;

var grid_length = 150;
var max_ants_on_grid = 500;
var max_children_on_grid = 500;
var ms_between_updates = 33;

function State() {
  this.grid = [];
  this.temp_grid = [];

  this.get_bounded_index = function (index) {
    var bounded_index = index;
    if (index < 0) {
        bounded_index = 0;
    }
    if (index >= grid_length) {
        bounded_index = grid_length-1;
    }
    return bounded_index;
  }

  this.init_grids = function () {
    for (var i = 0; i < grid_length; i = i + 1) {
        this.grid[i] = [];
        this.temp_grid[i] = [];
        for (var ii = 0; ii < grid_length; ii = ii + 1) {
            this.grid[i][ii] = new Cell(i,ii);
            this.temp_grid[i][ii] = new Cell(i,ii);
        }
    }
  }

  this.move_things = function () {
    // move everyone
    for (var i = 0; i < grid_length; i = i + 1) {
        for (var ii = 0; ii < grid_length; ii = ii + 1) {
            if (this.grid[i][ii].has_thing()) {
                this.move_thing(i,ii);
            }
        }
    }

    // swap locations
    for (var i = 0; i < grid_length; i = i + 1) {
        for (var ii = 0; ii < grid_length; ii = ii + 1) {
            // adjust reference
            this.grid[i][ii].thing = this.temp_grid[i][ii].thing; 
        }
    }
  }

  this.place_things = function () {
    for (var n = 0; n < max_ants_on_grid; n++) {
      var j = get_random_int(0, grid_length)
      var jj = get_random_int(0, grid_length)
  
      console.log(j + "," + jj);
      this.grid[j][jj].thing = new Ant();
      this.temp_grid[j][jj].thing = this.grid[j][jj].thing;
    }
  
    for (var n = 0; n < max_children_on_grid; n++) {
      var j = get_random_int(0, grid_length)
      var jj = get_random_int(0, grid_length)
  
      this.grid[j][jj].thing = new Child();
      this.temp_grid[j][jj].thing = this.grid[j][jj].thing;
    }
  }

  this.get_coords_from_orientation = function (i,ii) {
    var orient = this.grid[i][ii].thing.orientation;
    if (orient == UP) {
      return [i, this.get_bounded_index(ii-1)];
    } else if (orient == DOWN) {
      return [i, this.get_bounded_index(ii+1)];
    } else if (orient == LEFT) {
      return [this.get_bounded_index(i-1), ii];
    } else {
      return [this.get_bounded_index(i+1), ii];
    }
  }

  this.move_thing = function (i,ii) {
    var new_coords = this.get_coords_from_orientation(i,ii);
    var j = new_coords[0];
    var jj = new_coords[1];

    // handles collisions by doing NOTHING
    if (!this.temp_grid[j][jj].has_thing()) {
        // adjust reference
        this.temp_grid[j][jj].thing = this.temp_grid[i][ii].thing;
        this.temp_grid[i][ii].thing = null;
    }
  }
}


var state = new State();

function draw_grid(data) {
    var width = 600;
    var height = 600;
    var width_cell = width/grid_length;
    var height_cell = height/grid_length;

    var canvas = document.getElementById("grid")

    // create the canvas the very first time this method is invoked...
    if (canvas == null) {
        canvas = document.createElement('canvas');
        canvas.id = "grid";
        canvas.width = width;
        canvas.height = height;
        document.getElementsByTagName('body')[0].appendChild(canvas);
    }

    var context = canvas.getContext("2d");
    
    function draw_cells(){
        for (var i = 0; i < grid_length; i++) {
            for (var ii = 0; ii < grid_length; ii++) {
		// only redraw when there is a change. Nice optimization
                if (_data && _data[i][ii] === color_for_cell(data[i][ii])) {
                    continue;
                } 
                context.clearRect(i*width_cell, ii*height_cell, width_cell, height_cell);
                context.fillStyle = color_for_cell(data[i][ii]);
                context.fillRect(i*width_cell, ii*height_cell, width_cell, height_cell);
            }
        }
        
    }
    draw_cells();

    // remember _data as prior rendering
    if (!_data) {
        _data = [];
    }
    for (var i = 0; i < grid_length; i++) {
        _data[i] = [];
        for (var ii = 0; ii < grid_length; ii++){
            _data[i][ii] = color_for_cell(data[i][ii]);
        }
    }
}

// =====================================================
// Stateless methods, that do not need state to operate
// ======================================================

// interesting improvements
var color_for_cell = function (cell) {
    if (cell.has_thing()) {
       return cell.get_thing().color();
    }

    return "rgb(250,250,250)";

}

function Cell(i,ii) {
    this.i = i;
    this.ii = ii;

    this.thing = null;

    this.signal = 0;
    this.has_thing = function() {
        return this.thing ? true : false;
    };

    this.get_thing = function() {
        return this.thing;
    };

}

function Child() {
   this.last_signal = 0;
   this.orientation = random_orientation();

   this.color = function() {
      return "rgb(255,0,0)";
   }

}

function Adult() {

}

function AdultBackpack() {

}

function AdultBike() {

}


function Ant() {
   this.last_signal = 0;
   this.orientation = random_orientation();

   this.color = function() {
      return "rgb(0,0,0)";
   }
}

function random_orientation() {
   var r = Math.random() * 4;

   if (r < 1) {
     return LEFT;
   } else if (r < 2) {
     return UP;
   } else if (r < 3) {
     return RIGHT;
   } else {
     return DOWN;
   }
}

function calc_distance(i,ii,j,jj) {
    return Math.pow(Math.pow(Math.abs(i-j),2) + Math.pow(Math.abs(ii-jj),2) , 0.5);
}

function get_random_int(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}



// ==============================================================================
// MAIN to kick things off
// ==============================================================================

function initialize_simulation() {
    state.init_grids();
    state.place_things();
    draw_grid(state.grid.map(function(row) {return row.map(function(cell) {return cell;});}));
}

initialize_simulation();

var interval_id = setInterval(simulate_and_visualize, ms_between_updates);

function simulate_and_visualize() {
    state.move_things();
    draw_grid(state.grid.map(function(row) {return row.map(function(cell) {return cell;});}));
}

