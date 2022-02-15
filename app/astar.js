/**
 * A* implementation(s)
 *
 * depends on 'heap' module
 */

(function(astar) {

    //generic structure used in the AStar function and priority queue
    function Node(j, jj, exiti, exitii, endi, endii, parent, direction, goali, goalii, profilei, profileii) {
	this.i = j;
	this.ii = jj;
	this.direction = direction;
	this.exiti = exiti; //head of the exit x value
	this.exitii = exitii; //head of the exit y value
	this.endi = endi; //end of the exit x value
	this.endii = endii; //end of the exit y value
	this.goali = goali; //specific x value of the cell exit
	this.goalii = goalii; //specific y value of the cell exit
	this.profile_i = profilei; //all x values that the structure spans
	this.profile_ii = profileii; //all y values that the structure spans
	// how many steps fromo starting spot.
	this.parent = parent; //previous step, structured as a node
	this.g = 0; //number of steps to get to current position, used in heuristic
	if (typeof parent === 'undefined') { //if the nide has no parent
            this.g = 0; //this is the starting point, hence no number of steps too get to the current position
	}
	else { //if not the starting position
            this.g = parent.g + 1; //add one to the previous g to get the number of steps to get here
	}
	
	// starting from the last node (which is the exit) go backwards until you
	// get to a node whose parent is the original, then return its location [i ,ii]
	//I think this function returns the x and y coordinate that the anchor point wants to go
	this.initial_step = function() {
            var n = this; //n is the current node in use
            if (this.parent === null) { //if the node does not have a parent
		return []; //return empty array
            } // sanity check
	    
            // find node whose parent has no parent, since that node is the origin and then
            // n is the first step in the direction of the final path.
            while (typeof n.parent.parent !== 'undefined') {
		n = n.parent; //update n
            }
	    //return the next step, anchors, profiles, and the direction of the person
            return [n.i, n.ii, n.direction, n.profile_i, n.profile_ii];
	}
	
	this.initial_path = function(){
	  var path_array = [];
	  var n = this; //current node
	  if (this.parent === null) { //if the node does not have a parent
		  return []; //return empty array
    } // sanity check
	   // find node who has no parent, since that node is the origin and then
    // stop appending to list
    while (typeof n !== 'undefined') {
      path_array.push(n.i);
		  n = n.parent; //update n
      }
	    //return the path
      return path_array;
	}
    
	//used to quickly get the anchor values, hashtable
	//ask about this
	this.key = function() {
            return "" + this.i + "," + this.ii;
	}
	
	// set heuristic to use
	this.setHeuristic = function(h) {
	    this.heuristic = h;
	}

	//function to check if a person is at an exit and should be removed from the board
	this.done = function() {
            for (index = 0; index < this.profile_i.length; index++) { //go through all person's cells
		if ((this.profile_i[index] + this.i) >= this.exiti && (this.profile_i[index] + this.i) <= this.endi &&
                    (this.profile_ii[index] + this.ii) >= this.exitii && (this.profile_ii[index] + this.ii) <= this.endii) {
		    //if the cell is touching an exit
                    return true; // if any part of the person is in an exit
                    //checking if any part of the person is touching an exit
		}
            }
	}
    
	//Function to ensure that two nodes can be compared using < operator
	//here is where the distance heuristic function is used
	Node.prototype.valueOf = function() { 
            // f = g + h

	    // use heuristic function associated with node.
	    var h = this.heuristic(this.i, this.ii, this.goali, this.goalii);
            return this.g + h; //total heurisic value, f, is returned
	}
    }

    //not comopletely commented yet
    // only if do not contain an obstacle. Must check entire profile
    // if 'others' than check to avoid other shapes as well
    function get_neighbors(x, y, thing, state, others) { //gets the eight neighbors as a possible move
        var parents = []; //initialize array 
        var oix = -1; //initialize counter for the index of its orientation
        // Use deltas of [-1,+1] on both i and ii
        for (var di = -1; di <= 1; di++) {
            for (var dii = -1; dii <= 1; dii++) {
                if (di == 0 && dii == 0) {
                    continue; 
                }
                oix++;

                var safe_r = data.get_bounded_index_i(x + di); 
                var safe_c = data.get_bounded_index_ii(y + dii);
                if (safe_r != x + di) {
                    continue;
                }
                if (safe_c != y + dii) {
                    continue;
                }

                // ok. Can move anchor. Are other spots available?
                var safe = 1; //counter to check if a whole person is okay to move to
                for (var p = 0; p < thing.profile_i.length; p++) { //go through every cell of the person
                    var ss = data.get_coords_from_orientation_neighbors(thing, p, data.orientations[oix]);
                    var sr = data.get_bounded_index_i(x + ss[0]);
                    var sc = data.get_bounded_index_ii(y + ss[1]);

                    // can't move off the board
                    if (sr != x + ss[0]) {
                        safe = 0;
                        break;
                    }
                    if (sc != y + ss[1]) {
                        safe = 0;
                        break;
                    }
                    //check if there is an obstacle at the potential new coordinates
                    if (state.temp_grid[sr][sc].has_obstacle()) {
                        safe = 0; //update safe, it is now not safe to move
                        break; //end the loop, we know the person cannot move
                    } 
                    else if (others) { //If we are taking others into account
                        if (state.temp_grid[sr][sc].has_other_thing(thing)) { //check if there is any other thing is the coordinates
                            safe = 0; //update safe, it is now not safe to move
                            break; //end the loop, we know the person cannot move
                        }
                    }
                }
                if (safe) { //if safe equals one, person can move
                    parents.push([safe_r, safe_c, data.orientations[oix]]); //add the coordinates and its orientattion 
                }
            }
        }

        return parents; //return the list of possible coordinates with its orientation to move to
    }

    //I think we now have this implemented
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

    //function that takes in a person and a boolean
    //returns the shortest path of moves from the starting position to end goal
    function Astar(state, thing, others, heuristic) { 
        var open = new heap.minHeap(); //initialize priority queue
        var closed = {}; //initialize closed list, spots that have already been looked at
        var open_hash = {}; //
        var anchorX = thing.anchor_i; //x coordinate of the anchor of the person given
        var anchorY = thing.anchor_ii; //y coordinate of tthe anchor of the person given
        var exiti = thing.min_exiti; //x coordinate of the exit the person given is trying to reach
        var exitii = thing.min_exitii; //y coordinate of the exit the person given is trying to reach
        var endi = thing.endi; //x coordinate of the last cell of the exit 
        var endii = thing.endii; //y coordinate of the last cell of the exit
        var goali = thing.goali; //x coordinate of the specific exit cell the person is aiming for
        var goalii = thing.goalii; //y coordinate of the specific exit cell tthe eprson is aimiing for
        var profilei = thing.profile_i; //list of the other x coordiinates the person is covering
        var profileii = thing.profile_ii; //list of other y coordinates the person is covering
        //creating a new node using the information of the given person 
        var n = new Node(anchorX, anchorY, exiti, exitii, endi, endii, undefined, -1, goali, goalii, profilei, profileii);
	n.setHeuristic(heuristic); // be sure to set heurstic function to use
        open.insert(n); //add the starting node to the queue
        open_hash[n.key()] = n; 
        var heapLength = open.heap.length; //get the length of the queue
        //go through while the open list is not empty
        while (open.heap.length > 0) {
            var q = open.extractMin(); //get the minimun path so far
            //Returns the neighbors that all of the pieces can move to
	    //this function only returns coordinates and orientation
            var successors = get_neighbors(q.i, q.ii, thing, state, others);
            //shuffle array
            // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
            for (var i = successors.length - 1; i > 0; i--) {
                //var j = Math.floor(Math.random() * (i + 1));
                var j = random.nextInt(i+1);
                var temp = successors[i];
                successors[i] = successors[j];
                successors[j] = temp;
            } 

            for (i = 0; i < successors.length; i++) { //go through all the poossible next moves
                var succ = new Node(successors[i][0], successors[i][1], q.exiti, q.exitii, q.endi, q.endii, q, successors[i][2], q.goali, q.goalii, q.profile_i, q.profile_ii); //create a node with the information from the successsor
		succ.setHeuristic(heuristic); // be sure to set heurstic function to use

                if (succ.done()) { // matched the goal. reutrn this. last node
                    return succ;
                }

                //confused on this part (3ii)
                var exist = open_hash[succ.key()];
                if (typeof exist === 'undefined') {

                } else {
                    if (exist <= succ) { // deep insights, Succ can never outperform exist.
                        continue;
                    }
                }

                // step[ 3iii]
                exist = closed[succ.key()];
                if (typeof exist === 'undefined') {
                    open.insert(succ);
                    open_hash[succ.key()] = succ;
                } else {
                    if (exist <= succ) { // already processed this state AND was better than succ
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

    astar.AStar = Astar;

})(typeof astar === 'undefined'?
   this['astar']={}: astar);
