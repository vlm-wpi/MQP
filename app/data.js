/**
 * Data module
 *
 * All global variables are defined here.
 */

(function(data) {

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

    // GUI state from prior update
    data._data;

    //orientations for the directions a person can move (in degrees)
    data.UP = 180;
    data.DOWN = 90;
    data.LEFT = 270;
    data.RIGHT = 0;
    data.diagDownRight = 45;
    data.diagUpRight = 135;
    data.diagDownLeft = 225;
    data.diagUpLeft = 315;
    //list of these orientations
    data.orientations = [315, 270, 225, 180, 90, 135, 0, 45];
    
    //initial board confiigurations
    // width,height of the board, unless changed by input
    data.width_i = 150; 
    data.width_ii = 150;

    // prepare for all attributes...
    data.current = {};
    data.max = {};

    //number of children initially on board, can be changed by user input
    //counter for the number of children on the board, updates when a child reaches an exit
    data.max['Child'] = 25;
    data.current['Child'] = data.max['Child'];

    //number of adults initially on board, can be changed by user input
    //counter for the number of adults on the board, updates when an adult reaches an exit
    data.max['Adult'] = 25;
    data.current['Adult'] = data.max['Adult'];

    //number of adults with a backpack initially on board, can be changed by user input
    //counter for the number of adults w/ backpack on the board, updates when an adult w/ backpack reaches an exit
    data.max['AdultBackpack'] = 25; 
    data.current['AdultBackpack'] = data.max['AdultBackpack'];

    //number of adults with a bike initially on board, can be changed by user input
//counter for the number of adults w/ bike on the board, updates when an adult w/ bike reaches an exit
    data.max['AdultBike'] = 25;
    data.current['AdultBike'] = data.max['AdultBike']; 

    //number of oobstacles to place on the board, can be changed by user input
    data.max['Obstacle'] = 150; 

    // number of exits on grid, can be changed by user input
    data.max['Exit'] = 4;
    data.exit_locations = []; //might need to be global variable

    // number of milliseconds between a board update
    data.ms_between_updates = 1;

    // number of board updates a person is stuck before it tries to find another move
    data.wait_before_random_move = 5;

    //boolean used to tell if snapshots of the board are taken after every move, can be changed by user input
    data.take_snapshot = false; 

    //Initial board options: TODO: Better solution than bunch of booleans. Perhaps have
    // a specific new object for each one, and then have generic 'layout' to be set to that
    // or None if no layout...

    //boolean to check if the hall layout board is used, can be changed by user input
    data.hall_layout = false; 
    data.fuller_lower = false; //boolean used to check if the fuller lower board is used, can be changed by user input
    data.classroom = false; //boolean used to check if the classroom board is used, can be changed by user input

    //function that makes sure the given y coordinate is on the board, used for rounding boundary cases
    //takes in a y coordinate
    function get_bounded_index_ii(index) {
        var bounded_index_ii = index; //initially set the bounded inidex to the given y coordinate
        if (index < 0) { //if the y coordinate is less than zero, it is off the board
            bounded_index_ii = 0; //change the y value to zero so it is ono the board
        }
        if (index >= data.width_ii) { //if the y coordinate is greater than or equal to the height of the board, it is off the board
            bounded_index_ii = data.width_ii - 1; //change the y coordinate to one less than the height so it is on the board
        }
        return bounded_index_ii; //return the y coordinate, guarenteed to be on the board
    }

    // function that makes sure the given x coordinate is on the board, used for rounding boundary cases
    //takes in a x coordinate
    function get_bounded_index_i(index) { 
        var bounded_index_i = index; //initially set the bounded index to the given x coordinate
        if (index < 0) { //if the x coordinate is less than zero, it is off the board
            bounded_index_i = 0; //change the x value to zero so it is ono the board
        }
        if (index >= data.width_i) { //if the x coordinate is greater than or equal to the width of the board, it is off the board
            bounded_index_i = data.width_i - 1; //change the x coordinate to one less than the width so it is on the board
        }
        return bounded_index_i; //return the x coordinate, guarenteed to be on the board
    }
    
    //need this to because we have to use profile and not anchor
    //function that takes in a person, index, and orientation that the person is directed
    //returns new coordinates accordinating to the given orientation
    function get_coords_from_orientation_neighbors(thing, index, orient) {
        var i = thing.profile_i[index]; //x value of the current position
        var ii = thing.profile_ii[index]; //y value of the current position

        //8 diifferent orientations
        //Board y value decreases as going up. (0,0) is at the top left of the board
        if (orient == data.UP) { 
            return [i, ii - 1]; //if the orientation is up, subtract one from the y value
        } else if (orient == data.DOWN) {
            return [i, ii + 1]; //if orientation is down, add one to the y value
        } else if (orient == data.LEFT) {
            return [i - 1, ii]; //if orientation is left, subtract one from the x value
        } else if (orient == data.RIGHT) {
            return [i + 1, ii]; //if orientation is right, add one to x value
        } else if (orient == data.diagDownRight) {
            return [i + 1, ii + 1]; //if moving diagianally down to the right, add oone to both x and y value
        } else if (orient == data.diagUpRight) {
            return [i + 1, ii - 1]; //if moving diagonally up to the right, add one to x, subtract one to y
        } else if (orient == data.diagDownLeft) {
            return [i - 1, ii + 1]; //if moving diagonally down to the left, subtract one from x, add one to y
        } else {
            return [i - 1, ii - 1]; //else, moving diagonally up to the left, subtract one from x and y
        }
    }

    /** Assumes data.exit_locations is already set. */
    function get_exit_information(j, jj) {
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

	return [ min_exiti, min_exitii, min_endi, min_endii, goali, goalii];
    }


    // exported API
    data.get_bounded_index_i = get_bounded_index_i;
    data.get_bounded_index_ii = get_bounded_index_ii;
    data.get_coords_from_orientation_neighbors = get_coords_from_orientation_neighbors;
    data.get_exit_information = get_exit_information;

    data.random_orientation = random_orientation;
    data.calc_distance = calc_distance;

})(typeof data === 'undefined'?
            this['data']={}: data);
