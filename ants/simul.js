// GUi state from prior update
var _data; 

var UP = 180;
var DOWN = 90;
var LEFT = 270;
var RIGHT = 0;

var diagDownRight = 45;
var diagUpRight = 135;
var diagDownLeft = 225;
var diagUpLeft = 315;


var grid_length = 150;
// var max_ants_on_grid = 25;
var max_children_on_grid = 50;
var max_backpack_on_grid = 0;
var max_adult_on_grid =0;
var max_bike_on_grid =0;
var max_obstacles_on_grid = 0;
var max_exits_on_grid = 5;
var ms_between_updates = 1000;

//creating a priority queue, not totally sure where to put the functions
const leftChild = (index) => index * 2 + 1;
const rightChild = (index) => index * 2 + 2;
const parent = (index) => Math.floor((index - 1) / 2);
var D = 1;
var D2 = Math.sqrt(2);


function diagonal(x,y, goalX, goalY) {  //diagonal distance heuristic
  var dx = Math.abs(x - goalX);
  var dy = Math.abs(y - goalY);

  var h = D * (dx + dy) + (D2 - 2 * D) * Math.min(dx, dy);
  return h;
}

function Node(j,jj,exiti, exitii, parent, direction) {
	this.i = j;
	this.ii = jj;

  this.exiti = exiti;
  this.exitii = exitii;
  
  // starting from the last node (which is the exit) go backwards until you
  // get to a node whose parent is the original, then return its locatino [i ,ii]
  this.initial_step = function () {
    var n = this;
    if (this.parent === null) { return []; }   // sanity check
    
    // find node whose parent has no parent, sincee that node is the origin and then
    // n is the first step in the direction of the final path.
    while (typeof n.parent.parent !== 'undefined') {
      n = n.parent;
    }
    
    return [n.i, n.ii];
  }
  
  this.key = function() { 
    return "" + this.i + "," + this.ii;
  }
  
  this.done = function() {
    return (this.i == this.exiti && this.ii == this.exitii);
  }
  
  // how many steps fromo starting spot.
  this.parent = parent;
  this.g = 0;
  if (typeof parent === 'undefined') {
    this.g = 0;
  } else {
    this.g = parent.g + 1;
  }
  
   // this ensures that two nodes can be compared using < operator.
   Node.prototype.valueOf=function() {
    // f = g + h
    var h = diagonal(this.i, this.ii, this.exiti, this.exitii);
    return this.g + h;
  }
}


function minHeap() {
 this.heap = [];
 
 this.swap = function (indexOne, indexTwo) {
   const tmp = this.heap[indexOne];
   this.heap[indexOne] = this.heap[indexTwo];
   this.heap[indexTwo] = tmp;
 };

 this.peek = function() {
    // the root is always the highest priority item, make sure actually lowest
    return this.heap[0];
  };
  
  this.insert = function(item) {
    // push element to the end of the heap
    this.heap.push(item);
    
    // the index of the element we have just pushed
    let index = this.heap.length-1;
    
    // if the element is greater than its parent:
    // swap element with its parent
    while (index !== 0 && this.heap[index] < this.heap[parent(index)]) {
      this.swap(index, parent(index));
      index = parent(index);
    }
  };
  
  this.extractMin = function() {
    // remove the first element from the heap
    var root = this.heap.shift();

    // put the last element to the front of the heap
    // and remove the last element from the heap as it now
    // sits at the front of the heap
    this.heap.unshift(this.heap[this.heap.length-1]);
    this.heap.pop();
    
    // correctly re-position heap
    this.heapify(0);
    
    return root;
  };
  
  this.heapify = function(index) { //used maxheap so confused on what to change
    let left = leftChild(index);
    let right = rightChild(index);
    let smallest = index;

    // if the left child is bigger than the node we are looking at
    if (left < this.heap.length && this.heap[smallest] > this.heap[left]) {
      smallest = left; //i think this is wrong
    }
    
    // if the right child is bigger than the node we are looking at
    if (right < this.heap.length && this.heap[smallest] > this.heap[right]) {
      smallest = right;
    }
    
    // if the value of largest has changed, then some swapping needs to be done
    // and this method needs to be called again with the swapped element
    if (smallest != index) {
      this.swap(smallest, index);
      this.heapify(smallest);
    }
  };
  
  this.size = function(){ //gets the length of the heap
    return this.length;
  }
}


function State() {
	this.grid = [];
	this.temp_grid = [];
	this.population = [];

	this.get_bounded_index = function (index) {
		var bounded_index = index;
		if (index < 0) 
			{        bounded_index = 0;
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
		// this.draw_border = function() {
		// 	for (var i = grid_length+1; i < grid_length+2; i = i + 1) {
		// 		this.grid[i] = [];
		// 		this.temp_grid[i] = [];
		// 		this.grid[i][0] = new Cell(i,ii);
		// 		this.temp_grid[i][0] = new Cell(i,ii);
		// 	}
		// }


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

          function removeItemOnce(arr, value) {
            var index = arr.indexOf(value);
            if (index > -1) {
              arr.splice(index, 1);
            }
          }

    this.get_neighbors = function(x,y){ //gets the eight neighbors as a possible move
      var parents = [];
      parents.push([x-1,y]);
      parents.push([x+1,y]);
      parents.push([x-1,y-1]);
      parents.push([x,y-1]);
      parents.push([x+1,y-1]);
      parents.push([x-1,y+1]);
      parents.push([x,y+1]);
      parents.push([x+1,y+1]);
      return parents;
    }



//should eventually use temp grid
this.AStar = function (thing){
  //step 1
  var open = new minHeap();
  //step 2
  var closed = {};
  var open_hash = {}
  var anchorX = thing.anchor_i;
  var anchorY = thing.anchor_ii;
  var exiti = 0;
  var exitii = 0;
  var n = new Node(anchorX, anchorY, exiti, exitii, undefined, -1);
  open.insert(n);
  open_hash[n.key()] = n;
  
  //step 3
  var heapLength = open.heap.length;
  
  while(open.heap.length > 0){
    //do i need to call heapify function?
    var q = open.extractMin(); //3a,b
    console.log(open.heap.length + ":" + q.i + "," + q.ii);
    var successors = this.get_neighbors(q.i,q.ii); //3c, this function only returns coordinates
    
    for(i=0;i<successors.length;i++){
      var succ = new Node(successors[i][0], successors[i][1], q.exiti, q.exitii, q, i);
      
      if (succ.done()) { // matched the goal. reutrn this. last node
        return succ;
      }
      
      //confused on this part (3ii)
      var exist = open_hash[succ.key()];
      if (typeof exist === 'undefined') {

      } else {
        if (exist < succ) {   // deep insights, Succ can never outperform exist.
          continue;
        }
      }
      
      // step[ 3iii]
      exist = closed[succ.key()];
      if (typeof exist === 'undefined') {
        open.insert(succ);
        open_hash[succ.key()] = succ;
      } else {
        if (exist < succ) {    // already processed this state AND was better than succ
          continue;
        }
        console.log("WOW! Found better.");
        open.insert(succ);
        open_hash[succ.key()] = succ;
      }
    }
    
    closed[q.key()] = q;
  }
  return null;
}

this.place_things = function () {

 for (var n = 0; n < max_obstacles_on_grid; n++) {
  var j = get_random_int(0, grid_length)
  var jj = get_random_int(0, grid_length)

  var obj = new Obstacle(j,jj);
     // this.population.push(obj);  //do we want this?  do we want to save the obstacles to the population?
     this.temp_grid[j][jj].thing = obj;
   }

   for (var n = 0; n < max_exits_on_grid; n++) {
    var obj =  new Exit(j,jj);
    if ((obj.orientation == DOWN) || (obj.orientation == UP)) {
     var j = 0;
     var jj = get_random_int(0, grid_length-3);
   }
   else if ((obj.orientation == LEFT) || (obj.orientation == RIGHT)) {
     var j = grid_length;
     var jj = get_random_int(0, grid_length-3);
   }
   else if ((obj.orientation == diagUpLeft) || (obj.orientation == diagDownLeft)) {
     var j = get_random_int(0, grid_length-3);
     var jj = 0;
   }
   else {
     var j = get_random_int(0, grid_length-3);
     var jj = grid_length;
   }

      // this.population.push(obj);
      for (var p = 0; p < obj.profile_i.length; p++) {  //
      	var dj = obj.profile_i[p];
      	var djj = obj.profile_ii[p];
      	var safej = this.get_bounded_index(j+dj);
      	var safejj = this.get_bounded_index(jj+djj);

        this.temp_grid[safej][safejj].thing = obj;
      }
    }
    // for (var n = 0; n < max_ants_on_grid; n++) {
    //   var j = get_random_int(0, grid_length)
    //   var jj = get_random_int(0, grid_length)

    //   var obj = new Ant(j, jj);
    //   this.population.push(obj);
    //   this.temp_grid[j][jj].thing = obj;
    // }

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

  this.get_coords_from_orientation = function (thing) {
   var i = thing.anchor_i;
   var ii = thing.anchor_ii;

   var orient = thing.orientation;
   if (orient == UP) {
    return [i, this.get_bounded_index(ii-1)];
  } else if (orient == DOWN) {
    return [i, this.get_bounded_index(ii+1)];
  } else if (orient == LEFT) {
    return [this.get_bounded_index(i-1), ii];
  } else if (orient == RIGHT) {
    return [this.get_bounded_index(i+1), ii];
  } else if (orient == diagDownRight) {
    return [this.get_bounded_index(i+1),this.get_bounded_index(ii+1)]
  } else if (orient == diagUpRight) {
    return [this.get_bounded_index(i+1),this.get_bounded_index(ii-1)]
  } else if (orient == diagDownLeft) {
    return [this.get_bounded_index(i-1),this.get_bounded_index(ii+1)]
  } else {
    return [this.get_bounded_index(i-1),this.get_bounded_index(ii-1)]
  }
}

    this.get_coords_from_orientation_neighbors = function (thing, index) { //need this to because we have to use profile and not anchor
    	var i = thing.profile_i[index];
    	var ii = thing.profile_ii[index];

    	var orient = thing.orientation;
    	if (orient == UP) {
    		return [i, this.get_bounded_index(ii-1)];
    	} else if (orient == DOWN) {
    		return [i, this.get_bounded_index(ii+1)];
    	} else if (orient == LEFT) {
    		return [this.get_bounded_index(i-1), ii];
    	} else if (orient == RIGHT) {
    		return [this.get_bounded_index(i+1), ii];
    	} else if (orient == diagDownRight) {
    		return [this.get_bounded_index(i+1),this.get_bounded_index(ii+1)]
    	} else if (orient == diagUpRight) {
    		return [this.get_bounded_index(i+1),this.get_bounded_index(ii-1)]
    	} else if (orient == diagDownLeft) {
    		return [this.get_bounded_index(i-1),this.get_bounded_index(ii+1)]
    	} else {
    		return [this.get_bounded_index(i-1),this.get_bounded_index(ii-1)]
    	}
    }

    this.move_thing = function (thing) {
    	//var new_coords = this.get_coords_from_orientation(thing); 
    	var node = this.AStar(thing); //using AStar algorithm to get the best move
    	if (node == null) {
       console.log("NO MOVE:");
       return;
     }

     var new_coords = node.initial_step();
     var exiti = 0;
     var exitii = 0;
  	  if((new_coords[0] < exiti) || (new_coords[1] < exitii)){ //need to add in grid length
       removeItemOnce(this.population, new_coords);
       this.temp_grid[0][0]= [];
  	   // this.grid[new_coords] = [];
    }
    else{
     var j = new_coords[0];
     var jj = new_coords[1];

    // handles collisions by doing NOTHING. If spot that you are trying 
    // to move to DOESN'T HAVE a thing then you are free to move.
    if (!this.temp_grid[j+1][jj+1].has_other_thing(thing)) {
      var collision = 0; //maybe could have break if collides so doesn't have to keep going through loop
      for (var x = 0; x < thing.profile_i.length; x++) { //need to check all of the cells of the person
      	var new_neighbor_cords = this.get_coords_from_orientation_neighbors(thing, x)
      	var r = new_neighbor_cords[0];
      	var c = new_neighbor_cords[1];
      	var safe_r = this.get_bounded_index(r + thing.anchor_i);
      	var safe_c = this.get_bounded_index(c + thing.anchor_ii);
        if (this.temp_grid[safe_r][safe_c].has_other_thing(thing)){ //if something in the cell
          collision = collision + 1 ;//add one to collision
        }
      }
    }
    
    //here we will handle collisions
    //check the population if anyone is trying to move to the same spot
    for (var pop = 0; pop < this.population.length; pop++){ //for anchor cell
      //add in for every cell in person
      person = this.population[pop];
      //anchor anchor
      var person_coords = this.get_coords_from_orientation(person); //get where it wants to go
      var px = person_coords[0];
      var py = person_coords[1];
      if ((px == j) && (py == jj)){ //if both trying to go to same spot
        if (!(person.last_signal == 1)){ //if the person is not already paused
        	collision = collision + 1;
          person.last_signal = 1; //pausing the person
          //change their orientation
          person.orientation = random_orientation();
        }
      }
    }
    
/**      
          //profile anchor
          for (var x = 0; x < thing.profile_i.length; x++) { 
          	var new_neighbor_cords = this.get_coords_from_orientation_neighbors(thing, x)
          	var r = new_neighbor_cords[0];
          	var c = new_neighbor_cords[1];
            if ((px == r) && (py == c)){ //if both trying to go to same spot
            if (!(person.last_signal == 1)){ //if the person is not already paused
            	collision = collision + 1;
              person.last_signal = 1; //pausing the person
              //change their orientation
              person.orientation = random_orientation();
          }
      }
  }
          // now check for all profile cells (profile profile)
          for (var x = 0; x < thing.profile_i.length; x++) { 
          	var new_neighbor_cords = this.get_coords_from_orientation_neighbors(thing, x)
          	var r = new_neighbor_cords[0];
          	var c = new_neighbor_cords[1];
            for (var cell = 0; cell < person.profile_i.length; cell++){ //check all the cells of the person
              var surrounding_cell = this.get_coords_from_orientation_neighbors(person, cell); //get where want to go
              var row = surrounding_cell[0];
              var col = surrounding_cell[1];
              
              if ((r == row) && (c == col)){ //if both trying to go to same spot
                if (!(person.last_signal == 1)){ //if the person is not already paused
                	collision = collision + 1;
                  person.last_signal = 1; //pausing the person
                  //change their orientation
                  person.orientation = random_orientation();
              }
          }
            // anchor profile 
            if ((row == j) && (col == jj)){ //if both trying to go to same spot
                if (!(person.last_signal == 1)){ //if the person is not already paused
                	collision = collision + 1;
                  person.last_signal = 1; //pausing the person
                  //change their orientation
                  person.orientation = random_orientation();
              }
          }
      }
  }
  
  **/
}

    if (collision == 0){ //if no collision for any cells then can move whole piece
      // where thing is RIGHT NOW
      var i = thing.anchor_i;
      var ii = thing.anchor_ii;

    	// clear old one
    	thing.remove_footprint(this);

    	thing.anchor_i = j;
    	thing.anchor_ii = jj;

    	// move into new one
    	thing.place_footprint(this);
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
	this.anchor_i = j;
	this.anchor_ii = jj;

	if ((this.orientation == DOWN) || (this.orientation == UP) || (this.orientation == LEFT) || (this.orientation == RIGHT)) {
		this.profile_i  = [0,0,0,0];
		this.profile_ii = [-1,0,1,2];
	} 
	else {
		this.profile_i  = [-1,0,1,2];
		this.profile_ii = [0,0,0,0];
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
	
	//used for a*
	this.f = 0;
	this.h = 0;
	this.g = 0;

	this.color = function() {
		return "rgb(255,165,0)";
	}

	this.place_footprint = function(state) {
		state.temp_grid[this.anchor_i][this.anchor_ii].thing = this;
	}

	this.remove_footprint = function(state) {
		state.temp_grid[this.anchor_i][this.anchor_ii].thing = null;
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
		var safej = state.get_bounded_index(this.anchor_i+dj);
		var safejj = state.get_bounded_index(this.anchor_ii+djj);
		state.temp_grid[safej][safejj].thing = this;
	}
}

this.remove_footprint = function(state) {
	for (var p = 0; p < this.profile_i.length; p++) {  //
		var dj = this.profile_i[p];
		var djj = this.profile_ii[p];
		var safei = state.get_bounded_index(this.anchor_i+dj);
		var safeii = state.get_bounded_index(this.anchor_ii+djj);
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
		var safej = state.get_bounded_index(this.anchor_i+dj);
		var safejj = state.get_bounded_index(this.anchor_ii+djj);
		state.temp_grid[safej][safejj].thing = this;
	}
}

this.remove_footprint = function(state) {
	for (var p = 0; p < this.profile_i.length; p++) {  //
		var dj = this.profile_i[p];
		var djj = this.profile_ii[p];
		var safei = state.get_bounded_index(this.anchor_i+dj);
		var safeii = state.get_bounded_index(this.anchor_ii+djj);
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
   this.profile_i  = [0, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3];
   this.profile_ii = [0, 0, 2, 1, 0, -1, -2, -3, 2, 1, 0, -1, -2, -3];

   this.color = function() {
   	return "rgb(220,20,60)";
   }

   this.place_footprint = function(state) {
	for (var p = 0; p < this.profile_i.length; p++) {  //
		var dj = this.profile_i[p];
		var djj = this.profile_ii[p];
		var safej = state.get_bounded_index(this.anchor_i+dj);
		var safejj = state.get_bounded_index(this.anchor_ii+djj);
		state.temp_grid[safej][safejj].thing = this;
	}
}

this.remove_footprint = function(state) {
	for (var p = 0; p < this.profile_i.length; p++) {  //
		var dj = this.profile_i[p];
		var djj = this.profile_ii[p];
		var safei = state.get_bounded_index(this.anchor_i+dj);
		var safeii = state.get_bounded_index(this.anchor_ii+djj);
		state.temp_grid[safei][safeii].thing = null;
	}
}
}


// function Ant(j,jj) {
//    this.last_signal = 0;
//    this.orientation = random_orientation();

//    this.anchor_i = j;
//    this.anchor_ii = jj;

//    this.profile_i  = [0];
//    this.profile_ii = [0];

//    this.color = function() {
//       return "rgb(0,0,0)";
//    }

//    this.place_footprint = function(state) {
//     state.temp_grid[this.anchor_i][this.anchor_ii].thing = this;
//    }

//    this.remove_footprint = function(state) {
//      state.temp_grid[this.anchor_i][this.anchor_ii].thing = null;
//    }
// }

function random_orientation() {
	var r = Math.random() * 8;

	if (r < 1) {
		return LEFT;
	} else if (r < 2) {
		return UP;
	} else if (r < 3) {
		return RIGHT;
	} else if (r < 4) {
		return DOWN
	} else if (r < 5) {
		return diagDownRight;
	} else if (r < 6) {
		return diagUpRight;
	} else if (r < 7) {
		return diagDownLeft;
	} else {
		return diagUpLeft;
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
    // state.draw_border();
    state.place_things();
    draw_grid(state.grid.map(function(row) {return row.map(function(cell) {return cell;});}));
  }

  function start_simulation(){
    initialize_simulation();
    var interval_id = setInterval(simulate_and_visualize, ms_between_updates);

  }

  function simulate_and_visualize() {
   state.move_things();
   draw_grid(state.grid.map(function(row) {return row.map(function(cell) {return cell;});}));
   simulate_and_visualize.counter += 1;
 }
 simulate_and_visualize.counter = 0;