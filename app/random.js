/**
 * Handles random number generations (and seeds) for replicability of any run
 * 
 * 'npm install random-seed' to get this capability working
 */
(function(random) {

    random.generator = randomseed.uheprng();   // Make sure to use random-seed

    // Create pseudo-random number generator to use for all runs
    function create(seed) {
       if (typeof seed !== 'undefined') {
         random.generator = require('random-seed').create(seed); // specify initial seed
       } else {
         random.generator = require('random-seed').create();     // get what you get
       }
    }

    // random number between 0 and 1
    function next() {
       if (typeof random.generator !== 'undefined') {
         return random.generator.random()
       }
       return Math.random();
    }

    // random number between 0 (inclusive) and n (exclusive)
    function nextInt(n) {
      if (typeof random.generator !== 'undefined') {
         return random.generator.range(n);
       }
       // manually
       return Math.floor(Math.random() * n);
    }

    function nextIntBetween(min, max) {
      if (typeof random.generator !== 'undefined') {
        return random.generator.intBetween(min, max)
     }
     return Math.floor(Math.random() * (max - min)) + min;
    }

    // exported API
    random.create = create
    random.next = next
    random.nextInt = nextInt
    random.nextIntBetween = nextIntBetween

})(typeof random === 'undefined'?
            this['random']={}: random);
