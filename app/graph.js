/**
 * Graph Module
 *
 * Here we visualize all of the data.
 * Are we not using this at all of in headless mode?
 * //use data from app??
 */
(function(graph) {
  
  let start = Date.now();
	  //initial empty data
	  var lineData = []; 
	  var lineData2 = [];
	  
	  //set the dimensions
	  var margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 50
      },
      width = 1000,
      height = 500;
      
    //https://www.sitepoint.com/creating-simple-line-bar-charts-using-d3-js/#:~:text=We’ll%20be%20using%20d3.svg.line%20%28%29%20to%20draw%20our,is%20how%20we%20define%20the%20line%20generator%20function%3A
    //set the ranges
      xRange = d3.scale.linear().range([margin.left, width - margin.right]).domain([0, 2000]),
      yRange = d3.scale.linear().range([height - margin.top, margin.bottom]).domain([0,40]),
      //define the axes
      xAxis = d3.svg.axis()
        .scale(xRange)
        .tickSize(5)
        .tickSubdivide(true),
      yAxis = d3.svg.axis()
        .scale(yRange)
        .tickSize(5)
        .orient('left')
        .tickSubdivide(true);
    
      //define the line
     var lineFunc = d3.svg.line()
        .x(function(d) {
          return xRange(d.x);
        })
        .y(function(d) {
          return yRange(d.y);
        })
        .interpolate('linear');
      
    //add svg canvas
    //this vis is only goint to give the domain with the original data
    var vis = d3.select('#visualisation') 
    //add x axis
    var x = vis.append('svg:g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + (height - margin.bottom) + ')')
      .call(xAxis);
  
    //add y axis
    vis.append('svg:g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + (margin.left) + ',0)')
      .call(yAxis);
    
    //this is what needs to be transitioned each time when it updates
    //add valueline path
    var toUpdate = vis.append('svg:path')
      .attr('d', lineFunc(lineData))
      .attr('stroke', 'blue')
      .attr('stroke-width', 2)
      .attr('fill', 'none');
    
    var anotherUpdate = vis.append('svg:path')
      .attr('d', lineFunc(lineData2))
      .attr('stroke', 'green')
      .attr('stroke-width', 2)
      .attr('fill', 'none');
    
    //second graph
    var vis2 = d3.select('#visualisation2')
    var x2 = vis2.append('svg:g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + (height - margin.bottom) + ')')
      .call(xAxis);
    
    vis2.append('svg:g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + (margin.left) + ',0)')
      .call(yAxis);
      
    //this is what needs to be transitioned each time when it updates
    var toUpdate2 = vis2.append('svg:path')
      .attr('d', lineFunc(lineData))
      .attr('stroke', 'blue')
      .attr('stroke-width', 2)
      .attr('fill', 'none');
      
    var anotherUpdate2 = vis2.append('svg:path')
      .attr('d', lineFunc(lineData2))
      .attr('stroke', 'green')
      .attr('stroke-width', 2)
      .attr('fill', 'none');
    
    var ms_between_updates = 100;
    var value = 20;
    var valueGreen = 20;
  
    function simulate () {
      //get another value
      if (Math.random() < 0.5) {
        value -= 1;
      } else {
        value += 1;
    }
    if (Math.random() < 0.5) {
      valueGreen -= 1;
    } else {
      valueGreen += 1;
    }
    let now = Date.now();
    var value2 = now - start;

    // add this data to an existing data source...
    lineData.push({x: value2,y: value});
    lineData2.push({x: value2,y: valueGreen});
    //lineData = lineData.slice(-20);
    // lineData2 = lineData2.slice(-20);
    //now need to call .transition
    toUpdate.transition()
      .attr('d', lineFunc(lineData))
    anotherUpdate.transition()
      .attr('d', lineFunc(lineData2))
    toUpdate2.transition()
      .attr('d', lineFunc(lineData))
    anotherUpdate2.transition()
      .attr('d', lineFunc(lineData2))
    //changing the domain
    xRange = d3.scale.linear().range([margin.left, width - margin.right]).domain([0, d3.max(lineData, function(d) {
      return d.x;
    })])
    //update the axis to show the change
    xAxis = d3.svg.axis()
      .scale(xRange)
      .tickSize(5)
      .tickSubdivide(true)
   x.transition().call(xAxis)
    x2.transition().call(xAxis)
    }
  
  function start_graph() {
    interval_id = setInterval(simulate, ms_between_updates);
  }
  start_graph();

  //use this to get the actual data
  //if (!gui.headless) { document.getElementById("total_" + object_type + "_exit").innerHTML = total_time; }

function get_graph() {
  return lineData; //have no idea what this should be returning
}
    // export JUST what we want to
    graph.start_graph = start_graph;

    // make sure we keep reference so it can be retrieved AFTER simulation is over.
    graph.get_graph = get_graph;

})(typeof graphs === 'undefined'?
            this['graphs']={}: graphs);