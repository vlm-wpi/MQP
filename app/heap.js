/**
 * Heap structures
 *
 */

(function(heap) {

    // variables used in the priority queue
    const leftChild = (index) => index * 2 + 1;
    const rightChild = (index) => index * 2 + 2;
    const parent = (index) => Math.floor((index - 1) / 2);

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
	    
            // if the left index is less than the length of the heap and
            // the left child is smaller than the node we are looking at
            if (left < this.heap.length && this.heap[smallest] > this.heap[left]) {
		smallest = left; //change the smallest value to the left value
            }

            // if the right index is less than the length of the heap and
            // the right child is smaller than the node we are looking at
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

    // export this function
    heap.minHeap = minHeap;

})(typeof heap === 'undefined'?
   this['heap']={}: heap);
