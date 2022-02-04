/**
 * Conflict resolution strategies go here.
 *
 * depends on 'data'
 */

(function(conflict) {

    function get_random_int(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
    }

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
		var ran_exit_index = Math.floor(Math.random() * data.max['Exit']); //get a random index to choose the exit
		var new_exit = board.exit_locations[ran_exit_index]; //get the exit from the list of exits
		thing.min_exiti = new_exit.anchor_i; //update the person's exit x value 
		thing.min_exitii = new_exit.anchor_ii; //update the person's exit y value 
		thing.endi = new_exit.profile_i[3] + new_exit.anchor_i; //update the person's last exit x cell
		thing.endii = new_exit.profile_ii[3] + new_exit.anchor_ii; //update the person's last exit y cell
		var ranx = get_random_int(0,3); //get random number 0-3 for the goal cell of the exit x value
		var rany = get_random_int(0,3); //get random number 0-3 for the goal cell of the exit y value
		
		// prepare for next
		thing.goali = new_exit.profile_i[ranx] + new_exit.anchor_i; //update the new goal exit x coordinate
		thing.goalii = new_exit.profile_ii[rany]+ new_exit.anchor_ii; //update the new goal exit y coordinatee
		thing.wait = 0; //reset the wait time, not totally convinced that this should be here
		return true;
	    }
	    
	    // didn't do anythin
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
		var ran_exit_index = Math.floor(Math.random() * data.max['Exit']); //get a random index to choose the exit
		var new_exit = board.exit_locations[ran_exit_index]; //get the exit from the list of exits
		thing.min_exiti = new_exit.anchor_i; //update the person's exit x value 
		thing.min_exitii = new_exit.anchor_ii; //update the person's exit y value 
		thing.endi = new_exit.profile_i[3] + new_exit.anchor_i; //update the person's last exit x cell
		thing.endii = new_exit.profile_ii[3] + new_exit.anchor_ii; //update the person's last exit y cell
		var ranx = get_random_int(0,3); //get random number 0-3 for the goal cell of the exit x value
		var rany = get_random_int(0,3); //get random number 0-3 for the goal cell of the exit y value
		
		// prepare for next
		thing.goali = new_exit.profile_i[ranx] + new_exit.anchor_i; //update the new goal exit x coordinate
		thing.goalii = new_exit.profile_ii[rany]+ new_exit.anchor_ii; //update the new goal exit y coordinatee
		return true;
	    }
	    
	    // didn't do anythin
	    return false; 
	}
    }

    /**
     * Choose a different exit if thing.wait exceeds threshold.
     */
    function ChooseRandomMove(threshold) {
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
                    thing.remove_footprint(state); // remove the person from its current position on grid
                    thing.orientation = orientation; //update the person's orientation
                    next_coords = data.get_coords_from_orientation(thing); //get these new coordinates to move to
                    thing.anchor_i = next_coords[0]; //update the anchor x coordinate to its new position
                    thing.anchor_ii = next_coords[1]; //update the anchor y coordinate to its new position
                    thing.wait = 0; //reset the wait time
                    thing.place_footprint(state); //place the person in the temp grid in its new position
		    return true;
		}
            }
	    
	    return false;  // nothing happened
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
	} else {
	    console.log("unknown type:" + tpe);
	    return None;
	}
    }

    // exported API
    conflict.factory = factory;

})(typeof conflict === 'undefined'?
            this['conflict']={}: conflict);
