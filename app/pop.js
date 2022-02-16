/**
 * Population knows the types of the entities
 *
 * All global variables are defined here.
 */

(function(pop) {

function Child(j, jj) {
    this.orientation = data.random_orientation();
    this.anchor_i = j
    this.anchor_ii = jj
    this.min_exiti = 0;
    this.min_exitii = 0;
    this.code = "c";
    this.goali = 0; //initially
    this.goalii = 0; //initially
    this.endi = 0; //initially
    this.endii = 0; // initially
    this.profile_i = [0];
    this.profile_ii = [0];
    this.width = 1;
    this.height = 1;
    this.wait = 0;
    this.type = 'Child';
    this.exittime = 0;
    this.waitsteps = 0;
    this.local_occupancy = [];
    this.path_i = [];
    this.path_ii = [];
    this.initial_path = [];

    this.color = function() {
        return "rgb(255,165,0)";
    }

    this.place_footprint = function(state) {
        state.temp_grid[this.anchor_i][this.anchor_ii].thing = this;
    }

    this.remove_footprint = function(state) {
        state.temp_grid[this.anchor_i][this.anchor_ii].thing = null;
    }
}

function Adult(j, jj) {
    this.orientation = data.random_orientation();
    this.anchor_i = j
    this.anchor_ii = jj
    this.min_exiti = 0;
    this.min_exitii = 0;
    this.code = "a";
    this.goali = 0; //initially
    this.goalii = 0; //initially
    this.endi = 0; //initially
    this.endii = 0; // initially
    this.wait = 0;
    // my projection
    this.profile_i = [1, 0]
    this.profile_ii = [0, 0]
    this.width = 2;
    this.height = 1;
    this.type = 'Adult';
    this.exittime = 0;
    this.waitsteps = 0;
    this.local_occupancy = [];
    this.path_i = [];
    this.path_ii = [];
    this.initial_path = [];

    this.color = function() {
        return "rgb(0,0,255)";
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
    this.orientation = data.random_orientation();
    this.anchor_i = j
    this.anchor_ii = jj
    this.min_exiti = 0;
    this.min_exitii = 0;
    this.code = "P";
    this.goali = 0; //initially
    this.goalii = 0; //initially
    this.endi = 0; //initially
    this.endii = 0;
    this.wait = 0;
    // my projection
    this.profile_i = [0, 0, 1, 1];
    this.profile_ii = [0, 1, 0, 1];
    this.width = 2;
    this.height = 2;
    this.type = 'AdultBackpack';
    this.exittime = 0;
    this.waitsteps = 0;
    this.local_occupancy = [];
    this.path_i = [];
    this.path_ii = [];
    this.initial_path = [];

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
    this.orientation = data.random_orientation();
    this.anchor_i = j
    this.anchor_ii = jj
    this.min_exiti = 0;
    this.min_exitii = 0;
    this.code = "B";
    this.goali = 0; //initially
    this.goalii = 0; //initially
    this.endi = 0; //initially
    this.endii = 0;
    this.wait = 0;
    this.exittime = 0;
    this.waitsteps = 0;
    this.local_occupancy = [];
    this.path_i = [];
    this.path_ii = [];
    this.initial_path = [];
    
    // my projection
    this.profile_i = [0, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3];
    this.profile_ii = [0, 0, 2, 1, 0, -1, -2, -3, 2, 1, 0, -1, -2, -3];
    this.width = 4;
    this.height = 6;
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

    function types() {
	return [
	    'Child',
	    'Adult',
	    'AdultBike',
	    'AdultBackpack',
	];
    }

    function factory(tpe, j, jj) {
	if (tpe == 'Child') {
	    return new Child(j, jj);
	} else if (tpe == 'Adult') {
	    return new Adult(j, jj);
	} else if (tpe == 'AdultBike') {
	    return new AdultBike(j, jj);
	} else if (tpe == 'AdultBackpack') {
	    return new AdultBackpack(j, jj);
	} else {
	    console.log("unknown type:" + tpe);
	    return None;
	}
    }

//this function is where an object can be placed on a grid
    function dimension(tpe) {
	if (tpe == 'Child') {
	    return [0,0,0,0];
	} else if (tpe == 'Adult') {
	    return [0, 1, 0, 0];
	} else if (tpe == 'AdultBike') {
	    return [ 0,3,2,3];
	} else if (tpe == 'AdultBackpack') {
	    return [0,1,0,1];
	} else {
	    return [1, 1,1,1]; // reasonable
	}
    }

    // exported API
    pop.types = types;
    pop.dimension = dimension;
    pop.factory = factory;

})(typeof pop === 'undefined'?
            this['pop']={}: pop);
