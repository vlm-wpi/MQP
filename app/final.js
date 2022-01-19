/**
 * Final Application
 *
 * Refactor out the alorithm used for each individual entity.
 */

(function(exports) {

    //variable for the total number of people on the grid, updates when it reads the value from html
    var total_peds_at_start = 0; 

    //heuristic options
    var diagonal = true;   // initialize heuristic using diagonal distance
    var manhattan = false; // boolean to use manhattan distance in heuristic, user can change this
    var euclidean = false; // boolean to use euclidean distance in heuristic, user can change this
    
    //Collision counters
    var total_child_collisions = 0; //counter for the number of collisions for children, in total
    var avg_child_collisions = 0; //counter for the number of collisions for children, as an average
    var total_adult_collisions = 0; //counter for the number of collisions for adults, in total
    var avg_adult_collisions = 0; //counter for the number of collisions for adults, as an average
    var total_backpack_collisions = 0; //counter for the number of collisions for adults with a backpacj, in total
    var avg_backpack_collisions = 0; //counter for the number of collisions for with a backpack, as an average
    var total_bike_collisions = 0; //counter for the number of collisions for adults with a bike, in total
    var avg_bike_collisions = 0; //counter for the number of collisions for adults with a bike, as an average
    var total_collisions = 0; //counter for the number of collisions for people, in total
    var avg_collisions_total = 0; //counter for the number of collisions for people, as an average

    //Exit time counters (in units of board updates)
    var sum_of_exit_times = 0; //counter for the exit times of everyone, added together 
    var sum_child_exit_times = 0; //counter for the child exit times, added together
    var sum_adult_exit_times = 0; //counter for the adult exit times, added together
    var sum_backpack_exit_times = 0; //counter for the adult with backpack exit times, added together
    var sum_bike_exit_times = 0; //counter for the adult with a bike exit times, added together
    
    //Wait time counters
    var sum_wait_steps = 0; //number of times everyone has waited, all added together
    var sum_child_wait_steps = 0; //number of times each child has waited, all added together
    var sum_adult_wait_steps = 0; //number of times each adult has waited, all added together
    var sum_backpack_wait_steps = 0; //number of times each adult w a backpack has waited, added together
    var sum_bike_wait_steps = 0; //number of times each adult w a bike has waited, added together
    
    //counter for the number of children currently on the board
    var current_population = 0;

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
    var total_peds_at_start = parseInt(data.max['Child']) + parseInt(data.max['Adult']) + parseInt(data.max['AdultBackpack']) + parseInt(data.max['AdultBike']);
    document.getElementById("total_peds_at_start").innerHTML = total_peds_at_start;
    var num_children_initial = parseInt(data.max['Child']);
    document.getElementById("num_children_initial").innerHTML = num_children_initial;
    document.getElementById("num_adult_initial").innerHTML = data.max['Adult'];
    document.getElementById("num_backpack_initial").innerHTML = data.max['AdultBackpack'];
    document.getElementById("num_bike_initial").innerHTML = data.max['AdultBike'];
    document.getElementById("num_obstacle_initial").innerHTML = data.max['Obstacle'];
    this.grid = []; //data structure for grid, initially empty
    this.temp_grid = []; //data structure for the temp griid, used to try placing objects without actually moving them on the actual board
    this.population = []; //population of people on the grid, initially empty
    total_population_over_time = [total_peds_at_start]; //make the total population over time start with everyone on the board

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
        // move everyone at TOP level of abstraction
        // assume: population knows loc AND temp_grid is properly set.
        for (var p = this.population.length - 1; p >= 0; p--) { //go through everyone in the population
            var thing = this.population[p][0]; //set thing to the person
            var object_type = this.population[p][1]; //get what type of person (child, adult...)
            thing.exittime++; //always add one to exit time
            //call move thing function, moves things on the temp grid
            if (this.move_thing(thing)) { //returns true if at an exit, false if not, temp grid is updated
                this.population.splice(p, 1);
                var current_population = this.population.length; //number of people in the grid
                document.getElementById("current_total").innerHTML = current_population;
                total_population_over_time.push(current_population); //add the current population to the list of all previous populations (each update)
                sum_of_exit_times = sum_of_exit_times + thing.exittime; //add its exit time to the total exit times
                sum_wait_steps = sum_wait_steps + thing.waitsteps; //add its total waittime to the total waitime
		// TODO: THESE CAN BE GREATLY SIMPLIFIED...
                    //if a child
                    if (object_type == 'Child') { 
                        data.current['Child'] = data.current['Child'] - 1; //subtract one from the child population
                        document.getElementById("current_children").innerHTML = data.current['Child'];
                        //add to sum of everyones exit times
                        sum_child_exit_times = sum_child_exit_times + thing.exittime; //add its exit time to the total children exit times
                        sum_child_wait_steps = sum_child_wait_steps + thing.waitsteps; //add its wait time to the total children wait times
                        //check if last child
                        if(data.current['Child'] == 0) {
                          var total_child_exit_time = thing.exittime; //in board update units
                          document.getElementById("total_child_exit").innerHTML = total_child_exit_time;
                          var total_child_wait_steps = thing.waitsteps; //set the total amount of wait steps for children
                          document.getElementById("total_child_wait").innerHTML = total_child_wait_steps;
                        }
                        //if an adult
                    } else if (object_type == 'Adult') {
                        data.current['Adult'] = data.current['Adult'] - 1; //subtract one from the adult population
                        document.getElementById("current_adult").innerHTML = data.current['Adult'];
                        sum_adult_exit_times = sum_adult_exit_times + thing.exittime; //add its exit time to the total adult exit times
                        sum_adult_wait_steps = sum_adult_wait_steps + thing.waitsteps; //add its wait time to the total adult wait times
                        //check if last adult
                        if(data.current['Adult'] == 0){
                          var total_adult_exit_time = thing.exittime; //in board update units
                          document.getElementById("total_adult_exit").innerHTML = total_adult_exit_time;
                          var total_adult_wait_steps = thing.waitsteps; //set the total amount of wait steps for adults
                          document.getElementById("total_adult_wait").innerHTML = total_adult_wait_steps;
                        }
                        //check if adult with backpack
                    } else if (object_type == 'AdultBackpack') {
                        data.current['AdultBackpack'] = data.current['AdultBackpack'] - 1; //subtract one from the adult with backpack population
                        document.getElementById("current_backpack").innerHTML = data.current['AdultBackpack'];
                        sum_backpack_exit_times = sum_backpack_exit_times + thing.exittime; //add its exit time to the total adult with backpack exit times
                        sum_backpack_wait_steps = sum_backpack_wait_steps + thing.waitsteps; //add its wait time to the total adult with backpack wait times
                        if(data.current['AdultBackpack'] == 0){
                          var total_backpack_exit_time = thing.exittime; //in board update units
                          document.getElementById("total_backpack_exit").innerHTML = total_backpack_exit_time;
                          var total_backpack_wait_steps = thing.waitsteps; //set the total amount of wait steps for adults with backpack
                          document.getElementById("total_backpack_wait").innerHTML = total_backpack_wait_steps;
                        }
                        //check if adult with bike
                    } else if (object_type == 'AdultBike') {
                        data.current['AdultBike'] = data.current['AdultBike'] - 1; //subtract one from the adult with bike population
                        document.getElementById("current_bike").innerHTML = data.current['AdultBike'];
                        sum_bike_exit_times = sum_bike_exit_times + thing.exittime; //add its exit time to the total adult with bike exit times
                        sum_bike_wait_steps = sum_bike_wait_steps + thing.waitsteps; //add its wait time to the total adult with bike wait times
                        if(data.current['AdultBike'] == 0){
                          var total_bike_exit_time = thing.exittime; //in board update units
                          document.getElementById("total_bike_exit").innerHTML = total_bike_exit_time;
                          var total_bike_wait_steps = thing.waitsteps; //set the total amount of wait steps for adults with bike
                          document.getElementById("total_bike_wait").innerHTML = total_bike_wait_steps;
                        }
                }
                if (current_population == 0) { //if no people left on the grid
                //not sure if we need to set these to zero, should all be zero???
                    data.current['Child'] = 0;
                    data.current['Adult'] = 0;
                    data.current['AdultBackpack'] = 0;
                    data.current['AdultBike'] = 0;
                    end_simulation() //end the simulation
                    avg_collisions_total = total_collisions/total_peds_at_start;
                    document.getElementById("avg_collision").innerHTML = avg_collisions_total;
                    document.getElementById("collision").innerHTML = total_collisions;
                    avg_child_collisions = total_child_collisions/data.max['Child'];
                    document.getElementById("total_child_collide").innerHTML = total_child_collisions;
                    document.getElementById("avg_child_collide").innerHTML = avg_child_collisions;
                    avg_adult_collisions = total_adult_collisions/data.max['Adult'];
                    document.getElementById("total_adult_collide").innerHTML = total_adult_collisions;
                    document.getElementById("agv_adult_collide").innerHTML = avg_adult_collisions;
                    avg_backpack_collisions = total_backpack_collisions/data.max['AdultBackpack'];
                    document.getElementById("total_backpack_collide").innerHTML = total_backpack_collisions;
                    document.getElementById("avg_backpack_collide").innerHTML = avg_backpack_collisions;
                    avg_bike_collisions = total_bike_collisions/ data.max['AdultBike'];
                    document.getElementById("total_bike_collide").innerHTML = total_bike_collisions;
                    document.getElementById("avg_bike_collide").innerHTML = avg_bike_collisions;
                    var total_exit_time = thing.exittime; //total exit time in board updates
                    document.getElementById("total_exit_time").innerHTML = total_exit_time;
                    var avg_exit_time = (sum_of_exit_times) / total_peds_at_start; //in board update units
                    document.getElementById("avg_exit_time").innerHTML = avg_exit_time;
                    var avg_exit_time_child = (sum_child_exit_times) / data.max['Child']; //in board update units
                    var avg_exit_time_adult = (sum_adult_exit_times) / data.max['Adult']; //in board update units
                    var avg_exit_time_backpack = (sum_backpack_exit_times) / data.max['AdultBackpack']; //in board update units
                    var avg_exit_time_bike = (sum_bike_exit_times) / data.max['AdultBike']; //in board update units
                    document.getElementById("avg_exit_child").innerHTML = avg_exit_time_child;
                    document.getElementById("avg_exit_adult").innerHTML = avg_exit_time_adult;
                    document.getElementById("avg_exit_backpack").innerHTML = avg_exit_time_backpack;
                    document.getElementById("avg_exit_bike").innerHTML = avg_exit_time_bike;

                    var total_wait_steps = thing.waitsteps; //set the total number of waitsteps for everyoone
                    document.getElementById("total_wait_steps").innerHTML = total_wait_steps;
                    var avg_wait_steps = sum_wait_steps/total_peds_at_start; //average amount of waitsteps per person
                    document.getElementById("avg_wait_steps").innerHTML = avg_wait_steps;
                    var avg_wait_steps_child = sum_child_wait_steps/data.max['Child']; //average wait time for children
                    var avg_wait_steps_adult = sum_adult_wait_steps/data.max['Adult']; //average wait time for adults
                    var avg_wait_steps_backpack = sum_backpack_wait_steps/data.max['AdultBackpack']; //average wait time for adults with a backpack
                    var avg_wait_steps_bike = sum_bike_wait_steps/data.max['AdultBike']; //average wait time for adults with a bike
                    document.getElementById("avg_wait_steps_child").innerHTML = avg_wait_steps_child;
                    document.getElementById("avg_wait_steps_adult").innerHTML = avg_wait_steps_adult;
                    document.getElementById("avg_wait_steps_backpack").innerHTML = avg_wait_steps_backpack;
                    document.getElementById("avg_wait_steps_bike").innerHTML = avg_wait_steps_bike;
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

    this.place_things = function(random) {
        //added this in as part of exit distances
        
        //here will initialize a lecture hall
        // 30 rows, after 15th 2 row spaces for ppl
        //20 columns, 3 column spaces for ppl after 10
        //26x68
        //exits at (0,0) (0,44) (68,0) (68,44)
        //x values are columns
        //y values are rows

        if (data.hall_layout == true) {
            data.width_i = 50;
            data.width_ii = 75;
            //first quarter of the room
            for (var col = 0; col < 10; col++) { //leaving row space for people
                for (var row = 0; row < 30; row += 2) { //columns, next to each other
                    var obj = new Obstacle(col + 10, row + 10); //offsetting by 2,3
                    this.temp_grid[col + 10][row + 10].thing = obj;
                }
            }
            //second quarter of the room, double row space after first quarter
            for (var col = 0; col < 10; col++) { //leaving row space for people
                for (var row = 0; row < 30; row += 2) { //columns, next to each other
                    var obj = new Obstacle(col + 10, row + 42); //offsetting by 2,32
                    this.temp_grid[col + 10][row + 42].thing = obj;
                }
            }
            //third quarter of room
            for (var col = 0; col < 10; col++) { //leaving row space for people
                for (var row = 0; row < 30; row += 2) { //columns, next to each other
                    var obj = new Obstacle(col + 27, row + 10); //offsetting by 14,3
                    this.temp_grid[col + 27][row + 10].thing = obj;
                }
            }
            //fourth quarter of the room
            for (var col = 0; col < 10; col++) { //leaving row space for people
                for (var row = 0; row < 30; row += 2) { //columns, next t0 each other
                    var obj = new Obstacle(col + 27, row + 42); //offsetting by 14,32
                    this.temp_grid[col + 27][row + 42].thing = obj;
                }
            }
            var obj1 = new Exit(0, 0); //should probably make coordinates variables
            data.exit_locations.push(obj1);
            for (var p = 0; p < obj1.profile_i.length; p++) { //placing exits on the grid
                var dj = obj1.profile_i[p];
                var djj = obj1.profile_ii[p];
                var safej = data.get_bounded_index_i(0 + dj);
                var safejj = data.get_bounded_index_ii(0 + djj);

                this.temp_grid[safej][safejj].thing = obj1;
            }
            var obj2 = new Exit(data.width_i - 4, 0);
            // console.log(obj2)
            data.exit_locations.push(obj2);
            for (var p = 0; p < obj2.profile_i.length; p++) { //placing exits on the grid
                var dj = obj2.profile_i[p];
                var djj = obj2.profile_ii[p];
                var safej = data.get_bounded_index_i(data.width_i - 4 + dj);
                var safejj = data.get_bounded_index_ii(0 + djj);

                this.temp_grid[safej][safejj].thing = obj2;
            }
            var obj3 = new Exit(1, data.width_ii - 1);
            data.exit_locations.push(obj3);
            for (var p = 0; p < obj3.profile_i.length; p++) { //placing exits on the grid
                var dj = obj3.profile_i[p];
                var djj = obj3.profile_ii[p];
                var safej = data.get_bounded_index_i(1 + dj);
                var safejj = data.get_bounded_index_ii(data.width_ii - 1 + djj);

                this.temp_grid[safej][safejj].thing = obj3;
            }
            var obj4 = new Exit(data.width_i - 4, data.width_ii - 1);
            data.exit_locations.push(obj4);
            for (var p = 0; p < obj4.profile_i.length; p++) { //placing exits on the grid
                var dj = obj4.profile_i[p];
                var djj = obj4.profile_ii[p];
                var safej = data.get_bounded_index_i(data.width_i - 4 + dj);
                var safejj = data.get_bounded_index_ii(data.width_ii - 1 + djj);

                this.temp_grid[safej][safejj].thing = obj4;
            }
        }

        //setting up the default drawing for fuller lower lecture hall
        else if (data.fuller_lower == true) {
            data.width_i = 56;
            data.width_ii = 45;
            //first set of seats at the back of the room (left)
            for (var col = 6; col < 26; col++) {
                for (var row = 0; row < 2; row++) {
                    var obj = new Obstacle(col, row);
                    this.temp_grid[col][row].thing = obj;
                }
            }
            //first set of seats at the back of the room (right)
            for (var col = 29; col < 50; col++) {
                for (var row = 0; row < 2; row++) {
                    var obj = new Obstacle(col, row);
                    this.temp_grid[col][row].thing = obj;
                }
            }
            //second row of seats from the back (left)
            for (var col = 10; col < 22; col++) {
                for (var row = 4; row < 6; row++) {
                    var obj = new Obstacle(col, row);
                    this.temp_grid[col][row].thing = obj;
                }
            }
            //second row of seats from the back (right)
            for (var col = 33; col < 46; col++) {
                for (var row = 4; row < 6; row++) {
                    var obj = new Obstacle(col, row);
                    this.temp_grid[col][row].thing = obj;
                }
            }
            //third row of seats from the back (left)
            for (var col = 8; col < 24; col++) {
                for (var row = 9; row < 11; row++) {
                    var obj = new Obstacle(col, row);
                    this.temp_grid[col][row].thing = obj;
                }
            }
            //third row of seats from the back (right)
            for (var col = 31; col < 48; col++) {
                for (var row = 9; row < 11; row++) {
                    var obj = new Obstacle(col, row);
                    this.temp_grid[col][row].thing = obj;
                }
            }
            //fourth row of seats from the back (left)
            for (var col = 8; col < 24; col++) {
                for (var row = 13; row < 15; row++) {
                    var obj = new Obstacle(col, row);
                    this.temp_grid[col][row].thing = obj;
                }
            }
            //fourth row of seats from the back (right)
            for (var col = 31; col < 48; col++) {
                for (var row = 13; row < 15; row++) {
                    var obj = new Obstacle(col, row);
                    this.temp_grid[col][row].thing = obj;
                }
            }
            //fifth row of seats from the back (left)
            for (var col = 9; col < 23; col++) {
                for (var row = 17; row < 19; row++) {
                    var obj = new Obstacle(col, row);
                    this.temp_grid[col][row].thing = obj;
                }
            }
            //fifth row of seats from the back (right)
            for (var col = 32; col < 47; col++) {
                for (var row = 17; row < 19; row++) {
                    var obj = new Obstacle(col, row);
                    this.temp_grid[col][row].thing = obj;
                }
            }
            //sixth row of seats from the back (left)
            for (var col = 9; col < 23; col++) {
                for (var row = 21; row < 23; row++) {
                    var obj = new Obstacle(col, row);
                    this.temp_grid[col][row].thing = obj;
                }
            }
            //sixth row of seats from the back (right)
            for (var col = 32; col < 47; col++) {
                for (var row = 21; row < 23; row++) {
                    var obj = new Obstacle(col, row);
                    this.temp_grid[col][row].thing = obj;
                }
            }
            //seventh row from back (railing at front - left)
            for (var col = 9; col < 23; col++) {
                for (var row = 25; row < 26; row++) {
                    var obj = new Obstacle(col, row);
                    this.temp_grid[col][row].thing = obj;
                }
            }
            //side railing front left
            for (var col = 9; col < 10; col++) {
                for (var row = 26; row < 28; row++) {
                    var obj = new Obstacle(col, row);
                    this.temp_grid[col][row].thing = obj;
                }
            }
            //seventh row from back (railing at front - right)
            for (var col = 32; col < 47; col++) {
                for (var row = 25; row < 26; row++) {
                    var obj = new Obstacle(col, row);
                    this.temp_grid[col][row].thing = obj;
                }
            }
            //side railing front right
            for (var col = 46; col < 47; col++) {
                for (var row = 26; row < 28; row++) {
                    var obj = new Obstacle(col, row);
                    this.temp_grid[col][row].thing = obj;
                }
            }
            //podium front right
            for (var col = 38; col < 42; col++) {
                for (var row = 35; row < 38; row++) {
                    var obj = new Obstacle(col, row);
                    this.temp_grid[col][row].thing = obj;
                }
            }
            //railing down the middle (top)
            for (var col = 27; col < 28; col++) {
                for (var row = 2; row < 7; row++) {
                    var obj = new Obstacle(col, row);
                    this.temp_grid[col][row].thing = obj;
                }
            }
            //railing down the middle (bottom)
            for (var col = 27; col < 28; col++) {
                for (var row = 10; row < 26; row++) {
                    var obj = new Obstacle(col, row);
                    this.temp_grid[col][row].thing = obj;
                }
            }
            //first exit in the top left
            var obj01 = new Exit(1, 0)
            data.exit_locations.push(obj01)
            for (var p = 0; p < obj01.profile_i.length; p++) {
                var dj = obj01.profile_i[p];
                var djj = obj01.profile_ii[p];
                var safej = data.get_bounded_index_i(1 + dj);
                var safejj = data.get_bounded_index_ii(0 + djj);
                this.temp_grid[safej][safejj].thing = obj01;
            }
            //second exit in the top right
            var obj02 = new Exit(data.width_i - 4, 0)
            data.exit_locations.push(obj02)
            for (var p = 0; p < obj02.profile_i.length; p++) {
                var dj = obj02.profile_i[p];
                var djj = obj02.profile_ii[p];
                var safej = data.get_bounded_index_i(data.width_i - 4 + dj);
                var safejj = data.get_bounded_index_ii(0 + djj);
                this.temp_grid[safej][safejj].thing = obj02;
            }
            //third exit bottom left
            var obj03 = new Exit(0, data.width_ii - 9)
            data.exit_locations.push(obj03)
            for (var p = 0; p < obj03.profile_i.length; p++) {
                var dj = obj03.profile_i[p];
                var djj = obj03.profile_ii[p];
                var safej = data.get_bounded_index_i(0 + dj);
                var safejj = data.get_bounded_index_ii(data.width_ii - 9 + djj);
                this.temp_grid[safej][safejj].thing = obj03;
            }
            //fourth exit bottom left
            var obj04 = new Exit(0, data.width_ii - 5)
            data.exit_locations.push(obj04)
            for (var p = 0; p < obj04.profile_i.length; p++) {
                var dj = obj04.profile_i[p];
                var djj = obj04.profile_ii[p];
                var safej = data.get_bounded_index_i(0 + dj);
                var safejj = data.get_bounded_index_ii(data.width_ii - 5 + djj);
                this.temp_grid[safej][safejj].thing = obj04;
            }
            // console.log(data.exit_locations)
        } else if (data.classroom == true) {
            data.width_i = 40;
            data.width_ii = 35;
            //podium at front of classroom
            for (var col = 34; col < 38; col++) {
                for (var row = 3; row < 6; row++) {
                    var obj = new Obstacle(col, row);
                    this.temp_grid[col][row].thing = obj;
                }
            }
            //desks
            for (var col0 = 0; col0 < data.width_i-1; col0+=5) {
                for (var row0 = 8; row0 < data.width_ii-1; row0+=6) {
                    for (var col = col0; col < col0+3; col++) {
                        for (var row = row0; row < row0+3; row++) {
                            var obj = new Obstacle(col, row);
                            this.temp_grid[col][row].thing = obj;
                        }
                    }
                }
            }

            var obj01 = new Exit(0, 0)
            data.exit_locations.push(obj01)
            for (var p = 0; p < obj01.profile_i.length; p++) {
                var dj = obj01.profile_i[p];
                var djj = obj01.profile_ii[p];
                var safej = data.get_bounded_index_i(0 + dj);
                var safejj = data.get_bounded_index_ii(0 + djj);
                this.temp_grid[safej][safejj].thing = obj01;
            }
        }
        else {
            for (var n = 0; n < data.max['Obstacle']; n++) {
                var j = get_random_int(0, data.width_i)
                var jj = get_random_int(0, data.width_ii)

                var obj = new Obstacle(j, jj);
                this.temp_grid[j][jj].thing = obj;
            }
            for (var n = 0; n < data.max['Exit']; n++) {
                var j = get_random_int(0, data.width_i - 3);
                var jj = get_random_int(0, data.width_ii - 3);
                var choose = Math.round(Math.random());
                if (choose == 0) {
                    var j = j;
                    var jj = ((data.width_ii - 1) * (Math.round(Math.random())));
                }
                else if (choose == 1) {
                    var j = ((data.width_i - 1) * (Math.round(Math.random())));
                    var jj = jj;
                }
                var obj = new Exit(j, jj);
                //want to push whole object so that it keeps track of the end
                data.exit_locations.push(obj);

                for (var p = 0; p < obj.profile_i.length; p++) { //placing exits on the grid
                    var dj = obj.profile_i[p];
                    var djj = obj.profile_ii[p];
                    var safej = data.get_bounded_index_i(j + dj);
                    var safejj = data.get_bounded_index_ii(jj + djj);

                    this.temp_grid[safej][safejj].thing = obj;
                }
            }
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
        var num_children = 0;
        var times_not_placed = 0;
        while (num_children < data.max['Child']) {
          if (times_not_placed>(data.width_i*data.width_ii)){ //not sure what is a good number, have it at 1000 right now, changed to area
            window.alert("Cannot place this many children on the grid, please reset and choose another number");
            break;
        }
        var j = get_random_int(0, data.width_i);
        var jj = get_random_int(0, data.width_ii);
            //added this in as part of exit distances
            exit_distances = [];
            //randomly getting a specific exit cell goal
            var rand_x = get_random_int(0, 3);
            var rand_y = get_random_int(0, 3);
            for (var exit = 0; exit < data.exit_locations.length; exit++) {
                var exiti = data.exit_locations[exit].anchor_i;
                var exitii = data.exit_locations[exit].anchor_ii;
                var local_endi = data.exit_locations[exit].profile_i[3] + data.exit_locations[exit].anchor_i;
                var local_endii = data.exit_locations[exit].profile_ii[3] + data.exit_locations[exit].anchor_ii;
                var current_distance = calc_distance(j, jj, exiti, exitii) //should calculate to goal?
                var local_goali = data.exit_locations[exit].profile_i[rand_x] + data.exit_locations[exit].anchor_i;
                var local_goalii = data.exit_locations[exit].profile_ii[rand_y] + data.exit_locations[exit].anchor_ii;
                var list = [current_distance, exiti, exitii, local_endi, local_endii, local_goali, local_goalii] //keeping track of the beginning and end of exit
                exit_distances.push(list)
            }
            // console.log(exit_distances)
            var min_exit_distance = exit_distances[0][0]; 
            var min_exiti = exit_distances[0][1];
            var min_exitii = exit_distances[0][2];
            var min_endi = exit_distances[0][3];
            var min_endii = exit_distances[0][4];
            var goali = exit_distances[0][5];
            var goalii = exit_distances[0][6];

            for (var exit = 0; exit < exit_distances.length; exit++) {
                if (exit_distances[exit][0] < min_exit_distance) {
                    //change if needed
                    min_exit_distance = exit_distances[exit][0];
                    min_exiti = exit_distances[exit][1];
                    min_exitii = exit_distances[exit][2];
                    min_endi = exit_distances[exit][3];
                    min_endii = exit_distances[exit][4];
                    goali = exit_distances[exit][5];
                    goalii = exit_distances[exit][6];
                }
            }

            var objChild = new Child(j, jj);
            // console.log(objChild)
            objChild.min_exiti = min_exiti;
            objChild.min_exitii = min_exitii;
            objChild.endi = min_endi;
            objChild.endii = min_endii;
            objChild.goali = goali;
            objChild.goalii = goalii;

            var obstacle = 0;
            for (var p = 0; p < objChild.profile_i.length; p++) { //
                var dj = objChild.profile_i[p];
                var djj = objChild.profile_ii[p];
                var safej = data.get_bounded_index_i(j + dj);
                var safejj = data.get_bounded_index_ii(jj + djj);
                if (this.temp_grid[safej][safejj].has_other_thing(objChild)) { //should be somewhere
                    obstacle++;
                    //do not place
                }
            }
            if (obstacle == 0) {//if can place
                for (var p = 0; p < objChild.profile_i.length; p++) { //
                    var dj = objChild.profile_i[p];
                    var djj = objChild.profile_ii[p];
                    var safej = data.get_bounded_index_i(j + dj);
                    var safejj = data.get_bounded_index_ii(jj + djj);
                    this.temp_grid[safej][safejj].thing = objChild; 
                }
                this.population.push([objChild, 'Child']);
                // console.log(this.population)
                num_children++;
                times_not_placed = 0;
            }
            else{
              times_not_placed++;
          }
      }
        // console.log(min_exit_distance)
        // console.log(min_exiti)
        // console.log(min_exitii)
        var num_adultbackpack = 0;
        var times_not_placed_backpack = 0;
        while (num_adultbackpack < data.max['AdultBackpack']) {
          if (times_not_placed_backpack>1000){ //not sure what is a good number, have it at 1000 right now
            window.alert("Cannot place this many adults with a backpack on the grid, please reset and choose another number");
            break;
        }
        var j = get_random_int(0, data.width_i)
        var jj = get_random_int(0, data.width_ii)
            //added this in as part of exit distances
            exit_distances = [];
            //randomly getting a specific exit cell goal
            var rand_x = get_random_int(0, 3);
            var rand_y = get_random_int(0, 3);
            for (var exit = 0; exit < data.exit_locations.length; exit++) {
                var exiti = data.exit_locations[exit].anchor_i;
                var exitii = data.exit_locations[exit].anchor_ii;
                var local_endi = data.exit_locations[exit].profile_i[3] + data.exit_locations[exit].anchor_i;
                var local_endii = data.exit_locations[exit].profile_ii[3] + data.exit_locations[exit].anchor_ii;
                var local_goali = data.exit_locations[exit].profile_i[rand_x] + data.exit_locations[exit].anchor_i;
                var local_goalii = data.exit_locations[exit].profile_ii[rand_y] + data.exit_locations[exit].anchor_ii;
                var current_distance = calc_distance(j, jj, exiti, exitii)
                var list = [current_distance, exiti, exitii, local_endi, local_endii, local_goali, local_goalii]; //keeping track of the beginning and end of exit
                exit_distances.push(list)
            }
            // console.log(exit_distances)
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
            for (var exit = 0; exit < exit_distances.length; exit++) {
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
            var obj = new AdultBackpack(j, jj);
            obj.min_exiti = min_exiti;
            obj.min_exitii = min_exitii;
            obj.endi = min_endi;
            obj.endii = min_endii;
            obj.goali = goali;
            obj.goalii = goalii;

            var obstacle = 0;
            for (var p = 0; p < obj.profile_i.length; p++) { //
                var dj = obj.profile_i[p];
                var djj = obj.profile_ii[p];
                var safej = data.get_bounded_index_i(j + dj);
                var safejj = data.get_bounded_index_ii(jj + djj);
                if (this.temp_grid[safej][safejj].has_other_thing(obj)) { //should be somewhere
                    obstacle++;
                    //do not place
                }
            }
            if (obstacle == 0) {
                for (var p = 0; p < obj.profile_i.length; p++) { //
                    var dj = obj.profile_i[p];
                    var djj = obj.profile_ii[p];
                    var safej = data.get_bounded_index_i(j + dj);
                    var safejj = data.get_bounded_index_ii(jj + djj);
                    this.temp_grid[safej][safejj].thing = obj; //need to fix to always have correct number on floor
                }
                this.population.push([obj, 'AdultBackpack']);
                // console.log(this.population)
                num_adultbackpack++;
                times_not_placed_backpack = 0;
            }
            else{
              times_not_placed_backpack++;
          }
      }
      var num_adult = 0;
      times_not_placed_adult = 0;
      while (num_adult < data.max['Adult']) {
          if (times_not_placed_adult>1000){ //not sure what is a good number, have it at 1000 right now
            window.alert("Cannot place this many adults with a backpack on the grid, please reset and choose another number");
            break;
        }
        var j = get_random_int(0, data.width_i - 1)
        var jj = get_random_int(0, data.width_ii - 1)
            //added this in as part of exit distances
            exit_distances = [];
            //randomly getting a specific exit cell goal
            var rand_x = get_random_int(0, 3);
            var rand_y = get_random_int(0, 3);
            for (var exit = 0; exit < data.exit_locations.length; exit++) {
                var exiti = data.exit_locations[exit].anchor_i;
                var exitii = data.exit_locations[exit].anchor_ii;
                var local_endi = data.exit_locations[exit].profile_i[3] + data.exit_locations[exit].anchor_i;
                var local_endii = data.exit_locations[exit].profile_ii[3] + data.exit_locations[exit].anchor_ii;
                var current_distance = calc_distance(j, jj, exiti, exitii)
                var local_goali = data.exit_locations[exit].profile_i[rand_x] + data.exit_locations[exit].anchor_i;
                var local_goalii = data.exit_locations[exit].profile_ii[rand_y] + data.exit_locations[exit].anchor_ii;
                var list = [current_distance, exiti, exitii, local_endi, local_endii, local_goali, local_goalii]; //keeping track of the beginning and end of exit
                exit_distances.push(list)
            }
            // console.log(exit_distances)
            var min_exit_distance = exit_distances[0][0];
            var min_exiti = exit_distances[0][1];
            var min_exitii = exit_distances[0][2];
            var min_endi = exit_distances[0][3];
            var min_endii = exit_distances[0][4];
            var goali = exit_distances[0][5];
            var goalii = exit_distances[0][6];

            for (var exit = 0; exit < exit_distances.length; exit++) {
                if (exit_distances[exit][0] < min_exit_distance) {
                    //change if needed
                    min_exit_distance = exit_distances[exit][0];
                    min_exiti = exit_distances[exit][1];
                    min_exitii = exit_distances[exit][2];
                    min_endi = exit_distances[exit][3];
                    min_endii = exit_distances[exit][4];
                    goali = exit_distances[exit][5];
                    goalii = exit_distances[exit][6];
                }
            }

            var objAdult = new Adult(j, jj);
            objAdult.min_exiti = min_exiti;
            objAdult.min_exitii = min_exitii;
            objAdult.endi = min_endi;
            objAdult.endii = min_endii;
            objAdult.goali = goali;
            objAdult.goalii = goalii;

            //check if valid place to put adult
            var obstacle = 0;
            for (var p = 0; p < objAdult.profile_i.length; p++) { //
                var dj = objAdult.profile_i[p];
                var djj = objAdult.profile_ii[p];
                var safej = data.get_bounded_index_i(j + dj);
                var safejj = data.get_bounded_index_ii(jj + djj);
                if (this.temp_grid[safej][safejj].has_other_thing(objAdult)) { //should be somewhere
                    obstacle++;
                    //do not place
                }
            }
            if (obstacle == 0) {
                for (var p = 0; p < objAdult.profile_i.length; p++) { //
                    var dj = objAdult.profile_i[p];
                    var djj = objAdult.profile_ii[p];
                    var safej = data.get_bounded_index_i(j + dj);
                    var safejj = data.get_bounded_index_ii(jj + djj);
                    this.temp_grid[safej][safejj].thing = objAdult;
                }
                this.population.push([objAdult, "Adult"]);
                num_adult++;
                times_not_placed_adult = 0;
            }
            else{
              times_not_placed_adult++;
          }
      }

      var num_bike = 0;
      times_not_placed_bike = 0;
      while (num_bike < data.max['AdultBike']) {
          if (times_not_placed_bike>1000){ //not sure what is a good number, have it at 1000 right now
            window.alert("Cannot place this many children on the grid, please reset and choose another number");
            break;
        }
        var j = get_random_int(0, data.width_i-3);
        var jj = get_random_int(3, data.width_ii-2);
            //added this in as part of exit distances
            exit_distances = [];
            //randomly getting a specific exit cell goal
            var rand_x = get_random_int(0, 3);
            var rand_y = get_random_int(0, 3);
            for (var exit = 0; exit < data.exit_locations.length; exit++) {
                var exiti = data.exit_locations[exit].anchor_i;
                var exitii = data.exit_locations[exit].anchor_ii;
                var local_endi = data.exit_locations[exit].profile_i[3] + data.exit_locations[exit].anchor_i;
                var local_endii = data.exit_locations[exit].profile_ii[3] + data.exit_locations[exit].anchor_ii;
                var local_goali = data.exit_locations[exit].profile_i[rand_x] + data.exit_locations[exit].anchor_i;
                var local_goalii = data.exit_locations[exit].profile_ii[rand_y] + data.exit_locations[exit].anchor_ii;
                var current_distance = calc_distance(j, jj, exiti, exitii) //change?
                var list = [current_distance, exiti, exitii, local_endi, local_endii, local_goali, local_goalii]; //keeping track of the beginning and end of exit
                exit_distances.push(list)
            }
            // console.log(exit_distances)
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
            for (var exit = 0; exit < exit_distances.length; exit++) {
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
            var obj = new AdultBike(j, jj);
            obj.min_exiti = min_exiti;
            obj.min_exitii = min_exitii;
            obj.endi = min_endi;
            obj.endii = min_endii;
            obj.goali = goali;
            obj.goalii = goalii;

            var obstacle = 0;
            for (var p = 0; p < obj.profile_i.length; p++) { //
                var dj = obj.profile_i[p];
                var djj = obj.profile_ii[p];
                var safej = data.get_bounded_index_i(j + dj);
                var safejj = data.get_bounded_index_ii(jj + djj);
                if (this.temp_grid[safej][safejj].has_other_thing(obj)) { //should be somewhere
                    obstacle++;
                    //do not place
                }
            }
            if (obstacle == 0) {
                for (var p = 0; p < obj.profile_i.length; p++) { //
                    var dj = obj.profile_i[p];
                    var djj = obj.profile_ii[p];
                    var safej = data.get_bounded_index_i(j + dj);
                    var safejj = data.get_bounded_index_ii(jj + djj);
                    this.temp_grid[safej][safejj].thing = obj; //need to fix to always have correct number on floor
                }
                this.population.push([obj, 'AdultBike']);
                // console.log(this.population)
                num_bike++;
                times_not_placed_bike = 0; //reeset because moving onto another person
            }
            else{
              times_not_placed_bike++;
          }
      }
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
        if (count > 0) { //if thee count is greateer that zeero, some part is touching the exit
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
                    if (!next.has_other_thing(thing)) { //if there is nothing in thee cell trying to move to
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
                                total_collisions = total_collisions + 1; //add one to the global collision counter
                                //adding collision counter to specific person types
                                if (thing.type == 'Child') { //if a child
                                    total_child_collisions = total_child_collisions + 1; //add one to the children collisions
                                }
                                else if (thing.type == 'Adult') { //if an adult
                                    total_adult_collisions = total_adult_collisions + 1; //add one to the number of adult collisions
                                }
                                else if (thing.type == 'AdultBackpack') { //if adult with backpack
                                    total_backpack_collisions = total_backpack_collisions + 1; //add one to the number of adult with backpack collisions
                                }
                                else if (thing.type == 'AdultBike') { //if adult with bike
                                    total_bike_collisions = total_bike_collisions + 1; //add one to the total number of adult with bike collisions
                                }
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
                        var new_exit = data.exit_locations[ran_exit_index]; //get the exit from the list of exits
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
                            var orientation = random_orientation(); //random orientation
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

function draw_grid(input) {
    if (data.hall_layout == true) {
        data.width_i = 50;
        data.width_ii = 75;
    }
    if (data.fuller_lower == true) {
        data.width_i = 56;
        data.width_ii = 45;
    }
    if (data.classroom == true) {
        data.width_i = 40;
        data.width_ii = 35;
    }

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
        if (this.thing instanceof Obstacle) {
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

function Exit(j, jj) {

    this.orientation = random_orientation();
    this.anchor_i = j;
    this.anchor_ii = jj;

    //think we need to check anchor instead of orientation
    //if anchor i is 0 or grid length -3 use 1st set of profiles (vertical exit)
    //else use second set (makes them horizontal)
    if ((this.anchor_i == 0) || (this.anchor_i == data.width_i - 1)) {
        this.profile_i = [0, 0, 0, 0];
        this.profile_ii = [0, 1, 2, 3];
    } else {
        this.profile_i = [0, 1, 2, 3];
        this.profile_ii = [0, 0, 0, 0];
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

function Obstacle(j, jj) {
    this.orientation = random_orientation();
    this.anchor_i = j
    this.anchor_ii = jj

    this.profile_i = [0];
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

function Child(j, jj) {
    this.orientation = random_orientation();
    this.anchor_i = j
    this.anchor_ii = jj
    this.min_exiti = 0;
    this.min_exitii = 0;
    this.goali = 0; //initially
    this.goalii = 0; //initially
    this.endi = 0; //initially
    this.endii = 0; // initially
    this.profile_i = [0];
    this.profile_ii = [0];
    this.wait = 0;
    this.stuck = 0;
    this.type = 'Child';
    this.exittime = 0;
    this.waitsteps = 0;


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

function Adult(j, jj) {
    this.orientation = random_orientation();
    this.anchor_i = j
    this.anchor_ii = jj
    this.min_exiti = 0;
    this.min_exitii = 0;
    this.goali = 0; //initially
    this.goalii = 0; //initially
    this.endi = 0; //initially
    this.endii = 0; // initially
    this.wait = 0;
    // my projection
    this.profile_i = [1, 0]
    this.profile_ii = [0, 0]
    this.type = 'Adult';
    this.exittime = 0;
    this.waitsteps = 0;


    this.stuck = 0;

    this.color = function() {
        if (this.stuck == 0) {
            //            return "rgb(255,165,0)";
            return "rgb(0,0,255)";
        } else {
            return "rgb(255,0,0)";
        }
    }

    this.place_footprint = function(state) {
        for (var p = 0; p < this.profile_i.length; p++) { //
            var dj = this.profile_i[p];
            var djj = this.profile_ii[p];
            var safej = data.get_bounded_index_i(this.anchor_i + dj);
            var safejj = data.get_bounded_index_ii(this.anchor_ii + djj);
            state.temp_grid[safej][safejj].thing = this;
        }
    }

    this.remove_footprint = function(state) {
        for (var p = 0; p < this.profile_i.length; p++) { //
            var dj = this.profile_i[p];
            var djj = this.profile_ii[p];
            var safei = data.get_bounded_index_i(this.anchor_i + dj);
            var safeii = data.get_bounded_index_ii(this.anchor_ii + djj);
            state.temp_grid[safei][safeii].thing = null;
        }
    }
}

function AdultBackpack(j, jj) {
    this.orientation = random_orientation();
    this.anchor_i = j
    this.anchor_ii = jj
    this.min_exiti = 0;
    this.min_exitii = 0;
    this.goali = 0; //initially
    this.goalii = 0; //initially
    this.endi = 0; //initially
    this.endii = 0;
    this.wait = 0;
    // my projection
    this.profile_i = [0, 0, 1, 1];
    this.profile_ii = [0, 1, 0, 1];
    this.type = 'AdultBackpack';
    this.exittime = 0;
    this.waitsteps = 0;


    this.color = function() {
        return "rgb(0,128,0)";
    }

    this.place_footprint = function(state) {
        for (var p = 0; p < this.profile_i.length; p++) { //
            var dj = this.profile_i[p];
            var djj = this.profile_ii[p];
            var safej = data.get_bounded_index_i(this.anchor_i + dj);
            var safejj = data.get_bounded_index_ii(this.anchor_ii + djj);
            state.temp_grid[safej][safejj].thing = this;
        }
    }

    this.remove_footprint = function(state) {
        for (var p = 0; p < this.profile_i.length; p++) { //
            var dj = this.profile_i[p];
            var djj = this.profile_ii[p];
            var safei = data.get_bounded_index_i(this.anchor_i + dj);
            var safeii = data.get_bounded_index_ii(this.anchor_ii + djj);
            state.temp_grid[safei][safeii].thing = null;
        }
    }

}

function AdultBike(j, jj) {
    this.orientation = random_orientation();
    this.anchor_i = j
    this.anchor_ii = jj
    this.min_exiti = 0;
    this.min_exitii = 0;
    this.goali = 0; //initially
    this.goalii = 0; //initially
    this.endi = 0; //initially
    this.endii = 0;
    this.wait = 0;
    this.exittime = 0;
    this.waitsteps = 0;

    // my projection
    this.profile_i = [0, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3];
    this.profile_ii = [0, 0, 2, 1, 0, -1, -2, -3, 2, 1, 0, -1, -2, -3];
    this.type = 'AdultBike';


    this.color = function() {
        return "rgb(220,20,60)";
    }

    this.place_footprint = function(state) {
        for (var p = 0; p < this.profile_i.length; p++) { //
            var dj = this.profile_i[p];
            var djj = this.profile_ii[p];
            var safej = data.get_bounded_index_i(this.anchor_i + dj);
            var safejj = data.get_bounded_index_ii(this.anchor_ii + djj);
            state.temp_grid[safej][safejj].thing = this;
        }
    }

    this.remove_footprint = function(state) {
        for (var p = 0; p < this.profile_i.length; p++) { //
            var dj = this.profile_i[p];
            var djj = this.profile_ii[p];
            var safei = data.get_bounded_index_i(this.anchor_i + dj);
            var safeii = data.get_bounded_index_ii(this.anchor_ii + djj);
            state.temp_grid[safei][safeii].thing = null;
        }
    }
}

function random_orientation() {
    var r = Math.random() * 8;

    if (r < 1) {
        return data.LEFT;
    } else if (r < 2) {
        return data.UP;
    } else if (r < 3) {
        return data.RIGHT;
    } else if (r < 4) {
        return data.DOWN
    } else if (r < 5) {
        return data.diagDownRight;
    } else if (r < 6) {
        return data.diagUpRight;
    } else if (r < 7) {
        return data.diagDownLeft;
    } else {
        return data.diagUpLeft;
    }
}

function calc_distance(i, ii, j, jj) {
    return Math.pow(Math.pow(Math.abs(i - j), 2) + Math.pow(Math.abs(ii - jj), 2), 0.5);
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
    if ((data.hall_layout == true) || (data.fuller_lower == true) || (data.classroom == true)) {
        state.place_things(false);
    } else {
        state.place_things(true);
    }

    draw_grid(state.grid.map(function(row) {
        return row.map(function(cell) {
            return cell;
        });
    }));
}
var end_sim_counter = 0;
function end_simulation() {
    end_sim_counter = end_sim_counter + 1;
    clearInterval(interval_id);
}

function clear_simulation() {
    window.location.reload()
}

function start_simulation() {
    initialize_simulation();
    interval_id = setInterval(simulate_and_visualize, data.ms_between_updates);
}
// var _indexCounter = 0;
// var encoder = function() {return;};
// var context_list = [];
// var encoder = function() {return;}
// function GIF() {
//     console.log('i called gif()')
//     const encoder = GIFEncoder();
// }
// var encoder = GIFEncoder();
take_snapshot_calls = 0;
    function simulate_and_visualize() {
    state.move_things();
    draw_grid(state.grid.map(function(row) {
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

        // if(take_snapshot_calls = 0) {
        //     encoder.start();

        //     // encoder.addFrame(context)
        //     take_snapshot_calls = take_snapshot_calls + 1;
        // }
        // else {
        //     encoder.setProperties(true,true)
        // }
        // encoder.addFrame(context)
        // if(current_population == 0) {
        //     encoder.finish();
        //     encoder.download("download.gif","image/gif");
        // }
        // encoder.finish();
        // encoder.download("download.gif","image/gif");

        // var canvas = document.getElementById('grid');
        // for (var i=0; i<____; i++) {
            // var canvas = document.getElementById('grid');
            // var context = canvas.getContext('2d');
            // context_list.push(context)
        }

    }

    // export JUST what we want to
    exports.start_simulation = start_simulation;
    exports.end_simulation = end_simulation;
    exports.clear_simulation = clear_simulation;

})(typeof exports === 'undefined'?
            this['final']={}: exports);

