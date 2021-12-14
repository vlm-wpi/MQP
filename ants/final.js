// GUI state from prior update
var _data;

var UP = 180;
var DOWN = 90;
var LEFT = 270;
var RIGHT = 0;

var diagDownRight = 45;
var diagUpRight = 135;
var diagDownLeft = 225;
var diagUpLeft = 315;

var orientations = [315, 270, 225, 180, 90, 135, 0, 45];
var width_i = 50;
var width_ii = 50;
var max_children_on_grid = 1;
var current_num_children = max_children_on_grid;
var max_adult_on_grid = 1;
var current_num_adult = max_adult_on_grid;
var max_backpack_on_grid = 1;
var current_num_backpack = max_backpack_on_grid;
var max_bike_on_grid = 1;
var current_num_bike = max_bike_on_grid;
var total_peds_at_start = 0;
var max_obstacles_on_grid = 25;
var max_large_X_obstacles_on_grid = 0;
var max_exits_on_grid = 3;
var ms_between_updates = 1;
var take_snapshot = true;
var hall_layout = false;
var fuller_lower = false;

var total_child_collisions = 0;
var avg_child_collisions = 0;
var total_adult_collisions = 0;
var avg_adult_collisions = 0;
var total_backpack_collisions = 0;
var avg_backpack_collisions = 0;
var total_bike_collisions = 0;
var avg_bike_collisions = 0;
var total_collisions = 0;
var avg_collisions_total = 0;

var current_population = 0;

// HOOK UP GUI ELEMENTS: BEGIN
// -----------------------------------------------------
var numChildren = document.getElementById("numChildren");
numChildren.value = max_children_on_grid;
numChildren.oninput = function() {
    max_children_on_grid = this.value;
    current_num_children = max_children_on_grid;
}

var numAdults = document.getElementById("numAdults");
numAdults.value = max_adult_on_grid;
numAdults.oninput = function() {
    max_adult_on_grid = this.value;
    current_num_adult = max_adult_on_grid;
}

var numBackPacks = document.getElementById("numBackPacks");
numBackPacks.value = max_backpack_on_grid;
numBackPacks.oninput = function() {
    max_backpack_on_grid = this.value;
    current_num_backpack = max_backpack_on_grid;
}

var numBikes = document.getElementById("numBikes");
numBikes.value = max_bike_on_grid;
numBikes.oninput = function() {
    max_bike_on_grid = this.value;
    current_num_bike = max_bike_on_grid;
}

var ms_speed_slider = document.getElementById("ms_speed");
ms_speed_slider.value = ms_between_updates;
ms_speed_slider.oninput = function() {
  ms_between_updates = this.value;
}


var gridWidthi = document.getElementById("gridWidthi");
gridWidthi.value = width_i;
gridWidthi.oninput = function() {
    width_i = this.value;
}

var gridWidthii = document.getElementById("gridWidthii");
gridWidthii.value = width_ii;
gridWidthii.oninput = function() {
    width_ii = this.value;
}

var numExits = document.getElementById("numExits");
numExits.value = max_exits_on_grid;
numExits.oninput = function() {
    max_exits_on_grid = this.value;
}

var numObstacles = document.getElementById("numObstacles");
numObstacles.value = max_obstacles_on_grid;
numObstacles.oninput = function() {
    max_obstacles_on_grid = this.value;
}

var numXObstacles = document.getElementById("numXObstacles");
numXObstacles.value = max_large_X_obstacles_on_grid;
numXObstacles.oninput = function() {
    max_large_X_obstacles_on_grid = this.value;
}

var takeSnapshotCheckbox = document.getElementById("takeSnapshot");
if (take_snapshot) {
    takeSnapshotCheckbox.checked = true;
}
takeSnapshotCheckbox.oninput = function() {
    take_snapshot = takeSnapshotCheckbox.checked;
}

var hallLayoutCheckbox = document.getElementById("hallLayout");
if (hall_layout) {
    hallLayoutCheckbox.checked = true;
}
hallLayoutCheckbox.oninput = function() {
    hall_layout = hallLayoutCheckbox.checked;
}

var fullerLowerCheckbox = document.getElementById("fullerLower");
if (fuller_lower) {
    fullerLowerCheckbox.checked = true;
}
fullerLowerCheckbox.oninput = function() {
    fuller_lower = fullerLowerCheckbox.checked;
}

// HOOK UP GUI ELEMENTS: END
// -----------------------------------------------------

//creating a priority queue, not totally sure where to put the functions
const leftChild = (index) => index * 2 + 1;
const rightChild = (index) => index * 2 + 2;
const parent = (index) => Math.floor((index - 1) / 2);
var D = 1;
var D2 = Math.sqrt(2);


function diagonal(x, y, goalX, goalY) { //diagonal distance heuristic
    var dx = Math.abs(x - goalX);
    var dy = Math.abs(y - goalY);

    var h = D * (dx + dy) + (D2 - 2 * D) * Math.min(dx, dy);
    return h;
}

function Node(j, jj, exiti, exitii, endi, endii, parent, direction, goali, goalii, profilei, profileii) {
    this.i = j;
    this.ii = jj;
    this.direction = direction;

    this.exiti = exiti;
    this.exitii = exitii;
    this.endi = endi;
    this.endii = endii;
    this.goali = goali;
    this.goalii = goalii;
    this.profile_i = profilei;
    this.profile_ii = profileii;

    // starting from the last node (which is the exit) go backwards until you
    // get to a node whose parent is the original, then return its location [i ,ii]
    this.initial_step = function() {
        var n = this;
        if (this.parent === null) {
            return [];
        } // sanity check

        // find node whose parent has no parent, sincee that node is the origin and then
        // n is the first step in the direction of the final path.
        while (typeof n.parent.parent !== 'undefined') {
            n = n.parent;
        }
        return [n.i, n.ii, n.direction, n.profile_i, n.profile_ii];
    }
    this.key = function() {
        return "" + this.i + "," + this.ii;
    }

    //checking if any part of the person is touching an exit
    this.done = function() {
        for (index = 0; index < this.profile_i.length; index++) {
            if ((this.profile_i[index] + this.i) >= this.exiti && (this.profile_i[index] + this.i) <= this.endi &&
                (this.profile_ii[index] + this.ii) >= this.exitii && (this.profile_ii[index] + this.ii) <= this.endii) {
                return true; // if any part of the person is in an exit
        }
    }
}

    // how many steps fromo starting spot.
    this.parent = parent;
    this.g = 0;
    if (typeof parent === 'undefined') {
        this.g = 0;
    } else {
        this.g = parent.g + 1;
    }

    // this ensures that two nodes can be compared using < operator.
    Node.prototype.valueOf = function() {
        // f = g + h
        var h = diagonal(this.i, this.ii, this.goali, this.goalii);
        return this.g + h;
    }
}

function minHeap() {
    this.heap = [];

    this.swap = function(indexOne, indexTwo) {
        const tmp = this.heap[indexOne];
        this.heap[indexOne] = this.heap[indexTwo];
        this.heap[indexTwo] = tmp;
    };

    this.peek = function() {
        // the root is always the highest priority item, make sure actually lowest
        return this.heap[0];
    };

    this.insert = function(item) {
        // push element to the end of the heap
        this.heap.push(item);

        // the index of the element we have just pushed
        let index = this.heap.length - 1;

        // if the element is greater than its parent:
        // swap element with its parent
        while (index !== 0 && this.heap[index] < this.heap[parent(index)]) {
            this.swap(index, parent(index));
            index = parent(index);
        }
    };

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

        return root;
    };

    this.heapify = function(index) { //used maxheap so confused on what to change
        let left = leftChild(index);
        let right = rightChild(index);
        let smallest = index;

        // if the left child is bigger than the node we are looking at
        if (left < this.heap.length && this.heap[smallest] > this.heap[left]) {
            smallest = left; //i think this is wrong
        }

        // if the right child is bigger than the node we are looking at
        if (right < this.heap.length && this.heap[smallest] > this.heap[right]) {
            smallest = right;
        }

        // if the value of largest has changed, then some swapping needs to be done
        // and this method needs to be called again with the swapped element
        if (smallest != index) {
            this.swap(smallest, index);
            this.heapify(smallest);
        }
    };

    this.size = function() { //gets the length of the heap
        return this.length;
    }
}

function State() {
    var total_peds_at_start = parseInt(max_children_on_grid) + parseInt(max_adult_on_grid) + parseInt(max_backpack_on_grid) + parseInt(max_bike_on_grid);
    this.grid = [];
    this.temp_grid = [];
    this.population = [];

    this.get_bounded_index_i = function(index) {
        var bounded_index_i = index;
        if (index < 0) {
            bounded_index_i = 0;
        }
        if (index >= width_i) {
            bounded_index_i = width_i - 1;
        }
        return bounded_index_i;
    }
    this.get_bounded_index_ii = function(index) {
        var bounded_index_ii = index;
        if (index < 0) {
            bounded_index_ii = 0;
        }
        if (index >= width_ii) {
            bounded_index_ii = width_ii - 1;
        }
        return bounded_index_ii;
    }

    this.init_grids = function() {
        for (var i = 0; i < width_i; i = i + 1) {
            this.grid[i] = [];
            this.temp_grid[i] = [];
            for (var ii = 0; ii < width_ii; ii = ii + 1) {
                this.grid[i][ii] = new Cell(i, ii);
                this.temp_grid[i][ii] = new Cell(i, ii);
            }
        }
    }
    total_population_over_time = [total_peds_at_start];

    this.move_things = function() {
        // move everyone at TOP level of abstraction
        // assume: population knows loc AND temp_grid is properly set.
        for (var p = this.population.length - 1; p >= 0; p--) {
            var thing = this.population[p][0];
            var object_type = this.population[p][1];
            if (this.move_thing(thing)) {
                this.population.splice(p, 1); // remove
                // console.log("population: " + this.population)
                var current_population = this.population.length
                total_population_over_time.push(current_population)
                if (current_population > 0) {
                    // console.log(object_type)
                    if (object_type == 'Child') {
                        current_num_children = current_num_children - 1;
                    } else if (object_type == 'Adult') {
                        current_num_adult = current_num_adult - 1;
                    } else if (object_type == 'AdultBackpack') {
                        current_num_backpack = current_num_backpack - 1;
                    } else if (object_type == 'AdultBike') {
                        current_num_bike = current_num_bike - 1;
                    }
                } else if (current_population == 0) {
                    current_num_children = 0;
                    current_num_adult = 0;
                    current_num_backpack = 0;
                    current_num_bike = 0;
                    end_simulation()
                    console.log('I ended')
                    avg_collisions_total = total_collisions/total_peds_at_start;
                    avg_child_collisions = total_child_collisions/max_children_on_grid;
                    avg_adult_collisions = total_adult_collisions/max_adult_on_grid;
                    avg_backpack_collisions = total_backpack_collisions/max_backpack_on_grid;
                    avg_bike_collisions = total_bike_collisions/max_bike_on_grid;
                    console.log("total collisions: " + total_collisions)
                    console.log("total peds at start: " + total_peds_at_start)
                    console.log("average collisions total: " + avg_collisions_total)                    
                    console.log("total child collisions: " + total_child_collisions)
                    console.log("average child: " + avg_child_collisions)
                    console.log("total adult collisions: " + total_adult_collisions)
                    console.log("average adult: " + avg_adult_collisions)
                    console.log("total backpack collisions: " + total_backpack_collisions)
                    console.log("average backpack: " + avg_backpack_collisions)
                    console.log("total bike collisions: " + total_bike_collisions)
                    console.log("average bike: " + avg_bike_collisions)

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
        for (var i = 0; i < width_i; i = i + 1) {
            for (var ii = 0; ii < width_ii; ii = ii + 1) {
                // adjust reference
                this.grid[i][ii].thing = this.temp_grid[i][ii].thing;
            }
        }
    }

    function removeItemOnce(arr, value) {
        var index = arr.indexOf(value);
        if (index > -1) {
            arr.splice(index, 1);
        }
    }

    // only if do not contain an obstacle. Must check entire profile
    // if 'others' than check to avoid other shapes as well
    this.get_neighbors = function(x, y, thing, state, others) { //gets the eight neighbors as a possible move
        var parents = [];
        var oix = -1;
        for (var di = -1; di <= 1; di++) {
            for (var dii = -1; dii <= 1; dii++) {
                if (di == 0 && dii == 0) {
                    continue;
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
                var safe = 1;
                for (var p = 0; p < thing.profile_i.length; p++) {
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

                    if (state.temp_grid[sr][sc].has_obstacle()) {
                        safe = 0;
                        break;
                    } else if (others) {
                        if (state.temp_grid[sr][sc].has_other_thing(thing)) {
                            safe = 0;
                            break;
                        }
                    }
                }
                if (safe) {
                    parents.push([safe_r, safe_c, orientations[oix]]);
                }
            }
        }

        return parents;
    }


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

    this.AStar = function(thing, others) {
        //step 1
        var open = new minHeap();
        //step 2
        var closed = {};
        var open_hash = {};
        var anchorX = thing.anchor_i;
        var anchorY = thing.anchor_ii;
        var exiti = thing.min_exiti;
        var exitii = thing.min_exitii;
        var endi = thing.endi;
        var endii = thing.endii;
        var goali = thing.goali;
        var goalii = thing.goalii;
        var profilei = thing.profile_i;
        var profileii = thing.profile_ii

        var n = new Node(anchorX, anchorY, exiti, exitii, endi, endii, undefined, -1, goali, goalii, profilei, profileii);
        open.insert(n);
        open_hash[n.key()] = n;

        //step 3
        var heapLength = open.heap.length;

        while (open.heap.length > 0) {
            //do i need to call heapify function?
            var q = open.extractMin(); //3a,b
            var successors = this.get_neighbors(q.i, q.ii, thing, this, others); //3c, this function only returns coordinates
            //shuffle array
            // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
            for (var i = successors.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = successors[i];
                successors[i] = successors[j];
                successors[j] = temp;
            } // does this do anything???
            for (i = 0; i < successors.length; i++) {
                var succ = new Node(successors[i][0], successors[i][1], q.exiti, q.exitii, q.endi, q.endii, q, successors[i][2], q.goali, q.goalii, q.profile_i, q.profile_ii);

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
        var exit_locations = []; //might need to be global variable
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
        } else {
            for (var n = 0; n < max_obstacles_on_grid; n++) {
                var j = get_random_int(0, width_i)
                var jj = get_random_int(0, width_ii)

                var obj = new Obstacle(j, jj);
                this.temp_grid[j][jj].thing = obj;
            }
            for (var n = 0; n < max_exits_on_grid; n++) {
                //get 2 random ints from 0-gridlength-3 (for j and jj)
                //which ever one is bigger we keep and change the other one to 0 or grid_length (so it goes to an edge)
                var j = get_random_int(0, width_i - 3);
                var jj = get_random_int(0, width_ii - 3);
                if (j > jj) {
                    var j = j;
                    var jj = ((width_ii - 1) * (Math.round(Math.random())));
                } else {
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
        while (num_children < max_children_on_grid) {
            var j = get_random_int(0, width_i);
            var jj = get_random_int(0, width_ii);
            //added this in as part of exit distances
            exit_distances = [];
            for (var exit = 0; exit < exit_locations.length; exit++) {
                var exiti = exit_locations[exit].anchor_i;
                var exitii = exit_locations[exit].anchor_ii;
                var local_endi = exit_locations[exit].profile_i[3] + exit_locations[exit].anchor_i;
                var local_endii = exit_locations[exit].profile_ii[3] + exit_locations[exit].anchor_ii;
                var current_distance = calc_distance(j, jj, exiti, exitii) //should calculate to goal?
                //randomly getting a specific exit cell goal
                var rand_x = get_random_int(0, 3);
                var rand_y = get_random_int(0, 3);
                var local_goali = exit_locations[exit].profile_i[rand_x] + exit_locations[exit].anchor_i;
                var local_goalii = exit_locations[exit].profile_ii[rand_y] + exit_locations[exit].anchor_ii;
                var list = [current_distance, exiti, exitii, local_endi, local_endii, local_goali, local_goalii] //keeping track of the beginning and end of exit
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
            if (obstacle == 0) {
                for (var p = 0; p < objChild.profile_i.length; p++) { //
                    var dj = objChild.profile_i[p];
                    var djj = objChild.profile_ii[p];
                    var safej = this.get_bounded_index_i(j + dj);
                    var safejj = this.get_bounded_index_ii(jj + djj);
                    this.temp_grid[safej][safejj].thing = objChild; //need to fix to always have correct number on floor
                }
                this.population.push([objChild, 'Child']);
                // console.log(this.population)
                num_children++;
            }
        }
        // console.log(min_exit_distance)
        // console.log(min_exiti)
        // console.log(min_exitii)
        var num_adultbackpack = 0;
        while (num_adultbackpack < max_backpack_on_grid) {
            var j = get_random_int(0, width_i)
            var jj = get_random_int(0, width_ii)
            //added this in as part of exit distances
            exit_distances = [];
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
            }
        }
        var num_adult = 0;
        while (num_adult < max_adult_on_grid) {
            var j = get_random_int(0, width_i - 1)
            var jj = get_random_int(0, width_ii - 1)
            //added this in as part of exit distances
            exit_distances = [];
            for (var exit = 0; exit < exit_locations.length; exit++) {
                var exiti = exit_locations[exit].anchor_i;
                var exitii = exit_locations[exit].anchor_ii;
                var local_endi = exit_locations[exit].profile_i[3] + exit_locations[exit].anchor_i;
                var local_endii = exit_locations[exit].profile_ii[3] + exit_locations[exit].anchor_ii;
                var current_distance = calc_distance(j, jj, exiti, exitii)
                //randomly getting a specific exit cell goal
                var rand_x = get_random_int(0, 3);
                var rand_y = get_random_int(0, 3);
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
            }
        }

        var num_bike = 0;
        while (num_bike < max_bike_on_grid) {
            var j = get_random_int(0, width_i)
            var jj = get_random_int(0, width_ii)
            //added this in as part of exit distances
            exit_distances = [];
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
    this.get_coords_from_orientation_neighbors = function(thing, index, orient) {
        var i = thing.profile_i[index];
        var ii = thing.profile_ii[index];

        if (orient == UP) {
            return [i, ii - 1];
        } else if (orient == DOWN) {
            return [i, ii + 1];
        } else if (orient == LEFT) {
            return [i - 1, ii];
        } else if (orient == RIGHT) {
            return [i + 1, ii];
        } else if (orient == diagDownRight) {
            return [i + 1, ii + 1];
        } else if (orient == diagUpRight) {
            return [i + 1, ii - 1];
        } else if (orient == diagDownLeft) {
            return [i - 1, ii + 1];
        } else {
            return [i - 1, ii - 1];
        }
    }

    this.move_thing = function(thing) {
        var node = this.AStar(thing, 0); //using AStar algorithm to get the best move
        if (node == null) {
            node = this.AStar(thing, 1); // try to avoid others and break out of deadlock
            if (node == null) {
                thing.stuck = 1;
                return false;
            }
        }

        var new_coords = node.initial_step();
        var exiti = thing.min_exiti;
        var exitii = thing.min_exitii;

        // hack to fix
        var count = 0;
        for (index = 0; index < node.profile_i.length; index++) {
            //check if at exit
            if ((new_coords[0] + node.profile_i[index]) >= node.exiti && (new_coords[0] + node.profile_i[index]) <= node.endi &&
                (new_coords[1] + node.profile_ii[index]) >= node.exitii && (new_coords[1] + node.profile_ii[index]) <= node.endii) {
                count++;
        }
    }
    if (count > 0) {
            thing.remove_footprint(this); //remove object if any part of the object is touching the exit
            return true; // remove
        }
        //now make sure that you can move to the place you want to
        else {
            var j = new_coords[0];
            var jj = new_coords[1];
            var orientation = new_coords[2]; // direction to aim
            // handles collisions by doing NOTHING. If spot that you are
            // trying to move to DOESN'T HAVE a thing then you are free to
            // move, but you have to check profile.

            try {
                var next = this.temp_grid[j][jj];
                if (typeof next === 'undefined') {} else {
                    if (!next.has_other_thing(thing)) {

                        // maybe could have break if collides so doesn't
                        // have to keep going through loop. need to check
                        // all of the cells of the thing
                        var collision = 0;
                        for (var x = 0; x < thing.profile_i.length; x++) {
                            var new_deltas = this.get_coords_from_orientation_neighbors(thing, x, orientation);
                            var r = new_deltas[0];
                            var c = new_deltas[1];
                            var safe_r = this.get_bounded_index_i(r + thing.anchor_i);
                            var safe_c = this.get_bounded_index_ii(c + thing.anchor_ii);
                            if (this.temp_grid[safe_r][safe_c].has_other_thing(thing)) { //if something in the cell
                                collision = collision + 1; //add one to collision
                                // console.log(collision)
                                // console.log(thing.type)
                                if (thing.type == 'Child') {
                                    total_child_collisions = total_child_collisions + 1;
                                    total_collisions = total_collisions + 1;
                                    // console.log("num collisions: " + total_collisions)
                                    // console.log("total_child_collisions: " + total_child_collisions)
                                }
                                if (thing.type == 'Adult') {
                                    total_adult_collisions = total_adult_collisions + 1;
                                    total_collisions = total_collisions + 1;
                                    // console.log("num collisions: " + total_collisions)
                                    // console.log("total_adult_collisions: " + total_adult_collisions)
                                }
                                if (thing.type == 'AdultBackpack') {
                                    total_backpack_collisions = total_backpack_collisions + 1;
                                    total_collisions = total_collisions + 1;
                                    // console.log("num collisions: " + total_collisions)
                                    // console.log("total_backpack_collisions: " + total_backpack_collisions)
                                }
                                if (thing.type == 'AdultBike') {
                                    total_bike_collisions = total_bike_collisions + 1;
                                    total_collisions = total_collisions + 1;
                                    // console.log("num collisions: " + total_collisions)
                                    // console.log("total_bike_collisions: " + total_bike_collisions)
                                }
                            }
                        }
                    }

                    if (collision == 0) { //if no collision for any cells then can move whole piece
                        // where thing is RIGHT NOW
                        var i = thing.anchor_i;
                        var ii = thing.anchor_ii;

                        // clear old one
                        thing.remove_footprint(this);

                        thing.anchor_i = j;
                        thing.anchor_ii = jj;

                        // move into new one
                        thing.wait = 0;
                        thing.place_footprint(this);
                    }
                    else {
                      //add one to its still
                      thing.wait++;
                          //if it's still is greater than 5, try to move in any other direction other than the one you are trying to go to
                          if(thing.wait>5){ //can play around with this number
                            //get random orientation and try to move there
                            var orientation = random_orientation();
                            var can_move = true;
                            for (var x = 0; x < thing.profile_i.length; x++) { 
                                var new_deltas = this.get_coords_from_orientation_neighbors(thing, x, orientation);
                                var r = new_deltas[0];
                                var c = new_deltas[1];
                                var safe_r = this.get_bounded_index_i(r + thing.anchor_i);
                                var safe_c = this.get_bounded_index_ii(c + thing.anchor_ii);
                                if (this.temp_grid[safe_r][safe_c].has_other_thing(thing)){ //if something in the cell
                                  can_move = false;
                              }
                          }
                          if (can_move){
                              //change anchor and call place footprint
                              // clear old one
                              thing.remove_footprint(this);
                              //var place_holder = thing.orientation
                              thing.orientation = orientation;
                              next_coords = this.get_coords_from_orientation(thing); 
                              //thing.orientation = place_holder;
                              thing.anchor_i = next_coords[0];
                              thing.anchor_ii = next_coords[1];
                              thing.place_footprint(this);
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
    if ((hall_layout == true) || (fuller_lower == true)) {
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
        var encoder = GIFEncoder();
        encoder.setRepeat(0); //0  -> loop forever
                        //1+ -> loop n times then stop
        encoder.setDelay(1); //go to next frame every n milliseconds
        encoder.start();
        console.log('end sim counter was 1')
        encoder.addFrame(context);
        encoder.finish();
        encoder.download("download.gif","image/gif");
        
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
    // }
}
}
