/**
 * Handles random number generations (and seeds) for replicability of any run
 * 
 * 'npm install random-seed' to get this capability working
 */
(function(debug) {

   debug.active = false;

   function log(msg) {
       if (debug.active) {
         console.log(msg)
       }
   }

   // exported API
   debug.log = log

})(typeof debug === 'undefined'?
            this['debug']={}: debug);
