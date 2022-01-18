// Simple node.js script which uses sharedModule.js
  
// Get module.exports of sharedModule
const utilities = require('./sharedModule');
  
// Print frequency of character
console.log(utilities.getFrequency("GeeksForGeeks"));
