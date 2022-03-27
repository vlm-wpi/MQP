/**
 * Conflict resolution strategies go here.
 *
 * depends on 'data'
 */

(function(conflict) {
	//initialization
	var new_exit_profile_i = [];
	var new_exit_profile_ii = [];
    
    /** End of the chain. */
    function NullConflictStrategy() {
	
	this.next = undefined;

	this.try_to_resolve = function (thing, state, board) {
	    return false;
	}
    }

    /**
     * Choose a different exit if thing.wait exceeds threshold.
     */
    function ChooseDifferentExitAndReset(threshold) {
	this.threshold = threshold;

	this.next = undefined;

	this.try_to_resolve = function (thing, state, board) {
	    if (this.resolve(thing, state, board)) {
		return true;
	    }		

	    // Is there nothing next to try? DONE!
	    if (typeof this.next === 'undefined') {
		return false;
	    }
	    
	    return this.next.try_to_resolve(thing, state, board);
	}

	this.resolve = function (thing, state, board) {
	    if (thing.wait > this.threshold) {
		var ran_exit_index = random.nextInt(data.max['Exit']); //get a random index to choose the exit
		var new_exit = board.exit_locations[ran_exit_index]; //get the exit from the list of exits
		thing.min_exiti = new_exit.anchor_i; //update the person's exit x value 
		thing.min_exitii = new_exit.anchor_ii; //update the person's exit y value 
		thing.endi = new_exit.profile_i[3] + new_exit.anchor_i; //update the person's last exit x cell
		thing.endii = new_exit.profile_ii[3] + new_exit.anchor_ii; //update the person's last exit y cell
		var ranx = random.nextInt(4); //get random number 0-3 for the goal cell of the exit x value
		var rany = random.nextInt(4); //get random number 0-3 for the goal cell of the exit y value
		
		// prepare for next
		thing.goali = new_exit.profile_i[ranx] + new_exit.anchor_i; //update the new goal exit x coordinate
		thing.goalii = new_exit.profile_ii[rany]+ new_exit.anchor_ii; //update the new goal exit y coordinatee
		thing.wait = 0; //reset the wait time, not totally convinced that this should be here
		return true;
	    }
	    
	    // didn't do anything
	    return false; 
	}
    }
    
    /**
     * Choose a different exit if thing.wait exceeds threshold.
     */
    function ChooseDifferentExit(threshold) {
	this.threshold = threshold;

	this.next = undefined;

	this.try_to_resolve = function (thing, state, board) {
	    if (this.resolve(thing, state, board)) {
		return true;
	    }		

	    // Is there nothing next to try? DONE!
	    if (typeof this.next === 'undefined') {
		return false;
	    }
	    
	    return this.next.try_to_resolve(thing, state, board);
	}

	this.resolve = function (thing, state, board) {
	    if (thing.wait > this.threshold) {
		var ran_exit_index = random.nextInt(data.max['Exit']); //get a random index to choose the exit
		var new_exit = board.exit_locations[ran_exit_index]; //get the exit from the list of exits
		thing.min_exiti = new_exit.anchor_i; //update the person's exit x value 
		thing.min_exitii = new_exit.anchor_ii; //update the person's exit y value 
		thing.endi = new_exit.profile_i[3] + new_exit.anchor_i; //update the person's last exit x cell
		thing.endii = new_exit.profile_ii[3] + new_exit.anchor_ii; //update the person's last exit y cell
		var ranx = random.nextInt(4); //get random number 0-3 for the goal cell of the exit x value
		var rany = random.nextInt(4); //get random number 0-3 for the goal cell of the exit y value
		
		// prepare for next
		thing.goali = new_exit.profile_i[ranx] + new_exit.anchor_i; //update the new goal exit x coordinate
		thing.goalii = new_exit.profile_ii[rany]+ new_exit.anchor_ii; //update the new goal exit y coordinatee
		return true;
	    }
	    
	    // didn't do anything
	    return false; 
	}
    }

    /**
     * Choose a different exit if thing.wait exceeds threshold.
     */
    function ChooseRandomMove(threshold) {
	//this.threshold = threshold;

	this.next = undefined;

	this.try_to_resolve = function (thing, state, board) {
	    if (this.resolve(thing, state, board)) {
		return true;
	    }		

	    // Is there nothing next to try? DONE!
	    if (typeof this.next === 'undefined') {
		return false;
	    }

	    return this.next.try_to_resolve(thing, state, board);
	}

	this.resolve = function (thing, state, board) {
            if (thing.wait > threshold) { 
		//get random orientation and try to move there
		var orientation = data.random_orientation(); //random orientation
		var can_move = true; //initially assume you can move
		for (var x = 0; x < thing.profile_i.length; x++) { //go through every cell the person is occupying
                    //get next potential coordinates based off of the orientation
                    var new_deltas = data.get_coords_from_orientation_neighbors(thing, x, orientation);
                    var r = new_deltas[0]; //x value of new potential coordinate
                    var c = new_deltas[1]; //y value of new potential coordinate
                    var safe_r = data.get_bounded_index_i(r + thing.anchor_i); //bound the x coordiinate to make not out of bounds
                    var safe_c = data.get_bounded_index_ii(c + thing.anchor_ii); //bound the y coordinate to make not out of bounds
                    if (state.temp_grid[safe_r][safe_c].has_other_thing(thing)){ //if something in the cell trying ti move into
			can_move = false; //cannot move here
                    }
                    //if move puts you off the grid you cannot move in this orientation
                    // can't move off the board
                    //do we even need safe_r???
                    else if (safe_r != thing.anchor_i + r) {
			can_move = false; //cannot move off grid
                    }
                    else if (safe_c != thing.anchor_ii + c) {
			can_move = false; //cannot move off grid
                    }
		}
		
		if (can_move){ //if the person can move
                    //change anchor and call place footprint
                    //do not need to check if exit?? or should we check
                    thing.remove_footprint(state); // remove the person from its current position on grid
                    thing.orientation = orientation; //update the person's orientation
                    next_coords = data.get_coords_from_orientation(thing); //get these new coordinates to move to
                    thing.anchor_i = next_coords[0]; //update the anchor x coordinate to its new position
                    thing.anchor_ii = next_coords[1]; //update the anchor y coordinate to its new position
                    thing.wait = 0; //reset the wait time
                    thing.place_footprint(state); //place the person in the temp grid in its new position
                    final.didAnythingChange = true; //something moved on the board
		    return true;
		}
            }
	    
	    return false;  // nothing happened
	}
    }

        /**
     * Choose a different exit if thing.wait exceeds threshold.
     */
    function ChooseDifferentExitDensity(threshold) {
	this.threshold = threshold;

	this.next = undefined;

	this.try_to_resolve = function (thing, state, board) {
	    if (this.resolve(thing, state, board)) {
		return true;
	    }		

	    // Is there nothing next to try? DONE!
	    if (typeof this.next === 'undefined') {
		return false;
	    }
	    
	    return this.next.try_to_resolve(thing, state, board);
	}

	this.resolve = function (thing, state, board) {
	    if (thing.wait > this.threshold) {
	    thing.min_exiti = final.least_dense_exit_i; //get the i value of the least dense exit
		thing.min_exitii = final.least_dense_exit_ii; //get the ii value of the least dense exit
		if((final.least_dense_exit_i == 0) || (final.least_dense_exit_i == (data.width_i-1))) { //set the profiles of the new exit
			new_exit_profile_i = [0,0,0,0];
			new_exit_profile_ii = [0,1,2,3];
		} else {
			new_exit_prfile_i = [0,1,2,3];
			new_exit_profile_ii = [0,0,0,0];
		}
		thing.endi = new_exit_profile_i[3] + final.least_dense_exit_i; //update person's exit i cell
		thing.endii = new_exit_profile_ii[3] + final.least_dense_exit_ii; //update the person's exit ii cell
		var ranx = random.nextInt(4);  //get random number 0-3 for the goal cell of the exit x value
		var rany = random.nextInt(4);  //get random number 0-3 for the goal cell of the exit y value
		
		// prepare for next
		thing.goali = new_exit_profile_i[ranx] + final.least_dense_exit_i; //update the new goal exit x coordinate
		thing.goalii = new_exit_profile_ii[rany]+ final.least_dense_exit_ii; //update the new goal exit y coordinatee
		thing.wait = 0; //reset the wait time, not totally convinced that this should be here
		return true;
	    }
	    
	    // didn't do anything
	    return false; 
	}
    }
    
    //use the astar function that makes a path, taking others into account
    //as intuition, this conflict resolution needs to be last resort because if there are still a lot of people
    //left on the board, and they are near an exit, there will not be a path
    function takeOthersIntoAccount(threshold){
      this.threshold = threshold;

	    this.next = undefined;

	    this.try_to_resolve = function (thing, state, board) {
	    if (this.resolve(thing, state, board)) {
	    	return true;
	    }		

	    // Is there nothing next to try? DONE!
	    if (typeof this.next === 'undefined') {
		    return false;
	    }
	    
	    return this.next.try_to_resolve(thing, state, board);
  	  }
  	  this.resolve = function (thing, state, board) {
  	    if (thing.wait > this.threshold) {
  	      var node = astar.AStar(state, thing, 1, final.get_heuristic);
  	     if (node == null) { //if no move found from initial AStar call return false: can't move but not exit
  	     console.log("no path");
           return false;
        }
  	      var new_coords = node.initial_step(); //get the next move from the minheap
  	      thing.remove_footprint(state); // remove the person from its current position on grid
  	      //check if at exit?
  	      thing.anchor_i = new_coords[0]; //update the anchor x coordinate to its new position
          thing.anchor_ii = new_coords[1]; //update the anchor y coordinate to its new position
          thing.place_footprint(state); //place the person in the temp grid in its new position
  	      thing.wait = 0;
  	      final.didAnythingChange = true; //something moved on the board
  	      return true;
  	    }
  	    return false;
  	  }
      
    }

    function factory(tpe, threshold) {
		if (tpe == 'NullConflictStrategy') {
			return new NullConflictStrategy();
		} else if (tpe == 'ChooseDifferentExit') {
			return new ChooseDifferentExit(threshold);
		} else if (tpe == 'ChooseDifferentExitAndReset') {
			return new ChooseDifferentExitAndReset(threshold);
		} else if (tpe == 'ChooseRandomMove') {
			return new ChooseRandomMove(threshold);
		} else if (tpe == 'ChooseDifferentExitDensity') {
			return new ChooseDifferentExitDensity(threshold);
		} else if (tpe == 'takeOthersIntoAccount') {
			return new takeOthersIntoAccount(threshold);
		}else {
			console.log("unknown type:" + tpe);
			return None; //does not work to return none, what should i do?
		}
    }
	
	function knownStrategies() {
		return [
			'NullConflictStrategy', 
			'ChooseDifferentExit', 
			'ChooseDifferentExitAndReset', 
			'ChooseRandomMove', 
			'ChooseDifferentExitDensity', 
			'takeOthersIntoAccount'
		];
	}

    // exported API
    conflict.factory = factory;
	conflict.knownStrategies = knownStrategies;

})(typeof conflict === 'undefined'?
            this['conflict']={}: conflict);