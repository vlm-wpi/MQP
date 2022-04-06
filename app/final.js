/**
  * Final Application
*
  * Refactor out the alorithm used for each individual entity.
*/
  (function(final) {
    
    
    //// -----------------------------------------------------
      
      var things = pop.types(); //each type of a person
      final.didAnythingChange = false; //true if people moved during a board update, false if not
      final.deadlock = false;
      var stuckCount = 0;
      MAXCOUNT = 10; //change
      stuck_threshold = 3; //can change
      final.stuck = false;
      //initializations for average area occupancy lists
      var avg_occ_list = {};
      var population_types = pop.types();
      for (i=0; i<population_types.length; i++){
        avg_occ_list[population_types[i]] = [];
      }
      final.all_visited = [];
      final.avg_total_occ_list = [];
      final.total_avg_occ_all_time = 0;
      final.occ_sum = 0;
      var vor_count = 0;
      final.vor_exits_i = [];
      final.vor_exits_ii = [];
      final.evaluation_metric = 0;
      final.total_visited_i = [];
      final.total_visited_ii = [];
      var max_visits = 0;
      final.last_coords = [];
      final.final_occ = {};
      final.total_eval = 0;
      final.all_paths_i_taken = [];
      final.all_paths_ii_taken = [];
      final.overall_exit_time = 0;
      
      for (i=0; i<things.length; i++){
        final.final_occ[things[i]] = 0;
      }
      final.average_occupancy = {};
      
      final.eval_path = {}
      for (i=0; i<population_types.length; i++){
        final.eval_path[population_types[i]] = [];
      }
      final.total_eval_path = [];
      
      final.exit_times_array = {};
      for (i=0; i<population_types.length; i++){
        final.exit_times_array[population_types[i]] = [];
      }
      final.exit_times_total_array = [];
      //collision array used for standard deviation
      final.collision_list = {};
      for (i=0; i<population_types.length; i++){
        final.collision_list[population_types[i]] = [];
      }
      
      //initializing the lists of paths for different types
      final.path_i_taken = {};
      for (i=0; i<population_types.length; i++){
        final.path_i_taken[population_types[i]] = [];
      }
      final.path_ii_taken = {};
      for (i=0; i<population_types.length; i++){
        final.path_ii_taken[population_types[i]] = [];
      }
      
      // TODO: this can be driven by GUI considerations BUT ALSO in nodeApp
      // conflict resolution strategy
      // console.log("threshold1:"+data.threshold["threshold1"]);
      //  final.resolution_strategy1 = conflict.factory(data.resolve1, data.threshold["threshold1"]);
      //  final.resolution_strategy2 = conflict.factory(data.resolve2, data.threshold["threshold2"]);
      //  final.resolution_strategy3 = conflict.factory(data.resolve3, data.threshold["threshold3"]);
      //  final.resolution_strategy4 = conflict.factory(data.resolve4, data.threshold["threshold4"]);
      //conflict.factory('ChooseDifferentExit', data.wait_before_random_exit);
      //conflict.factory('NullConflictStrategy', 0);
      
      // the selected board to use for layout
      final.board = undefined;
      
      //string to save initial layout
      final.initial_path_layout = 'not working';
      
      //Collision counters
      final.collisions_total = {};
      //initialize each value to zero
      for (i=0; i<things.length; i++){
        final.collisions_total[things[i]] = 0;
      }
      final.collisions_average = {};
      
      //exit counters, not sure if have to initialize
      final.exit_total = {};
      final.exit_average = {};
      
      final.total_collisions = 0; //counter for the number of collisions for people, in total
      final.avg_collisions_total = 0; //counter for the number of collisions for people, as an average
      
      //Exit time counters (in units of board updates)
      final.total_exit_time = 0; //counter for total exit time (taken to be the max exit time; exit time of last ped to leave the board)
      final.avg_exit_time = 0; //counter for average exit time of all peds
      
      final.sum_of_exit_times = 0; //counter for the exit times of everyone, added together 
      final.sum_wait_steps = 0; //number of times everyone has waited, all added together
      
      final.exit_times = {};
      for (i=0; i<things.length; i++){
        final.exit_times[things[i]] = 0;
      }
      final.wait_steps = {};
      for (i=0; i<things.length; i++){
        final.wait_steps[things[i]] = 0;
      }
      var total_wait_steps;
      
      //counter for the number of people currently on the board
      //think could be data.current_population
      final.current_population = data.total_peds_at_start;
      
      // number of generations, run up to max_generation
      var number_generations = 0;
      var max_generation = Number.MAX_SAFE_INTEGER;
      
      // callback hook once done.
      var callback_done = undefined;
      
      
      
      
      //function that takes care of initializing the grid, placing items, and updating the board
      function State() {
        
        this.grid = []; //data structure for grid, initially empty
        this.temp_grid = []; //data structure for the temp griid, used to try placing objects without actually moving them on the actual board
        this.population = []; //population of people on the grid, initially empty
        total_population_over_time = [data.total_peds_at_start]; //make the total population over time start with everyone on the board
        
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
          var occ = {};
          var things = pop.types(); //each type of a person
          for(i=0; i<things.length; i++){
            occ[things[i]] = 0;
          }
          var avg_occ = {};
          var avg_total_occ = 0;
          //adding in calculation of average area occupancy
          //loop through the population and get the coordinates of each pedestrian
          //I think this can be condensed
          for (var p = this.population.length - 1; p >= 0; p--) {
            var thing = this.population[p][0]
            var open_cells = 49;
            var local_occ = 0;
            var type_counter = {};
            var things = pop.types();
            for (i=0; i<things.length; i++){
              var tpe = things[i];
              type_counter[tpe] = 0; //initializing so we can add to them
            }
            var num_to_divide_by = 0;
            var location = data.get_coords_from_orientation(thing);
            // console.log('location: ' + location)
            //find out the orienation of each pedestrian and set their box based on that
            var orientation = thing.orientation;
            if (orientation == data.UP) {
              box_profile_i = [-3,-2,-1,0,1,2,3];
              box_profile_ii = [0,1,2,3,4,5,6];
            } else if (orientation == data.DOWN) {
              box_profile_i = [-3,-2,-1,0,1,2,3];
              box_profile_ii = [0,-1,-2,-3,-4,-5,-6];
            } else if (orientation == data.LEFT) {
              box_profile_i = [0,-1,-2,-3,-4,-5,-6];
              box_profile_ii = [-3,-2,-1,0,1,2,3];
            } else if (orientation == data.RIGHT) {
              box_profile_i = [0,1,2,3,4,5,6];
              box_profile_ii = [-3,-2,-1,0,1,2,3];
            } else if (orientation == data.diagDownRight) {
              box_profile_i = [0,1,2,3,4,5,6];
              box_profile_ii = [0,-1,-2,-3,-4,-5,-6];
            } else if (orientation == data.diagUpRight) {
              box_profile_i = [0,1,2,3,4,5,6];
              box_profile_ii = [0,1,2,3,4,5,6];
            } else if (orientation == data.diagDownLeft) {
              box_profile_i = [0,-1,-2,-3,-4,-5,-6];
              box_profile_ii = [0,-1,-2,-3,-4,-5,-6];
            } else {
              box_profile_i = [0,-1,-2,-3,-4,-5,-6];
              box_profile_ii = [0,1,2,3,4,5,6];
            }
            for (var i = 0; i <= box_profile_i.length - 1; i++) {
              box_position_i = location[0] + box_profile_i[i];
              for (var ii = 0; ii <= box_profile_ii.length - 1; ii++) {
                box_position_ii = location[1] + box_profile_ii[ii];
                var safei = data.get_bounded_index_i(box_position_i);
                var safeii = data.get_bounded_index_ii(box_position_ii);
                //count the number of open cells in their box
                if(this.temp_grid[safei][safeii].thing != null) {
                  open_cells--;
                  thing_type = this.temp_grid[safei][safeii].thing;
                  //get a count for how many cells are taken up by peds of each type
                  //Here we can condense
                  //since type might be obstacle, need to go through the pop types
                  var type = thing_type.type;
                  var types = pop.types();
                  for(k=0; k<types.length; k++){
                    if (type == types[k]){
                      type_counter[type]+=1; //add one to the counter for the type of person
                    }
                  }
                  
                }
              }
            }
            //sets the number to divide by by adding on a pedestrian for the pedestrian of interest
            var num_to_divide_by = 0;
            for (i=0; i<things.length; i++){
              var person = pop.factory(things[i],0,0); //make a new person to get its profile length
              var profile = person.profile_i;
              var weight_by_type = type_counter[things[i]]/profile.length;
              num_to_divide_by+=weight_by_type;
            }
            num_to_divide_by += 1; //add one after everything has been calculated
            //calculate the average area occupancy by dividing the number of open cells by the number of pedestrians
            local_occ = (open_cells)/num_to_divide_by;
            //adds to the list of the individual's average area occupancy at each time step
            thing.local_occupancy.push(local_occ);

            //adds together the average area occupancy of each ped type at a given time step
            occ[thing.type]+= local_occ;
        }
        //calculates the average area occupancy across each ped type at a given time step
        for (i=0; i<things.length; i++){
          if(data.current[things[i]] != 0){
              avg_occ[things[i]] = occ[things[i]]/data.current[things[i]];
          avg_occ_list[things[i]].push(avg_occ[things[i]]); //pushing to a specific list in a list?
      }
  }
        //got through every type in the total occupancy list and add to together
        var total_occ = 0
        for (i=0; i<things.length; i++){
          var to_add = occ[things[i]];
          total_occ+=to_add;
      }
        //go through data.current types and add all together
        var total_current = 0;
        for (i=0; i<things.length; i++){
          var to_add = parseInt(data.current[things[i]]);
          total_current+=to_add;
      }
      avg_total_occ = total_occ/total_current;
      final.avg_total_occ_list.push(avg_total_occ);

        // move everyone at TOP level of abstraction
        // assume: population knows loc AND temp_grid is properly set.
        for (var p = this.population.length - 1; p >= 0; p--) { //go through everyone in the population
            // console.log('line 269 this population: ' + this.population)
            var thing = this.population[p][0]; //set thing to the person
            var object_type = this.population[p][1]; //get what type of person (child, adult...)
            thing.exittime++; //always add one to exit time
            //call move thing function, moves things on the temp grid
            
            if (this.move_thing(thing)) { //returns true if at an exit, false if not, temp grid is updated
                this.population.splice(p, 1);
                final.current_population = this.population.length; //number of people in the grid
                total_population_over_time.push(final.current_population); //add the current population to the list of all previous populations (each update)
                final.sum_of_exit_times += thing.exittime; //add its exit time to the total exit times
                final.sum_wait_steps += thing.waitsteps; //add its total waittime to the total waitime
                
                //add to list of exit times for each type and total
                final.exit_times_array[object_type].push(thing.exittime);
                final.exit_times_total_array.push(thing.exittime);

        // TODO: THESE CAN BE GREATLY SIMPLIFIED...
                data.current[object_type] -= 1; //subtract one from type's population
            
            //add to sum of everyones exit times
            final.exit_times[object_type] += thing.exittime; //add its exit time to the total person type exit times
            final.wait_steps[object_type] += thing.waitsteps; //add its wait time to the total person type wait times
            
            //check if last on the board for that type
            if(data.current[object_type] == 0) {
              var total_time = thing.exittime; //in board update units
              final.exit_total[object_type] = total_time;
              total_wait_steps = thing.waitsteps; //set the total amount of wait steps for each type of person
            }
            
            if (final.current_population == 0) { //if no people left on the grid
              total_wait_steps = thing.waitsteps; //set the total number of waitsteps for everyoone
              end_data(thing.exittime);
              end_simulation(); //end, because no one else is ono the grid
            }
          }
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
          // iterate over ALL types and see how many are needed of each type
          var things = pop.types();
          for (i = 0; i < things.length; i++) {
            var tpe = things[i];
            
            var num_thing = 0;
            var times_not_placed = 0;
            while (num_thing < data.max[tpe]) {
              // not sure what is a good number, have it at 1000 right now, changed to area
              if (times_not_placed > (data.width_i*data.width_ii)) {
                window.alert("Cannot place this many " + tpe + " on the grid, please reset and choose another number");
                return false;
              }
              
              // ensure stays fully on the board. Be sure to protect for safety's sake
        var dd = pop.dimension(tpe);
        //this was changed
        var j = data.get_bounded_index_i(random.nextIntBetween(dd[0], data.width_i - dd[1]));
        var jj = data.get_bounded_index_ii(random.nextIntBetween(dd[2], data.width_ii - dd[3]));
        // console.log("board "+final.board);
        var exit_information = layout.get_exit_information(final.board, j, jj);
        
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

    // function takes in a person, updates the temp grid. Be sure to remove TRUE if you 
    // are removing from the simulation
    this.move_thing = function(thing) { //returns true if person is at exit, false otherwise
        var heuristic = metrics.manhattand;  // default to manhattan
        if (metrics.euclidean) {
           heuristic = metrics.euclideand;
       } else if (metrics.diagonal) {
           heuristic = metrics.diagonald;
       }
       
    //probably not best logically
    // Be sure to set the heuristic here, so it can be used in conflict resolution strategies...
    final.get_heuristic = heuristic;

        var node = astar.AStar(state, thing, 0, heuristic); //using AStar algorithm to get the best move
        if (node == null) { //if no move found from initial AStar call return false: can't move but not exit
            thing.stuck++; //add one to their stuck
            return false;
            }
          else {
            thing.stuck = 0; //not stuck if there is a path
          }
          //now check if has been stuck for too long
          if(thing.stuck > stuck_threshold){
            final.stuck = true;
            end_data(thing.exittime);
            end_simulation();
          }
          
          if(thing.initial_path.length == 0){ //if empty, we want to try to find an initial path to compare
            var path = node.initial_path(); //get the "best" path
            //console.log("initial path: "+path);
            thing.initial_path = path;
          }
          // node is the initial step
          var new_coords = node.initial_step(); //get the next move from the minheap
          
          var exiti = thing.min_exiti; //get the first x value of the exit cell, don't think this is needed
        var exitii = thing.min_exitii; //get the first y value of the exit cell, dont think this is needed
        // Simplifying assumption: Once any piece of a thing touches the exit, the whole thing is removed.
    // Future work: Could be resolved by warping the very profile of a thing to become smaller as it
    // partially leaves, until it has no presence at which point it would be removed.
        var count = 0; //counter used to check if at an exit
        for (index = 0; index < node.profile_i.length; index++) { //go through every cell of the person
           //need to check all exits just in case the goal exit changes
            for(var b=0; b < data.exit_locations.length; b++){
              // console.log(typeof data.exit_locations[b].anchor_i);
              var start_exiti = data.exit_locations[b].anchor_i;
              var start_exitii = data.exit_locations[b].anchor_ii;
              var end_endi = data.exit_locations[b].profile_i[3] + data.exit_locations[b].anchor_i;
              var end_endii = data.exit_locations[b].profile_ii[3] + data.exit_locations[b].anchor_ii;
              //check if at exit
              //checking by making sure the next move is between or touching the exit
              if ((new_coords[0] + node.profile_i[index]) >= start_exiti && (new_coords[0] + node.profile_i[index]) <= end_endi &&
                (new_coords[1] + node.profile_ii[index]) >= start_exitii && (new_coords[1] + node.profile_ii[index]) <= end_endii) {
                count++; //if at exit, add one to the count
            // console.log(count)
        }
            }
    }

        if (count > 0) { //if the count is greater that zero, some part is touching the exit
            //get the last coordinate for each ped and push to a list
            var person_type = thing.type;
            final.collision_list[person_type].push(thing.collision);
            if (data.save_path) {
                final.last_coords.push([exiti,exitii])
              //get length of initial optimal path
              var init_path_length = thing.initial_path.length;
              //get length of actual path
              var actual_path_length = thing.path_i.length;
              //get the difference
              var path_difference = actual_path_length - init_path_length;
              //divide difference from actual
              var percent_diff = path_difference / actual_path_length
              //push this percent to array of total for that type
              final.eval_path[person_type].push(percent_diff);
            //keeps a list of the paths that each ped took

            final.path_i_taken[person_type].push('['+thing.path_i+']');
            final.path_ii_taken[person_type].push('['+thing.path_ii+']');
            final.all_paths_i_taken.push('['+thing.path_i+']');
            final.all_paths_ii_taken.push('['+thing.path_ii+']');
            // debug.log(person_type + 'final path i' + final.path_i_taken[person_type])
            // debug.log(person_type + 'final path ii' + final.path_ii_taken[person_type])
            // debug.log('final path i overalllll' + final.all_paths_i_taken)
            // debug.log('final path ii overalllll' + final.all_paths_ii_taken)
            }

            thing.remove_footprint(this); //remove object if any part of the object is touching the exit
            final.didAnythingChange = true;
            // console.log('i have removed the footprint of the: ' + person_type)
            // console.log(thing)
            return true; // remove, return true
        }

        // Now make sure that you can move to the place you want to
        var j = new_coords[0];           // x value of the move you want to make
        var jj = new_coords[1];          // y value of the move you want to make
        var orientation = new_coords[2]; // direction to aim

        //collision handling
        // handles collisions by doing NOTHING. If spot that you are
        // trying to move to DOESN'T HAVE a thing then you are free to
          // move, but you have to check profile. -- i think we changed this
          
          var next = this.temp_grid[j][jj]; //get what is in the spot of the cell trying to move to
          if (typeof next === 'undefined') { return false; } // Sanity check: Leave now if undefined
          
          var collision = 0; //counter for the number of collisions, a person trying to access a spot that another one is in
          if (!next.has_other_thing(thing)) { //if there is nothing in the cell trying to move to
            // maybe could have break if collides so doesn't
            // have to keep going through loop. need to check
            // all of the cells of the thing
            
            //shouln't need collision counter if have break statement -- yes for if statement below
            for (var x = 0; x < thing.profile_i.length; x++) { //go through all cells of the person
              //getting the new cell location according to orientation
              // var new_deltas = data.get_coords_from_orientation_neighbors(thing, x, orientation); //dont think need this
              // var r = new_deltas[0]; //x value of the new move
              //  var c = new_deltas[1]; //y value of the new move
              var safe_r = data.get_bounded_index_i(j + thing.profile_i[x]); //bound the x value, making sure on the board
              var safe_c = data.get_bounded_index_ii(jj + thing.profile_ii[x]); //bound the y value, making sure on the board
              if (this.temp_grid[safe_r][safe_c].has_other_thing(thing)) { //if something already in the cell
                collision = collision + 1; //add one to collision counter
                final.total_collisions = final.total_collisions + 1; //add one to the global collision counter
                //add the ped's coordinates to their path so that it still shows when they are stuck
                    var i = thing.anchor_i; //x coordinate of the person
                    var ii = thing.anchor_ii; //y coordinate of the person
                    if (data.save_path) {
                        thing.path_i.push(i);
                        thing.path_ii.push(ii);
                    }

                    //adding collision counter to specific person types
                    final.collisions_total[thing.type] += 1;
                    thing.collision += 1;
                    break; //since we found a collision on part of the person, break for loop
                }
            }
        } else { //there is something blocking the anchor
            collision = 1;
            final.total_collisions = final.total_collisions + 1; //add one to the global collision counter
            //adding collision counter to specific person types
            final.collisions_total[thing.type] += 1;
            thing.collision += 1;
        }

        //now check if you can actually move the person
        if (collision == 0) { //if no collision for any cells then can move whole piece
            // where thing is RIGHT NOW
            var i = thing.anchor_i; //x coordinate of the person
            var ii = thing.anchor_ii; //y coordinate of the person
            //add current position to the ped's path
                if (data.save_path) {
                  thing.path_i.push(i);
                  thing.path_ii.push(ii);
                }
                final.total_visited_i.push(i);
                final.total_visited_ii.push(ii);
                // console.log('path_i: ' + thing.path_i)
                // console.log('path_ii: ' + thing.path_ii)
                //get length of initial optimal path
                
                if (data.save_path) {
                  //DONT think this should be here, commented out adding to list
                  var init_path_length = thing.initial_path.length;
                  //console.log("initial: "+init_path_length);
                  //get length of actual path
                  var actual_path_length = thing.path_i.length;
                  //console.log("actual: "+actual_path_length);
                  //get the difference
                  var path_difference = actual_path_length - init_path_length;
                  //divide difference from actual
                  var percent_diff = path_difference / init_path_length;
                }
                //push this percent to array of total for that type
                var person_type = thing.type;
                //final.eval_path[person_type].push(percent_diff);
                
                
                // clear old one
                thing.remove_footprint(this); //remove the person from its current position
                thing.anchor_i = j; //update the anchor x coordinate for the move to make
                thing.anchor_ii = jj; //update the anchor y coordinate for the move to make
                
                // move into new one
                thing.wait = 0; //reset its wait since making a move
                thing.place_footprint(this); //update the person's position on the temp grid
            final.didAnythingChange = true;
            return false;
        }

    // now there is a collision to handle..
        thing.wait++; //add one to its wait
        thing.waitsteps++; //add one to its total waits
        
        var resolution_strategy1 = conflict.factory(data.resolve1, data.threshold1);
        var resolution_strategy2 = conflict.factory(data.resolve2, data.threshold2);
        var resolution_strategy3 = conflict.factory(data.resolve3, data.threshold3);
        var resolution_strategy4 = conflict.factory(data.resolve4, data.threshold4);
        
        resolution_strategy1.try_to_resolve(thing, state, final.board);
        resolution_strategy2.try_to_resolve(thing, state, final.board);
        resolution_strategy3.try_to_resolve(thing, state, final.board);
        resolution_strategy4.try_to_resolve(thing, state, final.board);

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

function emit_grid() {
    str = "";
    for (var i = 0; i < data.width_i; i++) {
        for (var ii = 0; ii < data.width_ii; ii++) {
            str += code_for_cell(state.temp_grid[i][ii]);
        }
        str += ",";
    }
    return str;
    final.initial_path_layout = str;
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

// single-letter code for each entity
var code_for_cell = function(cell) {
    if (cell.has_thing()) {
        return cell.get_thing().code;
    }

    return ".";
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

    //this is the issue!! -- fixed
    this.has_obstacle = function() {
       if (this.thing == null) { return false; }

       if (this.thing instanceof layout.Obstacle) {
        return true;
    } else {
        return false;
    }
}

this.has_other_thing = function(other) {
    if (this.thing == null) {
        return false;
    }
        if (this.thing == other) { //this line might be the issue
       //check if the anchor is the same
      // var person = this.thing
      // if ((person.anchor_i == other.anchor_i)&&(person.anchor_ii == other.anchor_ii)){
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
      //  if (!gui.headless) { clearInterval(interval_id2); }
  }

    /**
     * 1. Construct layout first to determine boundaries
     * 2. Once boundaries are set, create state to use layout for all dimensions
     * 3. Once state is constructed, then can initialize properly using temp_grid
     */
     final.board = layout.factory(data.layout, data.width_i, data.width_ii);
    // console.log("final board exits: "+final.board.exit_locations);
    data.width_i = final.board.width_i;
    data.width_ii = final.board.width_ii;
    state = new State();
    state.init_grids();

    final.board.initialize(state.temp_grid);

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
this.end_data = function(last_exit_time){
       var things = pop.types();
                
            for (i = 0; i < things.length; i++) {
              var tpe = things[i];
                data.current[tpe] = 0; //set everyone's population to zero
// console.log(tpe + ' : ' + data.max[tpe])

//ally this next line is the one you added in (closed it at 331)
if (data.max[tpe] > 0) {
  final.collisions_average[tpe] = final.collisions_total[tpe]/data.max[tpe];
  
  var avg_exit = final.exit_times[tpe] / data.max[tpe]; //in board update units
  final.exit_average[tpe] = avg_exit;
  
  var avg_wait_steps = final.wait_steps[tpe] / data.max[tpe]; //average wait time for ped
}
              }

final.avg_collisions_total = final.total_collisions/data.total_peds_at_start;

final.total_exit_time = last_exit_time; //total exit time in board updates [ CHECK THIS SEEMS WRONG] -- i think right
final.avg_exit_time = (final.sum_of_exit_times) / data.total_peds_at_start; //in board update units

var avg_wait_steps = final.sum_wait_steps/data.total_peds_at_start; //average amount of waitsteps per person

if (gui.headless) {
  for (i = 0; i <= final.avg_total_occ_list.length - 1; i++) {
    final.occ_sum = final.occ_sum + final.avg_total_occ_list[i];
  }
  final.total_avg_occ_all_time = final.occ_sum/final.avg_total_occ_list.length;
  debug.log('total average area occupancy of all time: ' + final.total_avg_occ_all_time);
  
  //the final evaluation metric for comparing different runs and characterizing them as good/bad
  //higher number is bad
  //get overall total exit time
  //findinig the max exit time throughout all exit times
  for(i=0; i<things.length; i++){
    if (final.exit_total[things[i]]>final.overall_exit_time){
      final.overall_exit_time = final.exit_total[things[i]];
    }
  }
  
  final.evaluation_metric = (final.avg_exit_time + final.avg_collisions_total - final.total_avg_occ_all_time);
  debug.log('final evaluation metric 1041: ' + final.evaluation_metric);
  
  //making list of all the coords visited as (i,ii)
  for(n=0; n<=final.total_visited_i.length-1; n++) {
    j = final.total_visited_i[n];
    jj = final.total_visited_ii[n];
    visited_coords = [j,jj];
    final.all_visited.push(visited_coords);
  } 
  //counter for num times each location was visited
  const count = [];
  for(const element of final.all_visited) {
    if(count[element]) {
      count[element] += 1;
    } else {
      count[element] = 1;
    }
  }
  for(const element of final.all_visited) {
    if(count[element]>max_visits) {
      max_visits = count[element];
      max_element = element;
    }
  }
  //do a count for the last coord of each ped to get num peds using each exit
  const count_last = [];
  var num_through_exit = [];
  var exits = []
  for(const element of final.last_coords) {
    if(count_last[element]) {
      count_last[element] += 1;
    } else {
      count_last[element] = 1;
      exits.push(element);
    }
  }
  for(const element of exits) {
    num_through_exit.push(count_last[element]); //make list for count of num of peds using each exit
  }
  debug.log('exits: ' + exits)
  debug.log('count of last coords: ' + num_through_exit);
  debug.log('max visited occurs at: (' + max_element + ') and is ' + max_visits)
  
  //calculating the final average occupancy for each ped type
  for(i=0; i<things.length; i++){
    var sum_occ = 0;
    var on_board_count = 0;
    var list_index = avg_occ_list[things[i]];
    for(j=0; j<list_index.length; j++){
      if(list_index[j]>=0){
        on_board_count++;
        sum_occ += list_index[j];
      }
    }
    final.final_occ = sum_occ/on_board_count;
    final.average_occupancy[things[i]] = final.final_occ;
  }
  debug.log('final occ list: ' + final.average_occupancy);
  
  //data for comparing against ideal path
  //go through each type of person
  var pop_tpes = pop.types();
  for(i=0; i<pop_tpes.length; i++){
    var eval_ratio = 0; //reset each time
    var this_list = final.eval_path[pop_tpes[i]];
    //add up all values in list
    for (j=0; j<this_list.length; j++){
      eval_ratio+=this_list[j];
      // console.log("individual: "+this_list[j]);
    }
    //divide by length of the list
    eval_ratio = eval_ratio/(this_list.length+1);
    //add to total list
    final.total_eval_path.push(eval_ratio);
    //console log fir now, show on screen in future
    debug.log("eval by type: "+eval_ratio);
  }
  //sum up total list
  var total_eval = 0;
  for(i=0; i< final.total_eval_path.length; i++){
    total_eval+=final.total_eval_path[i];
  }
  //divide by length of list
  total_eval = total_eval / (final.total_eval_path.length+1);
  final.total_eval = total_eval;
  
  //show in screen
  debug.log("total: "+ total_eval);
}

//make the bar graphs here
// end_simulation(); 
//adding strings for the axis labels and titles
final.total_data = [];
if (data.total_collide) {
  final.total_data.push([final.collisions_total, "Number of Collisions", "Total Number of collisions by Type of Person"]);
} if (data.average_collide) {
  final.total_data.push([final.collisions_average, "Number of Collisions", "Average Number of Collisions by Type of Person"]);
}if (data.total_exit) {
  final.total_data.push([final.exit_total, "Time taken to exit (in board updates)", "Time taken for each type of person to leave the board"]);
}if (data.average_exit) {
  final.total_data.push([final.exit_average, "Time taken to exit (in board updates)", "Average Time taken for each type of Person to Exit the board"]);
} if (data.average_occupancy) {
  final.total_data.push([final.average_occupancy, "Average area occupancy (in ped/sq ft)", "Total average area occupancy by pedestrian type"])
}
if (!gui.headless) { graph.createBarGraph(); }
if (!gui.headless) { graph.makeAvgGraph(); }
if (!gui.headless) { graph.makeAvgExitGraph(); }
            }

var end_sim_counter = 0;
function end_simulation() {
  end_sim_counter = end_sim_counter + 1;
  clearInterval(interval_id);
  // if (!gui.headless) { clearInterval(interval_id2); }
  if (typeof callback_done !== 'undefined') {
    callback_done();
  }
  if (!gui.headless) {
    for (i = 0; i <= final.avg_total_occ_list.length - 1; i++) {
      final.occ_sum = final.occ_sum + final.avg_total_occ_list[i];
    }
    final.total_avg_occ_all_time = final.occ_sum/final.avg_total_occ_list.length;
    debug.log('total average area occupancy of all time: ' + final.total_avg_occ_all_time);
    
    //the final evaluation metric for comparing different runs and characterizing them as good/bad
    //higher number is bad
    //get overall total exit time
    //findinig the max exit time throughout all exit times
    final.overall_exit_time = 0;
    for(i=0; i<things.length; i++){
      if (final.exit_total[things[i]]>final.overall_exit_time){
        final.overall_exit_time = final.exit_total[things[i]];
      }
    }
    
    final.evaluation_metric = (final.avg_exit_time + final.avg_collisions_total - final.total_avg_occ_all_time);
    debug.log('final evaluation metric 992: ' + final.evaluation_metric);
    
    //making list of all the coords visited as (i,ii)
    for(n=0; n<=final.total_visited_i.length-1; n++) {
      j = final.total_visited_i[n];
      jj = final.total_visited_ii[n];
      visited_coords = [j,jj];
      final.all_visited.push(visited_coords);
    } 
    //counter for num times each location was visited
    const count = [];
    for(const element of final.all_visited) {
      if(count[element]) {
        count[element] += 1;
      } else {
        count[element] = 1;
      }
    }
    for(const element of final.all_visited) {
      if(count[element]>max_visits) {
        max_visits = count[element];
        max_element = element;
      }
    }
    //do a count for the last coord of each ped to get num peds using each exit
    const count_last = [];
    var num_through_exit = [];
    var exits = []
    for(const element of final.last_coords) {
      if(count_last[element]) {
        count_last[element] += 1;
      } else {
        count_last[element] = 1;
        exits.push(element);
      }
    }
    for(const element of exits) {
      num_through_exit.push(count_last[element]); //make list for count of num of peds using each exit
    }
    debug.log('exits: ' + exits)
    debug.log('count of last coords: ' + num_through_exit);
    debug.log('max visited occurs at: (' + max_element + ') and is ' + max_visits)
    
    if(data.heatmap) {
      graph.heatmap();
    }
    
    //calculating the final average occupancy for each ped type
    for(i=0; i<things.length; i++){
      var sum_occ = 0;
      var on_board_count = 0;
      var list_index = avg_occ_list[things[i]];
      for(j=0; j<list_index.length; j++){
        if(list_index[j]>=0){
          on_board_count++;
          sum_occ += list_index[j];
        }
      }
      final.final_occ = sum_occ/on_board_count;
      final.average_occupancy[things[i]] = final.final_occ;
    }
    debug.log('final occ list: ' + final.average_occupancy);
    
    //data for comparing against ideal path
    //go through each type of person
    var pop_tpes = pop.types();
    for(i=0; i<pop_tpes.length; i++){
      var eval_ratio = 0; //reset each time
      var this_list = final.eval_path[pop_tpes[i]];
      //add up all values in list
      for (j=0; j<this_list.length; j++){
        eval_ratio+=this_list[j];
        // console.log("individual: "+this_list[j]);
      }
      //divide by length of the list
      eval_ratio = eval_ratio/(this_list.length+1);
      //add to total list
      final.total_eval_path.push(eval_ratio);
      //console log fir now, show on screen in future
      debug.log("eval by type: "+eval_ratio);
    }
    //sum up total list
    var total_eval = 0;
    for(i=0; i< final.total_eval_path.length; i++){
      total_eval+=final.total_eval_path[i];
    }
    //divide by length of list
    total_eval = total_eval / (final.total_eval_path.length+1);
    final.total_eval = total_eval;
    
    //show in screen
    debug.log("total: "+ total_eval);
  }
}

function clear_simulation() {
  if (!gui.headless) { window.location.reload() }
}

//we need a function that does not reload the window
//but instead manually resets the variables and board
function reset(){
  
  //clear canvas before starting
  let canvas = document.getElementById('grid');
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  //variables for graph need to be reset
  //repeat of initalizations
  data.total_peds_at_start = 0;
  var things = pop.types(); //each type of a person
  //initializations for average area occupancy lists
  var avg_occ_list = {};
  var population_types = pop.types();
  for (i=0; i<population_types.length; i++){
    avg_occ_list[population_types[i]] = [];
  }
  final.all_visited = [];
  final.avg_total_occ_list = [];
  final.total_avg_occ_all_time = 0;
  final.occ_sum = 0;
  var vor_count = 0;
  final.vor_exits_i = [];
  final.vor_exits_ii = [];
  final.evaluation_metric = 0;
  final.total_visited_i = [];
  final.total_visited_ii = [];
  var max_visits = 0;
  final.last_coords = [];
  final.final_occ = {};
  final.total_eval = 0;
  final.all_paths_i_taken = [];
  final.all_paths_ii_taken = [];
  final.overall_exit_time = 0;
  
  for (i=0; i<things.length; i++){
    final.final_occ[things[i]] = 0;
  }
  final.average_occupancy = {};
  
  final.eval_path = {}
  for (i=0; i<population_types.length; i++){
    final.eval_path[population_types[i]] = [];
  }
  final.total_eval_path = [];
  
  final.exit_times_array = {};
  for (i=0; i<population_types.length; i++){
    final.exit_times_array[population_types[i]] = [];
  }
  final.exit_times_total_array = [];
  //collision array used for standard deviation
  final.collision_list = {};
  for (i=0; i<population_types.length; i++){
    final.collision_list[population_types[i]] = [];
  }
  
  //initializing the lists of paths for different types
  final.path_i_taken = {};
  for (i=0; i<population_types.length; i++){
    final.path_i_taken[population_types[i]] = [];
  }
  final.path_ii_taken = {};
  for (i=0; i<population_types.length; i++){
    final.path_ii_taken[population_types[i]] = [];
  }
  
  //Collision counters
  final.collisions_total = {};
  //initialize each value to zero
  for (i=0; i<things.length; i++){
    final.collisions_total[things[i]] = 0;
  }
  final.collisions_average = {};
  
  //exit counters, not sure if have to initialize
  final.exit_total = {};
  final.exit_average = {};
  
  final.total_collisions = 0; //counter for the number of collisions for people, in total
  final.avg_collisions_total = 0; //counter for the number of collisions for people, as an average
  
  //Exit time counters (in units of board updates)
  final.total_exit_time = 0; //counter for total exit time (taken to be the max exit time; exit time of last ped to leave the board)
  final.avg_exit_time = 0; //counter for average exit time of all peds
  
  final.sum_of_exit_times = 0; //counter for the exit times of everyone, added together 
  final.sum_wait_steps = 0; //number of times everyone has waited, all added together
  
  final.exit_times = {};
  for (i=0; i<things.length; i++){
    final.exit_times[things[i]] = 0;
  }
  final.wait_steps = {};
  for (i=0; i<things.length; i++){
    final.wait_steps[things[i]] = 0;
  }
  
  //counter for the number of people currently on the board
  //think could be data.current_population
  final.current_population = data.total_peds_at_start;
  
  // number of generations, run up to max_generation
  var number_generations = 0;
  state.population = [];
  for (i=0; i<things.length; i++){
    data.current[things[i]] = data.max[things[i]];
  }
  //reset graph
 // graph.reset_graph();
}

function start_simulation(max_gen, callback) {
  
  if (!gui.headless) {
    reset(); //used to clear the board in GUI
  }
  
  var things = pop.types();
  for (i=0; i<things.length; i++){
    data.total_peds_at_start+=parseInt(data.max[things[i]]);
    // console.log(data.total_peds_at_start);
  }
  if (!gui.headless) {
    document.getElementById("total_peds_at_start").innerHTML = data.total_peds_at_start;
    for (i = 0; i < things.length; i++) {
      var tpe = things[i];
      document.getElementById("num_" + tpe + "_initial").innerHTML = data.max[tpe];
    }
    document.getElementById("num_Obstacle_initial").innerHTML = data.max['Obstacle']
  }
  
  data._data = undefined; // clear everything to clean up after 1st run
  
  if (typeof max_gen === 'undefined') {
    max_generation = Number.MAX_SAFE_INTEGER;
  } else {
    max_generation = max_gen;
    //console.log('max generation is: ' + max_generation)
  }
  
  if (typeof callback !== 'undefined') {
    callback_done = callback;
  }
  
  initialize_simulation();
  
  if (debug.active) {
    debug.log(emit_grid());
  }
  if (gui.headless) {
    emit_grid();
    final.initial_path_layout = emit_grid();
  }
  
  
  interval_id = setInterval(simulate_and_visualize, data.ms_between_updates);
  if (!gui.headless) {
    // interval_id2 = setInterval(graph.simulate, data.ms_between_updates); //think these two values should be the same
  }
  //my attempt at making a call to a voronoi file
  for(i=0; i < final.board.exit_locations.length; i++) {
    final.vor_exits_i.push(final.board.exit_locations[i].anchor_i);
    final.vor_exits_ii.push(final.board.exit_locations[i].anchor_ii);
  }
  if (!gui.headless) { voronoi.pVoronoiD(final.board); }
  var report = "";
  final.m = 0;
  for (var r = 0; r < voronoi.regions.length; r++) {
    var f = voronoi.density(r, state); //voronoi.count(r, state);
    report = report + f + ",";
    if(f>final.m) {
      final.m=f;
      final.most_dense_exit_i = final.vor_exits_i[r];
      final.most_dense_exit_ii = final.vor_exits_ii[r];
    }
  }
  //finding min density region and saving the index
  final.least_dense_index = 0;
  report2 = "";
  final.min = 10000; //initialization to find min density region (slightly sketchy but I don't think it'll cause problems)
  for (var r = 0; r < voronoi.regions.length; r++) {
    var f = voronoi.density(r, state); //voronoi.count(r, state);
    report2 = report2 + f + ",";
    if(f<final.min) {
      final.min=f;
      final.least_dense_exit_i = final.vor_exits_i[r];
      final.least_dense_exit_ii = final.vor_exits_ii[r];
      final.least_dense_index = r;
    }
  }
  debug.log('report: ' + report);
  debug.log('final.vor_exits_i: ' + final.vor_exits_i)
  debug.log('final.vor_exits_ii: ' + final.vor_exits_ii)
  
  debug.log('most dense exit location at start: (' + final.most_dense_exit_i + ', ' + final.most_dense_exit_ii + '), with a density of: ' + final.m);
  debug.log('least dense exit location at start: (' + final.least_dense_exit_i + ', ' + final.least_dense_exit_ii + '), with a density of: ' + final.min);
  debug.log('least dense index: ' + final.least_dense_index);
}

take_snapshot_calls = 0;
function simulate_and_visualize() {
  number_generations += 1;
  
  var report = "";
  for (r = 0; r < voronoi.regions.length; r++) {
    var f = voronoi.density(r, state); //voronoi.count(r, state);
    report = report + f + ",";
  }
  
  //console.log("gen:" + number_generations + ", density:" + report);
  
  if (number_generations >= max_generation) {
    end_data(number_generations);
    end_simulation();
    
    return;
  }
  
  final.didAnythingChange = false; //reset each board update
  state.move_things();
  if (!final.didAnythingChange){
    stuckCount++;
    if (stuckCount > MAXCOUNT){
      final.deadlock = true;
      end_data(number_generations);
      end_simulation();
      return;
    }
  }
  else{
    stuckCount = 0;
  }
  
  if (!gui.headless) { draw_grid(state.grid.map(function(row) {
    return row.map(function(cell) {
      return cell;
    });
  }));
    
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
    if(final.current_population != 0){
      graph.simulate(); //real time graph
    }
    
    
  }
}

// export JUST what we want to
final.start_simulation = start_simulation;
final.end_simulation = end_simulation;
final.clear_simulation = clear_simulation;
final.emit_grid = emit_grid;

// make sure we keep reference so it can be retrieved AFTER simulation is over.
final.get_state = get_state;

          })(typeof final === 'undefined'?
               this['final']={}: final);
