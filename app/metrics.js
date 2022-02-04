/**
 * Handles all things metric
 *
 */

(function(metrics) {

    //heuristic options
    metrics.diagonal = false;   // initialize heuristic using diagonal distance
    metrics.manhattan = false; // boolean to use manhattan distance in heuristic, user can change this
    metrics.euclidean = true; // boolean to use euclidean distance in heuristic, user can change this

    //global variables for the diaginal distance
    var D = 1; //distance of one edge of the square
    var D2 = Math.sqrt(2); //distance from one corner of a square to the other

    //function that returns the diagonal distance between a current (x,y) position to a goal (x,y) position
    function diagonald(x, y, goalX, goalY) { //diagonal distance heuristic
	//the absolute value of the difference between the current position x value and the goal x value
	//the absolute value of the difference between the current position y value and the goal y value
	var dx = Math.abs(x - goalX);
	var dy = Math.abs(y - goalY); 

	//maybe try to explain better
	//dx and dy added together plus the minumum of dx and dy times the squareroot of 2 minus 2
	var h = D * (dx + dy) + (D2 - 2 * D) * Math.min(dx, dy);
	return h; //the diagoonal distance is returned
    }

    //function that returns the manhattan distance between a current (x,y) position to a goal (x,y) position
    function manhattand(x, y, goalX, goalY){ 
	// the absolute values of the differences of the current x and goal x and current y and goal y values added together
	var h = Math.abs(x-goalX) + Math.abs(y-goalY);
	return h; //return the distance
    }

    //function that returns the euclidean distance between a current (x,y) position to a goal (x,y) position
    function euclideand(x, y, goalX, goalY){ 
	//the absolute value of the difference between the current position x value and the goal x value
	//the absolute value of the difference between the current position y value and the goal y value
	var dx = Math.abs(x - goalX);
	var dy = Math.abs(y - goalY);
	//distance formula
	var h = Math.sqrt(Math.pow(dx,2)+ Math.pow(dy,2)); //squareroot of dx squared and dy squared added together
	return h; //return the distance
    }

    // export api
    metrics.diagonald = diagonald;
    metrics.manhattand = manhattand;
    metrics.euclideand = euclideand;

})(typeof metrics === 'undefined'?
           this['metrics']={}: metrics);
