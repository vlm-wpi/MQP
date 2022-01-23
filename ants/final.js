// GUI state from prior update
var _data;
//orientations for the directions a person can move (in degrees)
var UP = 180;
var DOWN = 90;
var LEFT = 270;
var RIGHT = 0;
var diagDownRight = 45;
var diagUpRight = 135;
var diagDownLeft = 225;
var diagUpLeft = 315;
//list of these orientations
var orientations = [315, 270, 225, 180, 90, 135, 0, 45];

//initial board confiigurations
var width_i = 150; //width of the board, unless changed by input
var width_ii = 150; //height of the booard, unless changed by input
var max_children_on_grid = 25; //number of children initially on board, can be changed by user input
var current_num_children = max_children_on_grid; //counter for the number of children on the board, updates when a child reaches an exit
var max_adult_on_grid = 25; //number of adults initially on board, can be changed by user input
var current_num_adult = max_adult_on_grid; //counter for the number of adults on the board, updates when an adult reaches an exit
var max_backpack_on_grid = 25; //number of adults with a backpack initially on board, can be changed by user input
var current_num_backpack = max_backpack_on_grid; //counter for the number of adults w/ backpack on the board, updates when an adult w/ backpack reaches an exit
var max_bike_on_grid = 25; //number of adults with a bike initially on board, can be changed by user input
var current_num_bike = max_bike_on_grid; //counter for the number of adults w/ bike on the board, updates when an adult w/ bike reaches an exit

var total_peds_at_start = 0; //variable for the total number of people on the grid, updates when it reads the value from html
var max_obstacles_on_grid = 150; //number of oobstacles to place on the board, can be changed by user input
var max_large_X_obstacles_on_grid = 0; //number of large X oobstacles on grid, can be changed by user input
var max_exits_on_grid = 4; // number of exits on grid, can be changed by user input
var exit_locations = []; //might need to be global variable
var ms_between_updates = 1; // number of milliseconds between a board update
var wait_before_random_move = 5; //number of board updates a person is stuck before it tries to find another move
var take_snapshot = false; //boolean used to tell if snapshots of the board are taken after every move, can be changed by user input

//Initial board options
var hall_layout = false; //boolean to check if the hall layout board is used, can be changed by user input
var fuller_lower = false; //boolean used to check if the fuller lower board is used, can be changed by user input
var classroom = false; //boolean used to check if the classroom board is used, can be changed by user input

//counters for warnings
var num_checked = 0; //used to check if multiple board configurationos are checked at once
var num_checked_h = 0; //used to check if multiple heuristics are checked at once

//heuristic options
var diagonal = true; //initialize heuristoc using diagonal distance
var manhattan = false; //boolean to use manhattan distance in heuristic, user can change this
var euclidean = false; //boolean to use euclidean distance in heuristic, user can change this

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

// HOOK UP GUI ELEMENTS: BEGIN
// -----------------------------------------------------
var numChildren = document.getElementById("numChildren"); //getting the number of children to put on the board, from user input
numChildren.value = max_children_on_grid; 
//function that evaluates the user input for number of children
numChildren.oninput = function() { 
    if(this.value>(width_i*width_ii)){//if the user input is greater than the area of the board
      window.alert("Cannot fit this many objects on the grid, please choose another number."); //windoow poopup, too many children selected
  }
  max_children_on_grid = this.value; //updating the initial number of children on the grid
  current_num_children = max_children_on_grid; //updating the current number of children on the grid, should we update this somewhere else?
}

var numAdults = document.getElementById("numAdults"); //getting the number of adults to put on thee board from user input
numAdults.value = max_adult_on_grid;
//function that evaluates the user input for number of adults to place oon the board
numAdults.oninput = function() {
  //if the user input for the number of adults is greater than the area of the board
    if(this.value>(width_i*width_ii)/2){//divide by 2 because an adult takes up 2 spaces
        window.alert("Cannot fit this many objects on the grid, please choose another number."); //window poopup, too many adults selected
    }
    max_adult_on_grid = this.value; //uodating the initial number of adults on the board
    current_num_adult = max_adult_on_grid; //updating the current numbeer of adults on the board, should this be updated  somewhere else?
}

var numBackPacks = document.getElementById("numBackPacks"); //getting the number of adults with backpacks to put on the board, from user input
numBackPacks.value = max_backpack_on_grid;
//function that evaluates the user input for the number of adults with backpacks
numBackPacks.oninput = function() {
  //if the user input for the number of adults with a backpack is greater than the area of the board
    if(this.value>(width_i*width_ii)/4){//divide by 4 because an adult takes up 4 places no the board
        window.alert("Cannot fit this many adults with backpacks on the grid, please choose another number"); //popup window, too many adults with backpack selected
    }
    max_backpack_on_grid = this.value; //updating the initial number of adults with a backpack on the grid
    current_num_backpack = max_backpack_on_grid; //updating the current number of adults with a backpack on the board, should this be updated somewhere else?
}

var numBikes = document.getElementById("numBikes"); //getting the number of adults with bikes to put on the board, from user input
numBikes.value = max_bike_on_grid;
//function that evaluates the user input for the number of adults with bikes
numBikes.oninput = function() {
  //if the user input for the number of adults with a bike is greater than the area of the board
    if(this.value>(width_i*width_ii)/14){//dividing by 14 because and adult with a bike takes up 14 spaces
    //make it floor?
    window.alert("Cannot fit this many objects on the grid, please choose another number."); //popup window, too many adults with a bike selected
}
max_bike_on_grid = this.value; //updating the initial number with adults with a bike on the grid
current_num_bike = max_bike_on_grid; //updating the current number of adults with a bike on the board, should this be updated somewhere else?
}

var ms_speed_slider = document.getElementById("ms_speed"); //getting the update time from user input
ms_speed_slider.value = ms_between_updates; 
//function that sets the update time
ms_speed_slider.oninput = function() {
  ms_between_updates = this.value; //set the user input of the update time to the number of milliseconds between a board update
}

var wait_speed_slider = document.getElementById("wait_speed"); //getting the wait time from user input
wait_speed_slider.value = wait_before_random_move;
//function that sets the wait time
wait_speed_slider.oninput = function() {
  wait_before_random_move = this.value; //updating the number of board updates a person is stuck before it tries to find another move from the user input
}

var gridWidthi = document.getElementById("gridWidthi"); //getting the grid width from user input
gridWidthi.value = width_i;
//function the set the grid width
gridWidthi.oninput = function() {
    width_i = this.value; //updating the board width from the user input
}

var gridWidthii = document.getElementById("gridWidthii"); //getting the height of the board from user input
gridWidthii.value = width_ii;
//function to set the grid height
gridWidthii.oninput = function() {
    width_ii = this.value; //updating th board height from the uder input
}

var numExits = document.getElementById("numExits"); //getting the number of exits from user input
numExits.value = max_exits_on_grid;
//function that checks if the number of exits selected is valid
numExits.oninput = function() {
  //if the number of exits is greater than the perimeter of the board
    if(this.value>((2*width_i)+(2*width_ii))) {//divide by 4? since the number of exits takes up 4 spaces
    //make it floor?
    window.alert("Cannot fit this many exits on the grid, please choose another number."); //popup window, too many exits selected
  }
max_exits_on_grid = this.value; //updating the number of exits on the grid
}

var numObstacles = document.getElementById("numObstacles"); //getting the number of obstacles frooom user input
numObstacles.value = max_obstacles_on_grid; 
//function that checks of the number of obstacles is valid
numObstacles.oninput = function() {
  //if the number of obstacles is greater than the the area of the board
    if(this.value>(width_i*width_ii)){
    //make it floor?
    window.alert("Cannot fit this many objects on the grid, please choose another number."); //popup windoow, too many obstacles selected
}
max_obstacles_on_grid = this.value; //updating the number of obstacles on the board
}

var numXObstacles = document.getElementById("numXObstacles"); //getting the number of large "X" like obstacles from uper input
numXObstacles.value = max_large_X_obstacles_on_grid;
numXObstacles.oninput = function() {
    max_large_X_obstacles_on_grid = this.value; //updating the number of X obstacles no the board
}

var takeSnapshotCheckbox = document.getElementById("takeSnapshot"); //getting from user input if snapshots of the board will be taken
if (take_snapshot) {
    takeSnapshotCheckbox.checked = true;
}
takeSnapshotCheckbox.oninput = function() {
    take_snapshot = takeSnapshotCheckbox.checked; //update the boolean value of take snapshot, used to deterrmine if snapshots of the board will be taken
}

var hallLayoutCheckbox = document.getElementById("hallLayout"); //getting from user input if the hall layput will be used
if (hall_layout) {
    hallLayoutCheckbox.checked = true;
}
//function that updates the layout and makes sure it is the only one checked
hallLayoutCheckbox.oninput = function() {
    hall_layout = hallLayoutCheckbox.checked; //update the boolean value of the hall layout, used to determine if this layout will be used
    if (hall_layout ==  true) { //if the hall loyout is checked
        num_checked = num_checked + 1; //add one to the number of layouts checked
        console.log("lecture hall " + num_checked)
        if(num_checked > 1) { //if there is more than one layout checked
            window.alert("Cannot have more than one layout selected.  Please choose one or less and try again."); //popup window, too many layouts selected
        }
    }
}

var fullerLowerCheckbox = document.getElementById("fullerLower"); //getting from user input if the fuller lower layout will be used
if (fuller_lower) {
    fullerLowerCheckbox.checked = true;
}
//function that updates the layout and makes sure it is the only one checked
fullerLowerCheckbox.oninput = function() {
    fuller_lower = fullerLowerCheckbox.checked; //update the boolean value of the Fuller Lower layout, used to determine if this layout will be used
    if (fuller_lower ==  true) { //if the Fuller Lower loyout is checked
        num_checked = num_checked + 1; //add one to the number of layouts checked
        console.log("fuller lower " + num_checked)
        if(num_checked > 1) { //if there is more than one layout checked
            window.alert("Cannot have more than one layout selected.  Please choose one or less and try again."); //popup window, too many layouts selected
        }
    }
}

var classroomCheckbox = document.getElementById("classroom"); //getting from user input if the classroom layout will be used
if (classroom) {
    classroomCheckbox.checked = true;
}
//function that updates the layout and makes sure it is the only one checked
classroomCheckbox.oninput = function() {
    classroom = classroomCheckbox.checked; //update the boolean value of the classroom layout, used to determine if this layout will be used
    if (classroom ==  true) { //if the classroom loyout is checked
        num_checked = num_checked + 1; //add one to the number of layouts checked
        console.log("classroom " + num_checked)
        if(num_checked > 1) { //if there is more than one layout checked
            window.alert("Cannot have more than one layout selected.  Please choose one or less and try again."); //popup window, too many layouts selected
        }
    }   
}

var diagonalCheckbox = document.getElementById("diagonal"); //getting from user input if the diagonal distance will be used on the heuristic
if (diagonal) {
    diagonalCheckbox.checked = true;
}
//function that updates the diagonal heuristic value and makes sure only one heuristic is checked
diagonalCheckbox.oninput = function() {
    diagonal = diagonalCheckbox.checked; //update the boolean value of the diagonal, used to determine if the diagonal distance will be used
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
    manhattan = manhattanCheckbox.checked; //update the boolean value of manhattan, used to determine if the manhattan distance will be used 
    if (manhattan ==  true) { //if the manhattan dostance is checked
        num_checked_h = num_checked_h + 1; //add one to the number of heuristics checked
        console.log("manhattan" + num_checked_h)
        if(num_checked_h > 1) { //if the number of heuristics checked is more than one, someway to change to make more accurate???
            window.alert("Cannot have more than one heuristic selected.  Please choose one and try again."); //popup window, too many heuristics checked
        }
    }   
}

var euclideanCheckbox = document.getElementById("euclidean"); //getting from user input if the euclidean distance will be used as the heuristic
if (euclidean) {
    euclideanCheckbox.checked = true;
}
//function that updates the euclidean heuristic value and makes sure only one heuristic is checked
euclideanCheckbox.oninput = function() { 
    euclidean = euclideanCheckbox.checked; //update the boolean value of euclidean, used to determine if the euclidean distance will be used 
    if (euclidean ==  true) { //if the euclidean dostance is checked
        num_checked_h = num_checked_h + 1; //add one to the number of heuristics checked
        console.log("euclidean" + num_checked_h)
        if(num_checked_h > 1) { //if the number of heuristics checked is more than one, someway to change to make more accurate???
            window.alert("Cannot have more than one heuristic selected.  Please choose one and try again."); //popup window, too many heuristics checked
        }
    }   
}
//     (hall_layout && fuller_lower) || (hall_layout && classroom) || (fuller_lower && classroom) || (hall_layout && fuller_lower && classroom)) {
//     window.alert("Cannot have more than one layout selected.  Please choose one or less and try again.")
// }
// HOOK UP GUI ELEMENTS: END
// -----------------------------------------------------

//variables used in the priority queue
const leftChild = (index) => index * 2 + 1;
const rightChild = (index) => index * 2 + 2;
const parent = (index) => Math.floor((index - 1) / 2);
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
        return [n.i, n.ii, n.direction, n.profile_i, n.profile_ii]; //return the next step, anchors, profiles, and the direction of the person
    }
    
    //used to quickly get the anchor values, hashtable
    //ask about this
    this.key = function() {
        return "" + this.i + "," + this.ii;
    }

    //function to check if a person is at an exit and should be removed from the board
    this.done = function() {
        for (index = 0; index < this.profile_i.length; index++) { //go through all person's cells
            if ((this.profile_i[index] + this.i) >= this.exiti && (this.profile_i[index] + this.i) <= this.endi &&
                (this.profile_ii[index] + this.ii) >= this.exitii && (this.profile_ii[index] + this.ii) <= this.endii) { //if the cell is touching an exit
                return true; // if any part of the person is in an exit
                //checking if any part of the person is touching an exit
            }
        }
    }
    
    //Function to ensure that two nodes can be compared using < operator
    //here is where the distance heuristic function is used
    Node.prototype.valueOf = function() { 
        // f = g + h
        if (manhattan){ //if using the manhattan distancee
          var h = manhattand(this.i, this.ii, this.goali, this.goalii); //call the manhatan function, set this distance to h
        }
        else if (euclidean){ //if using the euclidean distance
          var h = euclideand(this.i, this.ii, this.goali, this.goalii); //call the euclidean function, set this distance to h
        }
        else { //else the diagoonal distance is used
          var h = diagonald(this.i, this.ii, this.goali, this.goalii); //call the diaginal function, set this distancee to h
        }
        return this.g + h; //total heurisic value, f, is returned
    }
}

//priority queue, used for AStar algorithm
function minHeap() {
    this.heap = []; //initially empty array

    //function to swap two nodes
    this.swap = function(indexOne, indexTwo) {
        const tmp = this.heap[indexOne]; //tmp is set to the node at the first index
        this.heap[indexOne] = this.heap[indexTwo]; //the first index is set to the node at the second index
        this.heap[indexTwo] = tmp; //the second index is set to the node from the first index
    };

    //function to see the value at the front of the heap, oor the root which is always the lowest priority item
    this.peek = function() {
        return this.heap[0]; //return the node at the front of the array
    };

    //function to place a node into the correct place in the min heap
    this.insert = function(item) {
        // push element to the end of the heap
        this.heap.push(item);

        // the index of the element we have just pushed
        let index = this.heap.length - 1;

        // if the element is less than its parent:
        // swap element with its parent
        while (index !== 0 && this.heap[index] < this.heap[parent(index)]) {
            this.swap(index, parent(index));
            index = parent(index); //set the index to half of the current index
            //do not fully understand
        }
    };

    //function to take the minimum value out of the heap, and reorders the heap
    this.extractMin = function() {
        // remove the first element from the heap
        var root = this.heap.shift();

        // put the last element to the front of the heap
        // and remove the last element from the heap as it now
        // sits at the front of the heap
        this.heap.unshift(this.heap[this.heap.length - 1]);
        this.heap.pop();

        // correctly re-position heap
        this.heapify(0);

        return root; //return the min value
    };

    //function to make the array into a min heap
    this.heapify = function(index) {
        let left = leftChild(index);
        let right = rightChild(index);
        let smallest = index;

        // if the left index is less than the length of the heap and the left child is smaller than the node we are looking at
        if (left < this.heap.length && this.heap[smallest] > this.heap[left]) {
            smallest = left; //change the smallest value to the left value
        }

        // if the right index is less than the length of the heap and the right child is smaller than the node we are looking at
        if (right < this.heap.length && this.heap[smallest] > this.heap[right]) {
            smallest = right; //change smallest to right
        }

        // if the value of smallest has changed, then some swapping needs to be done
        // and this method needs to be called again with the swapped element
        if (smallest != index) {
            this.swap(smallest, index); //swap smallest and index
            this.heapify(smallest); //recall heapify
        }
    };

    //function to get the "size" of the heap, or the number of nodes in it
    this.size = function() { //gets the length of the heap
        return this.length; //returns the length
    }
}

//function that takes care of initializing the grid, placing items, and updating the board
function State() {
    var total_peds_at_start = parseInt(max_children_on_grid) + parseInt(max_adult_on_grid) + parseInt(max_backpack_on_grid) + parseInt(max_bike_on_grid);
    document.getElementById("total_peds_at_start").innerHTML = total_peds_at_start;
    var num_children_initial = parseInt(max_children_on_grid);
    document.getElementById("num_children_initial").innerHTML = num_children_initial;
    document.getElementById("num_adult_initial").innerHTML = max_adult_on_grid;
    document.getElementById("num_backpack_initial").innerHTML = max_backpack_on_grid;
    document.getElementById("num_bike_initial").innerHTML = max_bike_on_grid;
    document.getElementById("num_obstacle_initial").innerHTML = max_obstacles_on_grid;
    this.grid = []; //data structure for grid, initially empty
    this.temp_grid = []; //data structure for the temp griid, used to try placing objects without actually moving them on the actual board
    this.population = []; //population of people on the grid, initially empty
    total_population_over_time = [total_peds_at_start]; //make the total population over time start with everyone on the board

    // function that makes sure the given x coordinate is on the board, used for rounding boundary cases
    //takes in a x coordinate
    this.get_bounded_index_i = function(index) {
        var bounded_index_i = index; //initially set the bounded index to the given x coordinate
        if (index < 0) { //if the x coordinate is less than zero, it is off the board
            bounded_index_i = 0; //change the x value to zero so it is ono the board
        }
        if (index >= width_i) { //if the x coordinate is greater than or equal to the width of the board, it is off the board
            bounded_index_i = width_i - 1; //change the x coordinate to one less than the width so it is on the board
        }
        return bounded_index_i; //return the x coordinate, guarenteed to be on the board
    }
    
    //function that makes sure the given y coordinate is on the board, used for rounding boundary cases
    //takes in a y coordinate
    this.get_bounded_index_ii = function(index) {
        var bounded_index_ii = index; //initially set the bounded inidex to the given y coordinate
        if (index < 0) { //if the y coordinate is less than zero, it is off the board
            bounded_index_ii = 0; //change the y value to zero so it is ono the board
        }
        if (index >= width_ii) { //if the y coordinate is greater than or equal to the height of the board, it is off the board
            bounded_index_ii = width_ii - 1; //change the y coordinate to one less than the height so it is on the board
        }
        return bounded_index_ii; //return the y coordinate, guarenteed to be on the board
    }

    //function thatt initializes the grid, does not need any input
    this.init_grids = function() {
        for (var i = 0; i < width_i; i = i + 1) { //go through each index until you get to the width og the board
            this.grid[i] = []; //initialize the grid at that width index to be empty
            this.temp_grid[i] = []; //initialize the temp grid at that width index to be empty
            for (var ii = 0; ii < width_ii; ii = ii + 1) { //go through every index until you get to the height of the board
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
                    //if a child
                    if (object_type == 'Child') { 
                        current_num_children = current_num_children - 1; //subtract one from the child population
                        document.getElementById("current_children").innerHTML = current_num_children;
                        //add to sum of everyones exit times
                        sum_child_exit_times = sum_child_exit_times + thing.exittime; //add its exit time to the total children exit times
                        sum_child_wait_steps = sum_child_wait_steps + thing.waitsteps; //add its wait time to the total children wait times
                        //check if last child
                        if(current_num_children==0){
                          var total_child_exit_time = thing.exittime; //in board update units
                          document.getElementById("total_child_exit").innerHTML = total_child_exit_time;
                          var total_child_wait_steps = thing.waitsteps; //set the total amount of wait steps for children
                          document.getElementById("total_child_wait").innerHTML = total_child_wait_steps;
                        }
                        //if an adult
                    } else if (object_type == 'Adult') {
                        current_num_adult = current_num_adult - 1; //subtract one from the adult population
                        document.getElementById("current_adult").innerHTML = current_num_adult;
                        sum_adult_exit_times = sum_adult_exit_times + thing.exittime; //add its exit time to the total adult exit times
                        sum_adult_wait_steps = sum_adult_wait_steps + thing.waitsteps; //add its wait time to the total adult wait times
                        //check if last adult
                        if(current_num_adult==0){
                          var total_adult_exit_time = thing.exittime; //in board update units
                          document.getElementById("total_adult_exit").innerHTML = total_adult_exit_time;
                          var total_adult_wait_steps = thing.waitsteps; //set the total amount of wait steps for adults
                          document.getElementById("total_adult_wait").innerHTML = total_adult_wait_steps;
                        }
                        //check if adult with backpack
                    } else if (object_type == 'AdultBackpack') {
                        current_num_backpack = current_num_backpack - 1; //subtract one from the adult with backpack population
                        document.getElementById("current_backpack").innerHTML = current_num_backpack;
                        sum_backpack_exit_times = sum_backpack_exit_times + thing.exittime; //add its exit time to the total adult with backpack exit times
                        sum_backpack_wait_steps = sum_backpack_wait_steps + thing.waitsteps; //add its wait time to the total adult with backpack wait times
                        if(current_num_backpack==0){
                          var total_backpack_exit_time = thing.exittime; //in board update units
                          document.getElementById("total_backpack_exit").innerHTML = total_backpack_exit_time;
                          var total_backpack_wait_steps = thing.waitsteps; //set the total amount of wait steps for adults with backpack
                          document.getElementById("total_backpack_wait").innerHTML = total_backpack_wait_steps;
                        }
                        //check if adult with bike
                    } else if (object_type == 'AdultBike') {
                        current_num_bike = current_num_bike - 1; //subtract one from the adult with bike population
                        document.getElementById("current_bike").innerHTML = current_num_bike;
                        sum_bike_exit_times = sum_bike_exit_times + thing.exittime; //add its exit time to the total adult with bike exit times
                        sum_bike_wait_steps = sum_bike_wait_steps + thing.waitsteps; //add its wait time to the total adult with bike wait times
                        if(current_num_bike == 0){
                          var total_bike_exit_time = thing.exittime; //in board update units
                          document.getElementById("total_bike_exit").innerHTML = total_bike_exit_time;
                          var total_bike_wait_steps = thing.waitsteps; //set the total amount of wait steps for adults with bike
                          document.getElementById("total_bike_wait").innerHTML = total_bike_wait_steps;
                        }
                }
                if (current_population == 0) { //if no people left on the grid
                //not sure if we need to set these to zero, should all be zero???
                    current_num_children = 0; //set number of children equal to zero
                    current_num_adult = 0; //set number of adults equal to zero
                    current_num_backpack = 0; //set number of adults with a backpack to zero
                    current_num_bike = 0; //set number of adults with a bike to zero
                    end_simulation() //end the simulation
                    avg_collisions_total = total_collisions/total_peds_at_start;
                    document.getElementById("avg_collision").innerHTML = avg_collisions_total;
                    document.getElementById("collision").innerHTML = total_collisions;
                    avg_child_collisions = total_child_collisions/max_children_on_grid;
                    document.getElementById("total_child_collide").innerHTML = total_child_collisions;
                    document.getElementById("avg_child_collide").innerHTML = avg_child_collisions;
                    avg_adult_collisions = total_adult_collisions/max_adult_on_grid;
                    document.getElementById("total_adult_collide").innerHTML = total_adult_collisions;
                    document.getElementById("agv_adult_collide").innerHTML = avg_adult_collisions;
                    avg_backpack_collisions = total_backpack_collisions/max_backpack_on_grid;
                    document.getElementById("total_backpack_collide").innerHTML = total_backpack_collisions;
                    document.getElementById("avg_backpack_collide").innerHTML = avg_backpack_collisions;
                    avg_bike_collisions = total_bike_collisions/max_bike_on_grid;
                    document.getElementById("total_bike_collide").innerHTML = total_bike_collisions;
                    document.getElementById("avg_bike_collide").innerHTML = avg_bike_collisions;
                    var total_exit_time = thing.exittime; //total exit time in board updates
                    document.getElementById("total_exit_time").innerHTML = total_exit_time;
                    var avg_exit_time = (sum_of_exit_times) / total_peds_at_start; //in board update units
                    document.getElementById("avg_exit_time").innerHTML = avg_exit_time;
                    var avg_exit_time_child = (sum_child_exit_times) / max_children_on_grid; //in board update units
                    var avg_exit_time_adult = (sum_adult_exit_times) / max_adult_on_grid; //in board update units
                    var avg_exit_time_backpack = (sum_backpack_exit_times) / max_backpack_on_grid; //in board update units
                    var avg_exit_time_bike = (sum_bike_exit_times) / max_bike_on_grid; //in board update units
                    document.getElementById("avg_exit_child").innerHTML = avg_exit_time_child;
                    document.getElementById("avg_exit_adult").innerHTML = avg_exit_time_adult;
                    document.getElementById("avg_exit_backpack").innerHTML = avg_exit_time_backpack;
                    document.getElementById("avg_exit_bike").innerHTML = avg_exit_time_bike;

                    var total_wait_steps = thing.waitsteps; //set the total number of waitsteps for everyoone
                    document.getElementById("total_wait_steps").innerHTML = total_wait_steps;
                    var avg_wait_steps = sum_wait_steps/total_peds_at_start; //average amount of waitsteps per person
                    document.getElementById("avg_wait_steps").innerHTML = avg_wait_steps;
                    var avg_wait_steps_child = sum_child_wait_steps/max_children_on_grid; //average wait time for children
                    var avg_wait_steps_adult = sum_adult_wait_steps/max_adult_on_grid; //average wait time for adults
                    var avg_wait_steps_backpack = sum_backpack_wait_steps/max_backpack_on_grid; //average wait time for adults with a backpack
                    var avg_wait_steps_bike = sum_bike_wait_steps/max_bike_on_grid; //average wait time for adults with a bike
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
                break; //at an exit no need to keep going through people
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
        for (var i = 0; i < width_i; i = i + 1) { 
            for (var ii = 0; ii < width_ii; ii = ii + 1) {
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

    //not comopletely commented yet
    // only if do not contain an obstacle. Must check entire profile
    // if 'others' than check to avoid other shapes as well
    this.get_neighbors = function(x, y, thing, state, others) { //gets the eight neighbors as a possible move
        var parents = []; //initialize array 
        var oix = -1; //initialize counter for tthe index of its orientation
        //I do not understand this part
        for (var di = -1; di <= 1; di++) {
            for (var dii = -1; dii <= 1; dii++) {
                if (di == 0 && dii == 0) {
                    continue; //not 100% sure on the continue statement
                }
                oix++;

                var safe_r = this.get_bounded_index_i(x + di); 
                var safe_c = this.get_bounded_index_ii(y + dii);
                if (safe_r != x + di) {
                    continue;
                }
                if (safe_c != y + dii) {
                    continue;
                }

                // ok. Can move anchor. Are other spots available?
                var safe = 1; //counter to check if a whole person is okay to move to
                for (var p = 0; p < thing.profile_i.length; p++) { //go through every cell of the person
                    var ss = this.get_coords_from_orientation_neighbors(thing, p, orientations[oix]);
                    var sr = this.get_bounded_index_i(x + ss[0]);
                    var sc = this.get_bounded_index_ii(y + ss[1]);

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
                    parents.push([safe_r, safe_c, orientations[oix]]); //add the coordinates and its orientattion 
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
    this.AStar = function(thing, others) {

        var open = new minHeap(); //initialize priority queue
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
        open.insert(n); //add the starting node to the queue
        open_hash[n.key()] = n; 
        var heapLength = open.heap.length; //get the length of the queue
        //go through while the open list is not empty
        while (open.heap.length > 0) {
            var q = open.extractMin(); //get the minimun path so far
            var successors = this.get_neighbors(q.i, q.ii, thing, this, others); //this function only returns coordinates and orientation
            //shuffle array
            // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
            for (var i = successors.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = successors[i];
                successors[i] = successors[j];
                successors[j] = temp;
            } // does this do anything???
            for (i = 0; i < successors.length; i++) { //go through all the poossible next moves
                var succ = new Node(successors[i][0], successors[i][1], q.exiti, q.exitii, q.endi, q.endii, q, successors[i][2], q.goali, q.goalii, q.profile_i, q.profile_ii); //create a node with the information from the successsor

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

    this.place_things = function(random) {
        //added this in as part of exit distances
        
        //here will initialize a lecture hall
        // 30 rows, after 15th 2 row spaces for ppl
        //20 columns, 3 column spaces for ppl after 10
        //26x68
        //exits at (0,0) (0,44) (68,0) (68,44)
        //x values are columns
        //y values are rows

        if (hall_layout == true) {
            width_i = 50;
            width_ii = 75;
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
            exit_locations.push(obj1);
            for (var p = 0; p < obj1.profile_i.length; p++) { //placing exits on the grid
                var dj = obj1.profile_i[p];
                var djj = obj1.profile_ii[p];
                var safej = this.get_bounded_index_i(0 + dj);
                var safejj = this.get_bounded_index_ii(0 + djj);

                this.temp_grid[safej][safejj].thing = obj1;
            }
            var obj2 = new Exit(width_i - 4, 0);
            // console.log(obj2)
            exit_locations.push(obj2);
            for (var p = 0; p < obj2.profile_i.length; p++) { //placing exits on the grid
                var dj = obj2.profile_i[p];
                var djj = obj2.profile_ii[p];
                var safej = this.get_bounded_index_i(width_i - 4 + dj);
                var safejj = this.get_bounded_index_ii(0 + djj);

                this.temp_grid[safej][safejj].thing = obj2;
            }
            var obj3 = new Exit(1, width_ii - 1);
            exit_locations.push(obj3);
            for (var p = 0; p < obj3.profile_i.length; p++) { //placing exits on the grid
                var dj = obj3.profile_i[p];
                var djj = obj3.profile_ii[p];
                var safej = this.get_bounded_index_i(1 + dj);
                var safejj = this.get_bounded_index_ii(width_ii - 1 + djj);

                this.temp_grid[safej][safejj].thing = obj3;
            }
            var obj4 = new Exit(width_i - 4, width_ii - 1);
            exit_locations.push(obj4);
            for (var p = 0; p < obj4.profile_i.length; p++) { //placing exits on the grid
                var dj = obj4.profile_i[p];
                var djj = obj4.profile_ii[p];
                var safej = this.get_bounded_index_i(width_i - 4 + dj);
                var safejj = this.get_bounded_index_ii(width_ii - 1 + djj);

                this.temp_grid[safej][safejj].thing = obj4;
            }
        }

        //setting up the default drawing for fuller lower lecture hall
        else if (fuller_lower == true) {
            width_i = 56;
            width_ii = 45;
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
            exit_locations.push(obj01)
            for (var p = 0; p < obj01.profile_i.length; p++) {
                var dj = obj01.profile_i[p];
                var djj = obj01.profile_ii[p];
                var safej = this.get_bounded_index_i(1 + dj);
                var safejj = this.get_bounded_index_ii(0 + djj);
                this.temp_grid[safej][safejj].thing = obj01;
            }
            //second exit in the top right
            var obj02 = new Exit(width_i - 4, 0)
            exit_locations.push(obj02)
            for (var p = 0; p < obj02.profile_i.length; p++) {
                var dj = obj02.profile_i[p];
                var djj = obj02.profile_ii[p];
                var safej = this.get_bounded_index_i(width_i - 4 + dj);
                var safejj = this.get_bounded_index_ii(0 + djj);
                this.temp_grid[safej][safejj].thing = obj02;
            }
            //third exit bottom left
            var obj03 = new Exit(0, width_ii - 9)
            exit_locations.push(obj03)
            for (var p = 0; p < obj03.profile_i.length; p++) {
                var dj = obj03.profile_i[p];
                var djj = obj03.profile_ii[p];
                var safej = this.get_bounded_index_i(0 + dj);
                var safejj = this.get_bounded_index_ii(width_ii - 9 + djj);
                this.temp_grid[safej][safejj].thing = obj03;
            }
            //fourth exit bottom left
            var obj04 = new Exit(0, width_ii - 5)
            exit_locations.push(obj04)
            for (var p = 0; p < obj04.profile_i.length; p++) {
                var dj = obj04.profile_i[p];
                var djj = obj04.profile_ii[p];
                var safej = this.get_bounded_index_i(0 + dj);
                var safejj = this.get_bounded_index_ii(width_ii - 5 + djj);
                this.temp_grid[safej][safejj].thing = obj04;
            }
            // console.log(exit_locations)
        } else if (classroom == true) {
            width_i = 40;
            width_ii = 35;
            //podium at front of classroom
            for (var col = 34; col < 38; col++) {
                for (var row = 3; row < 6; row++) {
                    var obj = new Obstacle(col, row);
                    this.temp_grid[col][row].thing = obj;
                }
            }
            //desks
            for (var col0 = 0; col0 < width_i-1; col0+=5) {
                for (var row0 = 8; row0 < width_ii-1; row0+=6) {
                    for (var col = col0; col < col0+3; col++) {
                        for (var row = row0; row < row0+3; row++) {
                            var obj = new Obstacle(col, row);
                            this.temp_grid[col][row].thing = obj;
                        }
                    }
                }
            }

            var obj01 = new Exit(0, 0)
            exit_locations.push(obj01)
            for (var p = 0; p < obj01.profile_i.length; p++) {
                var dj = obj01.profile_i[p];
                var djj = obj01.profile_ii[p];
                var safej = this.get_bounded_index_i(0 + dj);
                var safejj = this.get_bounded_index_ii(0 + djj);
                this.temp_grid[safej][safejj].thing = obj01;
            }
        }
        else {
            for (var n = 0; n < max_obstacles_on_grid; n++) {
                var j = get_random_int(0, width_i)
                var jj = get_random_int(0, width_ii)

                var obj = new Obstacle(j, jj);
                this.temp_grid[j][jj].thing = obj;
            }
            for (var n = 0; n < max_exits_on_grid; n++) {
                var j = get_random_int(0, width_i - 3);
                var jj = get_random_int(0, width_ii - 3);
                var choose = Math.round(Math.random());
                if (choose == 0) {
                    var j = j;
                    var jj = ((width_ii - 1) * (Math.round(Math.random())));
                }
                else if (choose == 1) {
                    var j = ((width_i - 1) * (Math.round(Math.random())));
                    var jj = jj;
                }
                var obj = new Exit(j, jj);
                //want to push whole object so that it keeps track of the end
                exit_locations.push(obj);

                for (var p = 0; p < obj.profile_i.length; p++) { //placing exits on the grid
                    var dj = obj.profile_i[p];
                    var djj = obj.profile_ii[p];
                    var safej = this.get_bounded_index_i(j + dj);
                    var safejj = this.get_bounded_index_ii(jj + djj);

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

            // RANDOM Xs
            // -------------
            for (var xx = 0; xx < max_large_X_obstacles_on_grid; xx++) {
                var j = get_random_int(20, width_i - 20)
                var jj = get_random_int(20, width_ii - 20)

                for (var n = 0; n <= 20; n++) {
                    this.temp_grid[j + n][jj + n].thing = new Obstacle(j + n, jj + n);
                    this.temp_grid[j - n][jj - n].thing = new Obstacle(j - n, jj - n);
                    this.temp_grid[j + n][jj - n].thing = new Obstacle(j + n, jj - n);
                    this.temp_grid[j - n][jj + n].thing = new Obstacle(j - n, jj + n);
                }
            }
        }
        var num_children = 0;
        var times_not_placed = 0;
        while (num_children < max_children_on_grid) {
          if (times_not_placed>(width_i*width_ii)){ //not sure what is a good number, have it at 1000 right now, changed to area
            window.alert("Cannot place this many children on the grid, please reset and choose another number");
            break;
        }
        var j = get_random_int(0, width_i);
        var jj = get_random_int(0, width_ii);
            //added this in as part of exit distances
            exit_distances = [];
            //randomly getting a specific exit cell goal
            var rand_x = get_random_int(0, 3);
            var rand_y = get_random_int(0, 3);
            for (var exit = 0; exit < exit_locations.length; exit++) {
                var exiti = exit_locations[exit].anchor_i;
                var exitii = exit_locations[exit].anchor_ii;
                var local_endi = exit_locations[exit].profile_i[3] + exit_locations[exit].anchor_i;
                var local_endii = exit_locations[exit].profile_ii[3] + exit_locations[exit].anchor_ii;
                var current_distance = calc_distance(j, jj, exiti, exitii) //should calculate to goal?
                var local_goali = exit_locations[exit].profile_i[rand_x] + exit_locations[exit].anchor_i;
                var local_goalii = exit_locations[exit].profile_ii[rand_y] + exit_locations[exit].anchor_ii;
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
                var safej = this.get_bounded_index_i(j + dj);
                var safejj = this.get_bounded_index_ii(jj + djj);
                if (this.temp_grid[safej][safejj].has_other_thing(objChild)) { //should be somewhere
                    obstacle++;
                    //do not place
                }
            }
            if (obstacle == 0) {//if can place
                for (var p = 0; p < objChild.profile_i.length; p++) { //
                    var dj = objChild.profile_i[p];
                    var djj = objChild.profile_ii[p];
                    var safej = this.get_bounded_index_i(j + dj);
                    var safejj = this.get_bounded_index_ii(jj + djj);
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
        while (num_adultbackpack < max_backpack_on_grid) {
          if (times_not_placed_backpack>1000){ //not sure what is a good number, have it at 1000 right now
            window.alert("Cannot place this many adults with a backpack on the grid, please reset and choose another number");
            break;
        }
        var j = get_random_int(0, width_i)
        var jj = get_random_int(0, width_ii)
            //added this in as part of exit distances
            exit_distances = [];
            //randomly getting a specific exit cell goal
            var rand_x = get_random_int(0, 3);
            var rand_y = get_random_int(0, 3);
            for (var exit = 0; exit < exit_locations.length; exit++) {
                var exiti = exit_locations[exit].anchor_i;
                var exitii = exit_locations[exit].anchor_ii;
                var local_endi = exit_locations[exit].profile_i[3] + exit_locations[exit].anchor_i;
                var local_endii = exit_locations[exit].profile_ii[3] + exit_locations[exit].anchor_ii;
                var local_goali = exit_locations[exit].profile_i[rand_x] + exit_locations[exit].anchor_i;
                var local_goalii = exit_locations[exit].profile_ii[rand_y] + exit_locations[exit].anchor_ii;
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
                var safej = this.get_bounded_index_i(j + dj);
                var safejj = this.get_bounded_index_ii(jj + djj);
                if (this.temp_grid[safej][safejj].has_other_thing(obj)) { //should be somewhere
                    obstacle++;
                    //do not place
                }
            }
            if (obstacle == 0) {
                for (var p = 0; p < obj.profile_i.length; p++) { //
                    var dj = obj.profile_i[p];
                    var djj = obj.profile_ii[p];
                    var safej = this.get_bounded_index_i(j + dj);
                    var safejj = this.get_bounded_index_ii(jj + djj);
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
      while (num_adult < max_adult_on_grid) {
          if (times_not_placed_adult>1000){ //not sure what is a good number, have it at 1000 right now
            window.alert("Cannot place this many adults with a backpack on the grid, please reset and choose another number");
            break;
        }
        var j = get_random_int(0, width_i - 1)
        var jj = get_random_int(0, width_ii - 1)
            //added this in as part of exit distances
            exit_distances = [];
            //randomly getting a specific exit cell goal
            var rand_x = get_random_int(0, 3);
            var rand_y = get_random_int(0, 3);
            for (var exit = 0; exit < exit_locations.length; exit++) {
                var exiti = exit_locations[exit].anchor_i;
                var exitii = exit_locations[exit].anchor_ii;
                var local_endi = exit_locations[exit].profile_i[3] + exit_locations[exit].anchor_i;
                var local_endii = exit_locations[exit].profile_ii[3] + exit_locations[exit].anchor_ii;
                var current_distance = calc_distance(j, jj, exiti, exitii)
                var local_goali = exit_locations[exit].profile_i[rand_x] + exit_locations[exit].anchor_i;
                var local_goalii = exit_locations[exit].profile_ii[rand_y] + exit_locations[exit].anchor_ii;
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
                var safej = this.get_bounded_index_i(j + dj);
                var safejj = this.get_bounded_index_ii(jj + djj);
                if (this.temp_grid[safej][safejj].has_other_thing(objAdult)) { //should be somewhere
                    obstacle++;
                    //do not place
                }
            }
            if (obstacle == 0) {
                for (var p = 0; p < objAdult.profile_i.length; p++) { //
                    var dj = objAdult.profile_i[p];
                    var djj = objAdult.profile_ii[p];
                    var safej = this.get_bounded_index_i(j + dj);
                    var safejj = this.get_bounded_index_ii(jj + djj);
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
      while (num_bike < max_bike_on_grid) {
          if (times_not_placed_bike>1000){ //not sure what is a good number, have it at 1000 right now
            window.alert("Cannot place this many children on the grid, please reset and choose another number");
            break;
        }
        var j = get_random_int(0, width_i-3);
        var jj = get_random_int(3, width_ii-2);
            //added this in as part of exit distances
            exit_distances = [];
            //randomly getting a specific exit cell goal
            var rand_x = get_random_int(0, 3);
            var rand_y = get_random_int(0, 3);
            for (var exit = 0; exit < exit_locations.length; exit++) {
                var exiti = exit_locations[exit].anchor_i;
                var exitii = exit_locations[exit].anchor_ii;
                var local_endi = exit_locations[exit].profile_i[3] + exit_locations[exit].anchor_i;
                var local_endii = exit_locations[exit].profile_ii[3] + exit_locations[exit].anchor_ii;
                var local_goali = exit_locations[exit].profile_i[rand_x] + exit_locations[exit].anchor_i;
                var local_goalii = exit_locations[exit].profile_ii[rand_y] + exit_locations[exit].anchor_ii;
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
                var safej = this.get_bounded_index_i(j + dj);
                var safejj = this.get_bounded_index_ii(jj + djj);
                if (this.temp_grid[safej][safejj].has_other_thing(obj)) { //should be somewhere
                    obstacle++;
                    //do not place
                }
            }
            if (obstacle == 0) {
                for (var p = 0; p < obj.profile_i.length; p++) { //
                    var dj = obj.profile_i[p];
                    var djj = obj.profile_ii[p];
                    var safej = this.get_bounded_index_i(j + dj);
                    var safejj = this.get_bounded_index_ii(jj + djj);
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
    if (orient == UP) {
        return [i, this.get_bounded_index_ii(ii - 1)];
    } else if (orient == DOWN) {
        return [i, this.get_bounded_index_ii(ii + 1)];
    } else if (orient == LEFT) {
        return [this.get_bounded_index_i(i - 1), ii];
    } else if (orient == RIGHT) {
        return [this.get_bounded_index_i(i + 1), ii];
    } else if (orient == diagDownRight) {
        return [this.get_bounded_index_i(i + 1), this.get_bounded_index_ii(ii + 1)]
    } else if (orient == diagUpRight) {
        return [this.get_bounded_index_i(i + 1), this.get_bounded_index_ii(ii - 1)]
    } else if (orient == diagDownLeft) {
        return [this.get_bounded_index_i(i - 1), this.get_bounded_index_ii(ii + 1)]
    } else {
        return [this.get_bounded_index_i(i - 1), this.get_bounded_index_ii(ii - 1)]
    }
}

    //need this to because we have to use profile and not anchor
    //function that takes in a person, index, and orientation that the person is directed
    //returns new coordinates accordinating to the given orientation
    this.get_coords_from_orientation_neighbors = function(thing, index, orient) {
        var i = thing.profile_i[index]; //x value of the current position
        var ii = thing.profile_ii[index]; //y value of the current position
        //8 diifferent orientations
        //Board y value decreases as going up. (0,0) is at the top left of the board
        if (orient == UP) { 
            return [i, ii - 1]; //if the orientation is up, subtract one from the y value
        } else if (orient == DOWN) {
            return [i, ii + 1]; //if orientation is down, add one to the y value
        } else if (orient == LEFT) {
            return [i - 1, ii]; //if orientation is left, subtract one from the x value
        } else if (orient == RIGHT) {
            return [i + 1, ii]; //if orientation is right, add one to x value
        } else if (orient == diagDownRight) {
            return [i + 1, ii + 1]; //if moving diagianally down to the right, add oone to both x and y value
        } else if (orient == diagUpRight) {
            return [i + 1, ii - 1]; //if moving diagonally up to the right, add one to x, subtract one to y
        } else if (orient == diagDownLeft) {
            return [i - 1, ii + 1]; //if moving diagonally down to the left, subtract one from x, add one to y
        } else {
            return [i - 1, ii - 1]; //else, moving diagonally up to the left, subtract one from x and y
        }
    }

    //function takes in a person, updates the temp grid
    this.move_thing = function(thing) { //returns true if person is at exit, false otherwise
        var node = this.AStar(thing, 0); //using AStar algorithm to get the best move
        if (node == null) { //if no move found from initial AStar call
            node = this.AStar(thing, 1); // try to avoid others and break out of deadlock
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
                            var new_deltas = this.get_coords_from_orientation_neighbors(thing, x, orientation); 
                            var r = new_deltas[0]; //x value of the new move
                            var c = new_deltas[1]; //y value of the new move
                            var safe_r = this.get_bounded_index_i(r + thing.anchor_i); //bound the x value, making sure on the board
                            var safe_c = this.get_bounded_index_ii(c + thing.anchor_ii); //bound the y value, making sure on the board
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
                      if(thing.wait>wait_before_random_move*2){
                        var ran_exit_index = Math.floor(Math.random() * max_exits_on_grid); //get a random index to choose the exit
                        var new_exit = exit_locations[ran_exit_index]; //get the exit from the list of exits
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
                          else if(thing.wait>wait_before_random_move){ 
                            //get random orientation and try to move there
                            var orientation = random_orientation(); //random orientation
                            var can_move = true; //initially assume you can move
                            for (var x = 0; x < thing.profile_i.length; x++) { //go through every cell the person is occupying
                            //get next potential coordinates based off of the orientation
                                var new_deltas = this.get_coords_from_orientation_neighbors(thing, x, orientation);
                                var r = new_deltas[0]; //x value of new potential coordinate
                                var c = new_deltas[1]; //y value of new potential coordinate
                                var safe_r = this.get_bounded_index_i(r + thing.anchor_i); //bound the x coordiinate to make not out of bounds
                                var safe_c = this.get_bounded_index_ii(c + thing.anchor_ii); //bound the y coordinate to make not out of bounds
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

function draw_grid(data) {
    if (hall_layout == true) {
        width_i = 50;
        width_ii = 75;
    }
    if (fuller_lower == true) {
        width_i = 56;
        width_ii = 45;
    }
    if (classroom == true) {
        width_i = 40;
        width_ii = 35;
    }

    if (parseInt(width_i) > parseInt(width_ii)) {
        var width = 600;
        var height = 600 * (width_ii / width_i);
    } else {
        var width = 600 * (width_i / width_ii);
        var height = 600;
    }

    var width_cell = width / width_i;
    var height_cell = height / width_ii;

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
        for (var i = 0; i < width_i; i++) {
            for (var ii = 0; ii < width_ii; ii++) {
                // only redraw when there is a change. Nice optimization
                if (_data && _data[i][ii] === color_for_cell(data[i][ii])) {
                    continue;
                }
                context.clearRect(i * width_cell, ii * height_cell, width_cell, height_cell);
                context.fillStyle = color_for_cell(data[i][ii]);
                context.fillRect(i * width_cell, ii * height_cell, width_cell, height_cell);
            }
        }
    }

    draw_cells();
    // remember _data as prior rendering
    if (!_data) {
        _data = [];
    }
    for (var i = 0; i < width_i; i++) {
        _data[i] = [];
        for (var ii = 0; ii < width_ii; ii++) {
            _data[i][ii] = color_for_cell(data[i][ii]);
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
    if ((this.anchor_i == 0) || (this.anchor_i == width_i - 1)) {
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
            var safej = state.get_bounded_index_i(this.anchor_i + dj);
            var safejj = state.get_bounded_index_ii(this.anchor_ii + djj);
            state.temp_grid[safej][safejj].thing = this;
        }
    }

    this.remove_footprint = function(state) {
        for (var p = 0; p < this.profile_i.length; p++) { //
            var dj = this.profile_i[p];
            var djj = this.profile_ii[p];
            var safei = state.get_bounded_index_i(this.anchor_i + dj);
            var safeii = state.get_bounded_index_ii(this.anchor_ii + djj);
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
            var safej = state.get_bounded_index_i(this.anchor_i + dj);
            var safejj = state.get_bounded_index_ii(this.anchor_ii + djj);
            state.temp_grid[safej][safejj].thing = this;
        }
    }

    this.remove_footprint = function(state) {
        for (var p = 0; p < this.profile_i.length; p++) { //
            var dj = this.profile_i[p];
            var djj = this.profile_ii[p];
            var safei = state.get_bounded_index_i(this.anchor_i + dj);
            var safeii = state.get_bounded_index_ii(this.anchor_ii + djj);
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
            var safej = state.get_bounded_index_i(this.anchor_i + dj);
            var safejj = state.get_bounded_index_ii(this.anchor_ii + djj);
            state.temp_grid[safej][safejj].thing = this;
        }
    }

    this.remove_footprint = function(state) {
        for (var p = 0; p < this.profile_i.length; p++) { //
            var dj = this.profile_i[p];
            var djj = this.profile_ii[p];
            var safei = state.get_bounded_index_i(this.anchor_i + dj);
            var safeii = state.get_bounded_index_ii(this.anchor_ii + djj);
            state.temp_grid[safei][safeii].thing = null;
        }
    }
}

function random_orientation() {
    var r = Math.random() * 8;

    if (r < 1) {
        return LEFT;
    } else if (r < 2) {
        return UP;
    } else if (r < 3) {
        return RIGHT;
    } else if (r < 4) {
        return DOWN
    } else if (r < 5) {
        return diagDownRight;
    } else if (r < 6) {
        return diagUpRight;
    } else if (r < 7) {
        return diagDownLeft;
    } else {
        return diagUpLeft;
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
    if ((hall_layout == true) || (fuller_lower == true) || (classroom == true)) {
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
    interval_id = setInterval(simulate_and_visualize, ms_between_updates);
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

    if (take_snapshot) {
        var canvas = document.getElementById('grid');
        var context = canvas.getContext('2d');
        var encoder = new GIFEncoder();
        encoder.setRepeat(0); //0  -> loop forever
                        //1+ -> loop n times then stop
        encoder.setDelay(1); //go to next frame every n milliseconds
        encoder.start();
        encoder.addFrame(context)
        encoder.finish();
        encoder.download("gif_image"+take_snapshot_calls+".gif","image/gif");
            // "download.gif","image/gif");
        take_snapshot_calls = take_snapshot_calls+1;

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
        // var context = canvas.getContext('2d');
        // var encoder = GIFEncoder();
        // encoder.setRepeat(0); //0  -> loop forever
        //                 //1+ -> loop n times then stop
        // encoder.setDelay(1); //go to next frame every n milliseconds
        // encoder.start();
        // console.log('end sim counter was 1')
        // for (var i=0; i < context_list.length; i++) {
        //     encoder.addFrame(context, true);

        // }
        // // encoder.addFrame(context);
        // encoder.finish();
        // encoder.download("download.gif","image/gif");
        
        // canvas.toBlob(function(blob) {
        //     var newImg = document.createElement('img');
        //     // make smaller if you'd like
        //     //newImg.height=100;
        //     //newImg.width=100;
        //     url = URL.createObjectURL(blob);

        //     newImg.onload = function() {
        //         // no longer need to read the blob so it's revoked
        //         URL.revokeObjectURL(url);
        //     };

        //     newImg.src = url;
        //     var header = document.createElement("H2");
        //     var label = document.createTextNode("Label " + _indexCounter);
        //     _indexCounter++;
        //     header.appendChild(label);
        //     document.body.appendChild(header); //different than our child object type?
        //     document.body.appendChild(newImg);


        // encoder.setRepeat(0); //0  -> loop forever
        //                 //1+ -> loop n times then stop
        // encoder.setDelay(1); //go to next frame every n milliseconds
        // encoder.start();
        // encoder.addFrame(context);
        // encoder.finish();
        // if (end_sim_counter == 1) {
        //     console.log('end sim counter was 1')
        //     encoder.download("download.gif","image/gif");
        // }
    //     });
//     // }
// }
// }
