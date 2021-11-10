var _data; // data from previous update

var DOWN = 90;
var LEFT = 180;
var UP = 270;
var RIGHT = 0;


function draw_grid(data) {
    var width = 600;
    var height = 600;
    var grid_length = data.length;
    var width_cell = width/grid_length;
    var height_cell = height/grid_length;

    var canvas = document.getElementById("grid")
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

function update_grid(data) {
    draw_grid(data);
}


// interesting improvements
var color_for_cell = function (cell) {
    if (cell.has_thing()) {
       return cell.get_thing().color();
    }
    else {
        if (cell.signal > 0) {
            var signal = cell.signal > 1 ? 1 : cell.signal;
            return "rgba(17,103,189,"+cell.signal+")";
        }
        else return "rgb(250,250,250)";
    }
}

var opacity_for_signal = function (cell) {
    return cell.has_thing() ? "1.0": cell.signal;
}


    
var grid_length = 150;
var grid = [];
var temp_grid = [];
var population = [];
var max_ants_on_grid = 5;
var max_children_on_grid = 5;
var max_adults_on_grid = 5;
var max_adults_w_backpack_on_grid = 3;
var max_adults_w_bike_on_grid = 2;
var ms_between_updates = 33;
var ants_out_of_nest = 0;

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
  this.last_signal = 0;
  this.orientation = random_orientation();

  this.color = function() {
      return "rgb(0,255,0)";
   }

}

function AdultBackpack() {
  this.last_signal = 0;
  this.orientation = random_orientation();

   this.color = function() {
      return "rgb(0,0,255)";
   }

}

function AdultBike() {
  this.last_signal = 0;
  this.orientation = random_orientation();

   this.color = function() {
      return "rgb(255,255,0)";
   }

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


function init_grids() {
    for (var i = 0; i < grid_length; i = i + 1) {
        grid[i] = [];
        temp_grid[i] = [];
        for (var ii = 0; ii < grid_length; ii = ii + 1) {
            grid[i][ii] = new Cell(i,ii);
            temp_grid[i][ii] = new Cell(i,ii);
        }
    }
}

function initialize_simulation() {
    init_grids();
    place_things();
    draw_grid(grid.map(function(row) {return row.map(function(cell) {return cell;});}));
}

initialize_simulation();
var interval_id = setInterval(simulate_and_visualize, ms_between_updates);


function simulate_and_visualize() {
    run_time_step();
    update_grid(grid.map(function(row) {return row.map(function(cell) {return cell;});}));
}

function run_time_step() {
    move_things();
}

function move_things() {
    for (var i = 0; i < grid_length; i = i + 1) {
        for (var ii = 0; ii < grid_length; ii = ii + 1) {
            if (grid[i][ii].has_thing()) {
                move_thing(i,ii);
            }
        }
    }
    // signal
    for (var i = 0; i < grid_length; i = i + 1) {
        for (var ii = 0; ii < grid_length; ii = ii + 1) {
            // adjust reference
            grid[i][ii].thing = temp_grid[i][ii].thing; 

            grid[i][ii].signal *= 0.95;	

            if (grid[i][ii].signal < 0.05) {
                grid[i][ii].signal = 0;	
            }
        }
    }
}

function place_things() {
  for (var n = 0; n < max_ants_on_grid; n++) {
    var j = get_random_int(0, grid_length)
    var jj = get_random_int(0, grid_length)

    grid[j][jj].thing = new Ant();
    temp_grid[j][jj].thing = grid[j][jj].thing;
  }

  for (var n = 0; n < max_children_on_grid; n++) {
    var j = get_random_int(0, grid_length)
    var jj = get_random_int(0, grid_length)

    grid[j][jj].thing = new Child();
    temp_grid[j][jj].thing = grid[j][jj].thing;
  }
  
    for (var n = 0; n < max_adults_on_grid; n++) {
    var j = get_random_int(0, grid_length)
    var jj = get_random_int(0, grid_length)

    adult = new Adult();
    grid[j][jj].thing = adult;
    grid[j+1][jj].thing = adult; //started implementation by creating "multiple adults"
    temp_grid[j][jj].thing = grid[j][jj].thing;
    temp_grid[j+1][jj].thing = grid[j+1][jj].thing;
  }
  
    for (var n = 0; n < max_adults_w_backpack_on_grid; n++) {
    var j = get_random_int(0, grid_length)
    var jj = get_random_int(0, grid_length)

    grid[j][jj].thing = new AdultBackpack();
    //grid[j+1][jj].thing = new AdultBackpack();
    //grid[j-1][jj-1].thing = new AdultBackpack();
   // grid[j+1][jj-1].thing = new AdultBackpack();
    temp_grid[j][jj].thing = grid[j][jj].thing;
  }
  
    for (var n = 0; n < max_adults_w_bike_on_grid; n++) {
    var j = get_random_int(0, grid_length)
    var jj = get_random_int(0, grid_length)

    grid[j][jj].thing = new AdultBike();
    temp_grid[j][jj].thing = grid[j][jj].thing;
  }
}

function get_coords_from_orientation(i,ii) {
    var orient = grid[i][ii].thing.orientation;
    if (orient == UP) {
      return [get_bounded_index(i), get_bounded_index(ii-1)];
    } else if (orient == DOWN) {
      return [get_bounded_index(i), get_bounded_index(ii+1)];
    } else if (orient == LEFT) {
      return [get_bounded_index(i-1), get_bounded_index(ii)];
    } else {
      return [get_bounded_index(i+1), get_bounded_index(ii)];
    }
}

function move_thing(i,ii) {
    var new_coords, j, jj;

    new_coords = get_coords_from_orientation(i,ii);
    j = new_coords[0];
    jj = new_coords[1];

    // handles collisions by doing NOTHING
    if (!temp_grid[j][jj].has_thing()) {
        // adjust reference
        temp_grid[j][jj].thing = temp_grid[i][ii].thing;
        temp_grid[i][ii].thing = null;
    }
}

function calc_distance(i,ii,j,jj) {
    return Math.pow(Math.pow(Math.abs(i-j),2) + Math.pow(Math.abs(ii-jj),2) , 0.5);
}

function calc_distance_to_nest(i,ii) {
    return calc_distance(i,ii,0,0);
}

function get_random_coordinates(i,ii) {
    var j   = get_random_int(i-1, i+1);
    var jj  = get_random_int(ii-1, ii+1);
    j  = get_bounded_index(j);
    jj = get_bounded_index(jj);
    return [j, jj];
}

function get_random_int(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function get_bounded_index(index) {
    var bounded_index = index;
    if (index < 0) {
        bounded_index = 0;
    }
    if (index >= grid_length) {
        bounded_index = grid_length-1;
    }
    return bounded_index;
}
