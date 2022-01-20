/**
 * GUI module.
 *
 * export gui.headless = False to state to others that code is run with GUI. To run 
 *
 * in headless mode, simply put "global.gui.headless = True;"
 */
(function(exports) {

    /**
     * Acts upon GUI controls to update the global state.
     *
     * Note: in some cases, want to have *some* updates directly apply to simulation
     */
    //counters for warnings
    var num_checked = 0; //used to check if multiple board configurationos are checked at once
    var num_checked_h = 0; //used to check if multiple heuristics are checked at once
    
    // HOOK UP GUI ELEMENTS: BEGIN
    // -----------------------------------------------------
    // getting the number of children to put on the board, from user input
    var numChildren = document.getElementById("numChildren"); 
    numChildren.value = data.max['Child'];

    //function that evaluates the user input for number of children
    numChildren.oninput = function() { 
	//if the user input is greater than the area of the board
	if(this.value>(data.width_i*data.width_ii)){
	    window.alert("Cannot fit this many objects on the grid, please choose another number.");
	}
	//updating the initial number of children on the grid
	data.max['Child'] = this.value; 
	//updating the current number of children on the grid, should we update this somewhere else?
	data.current['Child'] = data.max['Child'];
    }

    //getting the number of adults to put on thee board from user input
    var numAdults = document.getElementById("numAdults");
    numAdults.value = data.max['Adult'];
    //function that evaluates the user input for number of adults to place oon the board
    numAdults.oninput = function() {
	//if the user input for the number of adults is greater than the area of the board
	if(this.value>(data.width_i*data.width_ii)/2){//divide by 2 because an adult takes up 2 spaces
            window.alert("Cannot fit this many objects on the grid, please choose another number.");
	}
	// updating the initial number of adults on the board
	// updating the current numbeer of adults on the board, should this be updated  somewhere else?
	data.max['Adult'] = this.value; 
	data.current['Adult'] = data.max['Adult'];
    }

    //getting the number of adults with backpacks to put on the board, from user input
    var numBackPacks = document.getElementById("numBackPacks");
    numBackPacks.value = data.max['AdultBackpack'];
    //function that evaluates the user input for the number of adults with backpacks
    numBackPacks.oninput = function() {
	//if the user input for the number of adults with a backpack is greater than the area of the board
	//divide by 4 because an adult takes up 4 places no the board
	if(this.value>(data.width_i*data.width_ii)/4){
            window.alert("Cannot fit this many adults with backpacks on the grid, please choose another number");
	}
	//updating the initial number of adults with a backpack on the grid
	data.max['AdultBackpack'] = this.value;
	//updating the current number of adults with a backpack on the board, should this be updated somewhere else?
	data.current['AdultBackpack'] = data.max['AdultBackpack'];
    }

    //getting the number of adults with bikes to put on the board, from user input
    var numBikes = document.getElementById("numBikes");
    numBikes.value = data.max['AdultBike'];
    //function that evaluates the user input for the number of adults with bikes
    numBikes.oninput = function() {
	//if the user input for the number of adults with a bike is greater than the area of the board
	//dividing by 14 because and adult with a bike takes up 14 spaces
	if(this.value>(data.width_i*data.width_ii)/14){
	    //make it floor?
	    window.alert("Cannot fit this many objects on the grid, please choose another number.");
	}
	//updating the initial number with adults with a bike on the grid
	data.max['AdultBike'] = this.value;
	//updating the current number of adults with a bike on the board, should this be updated somewhere else?
	data.current['AdultBike'] = data.max['AdultBike'];
    }

    //getting the update time from user input
    var ms_speed_slider = document.getElementById("ms_speed");
    ms_speed_slider.value = data.ms_between_updates; 
    //function that sets the update time
    ms_speed_slider.oninput = function() {
	//set the user input of the update time to the number of milliseconds between a board update
	data.ms_between_updates = this.value;
    }

    //getting the wait time from user input
    var wait_speed_slider = document.getElementById("wait_speed");
    wait_speed_slider.value = data.wait_before_random_move;
    //function that sets the wait time
    wait_speed_slider.oninput = function() {
	//updating the number of board updates a person is stuck before it tries to find another move from the user input
	data.wait_before_random_move = this.value;
    }
    
    //getting the grid width from user input
    var gridWidthi = document.getElementById("gridWidthi");
    gridWidthi.value = data.width_i;
    //function the set the grid width
    gridWidthi.oninput = function() {
	//updating the board width from the user input
	data.width_i = this.value;
    }

    //getting the height of the board from user input
    var gridWidthii = document.getElementById("gridWidthii");
    gridWidthii.value = data.width_ii;
    //function to set the grid height
    gridWidthii.oninput = function() {
	//updating th board height from the uder input
	data.width_ii = this.value;
    }

    //getting the number of exits from user input
    var numExits = document.getElementById("numExits");
    numExits.value = data.max['Exit'];
    //function that checks if the number of exits selected is valid
    numExits.oninput = function() {
	//if the number of exits is greater than the perimeter of the board
	//divide by 4? since the number of exits takes up 4 spaces
	if(this.value>((2*width_i)+(2*width_ii))) {
	    //make it floor?
	    window.alert("Cannot fit this many exits on the grid, please choose another number.");
	}
	//updating the number of exits on the grid
	data.max['Exit'] = this.value;
    }

    //getting the number of obstacles frooom user input
    var numObstacles = document.getElementById("numObstacles");
    numObstacles.value = data.max['Obstacle'];
    //function that checks of the number of obstacles is valid
    numObstacles.oninput = function() {
	//if the number of obstacles is greater than the the area of the board
	if(this.value>(width_i*width_ii)){
	    //make it floor?
	    window.alert("Cannot fit this many objects on the grid, please choose another number.");
	}
	//updating the number of obstacles on the board
	max_obstacles_on_grid = this.value;
    }

    //getting from user input if snapshots of the board will be taken
    var takeSnapshotCheckbox = document.getElementById("takeSnapshot");
    if (data.take_snapshot) {
	takeSnapshotCheckbox.checked = true;
    }
    takeSnapshotCheckbox.oninput = function() {
	//update the boolean value of take snapshot, used to deterrmine if snapshots of the board will be taken
	data.take_snapshot = takeSnapshotCheckbox.checked;
    }

    //getting from user input if the hall layput will be used
    var hallLayoutCheckbox = document.getElementById("hallLayout");
    if (data.hall_layout) {
	hallLayoutCheckbox.checked = true;
    }
    //function that updates the layout and makes sure it is the only one checked
    hallLayoutCheckbox.oninput = function() {
	//update the boolean value of the hall layout, used to determine if this layout will be used
	data.hall_layout = hallLayoutCheckbox.checked;
	if (data.hall_layout ==  true) { //if the hall loyout is checked
            num_checked = num_checked + 1; //add one to the number of layouts checked
            console.log("lecture hall " + num_checked)
            if(num_checked > 1) { //if there is more than one layout checked
		window.alert("Cannot have more than one layout selected.  Please choose one or less and try again.");
            }
	}
    }

    //getting from user input if the fuller lower layout will be used
    var fullerLowerCheckbox = document.getElementById("fullerLower");
    if (data.fuller_lower) {
	fullerLowerCheckbox.checked = true;
    }
    //function that updates the layout and makes sure it is the only one checked
    fullerLowerCheckbox.oninput = function() {
	//update the boolean value of the Fuller Lower layout, used to determine if this layout will be used
	data.fuller_lower = fullerLowerCheckbox.checked;
	if (data.fuller_lower ==  true) { //if the Fuller Lower loyout is checked
            num_checked = num_checked + 1; //add one to the number of layouts checked
            console.log("fuller lower " + num_checked)
            if(num_checked > 1) { //if there is more than one layout checked
		window.alert("Cannot have more than one layout selected.  Please choose one or less and try again.");
            }
	}
    }

    //getting from user input if the classroom layout will be used
    var classroomCheckbox = document.getElementById("classroom");
    if (classroom) {
	classroomCheckbox.checked = true;
    }
    //function that updates the layout and makes sure it is the only one checked
    classroomCheckbox.oninput = function() {
	//update the boolean value of the classroom layout, used to determine if this layout will be used
	classroom = classroomCheckbox.checked;
	if (classroom ==  true) { //if the classroom loyout is checked
            num_checked = num_checked + 1; //add one to the number of layouts checked
            console.log("classroom " + num_checked)
            if(num_checked > 1) { //if there is more than one layout checked
		window.alert("Cannot have more than one layout selected.  Please choose one or less and try again.");
            }
	}   
    }

    //getting from user input if the diagonal distance will be used on the heuristic
    var diagonalCheckbox = document.getElementById("diagonal");
    if (diagonal) {
	diagonalCheckbox.checked = true;
    }
    //function that updates the diagonal heuristic value and makes sure only one heuristic is checked
    diagonalCheckbox.oninput = function() {
	//update the boolean value of the diagonal, used to determine if the diagonal distance will be used
	diagonal = diagonalCheckbox.checked;
	if (diagonal ==  true) { //if the diagonal dostance is checked
            num_checked_h = num_checked_h + 1; //add one to the number of heuristics checked
            console.log("diagonal" + num_checked_h)
            if(num_checked_h > 1) { //if the number of heuristics checked is more than one, someway to change to make more accurate???
		window.alert("Cannot have more than one heuristic selected.  Please choose one and try again."); //popup window, too many heuristics checked
            }
	}
    }

    var manhattanCheckbox = document.getElementById("manhattan"); //getting from user input if the manhattan distance will be used as the heuristic
    if (manhattan) {
	manhattanCheckbox.checked = true;
    }
    //function that updates the manhattan heuristic value and makes sure only one heuristic is checked
    manhattanCheckbox.oninput = function() {
	//update the boolean value of manhattan, used to determine if the manhattan distance will be used 
	manhattan = manhattanCheckbox.checked;
	if (manhattan ==  true) { //if the manhattan dostance is checked
            num_checked_h = num_checked_h + 1; //add one to the number of heuristics checked
            console.log("manhattan" + num_checked_h)
            if(num_checked_h > 1) { //if the number of heuristics checked is more than one, someway to change to make more accurate???
		window.alert("Cannot have more than one heuristic selected.  Please choose one and try again."); //popup window, too many heuristics checked
            }
	}   
    }

    //getting from user input if the euclidean distance will be used as the heuristic
    var euclideanCheckbox = document.getElementById("euclidean");
    if (euclidean) {
	euclideanCheckbox.checked = true;
    }
    //function that updates the euclidean heuristic value and makes sure only one heuristic is checked
    euclideanCheckbox.oninput = function() { 
	//update the boolean value of euclidean, used to determine if the euclidean distance will be used 
	euclidean = euclideanCheckbox.checked;
	if (euclidean ==  true) { //if the euclidean dostance is checked
            num_checked_h = num_checked_h + 1; //add one to the number of heuristics checked
            console.log("euclidean" + num_checked_h)
	    //if the number of heuristics checked is more than one, someway to change to make more accurate???
            if(num_checked_h > 1) { 
		window.alert("Cannot have more than one heuristic selected.  Please choose one and try again.");
            }
	}   
    }

// HOOK UP GUI ELEMENTS: END
// -----------------------------------------------------
    exports.headless = false;

})(typeof exports === 'undefined'?
            this['gui']={}: exports);
