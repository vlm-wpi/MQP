/**
 * Final Application
 *
 * Refactor out the alorithm used for each individual entity.
 */

(function(final) {

function get_random_int(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

    //variable for the total number of people on the grid, updates when it reads the value from html
    final.total_peds_at_start = 0; 
    
    //initializations for average density lists
    var avg_child_dens_list = [];
    var avg_adult_dens_list = [];
    var avg_backpack_dens_list = [];
    var avg_bike_dens_list = [];
    var avg_total_dens_list = [];
    var total_avg_dens_all_time = 0;
    var dens_sum = 0;


    //heuristic options
    var diagonal = true;   // initialize heuristic using diagonal distance
    var manhattan = false; // boolean to use manhattan distance in heuristic, user can change this
    var euclidean = false; // boolean to use euclidean distance in heuristic, user can change this
    

    // the selected board to use for layout
    var board = undefined;

    //Collision counters
    final.collisions_total = {};
    final.collisions_average = {};

    //counter for the number of collisions for children, in total and average
    final.collisions_total['Child'] = 0;
    final.collisions_average['Child'] = 0;

    final.collisions_total['Adult'] = 0;
    final.collisions_average['Adult'] = 0;

    final.collisions_total['AdultBike'] = 0;
    final.collisions_average['AdultBike'] = 0;

    final.collisions_total['AdultBackpack'] = 0;
    final.collisions_average['AdultBackpack'] = 0;

    final.total_collisions = 0; //counter for the number of collisions for people, in total
    final.avg_collisions_total = 0; //counter for the number of collisions for people, as an average

    //Exit time counters (in units of board updates)
    final.sum_of_exit_times = 0; //counter for the exit times of everyone, added together 
    final.sum_wait_steps = 0; //number of times everyone has waited, all added together

    final.exit_times = {};
    final.wait_steps = {};

    final.exit_times['Child'] = 0;
    final.wait_steps['Child'] = 0;

    final.exit_times['Adult'] = 0;
    final.wait_steps['Adult'] = 0;

    final.exit_times['AdultBike'] = 0;
    final.wait_steps['AdultBike'] = 0;

    final.exit_times['AdultBackpack'] = 0;
    final.wait_steps['AdultBackpack'] = 0;
   
    //counter for the number of children currently on the board
    final.current_population = 0;

    // number of generations, run up to max_generation
    var number_generations = 0;
    var max_generation = Number.MAX_SAFE_INTEGER;

    // callback hook once done.
    var callback_done = undefined;

//global variables for the diaginal distance
var D = 1; //distance of one edge of the square
var D2 = Math.sqrt(2); //distance from one corner of a square to the other

//function that returns the diagonal distance between a current (x,y) position to a goal (x,y) position
function diagonald(x, y, goalX, goalY) { //diagonal distance heuristic
    var dx = Math.abs(x - goalX); //the absolute value of the difference between the current position x value and the goal x value
    var dy = Math.abs(y - goalY); //the absolute value of the difference between the current position y value and the goal y value
  //maybe try too explain better
    var h = D * (dx + dy) + (D2 - 2 * D) * Math.min(dx, dy); //dx and dy added together plus the minumum of dx and dy times the squareroot of 2 minus 2
    return h; //the diagoonal distance is returned
}

//function that returns the manhattan distance between a current (x,y) position to a goal (x,y) position
function manhattand(x, y, goalX, goalY){ 
  var h = Math.abs(x-goalX) + Math.abs(y-goalY); //the absolute values of the differences of the current x and goal x and current y and goal y values added together
  return h; //return the distance
}

//function that returns the euclidean distance between a current (x,y) position to a goal (x,y) position
function euclideand(x, y, goalX, goalY){ 
  var dx = Math.abs(x - goalX); //the absolute value of the difference between the current position x value and the goal x value
  var dy = Math.abs(y - goalY); //the absolute value of the difference between the current position y value and the goal y value
  //distance formula
  var h = Math.sqrt(Math.pow(dx,2)+ Math.pow(dy,2)); //squareroot of dx squared and dy squared added together
  return h; //return the distance
}


//function that takes care of initializing the grid, placing items, and updating the board
function State() {
    final.total_peds_at_start = parseInt(data.max['Child']) + parseInt(data.max['Adult']) + parseInt(data.max['AdultBackpack']) + parseInt(data.max['AdultBike']);
    var num_children_initial = parseInt(data.max['Child']);
    if (!gui.headless) {
	document.getElementById("total_peds_at_start").innerHTML = final.total_peds_at_start;
 
      	var things = pop.types();
	for (i = 0; i < things.length; i++) {
	    var tpe = things[i];
	    document.getElementById("num_" + tpe + "_initial").innerHTML = data.max[tpe];
	}
    }
    this.grid = []; //data structure for grid, initially empty
    this.temp_grid = []; //data structure for the temp griid, used to try placing objects without actually moving them on the actual board
    this.population = []; //population of people on the grid, initially empty
    total_population_over_time = [final.total_peds_at_start]; //make the total population over time start with everyone on the board

    //function thatt initializes the grid, does not need any input
    this.init_grids = function() {
        for (var i = 0; i < data.width_i; i = i + 1) { //go through each index until you get to the width og the board
            this.grid[i] = []; //initialize the grid at that width index to be empty
            this.temp_grid[i] = []; //initialize the temp grid at that width index to be empty
            for (var ii = 0; ii < data.width_ii; ii = ii + 1) { //go through every index until you get to the height of the board
                this.grid[i][ii] = new Cell(i, ii); //at each index of the actual board, initialize an empty cell
                this.temp_grid[i][ii] = new Cell(i, ii); //at each index of the temp board, initialize an empty cell
            }
        }
    }
    
    //function to move people on the board, does not require any input
    this.move_things = function() {
    	//initializations for later
    	var child_dens = 0;
    	var avg_child_dens = 0;
    	var adult_dens = 0;
    	var avg_adult_dens = 0;
    	var backpack_dens = 0;
    	var avg_backpack_dens = 0;
        var bike_dens = 0;
    	var avg_bike_dens = 0;
    	var avg_total_dens = 0;
        //adding in calculation of local density
        //loop through the population and get the coordinates of each pedestrian
        for (var p = this.population.length - 1; p >= 0; p--) {
            var thing = this.population[p][0]
            var open_cells = 49;
            var local_dens = 0;
            var child = 0;
            var adult = 0;
            var backpack = 0;
            var bike = 0;
            var num_to_divide_by = 0;
            var location = this.get_coords_from_orientation(thing);
            //find out the orienation of each pedestrian and set their box based on that
            var orientation = thing.orientation;
            if (orientation == data.UP) {
                box_profile_i = [-3,-2,-1,0,1,2,3];
                box_profile_ii = [0,1,2,3,4,5,6];
                for (var i = 0; i <= box_profile_i.length - 1; i++) {
                    box_position_i = location[0] + box_profile_i[i];
                    for (var ii = 0; ii <= box_profile_ii.length - 1; ii++) {
                        box_position_ii = location[1] + box_profile_ii[ii];
                        var safei = data.get_bounded_index_i(box_position_i);
                        var safeii = data.get_bounded_index_ii(box_position_ii);
                        //count the number of open cells in their box
                        if(this.temp_grid[safei][safeii].has_other_thing(thing)) {
                            open_cells--;
                            thing_type = this.temp_grid[safei][safeii].thing;
                            //get a count for how many cells are taken up by peds of each type
                            //Here we can condense
                            if(thing_type.type == 'Child') {
                                    child++;
                                } else if (thing_type.type == 'Adult') {
                                    adult++;
                                } else if (thing_type.type == 'AdultBackpack') {
                                    backpack++;
                                } else if (thing_type.type == 'AdultBike') {
                                    bike++;
                                }
                            }
                    }
                }
                //sets the number to divide by by adding on a pedestrian for the pedestrian of interest
                var num_to_divide_by = ((child/1)+(adult/2)+(backpack/4)+(bike/14)) + 1;
                //calculate the local density by dividing the number of open cells by the number of pedestrians
                local_dens = (open_cells)/num_to_divide_by;
                // console.log('local_dens up: ' + local_dens);
            } else if (orientation == data.DOWN) {
            	box_profile_i = [-3,-2,-1,0,1,2,3];
                box_profile_ii = [0,-1,-2,-3,-4,-5,-6];
                for (var i = 0; i <= box_profile_i.length - 1; i++) {
                    box_position_i = location[0] + box_profile_i[i];
                    for (var ii = 0; ii <= box_profile_ii.length - 1; ii++) {
                        box_position_ii = location[1] + box_profile_ii[ii];
                        var safei = data.get_bounded_index_i(box_position_i);
                        var safeii = data.get_bounded_index_ii(box_position_ii);
                        //count the number of open cells in their box
                        if(this.temp_grid[safei][safeii].has_other_thing(thing)) {
                            open_cells--;
                            thing_type = this.temp_grid[safei][safeii].thing;
                            //get a count for how many cells are taken up by peds of each type
                            if(thing_type.type == 'Child') {
                                    child++;
                                } else if (thing_type.type == 'Adult') {
                                    adult++;
                                } else if (thing_type.type == 'AdultBackpack') {
                                    backpack++;
                                } else if (thing_type.type == 'AdultBike') {
                                    bike++;
                                }
                            }
                    }
                }
                //sets the number to divide by by adding on a pedestrian for the pedestrian of interest
                var num_to_divide_by = ((child/1)+(adult/2)+(backpack/4)+(bike/14)) + 1;
                //calculate the local density by dividing the number of open cells by the number of pedestrians
                local_dens = (open_cells)/num_to_divide_by;
            	// console.log('local_dens down: ' + local_dens);
            } else if (orientation == data.LEFT) {
            	box_profile_i = [0,-1,-2,-3,-4,-5,-6];
                box_profile_ii = [-3,-2,-1,0,1,2,3];
                for (var i = 0; i <= box_profile_i.length - 1; i++) {
                    box_position_i = location[0] + box_profile_i[i];
                    for (var ii = 0; ii <= box_profile_ii.length - 1; ii++) {
                        box_position_ii = location[1] + box_profile_ii[ii];
                        var safei = data.get_bounded_index_i(box_position_i);
                        var safeii = data.get_bounded_index_ii(box_position_ii);
                        //count the number of open cells in their box
                        if(this.temp_grid[safei][safeii].has_other_thing(thing)) {
                            open_cells--;
                            thing_type = this.temp_grid[safei][safeii].thing;
                            //get a count for how many cells are taken up by peds of each type
                            if(thing_type.type == 'Child') {
                                    child++;
                                } else if (thing_type.type == 'Adult') {
                                    adult++;
                                } else if (thing_type.type == 'AdultBackpack') {
                                    backpack++;
                                } else if (thing_type.type == 'AdultBike') {
                                    bike++;
                                }
                            }
                    }
                }
                //sets the number to divide by by adding on a pedestrian for the pedestrian of interest
                var num_to_divide_by = ((child/1)+(adult/2)+(backpack/4)+(bike/14)) + 1;
                //calculate the local density by dividing the number of open cells by the number of pedestrians
                local_dens = (open_cells)/num_to_divide_by;
                // console.log('local_dens left: ' + local_dens);
            } else if (orientation == data.RIGHT) {
            	box_profile_i = [0,1,2,3,4,5,6];
                box_profile_ii = [-3,-2,-1,0,1,2,3];
                for (var i = 0; i <= box_profile_i.length - 1; i++) {
                    box_position_i = location[0] + box_profile_i[i];
                    for (var ii = 0; ii <= box_profile_ii.length - 1; ii++) {
                        box_position_ii = location[1] + box_profile_ii[ii];
                        var safei = data.get_bounded_index_i(box_position_i);
                        var safeii = data.get_bounded_index_ii(box_position_ii);
                        //count the number of open cells in their box
                        if(this.temp_grid[safei][safeii].has_other_thing(thing)) {
                            open_cells--;
                            thing_type = this.temp_grid[safei][safeii].thing;
                            //get a count for how many cells are taken up by peds of each type
                            if(thing_type.type == 'Child') {
                                    child++;
                                } else if (thing_type.type == 'Adult') {
                                    adult++;
                                } else if (thing_type.type == 'AdultBackpack') {
                                    backpack++;
                                } else if (thing_type.type == 'AdultBike') {
                                    bike++;
                                }
                            }
                    }
                }
                //sets the number to divide by by adding on a pedestrian for the pedestrian of interest
                var num_to_divide_by = ((child/1)+(adult/2)+(backpack/4)+(bike/14)) + 1;
                //calculate the local density by dividing the number of open cells by the number of pedestrians
                local_dens = (open_cells)/num_to_divide_by;
                // console.log('local_dens right: ' + local_dens);
            } else if (orientation == data.diagDownRight) {
                box_profile_i = [0,1,2,3,4,5,6];
                box_profile_ii = [0,-1,-2,-3,-4,-5,-6];
                for (var i = 0; i <= box_profile_i.length - 1; i++) {
                    box_position_i = location[0] + box_profile_i[i];
                    for (var ii = 0; ii <= box_profile_ii.length - 1; ii++) {
                        box_position_ii = location[1] + box_profile_ii[ii];
                        var safei = data.get_bounded_index_i(box_position_i);
                        var safeii = data.get_bounded_index_ii(box_position_ii);
                        //count the number of open cells in their box
                        if(this.temp_grid[safei][safeii].has_other_thing(thing)) {
                            open_cells--;
                            thing_type = this.temp_grid[safei][safeii].thing;
                            //get a count for how many cells are taken up by peds of each type
                            if(thing_type.type == 'Child') {
                                    child++;
                                } else if (thing_type.type == 'Adult') {
                                    adult++;
                                } else if (thing_type.type == 'AdultBackpack') {
                                    backpack++;
                                } else if (thing_type.type == 'AdultBike') {
                                    bike++;
                                }
                            }
                    }
                }
                //sets the number to divide by by adding on a pedestrian for the pedestrian of interest
                var num_to_divide_by = ((child/1)+(adult/2)+(backpack/4)+(bike/14)) + 1;
                //calculate the local density by dividing the number of open cells by the number of pedestrians
                local_dens = (open_cells)/num_to_divide_by;
                // console.log('local_dens diagDownRight: ' + local_dens);
            } else if (orientation == data.diagUpRight) {
                box_profile_i = [0,1,2,3,4,5,6];
                box_profile_ii = [0,1,2,3,4,5,6];
                for (var i = 0; i <= box_profile_i.length - 1; i++) {
                    box_position_i = location[0] + box_profile_i[i];
                    for (var ii = 0; ii <= box_profile_ii.length - 1; ii++) {
                        box_position_ii = location[1] + box_profile_ii[ii];
                        var safei = data.get_bounded_index_i(box_position_i);
                        var safeii = data.get_bounded_index_ii(box_position_ii);
                        //count the number of open cells in their box
                        if(this.temp_grid[safei][safeii].has_other_thing(thing)) {
                            open_cells--;
                            thing_type = this.temp_grid[safei][safeii].thing;
                            //get a count for how many cells are taken up by peds of each type
                            if(thing_type.type == 'Child') {
                                    child++;
                                } else if (thing_type.type == 'Adult') {
                                    adult++;
                                } else if (thing_type.type == 'AdultBackpack') {
                                    backpack++;
                                } else if (thing_type.type == 'AdultBike') {
                                    bike++;
                                }
                            }
                    }
                }
                //sets the number to divide by by adding on a pedestrian for the pedestrian of interest
                var num_to_divide_by = ((child/1)+(adult/2)+(backpack/4)+(bike/14)) + 1;
                //calculate the local density by dividing the number of open cells by the number of pedestrians
                local_dens = (open_cells)/num_to_divide_by;
                // console.log('local_dens diagUpRight: ' + local_dens);
            } else if (orientation == data.diagDownLeft) {
                box_profile_i = [0,-1,-2,-3,-4,-5,-6];
                box_profile_ii = [0,-1,-2,-3,-4,-5,-6];
                for (var i = 0; i <= box_profile_i.length - 1; i++) {
                    box_position_i = location[0] + box_profile_i[i];
                    for (var ii = 0; ii <= box_profile_ii.length - 1; ii++) {
                        box_position_ii = location[1] + box_profile_ii[ii];
                        var safei = data.get_bounded_index_i(box_position_i);
                        var safeii = data.get_bounded_index_ii(box_position_ii);
                        //count the number of open cells in their box
                        if(this.temp_grid[safei][safeii].has_other_thing(thing)) {
                            open_cells--;
                            thing_type = this.temp_grid[safei][safeii].thing;
                            //get a count for how many cells are taken up by peds of each type
                            if(thing_type.type == 'Child') {
                                    child++;
                                } else if (thing_type.type == 'Adult') {
                                    adult++;
                                } else if (thing_type.type == 'AdultBackpack') {
                                    backpack++;
                                } else if (thing_type.type == 'AdultBike') {
                                    bike++;
                                }
                            }
                    }
                }
                //sets the number to divide by by adding on a pedestrian for the pedestrian of interest
                var num_to_divide_by = ((child/1)+(adult/2)+(backpack/4)+(bike/14)) + 1;
                //calculate the local density by dividing the number of open cells by the number of pedestrians
                local_dens = (open_cells)/num_to_divide_by;
                // console.log('local_dens diagDownLeft: ' + local_dens);
            } else {
                box_profile_i = [0,-1,-2,-3,-4,-5,-6];
                box_profile_ii = [0,1,2,3,4,5,6];
                for (var i = 0; i <= box_profile_i.length - 1; i++) {
                    box_position_i = location[0] + box_profile_i[i];
                    for (var ii = 0; ii <= box_profile_ii.length - 1; ii++) {
                        box_position_ii = location[1] + box_profile_ii[ii];
                        var safei = data.get_bounded_index_i(box_position_i);
                        var safeii = data.get_bounded_index_ii(box_position_ii);
                        //count the number of open cells in their box
                        if(this.temp_grid[safei][safeii].has_other_thing(thing)) {
                            open_cells--;
                            thing_type = this.temp_grid[safei][safeii].thing;
                            //get a count for how many cells are taken up by peds of each type
                            if(thing_type.type == 'Child') {
                                    child++;
                                } else if (thing_type.type == 'Adult') {
                                    adult++;
                                } else if (thing_type.type == 'AdultBackpack') {
                                    backpack++;
                                } else if (thing_type.type == 'AdultBike') {
                                    bike++;
                                }
                            }
                    }
                }
                //sets the number to divide by by adding on a pedestrian for the pedestrian of interest
                var num_to_divide_by = ((child/1)+(adult/2)+(backpack/4)+(bike/14)) + 1;
                //calculate the local density by dividing the number of open cells by the number of pedestrians
                local_dens = (open_cells)/num_to_divide_by;
                // console.log('local_dens diagUpLeft: ' + local_dens);
            }
            //adds to the list of the individual's local density at each time step
            thing.local_density.push(local_dens)
            // console.log(thing.local_density);
            //adds together the density of each ped type at a given time step
            if(thing.type == 'Child') {
            	child_dens = child_dens + local_dens;
            	// console.log('child_dens: ' + child_dens)
            } else if (thing.type == 'Adult') {
            	adult_dens = adult_dens + local_dens;
            	// console.log('adult_dens: ' + adult_dens)
            } else if (thing.type == 'AdultBackpack') {
            	backpack_dens = backpack_dens + local_dens;
            	// console.log('backpack_dens: ' + backpack_dens)
            } else if (thing.type == 'AdultBike') {
            	bike_dens = bike_dens + local_dens;
            	// console.log('bike_dens: ' + bike_dens)
            }
        }
        //calculates the average density across each ped type at a given time step
        avg_child_dens = child_dens/data.current['Child'];
        avg_child_dens_list.push(avg_child_dens);
        // console.log('average child density list: ' + avg_child_dens_list);
        avg_adult_dens = adult_dens/data.current['Adult'];
        avg_adult_dens_list.push(avg_adult_dens);
        // console.log('average adult density list: ' + avg_adult_dens_list);
        avg_backpack_dens = backpack_dens/data.current['AdultBackpack'];
        avg_backpack_dens_list.push(avg_backpack_dens);
        // console.log('average backpack density list: ' + avg_backpack_dens_list);
        avg_bike_dens = bike_dens/data.current['AdultBike'];
        avg_bike_dens_list.push(avg_bike_dens);
        // console.log('average bike density list: ' + avg_bike_dens_list);
        avg_total_dens = (child_dens + adult_dens + backpack_dens + bike_dens)/(data.current['Child']+data.current['Adult']+data.current['AdultBackpack']+data.current['AdultBike']);
        avg_total_dens_list.push(avg_total_dens);
        // console.log(avg_total_dens_list);

        // move everyone at TOP level of abstraction
        // assume: population knows loc AND temp_grid is properly set.
        for (var p = this.population.length - 1; p >= 0; p--) { //go through everyone in the population
            var thing = this.population[p][0]; //set thing to the person
            var object_type = this.population[p][1]; //get what type of person (child, adult...)
            thing.exittime++; //always add one to exit time
            //call move thing function, moves things on the temp grid
            if (this.move_thing(thing)) { //returns true if at an exit, false if not, temp grid is updated
                this.population.splice(p, 1);
                final.current_population = this.population.length; //number of people in the grid
                if (!gui.headless) { document.getElementById("current_total").innerHTML = final.current_population; }
                total_population_over_time.push(final.current_population); //add the current population to the list of all previous populations (each update)
                final.sum_of_exit_times += thing.exittime; //add its exit time to the total exit times
                final.sum_wait_steps += thing.waitsteps; //add its total waittime to the total waitime

		// TODO: THESE CAN BE GREATLY SIMPLIFIED...
                data.current[object_type] -= 1; //subtract one from type's population
                if (!gui.headless) { document.getElementById("current_" + object_type).innerHTML = data.current[object_type]; }

                //add to sum of everyones exit times
                final.exit_times[object_type] += thing.exittime; //add its exit time to the total children exit times
                final.wait_steps[object_type] += thing.waitsteps; //add its wait time to the total children wait times

                //check if last child
                if(data.current[object_type] == 0) {
                    var total_time = thing.exittime; //in board update units
                    if (!gui.headless) { document.getElementById("total_" + object_type + "_exit").innerHTML = total_time; }
                    var total_wait_steps = thing.waitsteps; //set the total amount of wait steps for children
                    if (!gui.headless) { document.getElementById("total_" + object_type + "_wait").innerHTML = total_wait_steps; }
                }

                if (final.current_population == 0) { //if no people left on the grid
                //not sure if we need to set these to zero, should all be zero???
      		    var things = pop.types();

		    end_simulation(); 

		    for (i = 0; i < things.length; i++) {
			var tpe = things[i];
			data.current[tpe] = 0; //set everyone's population to zero
			console.log("collisions:" +final.collisions_average[tpe]);
			final.collisions_average[tpe] = final.collisions_total[tpe]/data.max[tpe];
			if (!gui.headless) { 
			    document.getElementById("total_" + tpe + "_collide").innerHTML = final.collisions_total[tpe];
			    document.getElementById("avg_" + tpe + "_collide").innerHTML = final.collisions_average[tpe];
			}

			var avg_exit = final.exit_times[tpe] / data.max[tpe]; //in board update units
			if (!gui.headless) {
			    document.getElementById("avg_exit_" + tpe).innerHTML = avg_exit;
			}

			var avg_wait_steps = final.wait_steps[tpe] / data.max[tpe]; //average wait time for ped
			if (!gui.headless) {
			    document.getElementById("avg_wait_steps_" + tpe).innerHTML = avg_wait_steps;
			}
		    }

                    avg_collide_total = final.total_collisions/final.total_peds_at_start;

                    if (!gui.headless) { 
                      document.getElementById("avg_collide").innerHTML = final.avg_collisions_total;  // TODO: doesn't change ever?
                      document.getElementById("collide").innerHTML = final.total_collisions;
		    }

                    var total_exit_time = thing.exittime; //total exit time in board updates [ CHECK THIS SEEMS WRONG]

                    var avg_exit_time = (final.sum_of_exit_times) / final.total_peds_at_start; //in board update units


                    if (!gui.headless) { 
                      document.getElementById("total_exit_time").innerHTML = total_exit_time;
                      document.getElementById("avg_exit_time").innerHTML = avg_exit_time;
                    }

                    var total_wait_steps = thing.waitsteps; //set the total number of waitsteps for everyoone
                    var avg_wait_steps = final.sum_wait_steps/final.total_peds_at_start; //average amount of waitsteps per person

                    if (!gui.headless) {
                      document.getElementById("total_wait_steps").innerHTML = total_wait_steps;
                      document.getElementById("avg_wait_steps").innerHTML = avg_wait_steps;
                    }
                    // console.log("total collisions: " + total_collisions)
                    // console.log("total peds at start: " + total_peds_at_start)
                    // console.log("average collisions total: " + avg_collisions_total)                    
                    // console.log("total child collisions: " + total_child_collisions)
                    // console.log("average child: " + avg_child_collisions)
                    // console.log("total adult collisions: " + total_adult_collisions)
                    // console.log("average adult: " + avg_adult_collisions)
                    // console.log("total backpack collisions: " + total_backpack_collisions)
                    // console.log("average backpack: " + avg_backpack_collisions)
                    // console.log("total bike collisions: " + total_bike_collisions)
                    // console.log("average bike: " + avg_bike_collisions)
                    
                    //make the bar graphs here
                    graph.createBarGraph();

                }  
                // console.log("current_population: " + current_population)
                // console.log(total_population_over_time)
                // console.log("current_num_children: " + current_num_children)
                // console.log("current_num_adult: " + current_num_adult)
                // console.log("current_num_backpack: " + current_num_backpack)
                // console.log("current_num_bike: " + current_num_bike)
            }
            // else if (thing == Adult) {
            //            current_num_adult = current_num_adult-1;
            // }
            // else if (thing == AdultBackpack) {
            //            current_num_backpack = current_num_backpack-1;
            // }
            // else if (thing == AdultBike) {
            //            current_num_bike = current_num_bike-1;
            // }
        }

        // NEED THIS. This copies the footprint for drawing
        //got through every cell on the grid
        for (var i = 0; i < data.width_i; i = i + 1) { 
            for (var ii = 0; ii < data.width_ii; ii = ii + 1) {
                // adjust reference
                this.grid[i][ii].thing = this.temp_grid[i][ii].thing; //copy over the temp grid the the grid
            }
        }
    }

    //Currently not used !!
    function removeItemOnce(arr, value) {
        var index = arr.indexOf(value);
        if (index > -1) {
            arr.splice(index, 1);
        }
    }

    /** If return false then failed in some way. Otherwise return true. */
    this.place_things = function() {
        //added this in as part of exit distances
        
        //here will initialize a lecture hall
        // 30 rows, after 15th 2 row spaces for ppl
        //20 columns, 3 column spaces for ppl after 10
        //26x68
        //exits at (0,0) (0,44) (68,0) (68,44)
        //x values are columns
        //y values are rows

        if (data.hall_layout == true) {


        }

        //setting up the default drawing for fuller lower lecture hall
        else if (data.fuller_lower == true) {
            // console.log(data.exit_locations)
        } else if (data.classroom == true) {
	    // classroom
	}
        else {
            // INSERT SQUARE
            // -------------
            //            for (var n = 10; n <= 50; n++) {
            //                this.temp_grid[n][10].thing = new Obstacle(n,10);
            //                this.temp_grid[10][n].thing = new Obstacle(10,n);
            //
            //                this.temp_grid[n][50].thing = new Obstacle(n,50);
            //                this.temp_grid[50][n].thing = new Obstacle(50,n);       
            //            }

        }
	

	// all exits have been generated
        var num_children = 0;


	// iterate over ALL types and see how many are needed of each type
	var things = pop.types();
	for (i = 0; i < things.length; i++) {
	    var tpe = things[i];

	    var num_thing = 0;
            var times_not_placed = 0;
            while (num_thing < data.max[tpe]) {
		// not sure what is a good number, have it at 1000 right now, changed to area
		if (times_not_placed > (data.width_i*data.width_ii)) { 
		    console.log("Cannot place this many " + tpe + " on the grid, please reset and choose another number");
		    return false;
		}

		// ensure stays fully on the board.
		var dd = pop.dimension(tpe);
		//this was changed
		var j = get_random_int(dd[0], data.width_i - dd[1]);
		var jj = get_random_int(dd[2], data.width_ii - dd[3]);
		
		var exit_information = layout.get_exit_information(board, j, jj);
		
		// construct the actual thing using the factory in pop
		var obj = pop.factory(tpe, j, jj);
		
		obj.min_exiti  = exit_information[0];
		obj.min_exitii = exit_information[1];
		obj.endi       = exit_information[2];
		obj.endii      = exit_information[3];
		obj.goali      = exit_information[4];
		obj.goalii     = exit_information[5];
		
		var obstacle = 0;
		for (var p = 0; p < obj.profile_i.length; p++) { //
                    var dj = obj.profile_i[p];
                    var djj = obj.profile_ii[p];
                    var safej = data.get_bounded_index_i(j + dj);
                    var safejj = data.get_bounded_index_ii(jj + djj);
                    if (this.temp_grid[safej][safejj].has_other_thing(obj)) { //should be somewhere
			obstacle++;                       //do not place
                    }
		}
		if (obstacle == 0) {//if can place
                    for (var p = 0; p < obj.profile_i.length; p++) { //
			var dj = obj.profile_i[p];
			var djj = obj.profile_ii[p];
			var safej = data.get_bounded_index_i(j + dj);
			var safejj = data.get_bounded_index_ii(jj + djj);
			this.temp_grid[safej][safejj].thing = obj;
                    }
		    
                    this.population.push([obj, tpe]);
                    num_thing++;
                    times_not_placed = 0;
		}
		else{
		    times_not_placed++;
		}
	    }
	}

	return true;
    }

  this.get_coords_from_orientation = function(thing) {
    var i = thing.anchor_i;
    var ii = thing.anchor_ii;

    var orient = thing.orientation;
    if (orient == data.UP) {
        return [i, data.get_bounded_index_ii(ii - 1)];
    } else if (orient == data.DOWN) {
        return [i, data.get_bounded_index_ii(ii + 1)];
    } else if (orient == data.LEFT) {
        return [data.get_bounded_index_i(i - 1), ii];
    } else if (orient == data.RIGHT) {
        return [data.get_bounded_index_i(i + 1), ii];
    } else if (orient == data.diagDownRight) {
        return [data.get_bounded_index_i(i + 1), data.get_bounded_index_ii(ii + 1)]
    } else if (orient == data.diagUpRight) {
        return [data.get_bounded_index_i(i + 1), data.get_bounded_index_ii(ii - 1)]
    } else if (orient == data.diagDownLeft) {
        return [data.get_bounded_index_i(i - 1), data.get_bounded_index_ii(ii + 1)]
    } else {
        return [data.get_bounded_index_i(i - 1), data.get_bounded_index_ii(ii - 1)]
    }
}

    //function takes in a person, updates the temp grid
    this.move_thing = function(thing) { //returns true if person is at exit, false otherwise
	var heuristic = manhattand;  // default to manhattan
	if (euclidean) {
	    heuristic = euclideand;
	} else if (diagonal) {
	    heuristic = diagonald;
	}
        var node = astar.AStar(state, thing, 0, heuristic); //using AStar algorithm to get the best move
        if (node == null) { //if no move found from initial AStar call
            node = astar.AStar(state, thing, 1, heuristic); // try to avoid others and break out of deadlock
            if (node == null) { //if a person still cannot move
                thing.stuck = 1; //add one to its stuck value
                return false; //return false, not at an exit
            }
        }
        var new_coords = node.initial_step(); //get the next move from the minheap
        var exiti = thing.min_exiti; //get the first x value of the exit cell
        var exitii = thing.min_exitii; //get the first y value of the exit cell

        // hack to fix
        var count = 0; //counter used to check if at an exit
        for (index = 0; index < node.profile_i.length; index++) { //go through every cell of the person
            //check if at exit
            //checking by making sure the next move is between or touching the exit
            if ((new_coords[0] + node.profile_i[index]) >= node.exiti && (new_coords[0] + node.profile_i[index]) <= node.endi &&
                (new_coords[1] + node.profile_ii[index]) >= node.exitii && (new_coords[1] + node.profile_ii[index]) <= node.endii) {
                count++; //if at exit, add one to the count
                }
        }
        if (count > 0) { //if the count is greater that zeero, some part is touching the exit
            thing.remove_footprint(this); //remove object if any part of the object is touching the exit
            return true; // remove, return true
        }
        //now make sure that you can move to the place you want to
        else {
            var j = new_coords[0]; //x value of the move you want to make
            var jj = new_coords[1]; //y value of the move you want to make
            var orientation = new_coords[2]; // direction to aim
            
            //collision handling
            // handles collisions by doing NOTHING. If spot that you are
            // trying to move to DOESN'T HAVE a thing then you are free to
            // move, but you have to check profile. -- i think we changed this
            try { //I do not know what a try is -- ASK
                var next = this.temp_grid[j][jj]; //get what is in the spot of the cell trying to move to
                if (typeof next === 'undefined') {} //is this a sanity check?
                else {
                    if (!next.has_other_thing(thing)) { //if there is nothing in the cell trying to move to
                        // maybe could have break if collides so doesn't
                        // have to keep going through loop. need to check
                        // all of the cells of the thing
                        var collision = 0; //counter for the number of collisions, a person trying to access a spot that anoother one is in
                        for (var x = 0; x < thing.profile_i.length; x++) { //go through all cells of the person
                            //getting the new cell location according to orientation
                            var new_deltas = data.get_coords_from_orientation_neighbors(thing, x, orientation); 
                            var r = new_deltas[0]; //x value of the new move
                            var c = new_deltas[1]; //y value of the new move
                            var safe_r = data.get_bounded_index_i(r + thing.anchor_i); //bound the x value, making sure on the board
                            var safe_c = data.get_bounded_index_ii(c + thing.anchor_ii); //bound the y value, making sure on the board
                            if (this.temp_grid[safe_r][safe_c].has_other_thing(thing)) { //if something already in the cell
                                collision = collision + 1; //add one to collision counter
                                final.total_collisions = final.total_collisions + 1; //add one to the global collision counter

                                //adding collision counter to specific person types
				final.collisions_total[thing.type] += 1;

                                break; //since we found a collision on part of the person, break for loop
                            }
                        }
                    }
                    //now check if you can actually move the person
                    if (collision == 0) { //if no collision for any cells then can move whole piece
                        // where thing is RIGHT NOW
                        var i = thing.anchor_i; //x coordinate of the person
                        var ii = thing.anchor_ii; //y coordinate of the person
                        // clear old one
                        thing.remove_footprint(this); //remove the person from its current position
                        thing.anchor_i = j; //update the anchor x coordinate for the move to make
                        thing.anchor_ii = jj; //update the anchor y coordinate for the move to make
                        
                        // move into new one
                        thing.wait = 0; //reset its wait since making a move
                        thing.place_footprint(this); //update the person's position on the temp grid
                    }
                    else { //if there is a collision
                      
                      thing.wait++; //add one to its wait
                      thing.waitsteps++; //add one to its total waits
                      //find another exit to go to
                      //if the time waiting is greater than wait time but less than that double the wait time
                      //try to move randomly and then find a path
                      //if the time waiting is more than double the wait time, find another exit
			if(thing.wait>data.wait_before_random_move*2){
                        var ran_exit_index = Math.floor(Math.random() * data.max['Exit']); //get a random index to choose the exit
                        var new_exit = board.exit_locations[ran_exit_index]; //get the exit from the list of exits
                        thing.min_exiti = new_exit.anchor_i; //update the person's exit x value 
                        thing.min_exitii = new_exit.anchor_ii; //update the person's exit y value 
                        thing.endi = new_exit.profile_i[3] + new_exit.anchor_i; //update the person's last exit x cell
                        thing.endii = new_exit.profile_ii[3] + new_exit.anchor_ii; //update the person's last exit y cell
                        var ranx = get_random_int(0,3); //get random number 0-3 for the goal cell of the exit x value
                        var rany = get_random_int(0,3); //get random number 0-3 for the goal cell of the exit y value
                        thing.goali = new_exit.profile_i[ranx] + new_exit.anchor_i; //update the new goal exit x coordinate
                        thing.goalii = new_exit.profile_ii[rany]+ new_exit.anchor_ii; //update the new goal exit y coordinatee
                        //change the exit and recurrsively call the function
                        thing.wait = 0; //reset the wait time, not totally convinced that this should be here
                        this.move_thing(thing); //try to move the person now with the updated exit
                      }
                          //if the numnber of times waited is greater than the time to wait before making a randome move
                          //try to move in any other direction other than the one you are trying to go to
                          //wait_before_random_move can be changed by user input
                          else if(thing.wait>data.wait_before_random_move){ 
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
                                if (this.temp_grid[safe_r][safe_c].has_other_thing(thing)){ //if something in the cell trying ti move into
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
                              thing.remove_footprint(this); // remove the person from its current position on grid
                              thing.orientation = orientation; //update the person's orientation
                              next_coords = this.get_coords_from_orientation(thing); //get these new coordinates to move to
                              thing.anchor_i = next_coords[0]; //update the anchor x coordinate to its new position
                              thing.anchor_ii = next_coords[1]; //update the anchor y coordinate to its new position
                              thing.place_footprint(this); //place the person in the temp grid in its new position
                          }
                      }
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
function get_state() {
  return state;
}

function draw_grid(input) {
    if (parseInt(data.width_i) > parseInt(data.width_ii)) {
        var width = 600;
        var height = 600 * (data.width_ii / data.width_i);
    } else {
        var width = 600 * (data.width_i / data.width_ii);
        var height = 600;
    }

    var width_cell = width / data.width_i;
    var height_cell = height / data.width_ii;

    var canvas = document.getElementById("grid")

    // create the canvas the very first time this method is invoked...
    if (canvas == null) {
        canvas = document.createElement('canvas');
        canvas.id = "grid";
        canvas.width = width;
        canvas.height = height;
        document.getElementsByTagName('body')[0].appendChild(canvas); //not sure what this is doing
    }

    var context = canvas.getContext("2d");

    function draw_cells() {
        for (var i = 0; i < data.width_i; i++) {
            for (var ii = 0; ii < data.width_ii; ii++) {
                // only redraw when there is a change. Nice optimization
                if (data._data && data._data[i][ii] === color_for_cell(input[i][ii])) {
                    continue;
                }
                context.clearRect(i * width_cell, ii * height_cell, width_cell, height_cell);
                context.fillStyle = color_for_cell(input[i][ii]);
                context.fillRect(i * width_cell, ii * height_cell, width_cell, height_cell);
            }
        }
    }

    draw_cells();
    // remember _data as prior rendering
    if (!data._data) {
        data._data = [];
    }
    for (var i = 0; i < data.width_i; i++) {
        data._data[i] = [];
        for (var ii = 0; ii < data.width_ii; ii++) {
            data._data[i][ii] = color_for_cell(input[i][ii]);
        }
    }
}


// =====================================================
// Stateless methods, that do not need state to operate
// ======================================================

// interesting improvements
var color_for_cell = function(cell) {
    if (cell.has_thing()) {
        return cell.get_thing().color();
    }

    return "rgb(250,250,250)";
}

function Cell(i, ii) {
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
	if (this.thing == null) { return false; }

        if (this.tpe == 'Obstacle') {
            return true;
        } else {
            return false;
        }
    }

    this.has_other_thing = function(other) {
        if (this.thing == null) {
            return false;
        }
        if (this.thing == other) {
            return false;
        }

        // has SOME other thing...
        return true;
    }

}


// ==============================================================================
// MAIN to kick things off
// ==============================================================================

var interval_id = 0;

function initialize_simulation() {
    if (interval_id) {
        clearInterval(interval_id);
        clearInterval(interval_id2);
    }
    
    /**
     * 1. Construct layout first to determine boundaries
     * 2. Once boundaries are set, create state to use layout for all dimensions
     * 3. Once state is constructed, then can initialize properly using temp_grid
     */
    board = layout.factory(data.layout, data.width_i, data.width_ii)
    data.width_i = board.width_i;
    data.width_ii = board.width_ii;
    state = new State();
    state.init_grids();

    board.initialize(state.temp_grid);

    // TODO: Messy when user selects width_i, width_ii but also selects a layout type

    // state.draw_border();
    state.place_things(false);  // drop arg eventually.

    if (!gui.headless) { 
      draw_grid(state.grid.map(function(row) {
        return row.map(function(cell) {
            return cell;
        });
      }));
    }
}
var end_sim_counter = 0;
function end_simulation() {
    end_sim_counter = end_sim_counter + 1;
    clearInterval(interval_id);
    clearInterval(interval_id2);
    if (typeof callback_done !== 'undefined') {
       callback_done();
    }
    for (i = 0; i <= avg_total_dens_list.length - 1; i++) {
    	dens_sum = dens_sum + avg_total_dens_list[i];
    }
    total_avg_dens_all_time = dens_sum/avg_total_dens_list.length;
    console.log('total average density of all time: ' + total_avg_dens_all_time)
}

function clear_simulation() {
    if (!gui.headless) { window.location.reload() }
}

function start_simulation(max_gen, callback) {
    data._data = undefined; // clear everything to clean up after 1st run

    if (typeof max_gen === 'undefined') {
      max_generation = Number.MAX_SAFE_INTEGER;
    } else {
      max_generation = max_gen;
    }

    if (typeof callback !== 'undefined') {
      callback_done = callback;
    }

    initialize_simulation();
    interval_id = setInterval(simulate_and_visualize, data.ms_between_updates);
    interval_id2 = setInterval(graph.simulate, data.ms_between_updates); //think these two values should be the same
    ///this is testing out voronoi stuff
    console.log('before the call to voronoi')
    function randgp(max) {return Math.floor(Math.random()*max)}
// HF#2 Random hex color
function randhclr() {
  return "#"+
  ("00"+randgp(256).toString(16)).slice(-2)+
  ("00"+randgp(256).toString(16)).slice(-2)+
  ("00"+randgp(256).toString(16)).slice(-2)
}
// HF#3 Metrics: Euclidean, Manhattan and Minkovski 3/20/17
var D = 1;
var D2 = Math.sqrt(2);
console.log('inside the call to voronoi')
var heuristic = manhattand;  // default to manhattan
	if (euclidean) {
	    heuristic = euclideand;
	} else if (diagonal) {
	    heuristic = diagonald;
	}
console.log(heuristic)
function Metric(x,y,heuristic) {
var dx = Math.abs(x);
var dy = Math.abs(y);
console.log('inside metric function')
  if(heuristic=='euclideand') {
  	console.log('the heuristic is euclidean')
  	return Math.sqrt(x*x + y*y)}
  if(heuristic=='manhattand') {
  	console.log('the heuristic is manhattan')
  	return Math.abs(x) + Math.abs(y)}
  // if(mt==3) {return(Math.pow(Math.pow(Math.abs(x),3) + Math.pow(Math.abs(y),3),0.33333))}
  if(heuristic=diagonald) {
  	console.log('the heuristic is diagonal')
  	return (D * (dx + dy) + (D2 - 2 * D) * Math.min(dx, dy))}
}
// Plotting Voronoi diagram. aev 3/10/17
function pVoronoiD() {
  var cvs=document.getElementById("cvsId");
  var ctx=cvs.getContext("2d");
  var w=cvs.width, h=cvs.height;
  var x=y=d=dm=j=0, w1=w-2, h1=h-2;
  var n=data.max['Exit'];
  // document.getElementById("sites").value; //would be num exits for us
  var heuristic=heuristic
  // document.getElementById("mt").value; //would be heuristic checkbox for us
  var X=new Array(n), Y=new Array(n), C=new Array(n);
  ctx.fillStyle="white"; ctx.fillRect(0,0,w,h);
  for(var i=0; i<n; i++) {
    X[i]=randgp(w1); Y[i]=randgp(h1); C[i]=randhclr();
  }
  for(y=0; y<h1; y++) {
    for(x=0; x<w1; x++) {
      dm=Metric(h1,w1,heuristic); j=-1;
      for(var i=0; i<n; i++) {
        d=Metric(X[i]-x,Y[i]-y,heuristic)
        if(d<dm) {dm=d; j=i;}
      }//fend i
      ctx.fillStyle=C[j]; ctx.fillRect(x,y,1,1);
    }//fend x
  }//fend y
  ctx.fillStyle="black";
  for(var i=0; i<n; i++) {
    ctx.fillRect(X[i],Y[i],3,3);
  }
}
/////
}

take_snapshot_calls = 0;
    function simulate_and_visualize() {
      number_generations += 1;
      console.log("gen:" + number_generations);
      if (number_generations >= max_generation) {
         end_simulation();
         return;
      }

    state.move_things();
    if (!gui.headless) { draw_grid(state.grid.map(function(row) {
        return row.map(function(cell) {
            return cell;
        });
    }));
    }

    if (data.take_snapshot) {
        var canvas = document.getElementById('grid');
        var context = canvas.getContext('2d');
        var encoder = new GIFEncoder();
        encoder.setRepeat(0); //0  -> loop forever
                        //1+ -> loop n times then stop
        encoder.setDelay(1); //go to next frame every n milliseconds
        encoder.start();
        encoder.addFrame(context)
        encoder.finish();
        encoder.download("download.gif","image/gif");
        }

    }

    // export JUST what we want to
    final.start_simulation = start_simulation;
    final.end_simulation = end_simulation;
    final.clear_simulation = clear_simulation;

    // make sure we keep reference so it can be retrieved AFTER simulation is over.
    final.get_state = get_state;

})(typeof final === 'undefined'?
            this['final']={}: final);

