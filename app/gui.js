/**
 * GUI module.
 *
 * export gui.headless = False to state to others that code is run with GUI. To run 
 *
 * Access values from metrics
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
    
    //getting the grid width from user input
    var gridWidthi = document.getElementById("gridWidthi");
    gridWidthi.value = data.width_i;
    //function the set the grid width
    gridWidthi.oninput = function() {
	//updating the board width from the user input
    //setting min grid size to be 25x25
    if(this.value<25) {
        window.alert("Minimum grid size is 25x25.  Please enter a new value.")
    }
	data.width_i = this.value;
    }

    //getting the height of the board from user input
    var gridWidthii = document.getElementById("gridWidthii");
    gridWidthii.value = data.width_ii;
    //function to set the grid height
    gridWidthii.oninput = function() {
	//updating the board height from the user input
    //setting min grid size to be 25x25
    if(this.value<25) {
        window.alert("Minimum grid size is 25x25.  Please enter a new value.")
    }
	data.width_ii = this.value;
    }

    //getting the number of exits from user input
    var numExits = document.getElementById("numExits");
    numExits.value = data.max['Exit'];
    //function that checks if the number of exits selected is valid
    numExits.oninput = function() {
	//if the number of exits is greater than the perimeter of the board
	//divide by 4? since the number of exits takes up 4 spaces
	if(this.value>((2*data.width_i)+(2*data.width_ii))) {
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
	if(this.value>(data.width_i*data.width_ii)){
	    //make it floor?
	    window.alert("Cannot fit this many objects on the grid, please choose another number.");
	}
	//updating the number of obstacles on the board
    data.max['Obstacle'] = this.value;
	// max_obstacles_on_grid = this.value;
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

    // layouts
    var layoutChoices = document.getElementById("LayoutSelect");
    layoutChoices.oninput = function() {

	var layoutChoice = layoutChoices.options[layoutChoices.selectedIndex].value;
	console.log(layoutChoice);
	data.layout = layoutChoice;
    }
    
    //conflict resolusion strategies
    //can make this a lot shorter!
    var ResolutionChoice1 = document.getElementById("conflift_strategy1");
    ResolutionChoice1.oninput = function() {

	    var ResolutionChoice = ResolutionChoice1.options[ResolutionChoice1.selectedIndex].value;
	    console.log(ResolutionChoice);
	    data.resolve1 = ResolutionChoice;
    }
        
    var ResolutionChoice2 = document.getElementById("conflift_strategy2");
    ResolutionChoice2.oninput = function() {

	    var ResolutionChoice = ResolutionChoice2.options[ResolutionChoice2.selectedIndex].value;
	    console.log(ResolutionChoice);
	    data.resolve2 = ResolutionChoice;
    }
        
    var ResolutionChoice3 = document.getElementById("conflift_strategy3");
    ResolutionChoice3.oninput = function() {

	    var ResolutionChoice = ResolutionChoice3.options[ResolutionChoice3.selectedIndex].value;
	    console.log(ResolutionChoice);
	    data.resolve3 = ResolutionChoice;
    }
        
    var ResolutionChoice4 = document.getElementById("conflift_strategy4");
    ResolutionChoice4.oninput = function() {

	    var ResolutionChoice = ResolutionChoice4.options[ResolutionChoice4.selectedIndex].value;
	    console.log(ResolutionChoice);
	    data.resolve4 = ResolutionChoice;
    }
    
    var thresholdChoice1 = document.getElementById("threshold1");
    thresholdChoice1.value = data.threshold1;
    thresholdChoice1.onchange = function() {
	    data.threshold1 = this.value;
    }
    var thresholdChoice2 = document.getElementById("threshold2");
    thresholdChoice2.value = data.threshold2;
    thresholdChoice2.onchange = function() {
	    data.threshold2 = this.value;
    }
    var thresholdChoice3 = document.getElementById("threshold3");
    thresholdChoice3.value = data.threshold3;
    thresholdChoice3.onchange = function() {
	    data.threshold3 = this.value;
    }
    var thresholdChoice4 = document.getElementById("threshold4");
    thresholdChoice4.value = data.threshold4;
    thresholdChoice4.onchange = function() {
	    data.threshold4 = this.value;
    }

    //getting from user input if the diagonal distance will be used on the heuristic
    var diagonalCheckbox = document.getElementById("diagonal");
    if (metrics.diagonal) {
	diagonalCheckbox.checked = true;
    }
    //function that updates the diagonal heuristic value and makes sure only one heuristic is checked
    diagonalCheckbox.oninput = function() {
	//update the boolean value of the diagonal, used to determine if the diagonal distance will be used
	metrics.diagonal = diagonalCheckbox.checked;
	if (metrics.diagonal ==  true) { //if the diagonal dostance is checked
            num_checked_h = num_checked_h + 1; //add one to the number of heuristics checked
            console.log("diagonal" + num_checked_h)
            if(num_checked_h > 1) { //if the number of heuristics checked is more than one, someway to change to make more accurate???
		window.alert("Cannot have more than one heuristic selected.  Please choose one and try again."); //popup window, too many heuristics checked
            }
	}
    }

    var manhattanCheckbox = document.getElementById("manhattan"); //getting from user input if the manhattan distance will be used as the heuristic
    if (metrics.manhattan) {
	manhattanCheckbox.checked = true;
    }
    //function that updates the manhattan heuristic value and makes sure only one heuristic is checked
    manhattanCheckbox.oninput = function() {
	//update the boolean value of manhattan, used to determine if the manhattan distance will be used 
	metrics.manhattan = manhattanCheckbox.checked;
	if (metrics.manhattan ==  true) { //if the manhattan dostance is checked
            num_checked_h = num_checked_h + 1; //add one to the number of heuristics checked
            console.log("manhattan" + num_checked_h)
            if(num_checked_h > 1) { //if the number of heuristics checked is more than one, someway to change to make more accurate???
		window.alert("Cannot have more than one heuristic selected.  Please choose one and try again."); //popup window, too many heuristics checked
            }
	}   
    }

    //getting from user input if the euclidean distance will be used as the heuristic
    var euclideanCheckbox = document.getElementById("euclidean");
    if (metrics.euclidean) {
	euclideanCheckbox.checked = true;
    }
    //function that updates the euclidean heuristic value and makes sure only one heuristic is checked
    euclideanCheckbox.oninput = function() { 
	//update the boolean value of euclidean, used to determine if the euclidean distance will be used 
	metrics.euclidean = euclideanCheckbox.checked;
	if (metrics.euclidean ==  true) { //if the euclidean dostance is checked
            num_checked_h = num_checked_h + 1; //add one to the number of heuristics checked
            console.log("euclidean" + num_checked_h)
	    //if the number of heuristics checked is more than one, someway to change to make more accurate???
            if(num_checked_h > 1) { 
		window.alert("Cannot have more than one heuristic selected.  Please choose one and try again.");
            }
	}   
    }
    
  //graphs
    var total_collideCheckbox = document.getElementById("total_collide");
    if (data.total_collide) {
	total_collideCheckbox.checked = true;
    }
    total_collideCheckbox.oninput = function() {
	data.total_collide = total_collideCheckbox.checked;
    }
    
  var average_collideCheckbox = document.getElementById("average_collide");
    if (data.average_collide) {
	average_collideCheckbox.checked = true;
    }
    average_collideCheckbox.oninput = function() {
	data.average_collide = average_collideCheckbox.checked;
    }
    
  var total_exitCheckbox = document.getElementById("total_exit");
    if (data.total_exit) {
	total_exitCheckbox.checked = true;
    }
    total_exitCheckbox.oninput = function() {
	data.total_exit = total_exitCheckbox.checked;
    }
    
  var average_exitCheckbox = document.getElementById("average_exit");
    if (data.average_exit) {
	average_exitCheckbox.checked = true;
    }
    average_exitCheckbox.oninput = function() {
	data.average_exit = average_exitCheckbox.checked;
    }

  var average_occupancyCheckbox = document.getElementById("average_occupancy");
    if (data.average_occupancy) {
    average_occupancyCheckbox.checked = true;
    }
    average_occupancyCheckbox.oninput = function() {
    data.average_occupancy = average_occupancyCheckbox.checked;
    }

  var heatmap_Checkbox = document.getElementById("heatmap");
    if (data.heatmap) {
    heatmap_Checkbox.checked = true;
    console.log('heatmap checked gui')
    }
    heatmap_Checkbox.oninput = function() {
    data.heatmap = heatmap_Checkbox.checked;
    }

// HOOK UP GUI ELEMENTS: END
// -----------------------------------------------------
    exports.headless = false;

})(typeof exports === 'undefined'?
            this['gui']={}: exports);
