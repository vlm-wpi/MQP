// GUI state from prior update
var _data; 

Math.to_radians = function(degrees) {
  return degrees * Math.PI / 180;
};

Math.to_degrees = function(radians) {
  return radians * 180 / Math.PI;
};


var UP = 0;
var diagUpRight = 45;
var RIGHT = 90;
var diagDownRight = 135;
var DOWN = 180;
var diagDownLeft = 225;
var LEFT = 270;
var diagUpLeft = 315;


var grid_length = 150;
var max_children_on_grid = 10;
var max_backpack_on_grid = 10;
var max_adult_on_grid = 10;
var max_bike_on_grid = 10;
var max_obstacles_on_grid = 20;
var max_exits_on_grid = 0;    // still needs work....
var ms_between_updates = 33;

function State() {
    this.grid = [];
    this.temp_grid = [];
    this.obstacles = [];
    this.population = [];
    
    this.get_bounded_index = function (index) {
	if (index < 0) {
            return 0;
	}
	if (index >= grid_length) {
	    return grid_length-1;
        }	      
	return index;
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
    this.draw_border = function() {
	for (var i = grid_length+1; i < grid_length+2; i = i + 1) {
	    this.grid[i] = [];
	    this.temp_grid[i] = [];
	    this.grid[i][0] = new Cell(i,ii);
	    this.temp_grid[i][0] = new Cell(i,ii);
	}
    }
    
    
    this.move_things = function () {
	// move everyone at TOP level of abstraction
	// assume: population knows loc AND temp_grid is properly set.
	for (var p = 0; p < this.population.length; p++) {
    	    var thing = this.population[p];
    	    this.move_thing(thing);
	}
	
	// NEED THIS. This copies the footprint for drawing
	for (var i = 0; i < grid_length; i = i + 1) {
    	    for (var ii = 0; ii < grid_length; ii = ii + 1) {
		// adjust reference
		this.grid[i][ii].thing = this.temp_grid[i][ii].thing; 
	    }
	}
    }	


    this.place_things = function () {
	
	for (var n = 0; n < max_obstacles_on_grid; n++) {
	    var j = get_random_int(0, grid_length)
	    var jj = get_random_int(0, grid_length)
	    
	    var obj = new Obstacle(j,jj);
	    this.obstacles.push(obj); 
	    this.temp_grid[j][jj].thing = obj;
	}
	
	for (var n = 0; n < max_exits_on_grid; n++) {
	    var j, jj;
	    if (this.orientation == DOWN || this.orientation == UP) {
		j = 0;
		jj = get_random_int(0, grid_length);
	    } else {
		j = get_random_int(0, grid_length);
		jj = 0;
	    }
	    
	    var obj =  new Exit(j,jj);
	    for (var p = 0; p < obj.profile_i.length; p++) {  //
      		var dj = obj.profile_i[p];
      		var djj = obj.profile_ii[p];
      		var safej = this.get_bounded_index(j+dj);
      		var safejj = this.get_bounded_index(jj+djj);
		
      		this.temp_grid[safej][safejj].thing = obj;
	    }
	}
	
	for (var n = 0; n < max_children_on_grid; n++) {
    	    var j = get_random_int(0, grid_length)
    	    var jj = get_random_int(0, grid_length)
	    
    	    var obj = new Child(j,jj);
    	    this.population.push(obj);
    	    this.temp_grid[j][jj].thing = obj;
	}
	
	for (var n = 0; n < max_backpack_on_grid; n++) {
    	    var j = get_random_int(0, grid_length)
    	    var jj = get_random_int(0, grid_length)
	    
    	    var obj =  new AdultBackpack(j,jj);
    	    this.population.push(obj);
	    
            for (var p = 0; p < obj.profile_i.length; p++) {  //
		var dj = obj.profile_i[p];
      		var djj = obj.profile_ii[p];
      		var safej = this.get_bounded_index(j+dj);
      		var safejj = this.get_bounded_index(jj+djj);
		
      		this.temp_grid[safej][safejj].thing = obj;
            }
	}
	
	for (var n = 0; n < max_adult_on_grid; n++) {
  	    var j = get_random_int(0, grid_length)
  	    var jj = get_random_int(0, grid_length)
	    
  	    var obj =  new Adult(j,jj);
  	    this.population.push(obj);
            for (var p = 0; p < obj.profile_i.length; p++) {  //
      		var dj = obj.profile_i[p];
      		var djj = obj.profile_ii[p];
      		var safej = this.get_bounded_index(j+dj);
      		var safejj = this.get_bounded_index(jj+djj);
		
      		this.temp_grid[safej][safejj].thing = obj;
            }
	}
	
	for (var n = 0; n < max_bike_on_grid; n++) {
  	    var j = get_random_int(0, grid_length)
  	    var jj = get_random_int(0, grid_length)
	    
  	    var obj =  new AdultBike(j,jj);
  	    this.population.push(obj);
	    for (var p = 0; p < obj.profile_i.length; p++) {  //
      		var dj = obj.profile_i[p];
      		var djj = obj.profile_ii[p];
      		var safej = this.get_bounded_index(j+dj);
      		var safejj = this.get_bounded_index(jj+djj);
		
      		this.temp_grid[safej][safejj].thing = obj;
	    }
	}
    }
    
    this.vector_orientation = function (thing) {
	var orient = thing.orientation;
	var orientation_radians = Math.to_radians((orient+180) % 360);  // flip direction
	var coords = [];
	coords.push(Math.sin(orientation_radians));
	coords.push(Math.cos(orientation_radians));
	return coords;
    }
    
    this.get_coords_from_orientation = function (thing) {
	var i = thing.anchor_i;
	var ii = thing.anchor_ii;
	
	var orient = thing.orientation;
	
	var orientation_radians = Math.to_radians((orient+180)% 360);
	var coords = [];
	coords.push(this.get_bounded_index(i + Math.sin(orientation_radians)));
	coords.push(this.get_bounded_index(ii + Math.cos(orientation_radians)));
	return coords;
    }
    
    // compute each pixel in neighbor of shape. IMPORTANT that it adjusts
    // based on projected vector[] of movement! subtle defect
    this.get_coords_from_orientation_neighbors = function (thing, index) { 
	var vector = this.vector_orientation(thing);
    	var i = thing.anchor_i + vector[0] + thing.profile_i[index];
    	var ii = thing.anchor_ii + vector[1] + thing.profile_ii[index];
	var coords = [];
        coords.push(this.get_bounded_index(i));
        coords.push(this.get_bounded_index(ii));
        return coords;
    }
    
    this.move_thing = function (thing) {
	// continue in orientation using floatin point
	var vector = this.vector_orientation(thing);
	var new_coords = [thing.anchor_i + vector[0],
                          thing.anchor_ii + vector[1]];
	
	// closest match to the grid
    	var j = Math.trunc(this.get_bounded_index(new_coords[0]));
    	var jj = Math.trunc(this.get_bounded_index(new_coords[1]));
	
	// where thing is RIGHT NOW
	var i = thing.anchor_i;
	var ii = thing.anchor_ii;
	if (j == i && jj == ii) {
	    return; // not moved.
	}

	// handles collisions by doing NOTHING. If spot that you are trying 
	// to move to DOESN'T HAVE a thing then you are free to try to move.
	if (!this.temp_grid[j][jj].has_other_thing(thing)) {
	    var collision = 0;
	    
	    // need to check all of the cells of the person
	    for (var x = 0; x < thing.profile_i.length; x++) { 
      		var new_neighbor_cords = this.get_coords_from_orientation_neighbors(thing, x)
      	        var safe_r = Math.trunc(new_neighbor_cords[0]);
      		var safe_c = Math.trunc(new_neighbor_cords[1]);

		//if something in the cell, add one to collision
		if (this.temp_grid[safe_r][safe_c].has_other_thing(thing)){ 
		    collision += 1;
		}
	    }
	    
	    // if no collision for any cells then can move whole piece
	    if (collision == 0){ 
      		// clear old one
      		thing.remove_footprint(this);
		
      		thing.anchor_i = new_coords[0];
      		thing.anchor_ii = new_coords[1];

      		// move into new one
      		thing.place_footprint(this);
	    }
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
    
    this.has_other_thing = function(other) {
	if (this.thing == null) { return false; }
	if (this.thing == other) { return false; }	
	
	// has SOME other thing...
	return true;
    }
    
}
function Exit(j,jj) {
    this.last_signal = 0;
    this.orientation = random_orientation();
    this.anchor_i = j
    this.anchor_ii = jj
    
    if ((this.orientation == DOWN) || (this.orientation == UP) || (this.orientation == LEFT) || (this.orientation || RIGHT)) {
	this.profile_i  = [-1,0,1,2];
	this.profile_ii = [0,0,0,0];
    } 
    else {
	this.profile_i  = [0,0,0,0];
	this.profile_ii = [-1,0,1,2];
    }
    
    
    this.color = function() {
	return "rgb(139,69,19)";
    }
    
    this.place_footprint = function(state) {
	state.temp_grid[this.anchor_i][this.anchor_ii].thing = this;
    }
    
    this.remove_footprint = function(state) {
	state.temp_grid[this.anchor_i][this.anchor_ii].thing = null;
    }
}

function Obstacle(j,jj) {
    this.last_signal = 0;
    this.orientation = random_orientation();
    this.anchor_i = j
    this.anchor_ii = jj
    
    this.profile_i  = [0];
    this.profile_ii = [0];
    
    this.color = function() {
	return "rgb(0,0,0)";
    }
    
    this.place_footprint = function(state) {
	state.temp_grid[this.anchor_i][this.anchor_ii].thing = this;
    }
    
    this.remove_footprint = function(state) {
	state.temp_grid[this.anchor_i][this.anchor_ii].thing = null;
    }
}

function Child(j,jj) {
    this.last_signal = 0;
    this.orientation = random_orientation();
    this.anchor_i = j
    this.anchor_ii = jj
    
    this.profile_i  = [0];
    this.profile_ii = [0];
    
    this.color = function() {
	return "rgb(255,165,0)";
    }
    
    this.place_footprint = function(state) {
	for (var p = 0; p < this.profile_i.length; p++) {  //
	    var dj = this.profile_i[p];
	    var djj = this.profile_ii[p];
	    var safej = state.get_bounded_index(Math.trunc(this.anchor_i+dj));
	    var safejj = state.get_bounded_index(Math.trunc(this.anchor_ii+djj));
	    state.temp_grid[safej][safejj].thing = this;
	}
    }
    
    this.remove_footprint = function(state) {
	for (var p = 0; p < this.profile_i.length; p++) {  //
	    var dj = this.profile_i[p];
	    var djj = this.profile_ii[p];
	    var safej = Math.trunc(state.get_bounded_index(this.anchor_i+dj));
	    var safejj = Math.trunc(state.get_bounded_index(this.anchor_ii+djj));
	    state.temp_grid[safej][safejj].thing = null;
	}
    }
}

function Adult(j,jj) {
    this.last_signal = 0;
    this.orientation = random_orientation();
    this.anchor_i = j
    this.anchor_ii = jj
    
    // my projection 
    this.profile_i  = [1, 0]
    this.profile_ii = [0, 0]
    
    this.color = function() {
   	return "rgb(0,0,255)";
    }
    
    this.place_footprint = function(state) {
	for (var p = 0; p < this.profile_i.length; p++) {  //
	    var dj = this.profile_i[p];
	    var djj = this.profile_ii[p];
	    var safej = Math.trunc(state.get_bounded_index(this.anchor_i+dj));
	    var safejj = Math.trunc(state.get_bounded_index(this.anchor_ii+djj));
	    state.temp_grid[safej][safejj].thing = this;
	}
    }
    
    this.remove_footprint = function(state) {
	for (var p = 0; p < this.profile_i.length; p++) {  //
	    var dj = this.profile_i[p];
	    var djj = this.profile_ii[p];
	    var safei = Math.trunc(state.get_bounded_index(this.anchor_i+dj));
	    var safeii = Math.trunc(state.get_bounded_index(this.anchor_ii+djj));
	    state.temp_grid[safei][safeii].thing = null;
	}
    }
}

function AdultBackpack(j,jj) {
    this.last_signal = 0;
    this.orientation = random_orientation();
    this.anchor_i = j
    this.anchor_ii = jj
    
    // my projection 
    this.profile_i  = [0, 0, 1, 1];
    this.profile_ii = [0, 1, 0, 1];

    
    this.color = function() {
   	return "rgb(0,128,0)";
    }
    
    this.place_footprint = function(state) {
	for (var p = 0; p < this.profile_i.length; p++) {  //
	    var dj = this.profile_i[p];
	    var djj = this.profile_ii[p];
	    var safej = Math.trunc(state.get_bounded_index(this.anchor_i+dj));
	    var safejj = Math.trunc(state.get_bounded_index(this.anchor_ii+djj));
	    state.temp_grid[safej][safejj].thing = this;
	}
    }
    
    this.remove_footprint = function(state) {
	for (var p = 0; p < this.profile_i.length; p++) {  //
	    var dj = this.profile_i[p];
	    var djj = this.profile_ii[p];
	    var safei = Math.trunc(state.get_bounded_index(this.anchor_i+dj));
	    var safeii = Math.trunc(state.get_bounded_index(this.anchor_ii+djj));
	    state.temp_grid[safei][safeii].thing = null;
	}
    }
}

function AdultBike(j,jj) {
    this.last_signal = 0;
    this.orientation = random_orientation();
    this.anchor_i = j
    this.anchor_ii = jj
    
    // my projection 
    this.profile_i  = [0, 1, 2, 2, 2, 2,  2,   2, 3, 3, 3, 3,   3,  3];
    this.profile_ii = [0, 0, 2, 1, 0, -1, -2, -3, 2, 1, 0, -1, -2, -3];
    
    this.color = function() {
   	return "rgb(220,20,60)";
    }
    
    // orientation rotated 180 degrees 
    this.place_footprint = function(state) {
	for (var p = 0; p < this.profile_i.length; p++) {  //
	    var dj = this.profile_i[p];
	    var djj = this.profile_ii[p];
	    var safej = Math.trunc(state.get_bounded_index(this.anchor_i+dj));
	    var safejj = Math.trunc(state.get_bounded_index(this.anchor_ii+djj));
	    state.temp_grid[safej][safejj].thing = this;
	}
    }
    
    this.remove_footprint = function(state) {
	for (var p = 0; p < this.profile_i.length; p++) {  //
	    var dj = this.profile_i[p];
	    var djj = this.profile_ii[p];
	    var safei = Math.trunc(state.get_bounded_index(this.anchor_i+dj));
	    var safeii = Math.trunc(state.get_bounded_index(this.anchor_ii+djj));
	    state.temp_grid[safei][safeii].thing = null;
	}
    }
}


function random_orientation() {
    var r = Math.trunc(Math.random()*360);

    return r;
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
