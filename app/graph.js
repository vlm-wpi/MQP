/**
 * Graph Module
 *
 * Here we visualize all of the data.
 * Are we not using this at all of in headless mode?
 * //use data from app??
 */
(function(graph) {
  
	  var things = pop.types(); //each type of a person
	  var value2 = 0; //for x Axis, number of board updates
	  //empty arrays for each type of person. Make sure the population types never changes order!
	  var lineData = []; //initial empty data
	  var totalPopData = [{x: value2,y: final.total_peds_at_start}];
	  for (i = 0; i < things.length; i++) {
	    var tpe = things[i];
	    lineData[i] = [];
	}
	  
	  //set the dimensions
	  var margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 50
      },
      width = 500 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;
      
    //https://www.sitepoint.com/creating-simple-line-bar-charts-using-d3-js/#:~:text=We’ll%20be%20using%20d3.svg.line%20%28%29%20to%20draw%20our,is%20how%20we%20define%20the%20line%20generator%20function%3A
    //set the ranges
    var yMax = 0;
    //get the largest value out of all the types of people
    //I think we can just use the total population -- yes
    //need this code if take total population off
	  //for (i = 0; i < things.length; i++) {
	 //   var tpe = things[i];
	 //   if (data.max[tpe]>yMax){
	 //     yMax = data.max[tpe];
	//    }
	//}
      xRange = d3.scaleLinear().range([margin.left, width - margin.right]).domain([0, 1]), //terms of board updates
      yRange = d3.scaleLinear().range([height - margin.top, margin.bottom]).domain([0,final.total_peds_at_start]),
      
    //define the axes
    xAxis = d3.axisBottom()
      .scale(xRange)
      .tickSize(5),
    yAxis = d3.axisLeft()
      .scale(yRange)
      .tickSize(5);
    
    //define the line
    var lineFunc = d3.line()
      .x(function(d) {
        return xRange(d.x);
      })
      .y(function(d) {
        return yRange(d.y);
      });
      
   //add svg canvas
    var vis = d3.select('#visualisation') 
    
  //add x axis
  var x = vis.append('svg:g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + (height - margin.bottom) + ')')
    .call(xAxis);
    
  // Add the text label for the x axis
  //http://www.d3noob.org/2012/12/adding-axis-labels-to-d3js-graph.html
  vis.append("text")
    .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom) + ")")
    .style("text-anchor", "middle")
    .text("Time (Number of Board Updates) ");
  
  //add y axis
  vis.append('svg:g')
     .attr('class', 'y axis')
    .attr('transform', 'translate(' + (margin.left) + ',0)')
    .call(yAxis);
    
  // Add the text label for the Y axis
  vis.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Number of People");
  //title
  vis.append("text")
   .attr("x", width/2)
   .attr("y", margin.top)
   .attr("text-anchor", "middle")
   .style("font-size", "16px")
   .text("Number of People by Type on the Grid Over Time");
    
  //this is what needs to be transitioned each time when it updates
  //add valueline path
  //creating an array of values to make a line for the graph
  var updates = [];
  for (i = 0; i < things.length; i++) {
    var tpe = things[i];
    //create new object to get its color, there might be a better way to do this
    var obj = pop.factory(tpe,0,0);
    var color = obj.color();
    updates[i] = vis.append('svg:path')
      .attr('d', lineFunc(lineData[i]))
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('fill', 'none');
  }
  //adding values for the total population
  var total = vis.append('svg:path')
    .attr('d', lineFunc(totalPopData))
    .attr('stroke', "black")
    .attr('stroke-width', 2)
    .attr('fill', 'none');
    
  var ms_between_updates = 100; //dont think i need
  var value = 20;
  var valueGreen = 20;
  var num_updates = 0;
  
  function simulate () {
    
    num_updates++;
    value2++; //add one board update
    // console.log("Number of updates:" + num_updates);
    for (i = 0; i < things.length; i++) {
      var tpe = things[i];
      value = data.current[tpe];
      lineData[i].push({x: value2,y: value});
    }
    totalPopData.push({x: value2,y: final.current_population});
    //update every line
    for (i = 0; i < updates.length; i++) {
      updates[i].transition()
      .attr('d', lineFunc(lineData[i]));
    }
    total.transition()
      .attr('d', lineFunc(totalPopData));
  //lineData = lineData.slice(-20); //only if want to split
 // lineData2 = lineData2.slice(-20);
  //can just do lineData[0] because all the same?
  xRange = d3.scaleLinear().range([margin.left, width - margin.right]).domain([0, d3.max(lineData[0], function(d) {
    return d.x;
  })]);
  //update the axis to show the change
  xAxis = d3.axisBottom()
      .scale(xRange)
      .tickSize(5);
  x.transition().call(xAxis);
  }

  //checking what data to use for graphs
  var total_data = [];
	if (data.total_collide) {
	    total_data.push(final.collisions_total);
	} if (data.average_collide) {
	   total_data.push(final.collisions_average);
	}if (data.total_exit) {
	    total_data.push(final.exit_total);
	}if (data.average_exit) {
	    total_data.push(final.exit_average);
	}
  
  function createBarGraph(){
    console.log('here');
    for(k=0; k<total_data.length; k++){
      console.log('#visualisation'+k);
    var svg = d3.select('#visualisation'+k),
            margin = 200,
            width = svg.attr("width") - margin,
            height = svg.attr("height") - margin

    var data = []
    for (i = 0; i < things.length; i++) {
      var tpe = things[i];
      var info = total_data[k];
      value = info[tpe];
      data.push({Type: tpe,Value: value});
    }
    //data.push({Type: "Total",Value: final.total_collisions});
    
    //array of keys
    const types = data.map(function(obj){
      return obj.Type;
    });
    //array of values
    var num = data.map(function(obj){
      return obj.Value;
    });
    //max value
    var maxValue = d3.max(num);
   
   var xScale = d3.scaleBand()
    .range([0, width])
    .padding(0.05)
    .domain(types)
    
    var yScale = d3.scaleLinear()
      .range([0, height])
      .domain([maxValue, 0]); //try to change to data.max
      
    var g = svg.append("g")
            .attr("transform", "translate(" + 100 + "," + 100 + ")");
    //adding x axis
    g.append("g")
      .attr("transform", "translate(0," + height + ")")
     .call(d3.axisBottom(xScale)).append("text")
     .attr("y", height - 250).attr("x", width - 100)
     .attr("text-anchor", "end").attr("font-size", "15px")
     .text("Type of Person");
    //adding y axis
    g.append("g")
      .call(d3.axisLeft(yScale).tickFormat(function(d){
             return d;
         }).ticks(10))
     .append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", 6)
     .attr("dy", "-5.1em")
     .attr("text-anchor", "end")
     .text("Number of Collisions");
    //plotting
    g.selectAll(".bar")
     .data(data)
     .enter().append("rect")
     .attr("class", "bar")
     //.attr('d', barFunc(collision_data))
     .attr("x", function(d) { return xScale(d.Type); })
     .attr("y", function(d) { return yScale(d.Value); })
     .attr("width", xScale.bandwidth())
     .attr("height", function(d) { return height - yScale(d.Value); });
     
    }
     
     /*//graph for exit time
     var svgE = d3.select('#visualisation3'),
            marginE = 200,
            widthE = svgE.attr("width") - marginE,
            heightE = svgE.attr("height") - marginE

    var exit_data = []
    for (i = 0; i < things.length; i++) {
      var tpe = things[i];
      var valueE = document.getElementById("total_" + tpe + "_exit").innerHTML;
      exit_data.push({Type: tpe,Exit: valueE});
      console.log({Type: tpe,Exit: valueE});
    }
    exit_data.push({Type: "Total",Exit: final.total_exit_time});
    
    //array of keys
    const typesE = exit_data.map(function(obj){
      return obj.Type;
    });
    //array of values
    var exitNum = exit_data.map(function(obj){
      return obj.Exit;
    });
    //max value
    var maxExit = d3.max(exitNum);
   
   var xScaleE = d3.scaleBand()
    .range([0, widthE])
    .padding(0.05)
    .domain(typesE)
    
    var yScaleE = d3.scaleLinear()
      .range([0, heightE])
      .domain([maxExit, 0]); //try to change to data.max
      
    var gE = svgE.append("g")
            .attr("transform", "translate(" + 100 + "," + 100 + ")");
    //adding x axis
    gE.append("g")
      .attr("transform", "translate(0," + heightE + ")")
     .call(d3.axisBottom(xScale)).append("text")
     .attr("y", heightE - 250).attr("x", widthE - 100)
     .attr("text-anchor", "end").attr("font-size", "15px")
     .text("Type of Person");
    //adding y axis
    gE.append("g")
      .call(d3.axisLeft(yScaleE).tickFormat(function(d){
             return d;
         }).ticks(10))
     .append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", 6)
     .attr("dy", "-5.1em")
     .attr("text-anchor", "end")
     .text("Time taken to exit (in board updates)");
    //plotting
    gE.selectAll(".bar")
     .data(exit_data)
     .enter().append("rect")
     .attr("class", "bar")
     //.attr('d', barFunc(collision_data))
     .attr("x", function(d) { return xScaleE(d.Type); })
     .attr("y", function(d) { return yScaleE(d.Exit); })
     .attr("width", xScale.bandwidth())
     .attr("height", function(d) { return heightE - yScaleE(d.Exit); });*/
  }
  
  //use this to get the actual data
  //if (!gui.headless) { document.getElementById("total_" + object_type + "_exit").innerHTML = total_time; }

    // export JUST what we want to
    graph.simulate = simulate;
    graph.createBarGraph = createBarGraph;
//do i need a getter
    // make sure we keep reference so it can be retrieved AFTER simulation is over.
   // graph.get_graph = get_graph;

})(typeof graph === 'undefined'?
            this['graph']={}: graph);