// GUI state from prior update
var _data;

var UP = 180;
var DOWN = 90;
var LEFT = 270;
var RIGHT = 0;

var diagDownRight = 45;
var diagUpRight = 135;
var diagDownLeft = 225;
var diagUpLeft = 315;

var orientations = [315, 270, 225, 180, 90, 135, 0, 45];
//
var grid_length = 150;
var max_children_on_grid = 10;
var max_backpack_on_grid = 0;
var max_adult_on_grid = 10;
var max_bike_on_grid = 0;
var max_obstacles_on_grid = 100;
var max_large_X_obstacles_on_grid = 0;
var max_exits_on_grid = 4;
var ms_between_updates = 1;
var take_snapshot = false;
var hall_layout = false;

// HOOK UP GUI ELEMENTS: BEGIN
// -----------------------------------------------------
var numChildren = document.getElementById("numChildren");
numChildren.value = max_children_on_grid;
numChildren.oninput = function() {
	max_children_on_grid = this.value;
}

var numBikesSlider = document.getElementById("numBikes");
numBikesSlider.value = max_bike_on_grid;
numBikesSlider.oninput = function() {
	max_bike_on_grid = this.value;
}

var numBackPacks = document.getElementById("numBackPacks");
numBackPacks.value = max_backpack_on_grid;
numBackPacks.oninput = function() {
	max_backpack_on_grid = this.value;
}

var numAdults = document.getElementById("numAdults");
numAdults.value = max_adult_on_grid;
numAdults.oninput = function() {
	max_adult_on_grid = this.value;
}

var numExits = document.getElementById("numExits");
numExits.value = max_exits_on_grid;
numExits.oninput = function() {
	max_exits_on_grid = this.value;
}

var numObstacles = document.getElementById("numObstacles");
numObstacles.value = max_obstacles_on_grid;
numObstacles.oninput = function() {
	max_obstacles_on_grid = this.value;
}

var numXObstacles = document.getElementById("numXObstacles");
numXObstacles.value = max_large_X_obstacles_on_grid;
numXObstacles.oninput = function() {
	max_large_X_obstacles_on_grid = this.value;
}

var takeSnapshotCheckbox = document.getElementById("takeSnapshot");
if (take_snapshot) {
	takeSnapshotCheckbox.checked = true;
}
takeSnapshotCheckbox.oninput = function() {
	take_snapshot = takeSnapshotCheckbox.checked;
}
var hallLayoutCheckbox = document.getElementById("hallLayout");
if (hall_layout) {
	hallLayoutCheckbox.checked = true;
}
hallLayoutCheckbox.oninput = function() {
	hall_layout = hallLayoutCheckbox.checked;
}


// HOOK UP GUI ELEMENTS: END
// -----------------------------------------------------





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

function Node(j,jj,exiti, exitii, endi, endii, parent, direction, goali, goalii) {
	this.i = j;
	this.ii = jj;
	this.direction = direction;

	this.exiti = exiti;
	this.exitii = exitii;
	this.endi = endi;
	this.endii = endii;
	this.goali = goali;
	this.goalii = goalii;

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
	
	return [n.i, n.ii, n.direction];
}

this.key = function() { 
	return "" + this.i + "," + this.ii;
}

this.done = function() {
	return (this.i >= this.exiti && this.i <= this.endi &&
		this.ii >= this.exitii && this.ii <= this.endii);
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
	var h = diagonal(this.i, this.ii, this.goali, this.goalii);
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

		this.move_things = function () {
        // move everyone at TOP level of abstraction
        // assume: population knows loc AND temp_grid is properly set.
        for (var p =  this.population.length-1; p >= 0; p--) {
        	var thing = this.population[p];
        	if (this.move_thing(thing)) {
		this.population.splice(p, 1); // remove
	}
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
    
    // only if do not contain an obstacle. Must check entire profile
    // if 'others' than check to avoid other shapes as well
    this.get_neighbors = function(x,y,thing,state,others) { //gets the eight neighbors as a possible move
    	var parents = [];
    	var oix = -1;
    	for (var di = -1; di <= 1; di++) {
    		for (var dii = -1; dii <= 1; dii++) {
    			if (di == 0 && dii == 0) {
    				continue; 
    			}
    			oix++;

    			var safe_r = this.get_bounded_index(x+di);
    			var safe_c = this.get_bounded_index(y+dii);
    			if (safe_r != x+di) { continue; }
    			if (safe_c != y+dii) { continue; }

		// ok. Can move anchor. Are other spots available?
		var safe = 1;
		for (var p = 0; p < thing.profile_i.length; p++) {
			var ss = this.get_coords_from_orientation_neighbors(thing, p, orientations[oix]);
			var sr = this.get_bounded_index(x + ss[0]);
			var sc = this.get_bounded_index(y + ss[1]);

		    // can't move off the board
		    if (sr != x + ss[0]) { safe = 0; break; }
		    if (sc != y + ss[1]) { safe = 0; break; }

		    if (state.temp_grid[sr][sc].has_obstacle()) {
		    	safe = 0;
		    	break;
		    } else if (others) {
		    	if (state.temp_grid[sr][sc].has_other_thing(thing)) {
		    		safe = 0;
		    		break;
		    	}
		    }
		}
		if (safe) {
			parents.push([safe_r, safe_c, orientations[oix]]);
		}
	}
}

return parents;
}


    // Currently only plans around obstacles, but this could lead to deadlock conditions.
    // IF SO, then it could re-run, with an effort to try to avoid existing shapes as well.
    //
    //          xx
    //          xx
    //        xxxx
    //        yyxx      <-- deadlock if both are trying to go up and to left!
    //        yyxx
    //      yyyy
    //        yy
    //        yy

    this.AStar = function (thing, others){
	//step 1
	var open = new minHeap();
	//step 2
	var closed = {};
	var open_hash = {};
	var anchorX = thing.anchor_i;
	var anchorY = thing.anchor_ii;
	var exiti = thing.min_exiti;
	var exitii = thing.min_exitii;
	var endi = thing.endi;
	var endii = thing.endii;
	var goali = thing.goali;
	var goalii = thing.goalii;
	//if (thing.profile_i[0]==0) {
	//	var endi = exiti;
	//	var endii = exitii+3;
//	}
//	else {
//		var endi = exiti+3;
//		var endii = exitii;
//	}

var n = new Node(anchorX, anchorY, exiti, exitii, endi, endii, undefined, -1, goali, goalii);
open.insert(n);
open_hash[n.key()] = n;

	//step 3
	var heapLength = open.heap.length;
	
	while(open.heap.length > 0){
	    //do i need to call heapify function?
	    var q = open.extractMin(); //3a,b
	    var successors = this.get_neighbors(q.i,q.ii,thing,this,others); //3c, this function only returns coordinates
	    //shuffle array
	    // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
	     for (var i = successors.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = successors[i];
        successors[i] = successors[j];
        successors[j] = temp;
    } // does this do anything???
	    for(i=0;i<successors.length;i++){
	    	var succ = new Node(successors[i][0], successors[i][1], q.exiti, q.exitii, q.endi, q.endii, q, successors[i][2], q.goali, q.goalii);

		if (succ.done()) { // matched the goal. reutrn this. last node
			return succ;
		}
		
		//confused on this part (3ii)
		var exist = open_hash[succ.key()];
		if (typeof exist === 'undefined') {

		} else {
		    if (exist <= succ) {   // deep insights, Succ can never outperform exist.
		    	continue;
		    }
		}
		
		// step[ 3iii]
		exist = closed[succ.key()];
		if (typeof exist === 'undefined') {
			open.insert(succ);
			open_hash[succ.key()] = succ;
		} else {
		    if (exist <= succ) {    // already processed this state AND was better than succ
		    	continue;
		    }
		 //   console.log("WOW! Found better.");
		 open.insert(succ);
		 open_hash[succ.key()] = succ;
		}
	}

	closed[q.key()] = q;
}
return null;
}

this.place_things = function (random) {
  	//added this in as part of exit distances
  var exit_locations = []; //might need to be global variable
      //here will initialize a lecture hall
      // 30 rows, after 15th 2 row spaces for ppl
      //20 columns, 3 column spaces for ppl after 10
      //26x68
      //exits at (0,0) (0,44) (68,0) (68,44) 
      //x values are columns
      //y values are rows
      
      if (random==false){
        //first quarter of the room
        for (var col=0; col<10; col++){ //leaving row space for people
          for (var row=0; row<30; row+=2){ //columns, next to each other
            var obj = new Obstacle(col+10,row+10); //offsetting by 2,3
            this.temp_grid[col+10][row+10].thing = obj;
        }
    }
        //second quarter of the room, double row space after first quarter
        for (var col=0; col<10; col++){ //leaving row space for people
          for (var row=0; row<30; row+=2){ //columns, next to each other
            var obj = new Obstacle(col+10,row+42); //offsetting by 2,32
            this.temp_grid[col+10][row+42].thing = obj;
        }
    }
        //third quarter of room
        for (var col=0; col<10; col++){ //leaving row space for people
          for (var row=0; row<30; row+=2){ //columns, next to each other
            var obj = new Obstacle(col+27,row+10); //offsetting by 14,3
            this.temp_grid[col+27][row+10].thing = obj;
        }
    }
        //fourth quarter of the room
        for (var col=0; col<10; col++){ //leaving row space for people
          for (var row=0; row<30; row+=2){ //columns, next t0 each other
            var obj = new Obstacle(col+27,row+42); //offsetting by 14,32
            this.temp_grid[col+27][row+42].thing = obj;
        }
    }
    var obj1 = new Exit(0,0); //should probably make coordinates variables
    exit_locations.push(obj1);
     for (var p = 0; p < obj1.profile_i.length; p++) {  //placing exits on the grid
     	var dj = obj1.profile_i[p];
     	var djj = obj1.profile_ii[p];
     	var safej = this.get_bounded_index(0+dj);
     	var safejj = this.get_bounded_index(0+djj);

     	this.temp_grid[safej][safejj].thing = obj1;
     }
     var obj2 = new Exit(grid_length-3,0);
     exit_locations.push(obj2);
	    for (var p = 0; p < obj2.profile_i.length; p++) {  //placing exits on the grid
	    	var dj = obj2.profile_i[p];
	    	var djj = obj2.profile_ii[p];
	    	var safej = this.get_bounded_index(grid_length-3+dj);
	    	var safejj = this.get_bounded_index(0+djj);

	    	this.temp_grid[safej][safejj].thing = obj2;
	    }
	    var obj3 = new Exit(0,grid_length-1);
	    exit_locations.push(obj3);
	    for (var p = 0; p < obj3.profile_i.length; p++) {  //placing exits on the grid
	    	var dj = obj3.profile_i[p];
	    	var djj = obj3.profile_ii[p];
	    	var safej = this.get_bounded_index(0+dj);
	    	var safejj = this.get_bounded_index(grid_length-1+djj);

	    	this.temp_grid[safej][safejj].thing = obj3;
	    }
	    var obj4 = new Exit(grid_length-3, grid_length-1);
	    exit_locations.push(obj4);
	    for (var p = 0; p < obj4.profile_i.length; p++) {  //placing exits on the grid
	    	var dj = obj4.profile_i[p];
	    	var djj = obj4.profile_ii[p];
	    	var safej = this.get_bounded_index(grid_length-3+dj);
	    	var safejj = this.get_bounded_index(grid_length-1+djj);

	    	this.temp_grid[safej][safejj].thing = obj4;
	    }
	}
	else{

		for (var n = 0; n < max_obstacles_on_grid; n++) {
			var j = get_random_int(0, grid_length)
			var jj = get_random_int(0, grid_length)

			var obj = new Obstacle(j,jj);
      	    // this.population.push(obj);  //do we want this?  do we want to save the obstacles to the population?
      	    this.temp_grid[j][jj].thing = obj;
      	}

      	
	for (var n = 0; n < max_exits_on_grid; n++) { //logic needs to be changed
	//get 2 random ints from 0-gridlength-3 (for j and jj)
	//which ever one is bigger we keep and change the other one to 0 or grid_length (so it goes to an edge)
	var j = get_random_int(0,grid_length-3);
	var jj = get_random_int(0,grid_length-3);
	if (j > jj) {
		var j = j;
		var jj = ((grid_length-1)*(Math.round(Math.random())));
	}
	else {
		var j = ((grid_length-1)*(Math.round(Math.random())));
		var jj = jj;
	}
	var obj = new Exit(j,jj);
  	    //want to push whole object so that it keeps track of the end
  	    exit_locations.push(obj); 
  	    //used so people can exit at all directions
  	    //could change to just the exit object added but did not want to change code below too much
  	    
  	 //    var obj =  new Exit(j,jj);
  	 //    if ((obj.orientation == DOWN) || (obj.orientation == UP)) {
  		// var j = 0;
  		// var jj = get_random_int(0, grid_length-3);
  		// exit_locations.push([j,jj])
  	 //    }
  	 //    else if ((obj.orientation == LEFT) || (obj.orientation == RIGHT)) {
  		// var j = grid_length;
  		// var jj = get_random_int(0, grid_length-3);
  		// exit_locations.push([j,jj])
  	 //    }
  	 //    else if ((obj.orientation == diagUpLeft) || (obj.orientation == diagDownLeft)) {
  		// var j = get_random_int(0, grid_length-3);
  		// var jj = 0;
  		// exit_locations.push([j,jj])
  	 //    }
  	 //    else {
  		// var j = get_random_int(0, grid_length-3);
  		// var jj = grid_length;
  		// exit_locations.push([j,jj])
  	 //    }
  	    // this.population.push(obj);
  	    for (var p = 0; p < obj.profile_i.length; p++) {  //placing exits on the grid
  	    	var dj = obj.profile_i[p];
  	    	var djj = obj.profile_ii[p];
  	    	var safej = this.get_bounded_index(j+dj);
  	    	var safejj = this.get_bounded_index(jj+djj);
  	    	
  	    	this.temp_grid[safej][safejj].thing = obj;
  	    }
  	}
  		// INSERT SQUARE
	// -------------
//	for (var n = 10; n <= 50; n++) {
//	    this.temp_grid[n][10].thing = new Obstacle(n,10);
//	    this.temp_grid[10][n].thing = new Obstacle(10,n);
//
//	    this.temp_grid[n][50].thing = new Obstacle(n,50);
//	    this.temp_grid[50][n].thing = new Obstacle(50,n);	
//	}

  	// RANDOM Xs 
  	// -------------
  	for (var xx = 0; xx < max_large_X_obstacles_on_grid; xx++) {
  		var j = get_random_int(20, grid_length-20)
  		var jj = get_random_int(20, grid_length-20)
  		
  		for (var n = 0; n <= 20; n++) {
  			this.temp_grid[j+n][jj+n].thing = new Obstacle(j+n,jj+n);
  			this.temp_grid[j-n][jj-n].thing = new Obstacle(j-n,jj-n);
  			this.temp_grid[j+n][jj-n].thing = new Obstacle(j+n,jj-n);
  			this.temp_grid[j-n][jj+n].thing = new Obstacle(j-n,jj+n);
  		}
  	}
  	
  }
	// console.log(exit_locations)

	for (var n = 0; n < max_children_on_grid; n++) {
		var j = get_random_int(0, grid_length);
		var jj = get_random_int(0, grid_length);
    	    //added this in as part of exit distances
    	    exit_distances = [];
    	    for (var exit=0; exit < exit_locations.length; exit++) {
    	    	var exiti = exit_locations[exit].anchor_i;
    	    	var exitii = exit_locations[exit].anchor_ii;
    	    	var local_endi = exit_locations[exit].profile_i[3] + exit_locations[exit].anchor_i;
    	    	var local_endii = exit_locations[exit].profile_ii[3] + exit_locations[exit].anchor_ii;
    	    	var current_distance = calc_distance(j,jj,exiti,exitii)
    	    	//randomly getting a specific exit cell goal
    	    	var rand_x = get_random_int(0, 3);
    	    	var rand_y = get_random_int(0, 3);
    	    	var local_goali = exit_locations[exit].profile_i[rand_x]+ exit_locations[exit].anchor_i;
    	    	var local_goalii = exit_locations[exit].profile_ii[rand_y]+ exit_locations[exit].anchor_ii;
    	    	var list = [current_distance,exiti,exitii, local_endi, local_endii, local_goali, local_goalii] //keeping track of the beginning and end of exit
    	    	exit_distances.push(list)
    	    }
    	    console.log(exit_distances)
    	    var min_exit_distance = exit_distances[0][0]; //this needs to be a var
    	    var min_exiti = exit_distances[0][1];
    	    var min_exitii = exit_distances[0][2];
    	    var min_endi = exit_distances[0][3];
    	    var min_endii = exit_distances[0][4];
    	    var goali = exit_distances[0][5];
    	    var goalii = exit_distances[0][6];
    	    // console.log(min_exit_distance)
    	    // console.log(min_exiti)
    	    // console.log(min_exitii)
    	    for (var exit=0; exit < exit_distances.length; exit++) {
    	    	if (exit_distances[exit][0] < min_exit_distance) {
    	    	  //change if needed
    	    	  min_exit_distance = exit_distances[exit][0];
    	    	  min_exiti = exit_distances[exit][1];
    	    	  min_exitii = exit_distances[exit][2];
    	    	  min_endi = exit_distances[exit][3];
    	    	  min_endii = exit_distances[exit][4];
    	    	  goali = exit_distances[exit][5];
    	    	  goalii = exit_distances[exit][6];
    	    	  // console.log(min_exit_distance)
    	    	  // console.log(min_exiti)
    	    	  // console.log(min_exitii)
    	    	}
    	    }

    	    var objChild = new Child(j,jj);
    	    objChild.min_exiti = min_exiti;
    	    objChild.min_exitii = min_exitii;
    	    objChild.endi = min_endi;
    	    objChild.endii = min_endii;
    	    objChild.goali = goali;
    	    objChild.goalii = goalii;

    	    this.population.push(objChild);
    	    var obstacle = 0;
    	    for (var p = 0; p < objChild.profile_i.length; p++) {  //
    	    	var dj = objChild.profile_i[p];
    	    	var djj = objChild.profile_ii[p];
    	    	var safej = this.get_bounded_index(j+dj);
    	    	var safejj = this.get_bounded_index(jj+djj);
    	    	if (this.temp_grid[safej][safejj].has_other_thing(objChild)){ //should be somewhere
    	    		obstacle++;
            //do not place
        }
    }
    if (obstacle = 0){
			       for (var p = 0; p < objChild.profile_i.length; p++) {  //
			       	var dj = objChild.profile_i[p];
			       	var djj = objChild.profile_ii[p];
			       	var safej = this.get_bounded_index(j+dj);
			       	var safejj = this.get_bounded_index(jj+djj);
  			      this.temp_grid[safej][safejj].thing = objChild; //need to fix to always have correct number on floor
  			  }
  			}
  		}
		// console.log(min_exit_distance)
		// console.log(min_exiti)
		// console.log(min_exitii)

		for (var n = 0; n < max_backpack_on_grid; n++) {
			var j = get_random_int(0, grid_length)
			var jj = get_random_int(0, grid_length)
    	    //added this in as part of exit distances
    	    exit_distances = [];
    	    for (var exit=0; exit < exit_locations.length; exit++) {
    	    	var exiti = exit_locations[exit].anchor_i;
    	    	var exitii = exit_locations[exit].anchor_ii;
    	    	var local_endi = exit_locations[exit].profile_i[3] + exit_locations[exit].anchor_i;
    	    	var local_endii = exit_locations[exit].profile_ii[3] + exit_locations[exit].anchor_ii;
    	    	var current_distance = calc_distance(j,jj,exiti,exitii)
    	    	var list = [current_distance,exiti,exitii, local_endi, local_endii] //keeping track of the beginning and end of exit
    	    	exit_distances.push(list)
    	    }
// console.log(exit_distances)
    	    var min_exit_distance = exit_distances[0][0]; //this needs to be a var
    	    var min_exiti = exit_distances[0][1];
    	    var min_exitii = exit_distances[0][2];
    	    var min_endi = exit_distances[0][3];
    	    var min_endii = exit_distances[0][4];
    	    // console.log(min_exit_distance)
    	    // console.log(min_exiti)
    	    // console.log(min_exitii)
    	    for (var exit=0; exit < exit_distances.length; exit++) {
    	    	if (exit_distances[exit][0] < min_exit_distance) {
    	    	  //change if needed
    	    	  min_exit_distance = exit_distances[exit][0];
    	    	  min_exiti = exit_distances[exit][1];
    	    	  min_exitii = exit_distances[exit][2];
    	    	  min_endi = exit_distances[exit][3];
    	    	  min_endii = exit_distances[exit][4];
    	    		// console.log(min_exit_distance)
    	    		// console.log(min_exiti)
    	    		// console.log(min_exitii)
    	    	}
    	    }
    	    var obj =  new AdultBackpack(j,jj);
    	    obj.min_exiti = min_exiti;
    	    obj.min_exitii = min_exitii;
    	    obj.endi = min_endi;
    	    obj.endii = min_endii;
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
		var j = get_random_int(0, grid_length-1)
		var jj = get_random_int(0, grid_length-1)
    	    //added this in as part of exit distances
    	    exit_distances = [];
    	    for (var exit=0; exit < exit_locations.length; exit++) {
    	    	var exiti = exit_locations[exit].anchor_i;
    	    	var exitii = exit_locations[exit].anchor_ii;
    	    	var local_endi = exit_locations[exit].profile_i[3] + exit_locations[exit].anchor_i;
    	    	var local_endii = exit_locations[exit].profile_ii[3] + exit_locations[exit].anchor_ii;
    	    	var current_distance = calc_distance(j,jj,exiti,exitii)
    	    	var list = [current_distance,exiti,exitii, local_endi, local_endii] //keeping track of the beginning and end of exit
    	    	exit_distances.push(list)
    	    }
// console.log(exit_distances)
    	    var min_exit_distance = exit_distances[0][0]; //this needs to be a var
    	    var min_exiti = exit_distances[0][1];
    	    var min_exitii = exit_distances[0][2];
    	    var min_endi = exit_distances[0][3];
    	    var min_endii = exit_distances[0][4];
    	    // console.log(min_exit_distance)
    	    // console.log(min_exiti)
    	    // console.log(min_exitii)
    	    for (var exit=0; exit < exit_distances.length; exit++) {
    	    	if (exit_distances[exit][0] < min_exit_distance) {
    	    	  //change if needed
    	    	  min_exit_distance = exit_distances[exit][0];
    	    	  min_exiti = exit_distances[exit][1];
    	    	  min_exitii = exit_distances[exit][2];
    	    	  min_endi = exit_distances[exit][3];
    	    	  min_endii = exit_distances[exit][4];
    	    		// console.log(min_exit_distance)
    	    		// console.log(min_exiti)
    	    		// console.log(min_exitii)
    	    	}
    	    }

    	    var obj = new Adult(j,jj);
    	    obj.min_exiti = min_exiti;
    	    obj.min_exitii = min_exitii;
    	    obj.endi = min_endi;
    	    obj.endii = min_endii;

	    // var j = get_random_int(0, grid_length)
	    // var jj = get_random_int(0, grid_length)
	    
	    // var obj =  new Adult(j,jj);
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

    //need this to because we have to use profile and not anchor
    this.get_coords_from_orientation_neighbors = function (thing, index, orient) { 
    	var i = thing.profile_i[index];
    	var ii = thing.profile_ii[index];

    	if (orient == UP) {
    		return [i, ii-1];
    	} else if (orient == DOWN) {
    		return [i, ii+1];
    	} else if (orient == LEFT) {
    		return [i-1, ii];
    	} else if (orient == RIGHT) {
    		return [i+1, ii];
    	} else if (orient == diagDownRight) {
    		return [i+1, ii+1];
    	} else if (orient == diagUpRight) {
    		return [i+1,ii-1];
    	} else if (orient == diagDownLeft) {
    		return [i-1,ii+1];
    	} else {
    		return [i-1,ii-1];
    	}
    }
    
    this.move_thing = function (thing) {
    	var node = this.AStar(thing,0); //using AStar algorithm to get the best move
    	if (node == null) {
	    node = this.AStar(thing,1); // try to avoid others and break out of deadlock
	    if (node == null) {
	    	thing.stuck = 1;
	    	return false;
	    }
	}
	
	var new_coords = node.initial_step();
	var exiti = thing.min_exiti;
	var exitii = thing.min_exitii;

	// hack to fix
	if (new_coords[0] >= node.exiti && new_coords[0] <= node.endi &&
		new_coords[1] >= node.exitii && new_coords[1] <= node.endii) {
		thing.remove_footprint(this);
            return true; // remove
        }
        else{
        	var j = new_coords[0];
        	var jj = new_coords[1];
	    var orientation = new_coords[2]; // direction to aim
	    // handles collisions by doing NOTHING. If spot that you are
	    // trying to move to DOESN'T HAVE a thing then you are free to
	    // move, but you have to check profile.

	    try {
	    	var next = this.temp_grid[j][jj];
	    	if (typeof next === 'undefined') {
	    	} else {
	    		if (!next.has_other_thing(thing)) {

			// maybe could have break if collides so doesn't
			// have to keep going through loop. need to check
			// all of the cells of the thing
			var collision = 0;
			for (var x = 0; x < thing.profile_i.length; x++) { 
				var new_deltas = this.get_coords_from_orientation_neighbors(thing, x, orientation);
				var r = new_deltas[0];
				var c = new_deltas[1];
				var safe_r = this.get_bounded_index(r + thing.anchor_i);
				var safe_c = this.get_bounded_index(c + thing.anchor_ii);
			    if (this.temp_grid[safe_r][safe_c].has_other_thing(thing)){ //if something in the cell
				collision = collision + 1 ;//add one to collision
			}
		}
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
    } catch (error) {
    	console.error(error);
    }
}

	return false; // do not remove
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

	this.has_thing = function() {
		return this.thing ? true : false;
	};

	this.get_thing = function() {
		return this.thing;
	};

	this.has_obstacle = function() {
		if (this.thing instanceof Obstacle) {
			return true;
		} else {
			return false;
		}
	}

	this.has_other_thing = function(other) {
		if (this.thing == null) { return false; }
		if (this.thing == other) { return false; }	

	// has SOME other thing...
	return true;
}

}

function Exit(j,jj) {

	this.orientation = random_orientation();
	this.anchor_i = j;
	this.anchor_ii = jj;
	
	//think we need to check anchor instead of orientation
	//if anchor i is 0 or grid length -3 use 1st set of profiles (vertical exit)
	//else use second set (makes them horizontal)
	if ((this.anchor_i == 0) || (this.anchor_i == grid_length-1)) {
		this.profile_i  = [0,0,0,0];
		this.profile_ii = [0,1,2,3];
	}
	else {
		this.profile_i  = [0,1,2,3];
		this.profile_ii = [0,0,0,0];
	}
	// if ((this.orientation == DOWN) || (this.orientation == UP) || (this.orientation == LEFT) || (this.orientation == RIGHT)) {
	// 	this.profile_i  = [0,0,0,0];
	// 	this.profile_ii = [-1,0,1,2];
	// } 
	// else {
	// 	this.profile_i  = [-1,0,1,2];
	// 	this.profile_ii = [0,0,0,0];
	// }

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
	this.orientation = random_orientation();
	this.anchor_i = j
	this.anchor_ii = jj
	this.min_exiti = 0;
	this.min_exitii = 0;
	this.goali = 0; //initially
	this.goalii = 0; //initially
    this.endi = 0; //initially
    this.endii = 0; // initially
    this.profile_i  = [0];
    this.profile_ii = [0];

    this.stuck = 0;

    this.color = function() {
    	if (this.stuck == 0) {
    		return "rgb(255,165,0)";
    	} else {
    		return "rgb(255,0,0)";
    	}
    }
    
    this.place_footprint = function(state) {
    	state.temp_grid[this.anchor_i][this.anchor_ii].thing = this;
    }
    
    this.remove_footprint = function(state) {
    	state.temp_grid[this.anchor_i][this.anchor_ii].thing = null;
    }
}

function Adult(j,jj) {
	this.orientation = random_orientation();
	this.anchor_i = j
	this.anchor_ii = jj
	this.min_exiti = 0;
	this.min_exitii = 0;
    this.endi = 0; //initially
    this.endii = 0; // initially
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
	this.orientation = random_orientation();
	this.anchor_i = j
	this.anchor_ii = jj
	this.min_exiti = 0;
	this.min_exitii = 0;
    this.endi = 0; //initially
    this.endii = 0;
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

var interval_id = 0;

function initialize_simulation() {
	if (interval_id) {
		clearInterval(interval_id);
	}
	state = new State();

	state.init_grids();
    // state.draw_border();
    if (hall_layout==true){
      state.place_things(false);
    }
    else{
      state.place_things(true);
    }
    
    draw_grid(state.grid.map(function(row) {return row.map(function(cell) {return cell;});}));
}

function end_simulation() {
	clearInterval(interval_id);
}

function start_simulation() {
	initialize_simulation();
	interval_id = setInterval(simulate_and_visualize, ms_between_updates);
}

var _indexCounter = 0;
function simulate_and_visualize() {
	state.move_things();
	draw_grid(state.grid.map(function(row) {return row.map(function(cell) {return cell;});}));

	if (take_snapshot) {
		var canvas = document.getElementById('grid');

		canvas.toBlob(function(blob) {
			var newImg = document.createElement('img');
	    // make smaller if you'd like
	    //newImg.height=100;
	    //newImg.width=100;
	    url = URL.createObjectURL(blob);
	    
	    newImg.onload = function() {
		// no longer need to read the blob so it's revoked
		URL.revokeObjectURL(url);
	};

	newImg.src = url;
	var header = document.createElement("H2");
	var label = document.createTextNode("Label " + _indexCounter);
	_indexCounter++;
	header.appendChild(label);
	document.body.appendChild(header);
	document.body.appendChild(newImg);
});
	}	
}

//right now, pedestrians don't exit the board if their non-anchor
//point makes contact with the exit - goal of this is to change
//but right now it's just pseudocode

// for ((j,jj) in (obj.profile_i,obj.profile_ii)) {
// 	if (j,jj in contact with exit) {
// 		remove_footprint(obj)
// 	}
// }