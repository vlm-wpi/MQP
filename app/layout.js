/**
 * Layout
 *
 * Issues regarding fixed layouts and chanches in the future to extend.
 * 

    data.width_i = 150; 
    data.width_ii = 150;

    awkward that this refers to data.max['Obstacle'] to find how many to place
    

 */

(function(layout) {

    function Obstacle(j, jj) {
	this.orientation = data.random_orientation();
	this.anchor_i = j
	this.anchor_ii = jj
	this.code = 'x';
	this.type = 'Obstacle';
	
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

    function Exit(j, jj, orientation ) {  /* pass in TRUE for VERTICAL. */
	
	this.orientation = data.random_orientation();
	this.anchor_i = j;
	this.anchor_ii = jj;
	this.code = '@';
	this.type = 'Exit';

	//think we need to check anchor instead of orientation
	//if anchor i is 0 or grid length -3 use 1st set of profiles (vertical exit)
	//else use second set (makes them horizontal)
	if (orientation) {
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

    function Randomized(i, ii) { /** widths. */
	this.width_i = i;
	this.width_ii = ii;
	this.exit_locations = [];
	this.obstacles = [];

	this.initialize = function(temp_grid) {
            for (var n = 0; n < data.max['Obstacle']; n++) {
                var j = random.nextInt(this.width_i)
                var jj = random.nextInt(this.width_ii)

                var obj = new Obstacle(j, jj);
		        this.obstacles.push(obj);
                temp_grid[j][jj].thing = obj;
            }

            for (var n = 0; n < data.max['Exit']; n++) {
                var j = random.nextIntBetween(0, this.width_i - 3);
                var jj = random.nextIntBetween(0, this.width_ii - 3);
                var choose = Math.round(random.next());
                if (choose == 0) {
                    var j = j;
                    var jj = (this.width_ii - 1) * Math.round(random.next());
                }
                else if (choose == 1) {
                    var j = (this.width_i - 1) * (Math.round(random.next()));
                    var jj = jj;
                }
                var obj = new Exit(j, jj);
                //cannot use orientation for random exit, need to check j and jj
                 if ((obj.anchor_i == 0) || (obj.anchor_i == this.width_i - 1)) {
                    obj.profile_i = [0, 0, 0, 0];
                    obj.profile_ii = [0, 1, 2, 3]; //vertical exit
                } else {
                    obj.profile_i = [0, 1, 2, 3];
                    obj.profile_ii = [0, 0, 0, 0]; //horizontal exit
                }
                //want to push whole object so that it keeps track of the end
                this.exit_locations.push(obj);
                for (var p = 0; p < obj.profile_i.length; p++) { //placing exits on the grid
                    var dj = obj.profile_i[p];
                    var djj = obj.profile_ii[p];
                    var safej = data.get_bounded_index_i(j + dj);
                    var safejj = data.get_bounded_index_ii(jj + djj);

                    temp_grid[safej][safejj].thing = obj;
                }
            }
	}
    }

    function Classroom (i, ii) {
	this.width_i = 40;
	this.width_ii = 35;
	this.exit_locations = [];
	this.obstacles = [];
    data.max['Exit'] = 1;


	this.initialize = function(temp_grid) {
            //podium at front of classroom
            for (var col = 34; col < 38; col++) {
                for (var row = 3; row < 6; row++) {
                    var obj = new Obstacle(col, row);
                    temp_grid[col][row].thing = obj;
                }
            }
            //desks
            for (var col0 = 0; col0 < data.width_i-1; col0+=5) {
                for (var row0 = 8; row0 < data.width_ii-1; row0+=6) {
                    for (var col = col0; col < col0+3; col++) {
                        for (var row = row0; row < row0+3; row++) {
                            var obj = new Obstacle(col, row);
                            temp_grid[col][row].thing = obj;
                        }
                    }
                }
            }

            var obj01 = new Exit(0, 0)
            this.exit_locations.push(obj01)
            for (var p = 0; p < obj01.profile_i.length; p++) {
                var dj = obj01.profile_i[p];
                var djj = obj01.profile_ii[p];
                var safej = data.get_bounded_index_i(0 + dj);
                var safejj = data.get_bounded_index_ii(0 + djj);
                temp_grid[safej][safejj].thing = obj01;
            }
	}

    }

    function LectureHall (i, ii) {
	this.width_i = 50;
	this.width_ii = 75;
	this.exit_locations = [];
	this.obstacles = [];

	this.initialize = function(temp_grid) {
	  var fs = require("fs");
    var text = fs.readFileSync("LectureHall");
    var textByLine = text.split("\n");
    console.log(textByLine);
	  
            //first quarter of the room
            for (var col = 0; col < 10; col++) { //leaving row space for people
                for (var row = 0; row < 30; row += 2) { //columns, next to each other
                    var obj = new Obstacle(col + 10, row + 10); //offsetting by 2,3
                    temp_grid[col + 10][row + 10].thing = obj;
                }
            }
            //second quarter of the room, double row space after first quarter
            for (var col = 0; col < 10; col++) { //leaving row space for people
                for (var row = 0; row < 30; row += 2) { //columns, next to each other
                    var obj = new Obstacle(col + 10, row + 42); //offsetting by 2,32
                    temp_grid[col + 10][row + 42].thing = obj;
                }
            }
            //third quarter of room
            for (var col = 0; col < 10; col++) { //leaving row space for people
                for (var row = 0; row < 30; row += 2) { //columns, next to each other
                    var obj = new Obstacle(col + 27, row + 10); //offsetting by 14,3
                    temp_grid[col + 27][row + 10].thing = obj;
                }
            }
            //fourth quarter of the room
            for (var col = 0; col < 10; col++) { //leaving row space for people
                for (var row = 0; row < 30; row += 2) { //columns, next t0 each other
                    var obj = new Obstacle(col + 27, row + 42); //offsetting by 14,32
                    temp_grid[col + 27][row + 42].thing = obj;
                }
            }

            var obj1 = new Exit(0, 0, false); //should probably make coordinates variables
            this.exit_locations.push(obj1);
            for (var p = 0; p < obj1.profile_i.length; p++) { //placing exits on the grid
                var dj = obj1.profile_i[p];
                var djj = obj1.profile_ii[p];
                var safej = data.get_bounded_index_i(0 + dj);
                var safejj = data.get_bounded_index_ii(0 + djj);

                temp_grid[safej][safejj].thing = obj1;
            }

            var obj2 = new Exit(data.width_i - 4, 0, false);
            // console.log(obj2)
            this.exit_locations.push(obj2);
            for (var p = 0; p < obj2.profile_i.length; p++) { //placing exits on the grid
                var dj = obj2.profile_i[p];
                var djj = obj2.profile_ii[p];
                var safej = data.get_bounded_index_i(data.width_i - 4 + dj);
                var safejj = data.get_bounded_index_ii(0 + djj);
		
                temp_grid[safej][safejj].thing = obj2;
            }

            var obj3 = new Exit(1, data.width_ii - 1, true);
            this.exit_locations.push(obj3);
            for (var p = 0; p < obj3.profile_i.length; p++) { //placing exits on the grid
                var dj = obj3.profile_i[p];
                var djj = obj3.profile_ii[p];
                var safej = data.get_bounded_index_i(1 + dj);
                var safejj = data.get_bounded_index_ii(data.width_ii - 1 + djj);

                temp_grid[safej][safejj].thing = obj3;
            }
            var obj4 = new Exit(data.width_i - 4, data.width_ii - 1);
            this.exit_locations.push(obj4);
            for (var p = 0; p < obj4.profile_i.length; p++) { //placing exits on the grid
                var dj = obj4.profile_i[p];
                var djj = obj4.profile_ii[p];
                var safej = data.get_bounded_index_i(data.width_i - 4 + dj);
                var safejj = data.get_bounded_index_ii(data.width_ii - 1 + djj);

                temp_grid[safej][safejj].thing = obj4;
            }
	}
    }

    function FullerLower() {
        this.width_i = 56;
        this.width_ii = 45;
	this.exit_locations = [];
	this.obstacles = [];
    
	this.initialize = function(temp_grid) {
            //first set of seats at the back of the room (left)
            for (var col = 6; col < 26; col++) {
		for (var row = 0; row < 2; row++) {
                    var obj = new Obstacle(col, row);
                    temp_grid[col][row].thing = obj;
		}
            }
	    
            //first set of seats at the back of the room (right)
            for (var col = 29; col < 50; col++) {
		for (var row = 0; row < 2; row++) {
                    var obj = new Obstacle(col, row);
                    temp_grid[col][row].thing = obj;
		}
            }
            //second row of seats from the back (left)
            for (var col = 10; col < 22; col++) {
		for (var row = 4; row < 6; row++) {
                    var obj = new Obstacle(col, row);
                    temp_grid[col][row].thing = obj;
		}
            }
            //second row of seats from the back (right)
            for (var col = 33; col < 46; col++) {
		for (var row = 4; row < 6; row++) {
                    var obj = new Obstacle(col, row);
                    temp_grid[col][row].thing = obj;
		}
            }
            //third row of seats from the back (left)
            for (var col = 8; col < 24; col++) {
		for (var row = 9; row < 11; row++) {
                    var obj = new Obstacle(col, row);
                    temp_grid[col][row].thing = obj;
		}
            }
            //third row of seats from the back (right)
            for (var col = 31; col < 48; col++) {
		for (var row = 9; row < 11; row++) {
                    var obj = new Obstacle(col, row);
                    temp_grid[col][row].thing = obj;
		}
            }
            //fourth row of seats from the back (left)
            for (var col = 8; col < 24; col++) {
		for (var row = 13; row < 15; row++) {
                    var obj = new Obstacle(col, row);
                    temp_grid[col][row].thing = obj;
		}
            }
            //fourth row of seats from the back (right)
            for (var col = 31; col < 48; col++) {
		for (var row = 13; row < 15; row++) {
                    var obj = new Obstacle(col, row);
                    temp_grid[col][row].thing = obj;
		}
            }
            //fifth row of seats from the back (left)
            for (var col = 9; col < 23; col++) {
		for (var row = 17; row < 19; row++) {
                    var obj = new Obstacle(col, row);
                    temp_grid[col][row].thing = obj;
		}
            }
            //fifth row of seats from the back (right)
            for (var col = 32; col < 47; col++) {
		for (var row = 17; row < 19; row++) {
                    var obj = new Obstacle(col, row);
		    temp_grid[col][row].thing = obj;
		}
            }
            //sixth row of seats from the back (left)
            for (var col = 9; col < 23; col++) {
		for (var row = 21; row < 23; row++) {
                    var obj = new Obstacle(col, row);
                    temp_grid[col][row].thing = obj;
		}
            }
            //sixth row of seats from the back (right)
            for (var col = 32; col < 47; col++) {
		for (var row = 21; row < 23; row++) {
                    var obj = new Obstacle(col, row);
                    temp_grid[col][row].thing = obj;
		}
            }
            //seventh row from back (railing at front - left)
            for (var col = 9; col < 23; col++) {
		for (var row = 25; row < 26; row++) {
                    var obj = new Obstacle(col, row);
                    temp_grid[col][row].thing = obj;
		}
            }
            //side railing front left
            for (var col = 9; col < 10; col++) {
		for (var row = 26; row < 28; row++) {
                    var obj = new Obstacle(col, row);
                    temp_grid[col][row].thing = obj;
		}
            }
            //seventh row from back (railing at front - right)
            for (var col = 32; col < 47; col++) {
		for (var row = 25; row < 26; row++) {
                    var obj = new Obstacle(col, row);
                    temp_grid[col][row].thing = obj;
		}
            }
            //side railing front right
            for (var col = 46; col < 47; col++) {
		for (var row = 26; row < 28; row++) {
                    var obj = new Obstacle(col, row);
                    temp_grid[col][row].thing = obj;
		}
            }
            //podium front right
            for (var col = 38; col < 42; col++) {
		for (var row = 35; row < 38; row++) {
                    var obj = new Obstacle(col, row);
                    temp_grid[col][row].thing = obj;
		}
            }
            //railing down the middle (top)
            for (var col = 27; col < 28; col++) {
		for (var row = 2; row < 7; row++) {
                    var obj = new Obstacle(col, row);
                    temp_grid[col][row].thing = obj;
		}
            }
            //railing down the middle (bottom)
            for (var col = 27; col < 28; col++) {
		for (var row = 10; row < 26; row++) {
                    var obj = new Obstacle(col, row);
                    temp_grid[col][row].thing = obj;
		}
            }
	    
            //first exit in the top left
            var obj01 = new Exit(1, 0, false);
            this.exit_locations.push(obj01);
            for (var p = 0; p < obj01.profile_i.length; p++) {
		var dj = obj01.profile_i[p];
		var djj = obj01.profile_ii[p];
		var safej = data.get_bounded_index_i(1 + dj);
		var safejj = data.get_bounded_index_ii(0 + djj);
		temp_grid[safej][safejj].thing = obj01;
            }
	    
            //second exit in the top right
            var obj02 = new Exit(data.width_i - 4, 0, false);
            this.exit_locations.push(obj02);
            for (var p = 0; p < obj02.profile_i.length; p++) {
		var dj = obj02.profile_i[p];
		var djj = obj02.profile_ii[p];
		var safej = data.get_bounded_index_i(this.width_i - 4 + dj);
		var safejj = data.get_bounded_index_ii(0 + djj);
		temp_grid[safej][safejj].thing = obj02;
            }
	    
            //third exit bottom left
            var obj03 = new Exit(0, data.width_ii - 9, true);
            this.exit_locations.push(obj03);
            for (var p = 0; p < obj03.profile_i.length; p++) {
		var dj = obj03.profile_i[p];
		var djj = obj03.profile_ii[p];
		var safej = data.get_bounded_index_i(0 + dj);
		var safejj = data.get_bounded_index_ii(this.width_ii - 9 + djj);
		temp_grid[safej][safejj].thing = obj03;
            }
	    
            //fourth exit bottom left
            var obj04 = new Exit(0, data.width_ii - 5, true);
            this.exit_locations.push(obj04);
            for (var p = 0; p < obj04.profile_i.length; p++) {
		var dj = obj04.profile_i[p];
		var djj = obj04.profile_ii[p];
		var safej = data.get_bounded_index_i(0 + dj);
		var safejj = data.get_bounded_index_ii(this.width_ii - 5 + djj);
		temp_grid[safej][safejj].thing = obj04;
            }
	    
            // console.log(data.exit_locations)
	}
    }

    function layouts() {
	return [
	    'Randomized',
	    'LectureHall',
	    'FullerLower',
	    'Classroom',

	    /** Add more here as you need. */
	];
    }

    function factory(tpe, widthi, widthii) {
	if (tpe == 'Randomized') {
	    return new Randomized(widthi, widthii);
	} else if (tpe == 'LectureHall') {
	    return new LectureHall(); 
	} else if (tpe == 'FullerLower') {
	    return new FullerLower();
	} else if (tpe == 'Classroom') {
	    return new Classroom();
	} else {
	    console.log("unknown type:" + tpe);
	    return None;
	}
    }

    /** Assumes data.exit_locations is already set. */
    function get_exit_information(board, j, jj) {
        //added this in as part of exit distances
        exit_distances = [];
        //randomly getting a specific exit cell goal
        var rand_x = random.nextInt(4);
        var rand_y = random.nextInt(4);
        for (var exit = 0; exit < board.exit_locations.length; exit++) {
            var exiti = board.exit_locations[exit].anchor_i;
            var exitii = board.exit_locations[exit].anchor_ii;
            var local_endi = board.exit_locations[exit].profile_i[3] + board.exit_locations[exit].anchor_i;
            var local_endii = board.exit_locations[exit].profile_ii[3] + board.exit_locations[exit].anchor_ii;
            var current_distance = data.calc_distance(j, jj, exiti, exitii) //should calculate to goal?
            var local_goali = board.exit_locations[exit].profile_i[rand_x] + board.exit_locations[exit].anchor_i;
            var local_goalii = board.exit_locations[exit].profile_ii[rand_y] + board.exit_locations[exit].anchor_ii;
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
    layout.layouts = layouts;
    layout.factory = factory;
    layout.get_exit_information = get_exit_information;
    layout.Obstacle = Obstacle;

})(typeof layout === 'undefined'?
            this['layout']={}: layout);
