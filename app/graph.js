/**
 * Graph Module
 *
 * Here we visualize all of the data.
 * Are we not using this at all of in headless mode?
 * //use data from app??
 */
(function(graph) {
  
  //function to get the standard deviation of an array
  //https://stackoverflow.com/questions/7343890/standard-deviation-javascript
  function getStandardDeviation (array) {
      if (typeof array === 'undefined') { return 0; }  // NOT SURE what else to do....
    const n = array.length;
      if (n == 0) { return 0; }  // NOT SURE what else to do....
    const mean = array.reduce((a, b) => a + b) / n;
    return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}

	  var things = pop.types(); //each type of a person
	  var value2 = 0; //for x Axis, number of board updates
	  //empty arrays for each type of person. Make sure the population types never changes order!
	  var lineData = []; //initial empty data
	  var totalPopData = [];
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
      yRange = d3.scaleLinear().range([height - margin.top, margin.bottom]).domain([0,100]), //100 because a percent
      
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
        .attr("y", margin.left-45)
        .attr("x",-220)
        .attr('transform', 'rotate(-90)')
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Percentage of People on Grid");
    
  //title
  vis.append("text")
   .attr("x", width/2)
   .attr("y", margin.top)
   .attr("text-anchor", "middle")
   .style("font-size", "16px")
   .text("Percentage of People by Type on the Grid Over Time");
    
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
    //.attr('d', lineFunc(totalPopData))
    .attr('stroke', "black")
    .attr('stroke-width', 2)
    .attr('fill', 'none');


  var ms_between_updates = 100; //dont think i need
  var value = 20;
  var valueGreen = 20;
  var num_updates = 0; //dont think necessary
  
  function reset_graph(){
    
    var vis = d3.select("#visualisation0");
    var vis1 = d3.select("#visualisation1");
    var vis2 = d3.select("#visualisation2");
    var vis3 = d3.select("#visualisation3");
    var vis4 = d3.select("#visualisation4");
    var vis5 = d3.select("#visualisation5");
    var vis6 = d3.select("#visualisation6");
    var vis7 = d3.select("#visualisation7");
    
    vis.selectAll("g").remove() //removes axis
    vis1.selectAll("g").remove() //removes axis
    vis2.selectAll("g").remove() //removes axis
    vis3.selectAll("g").remove() //removes axis
    vis4.selectAll("g").remove() //removes axis
    vis5.selectAll("g").remove() //removes axis
    vis6.selectAll("g").remove() //removes axis
    vis7.selectAll("g").remove() //removes axis
    d3.selectAll("rect").remove() //removes bars
    d3.selectAll("circle").remove() //removes min and max from graph
    d3.selectAll("line").remove() //removes standard deviatin from graph

    
    //population graph removal
    while(totalPopData.length > 0){
      totalPopData.pop();
    }
    var things = pop.types(); //each type of a person
	  value2 = 0; //for x Axis, number of board updates
	 for (i = 0; i < things.length; i++) {
	   while(lineData[i].length>0){
	     lineData[i].pop();
	   }
	 }
  }
  
  
    function simulate () {
    num_updates++;
    value2++; //add one board update
    // console.log("Number of updates:" + num_updates);
    for (i = 0; i < things.length; i++) {
      var tpe = things[i];
      value = (data.current[tpe]/data.total_peds_at_start)*100; //now a percent for each type of ped
      lineData[i].push({x: value2,y: value});
    }
    totalPopData.push({x: value2,y: (final.current_population/data.total_peds_at_start)*100});
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

  function createBarGraph(){
      //checking what data to use for graphs
    
  for(k=0; k<final.total_data.length; k++){
    var svg = d3.select('#visualisation'+k);
    //set the id
    svg.attr("id","visualisation"+k)
    var colors = [];
    var data = [];
    var value_avg;
    for (i = 0; i < things.length; i++) {
      var tpe = things[i];
      var info = final.total_data[k][0];
      value = info[tpe];
      //create new object to get its color, there might be a better way to do this
      var obj = pop.factory(tpe,0,0);
      data.push({Type: tpe,Value: value, Color: obj.color()});
    }
    
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
    .range([margin.left, width])
    .padding(0.05)
    .domain(types)
    
    var yScale = d3.scaleLinear()
      .range([margin.bottom, height])
      .domain([maxValue, 0]); //try to change to data.max

    //adding x axis
    svg.append("g")
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,'+ height + ')')
      .call(d3.axisBottom(xScale));
      
   //text for x
  svg.append("text")
    .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom+10) + ")")
    .style("text-anchor", "middle")
    .text("Type of Person");

    //adding y axis
    svg.append("g")
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + (margin.left) + ',0)')
      .call(d3.axisLeft(yScale).tickFormat(function(d){
             return d;
         }).ticks(10));
     //text for y
    svg.append("text")
      .attr('transform', 'rotate(-90)')
        .attr("y",margin.left-40)
        .attr("x",0-(height/2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(final.total_data[k][1]);
        
  //title
  svg.append("text")
   .attr("x", width/2)
   .attr("y", margin.top)
   .attr("text-anchor", "middle")
   .style("font-size", "16px")
   .text(final.total_data[k][2]);
    
    // create a tooltip
  var Tooltip = d3.select('#visualisation'+k)
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function(d) {
    Tooltip
      .style("opacity", 1)
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
  }
  var mousemove = function(d) {
    Tooltip
      .html("The exact value of<br>this bar is: " + d.Value)
      .style("left", (event.pageX+70) + "px")
      .style("top", (event.pageY) + "px")
  }
  var mouseleave = function(d) {
    Tooltip
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", 0.8)
  }

    //plotting
    svg.selectAll(".bar")
     .data(data)
     .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return xScale(d.Type); })
      .attr("y", function(d) { return yScale(d.Value); })
      .attr("width", xScale.bandwidth())
      .attr("height", function(d) { return (height - yScale(d.Value)); })
      .style('fill', function(d){return d.Color;})
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
     
    }
  }
function heatmap() {
  // set the dimensions and margins of the graph
const margin = {top: 80, right: 5, bottom: 15, left: 40},
  width = 450 - margin.left - margin.right,
  height = 450 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#visualisation5")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
  const myGroups = Array.from(new Set(final.all_visited.map(d => d.X)))
  const myVars = Array.from(new Set(final.all_visited.map(d => d.Y)))
  // var myGroups = final.total_visited_i;

  // Build X scales and axis:
  const x = d3.scaleBand()
    .range([ 0, width ])
    .domain(myGroups)
    .padding(0.05);
  svg.append("g")
    .style("font-size", 10)
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickSize(0))
    .select(".domain").remove()

  // Build Y scales and axis:
  const y = d3.scaleBand()
    .range([ 0,height ])
    .domain(myVars)
    .padding(0.05);
  svg.append("g")
    .style("font-size", 10)
    .call(d3.axisLeft(y).tickSize(0))
    .select(".domain").remove()

  // Build color scale
  var myColor = d3.scaleLinear()
  .range(["white", "#69b3a2"])
  .domain([1,100])

  // create a tooltip
  const tooltip = d3.select("#visualisation5")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")

  // Three function that change the tooltip when user hover / move / leave a cell
  const mouseover = function(event,d) {
    tooltip
      .style("opacity", 1)
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
  }
  const mousemove = function(event,d) {
    tooltip
      .html("The exact value of<br>this cell is: " + d.value)
      .style("left", (event.x)/2 + "px")
      .style("top", (event.y)/2 + "px")
  }
  const mouseleave = function(event,d) {
    tooltip
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", 0.8)
  }

  // add the squares
  svg.selectAll()
    .data(final.all_visited, function(d) {return d.X+':'+d.Y;})
    .join("rect")
      .attr("x", function(d) { return x(d.X) })
      .attr("y", function(d) { return y(d.Y) })
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("width", x.bandwidth() )
      .attr("height", y.bandwidth() )
      .style("fill", function(d) { return myColor(d.Value)} )
      .style("stroke-width", 4)
      .style("stroke", "none")
      .style("opacity", 0.8)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
//})

// Add title to graph
svg.append("text")
        .attr("x", 0)
        .attr("y", -50)
        .attr("text-anchor", "left")
        .style("font-size", "22px")
        .text("A d3.js heatmap");

// Add subtitle to graph
svg.append("text")
        .attr("x", 0)
        .attr("y", -20)
        .attr("text-anchor", "left")
        .style("font-size", "14px")
        .style("fill", "grey")
        .style("max-width", 400)
        .text("A short description of the take-away message of this chart.");
  }
  
  function makeAvgGraph(){
    var svg = d3.select('#visualisation6');
    var colors = [];
    var data = [];
    var data_total = [];
    var value_avg;
    var value_total;
    var data_sd = [];
    for (i = 0; i < things.length; i++) {
      var tpe = things[i];
      var info = final.collisions_average;
      var info_total = final.collisions_total;
      value_avg = info[tpe];
      value_total = info_total[tpe];
      //get standarrd deviations
      var sd = getStandardDeviation(final.collision_list[tpe]);
      var min = d3.min(final.collision_list[tpe]);
      //create new object to get its color, there might be a better way to do this
      var obj = pop.factory(tpe,0,0);
      data.push({Type: tpe,Value: value_avg, Color: obj.color()});
      data_total.push({Type: tpe,Value: value_total});
      data_sd.push({Type: tpe,Value: sd, Avg: value_avg, Min: min});
    }

    //array of keys
    const types = data.map(function(obj){
      return obj.Type;
    });
    //array of values
    var num = data_total.map(function(obj){ //don't need
      return obj.Value;
    });
    //max value
    var maxValue = d3.max(num);
   
   var xScale = d3.scaleBand()
    .range([margin.left, width])
    .padding(0.05)
    .domain(types)
    
    var yScale = d3.scaleLinear()
      .range([margin.bottom, height])
      .domain([maxValue, 0]); //try to change to data.max

    //adding x axis
    svg.append("g")
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,'+ height + ')')
      .call(d3.axisBottom(xScale));
      
   //text for x
  svg.append("text")
    .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom+10) + ")")
    .style("text-anchor", "middle")
    .text("Type of Person");

    //adding y axis
    svg.append("g")
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + (margin.left) + ',0)')
      .call(d3.axisLeft(yScale).tickFormat(function(d){
             return d;
         }).ticks(10));
     //text for y
    svg.append("text")
      .attr('transform', 'rotate(-90)')
        .attr("y",margin.left-40)
        .attr("x",0-(height/2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text('Number of Collisions');
        
  //title
  svg.append("text")
   .attr("x", width/2)
   .attr("y", margin.top)
   .attr("text-anchor", "middle")
   .style("font-size", "16px")
   .text("Average Number of Collisions");

    //plotting
    svg.selectAll(".bar")
     .data(data)
     .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return xScale(d.Type); })
      .attr("y", function(d) { return yScale(d.Value); })
      .attr("width", xScale.bandwidth())
      .attr("height", function(d) { return (height - yScale(d.Value)); })
      .style('fill', function(d){return d.Color;});
      
    svg.selectAll("myCircles")
     .data(data_total)
     .enter().append("circle")
      .attr("cx", function(d) { return xScale(d.Type)+(xScale.bandwidth()/2); })
      .attr("cy", function(d) { return yScale(d.Value); })
      .attr('r', 5);
      
    svg.selectAll("mySdLines")
     .data(data_sd)
     .enter().append('line')
      .style('stroke', 'black')
      .style('stroke-width', 3)
      .attr("x1", function(d) { return xScale(d.Type)+(xScale.bandwidth()/2); })
      .attr("y1", function(d) { return yScale(d.Avg-d.Value); })
      .attr("x2", function(d) { return xScale(d.Type)+(xScale.bandwidth()/2); })
      .attr("y2", function(d) { return yScale(d.Avg+d.Value); });
      
    svg.selectAll("myCirclesMin")
     .data(data_sd)
     .enter().append("circle")
      .attr("cx", function(d) { return xScale(d.Type)+(xScale.bandwidth()/2); })
      .attr("cy", function(d) { return yScale(d.Min); })
      .attr('r', 5);
      
    svg.selectAll("mySdBarLines")
     .data(data_sd)
     .enter().append('line')
      .style('stroke', 'black')
      .style('stroke-width', 3)
      .attr("x1", function(d) { return xScale(d.Type)+(xScale.bandwidth()/2)-5; })
      .attr("y1", function(d) { return yScale(d.Avg-d.Value); })
      .attr("x2", function(d) { return xScale(d.Type)+(xScale.bandwidth()/2)+5; })
      .attr("y2", function(d) { return yScale(d.Avg-d.Value); })
      
    svg.selectAll("moreLines")
     .data(data_sd)
     .enter().append('line')
      .style('stroke', 'black')
      .style('stroke-width', 3)
      .attr("x1", function(d) { return xScale(d.Type)+(xScale.bandwidth()/2)-5; })
      .attr("y1", function(d) { return yScale(d.Avg+d.Value); })
      .attr("x2", function(d) { return xScale(d.Type)+(xScale.bandwidth()/2)+5; })
      .attr("y2", function(d) { return yScale(d.Avg+d.Value); });
    
  }
  
    function makeAvgExitGraph(){
    var svg = d3.select('#visualisation7');
    var colors = [];
    var data = [];
    var data_total = [];
    var value_avg;
    var value_total;
    var data_sd = [];
    for (i = 0; i < things.length; i++) {
      var tpe = things[i];
      var info = final.exit_average;
      var info_total = final.exit_total;
      value_avg = info[tpe];
      value_total = info_total[tpe];
      //get standarrd deviations
      var sd = getStandardDeviation(final.exit_times_array[tpe]);
      var min = d3.min(final.exit_times_array[tpe]);
      //create new object to get its color, there might be a better way to do this
      var obj = pop.factory(tpe,0,0);
      data.push({Type: tpe,Value: value_avg, Color: obj.color()});
      data_total.push({Type: tpe,Value: value_total});
      data_sd.push({Type: tpe,Value: sd, Avg: value_avg, Min: min});
    }

    //array of keys
    const types = data.map(function(obj){
      return obj.Type;
    });
    //array of values
    var num = data_total.map(function(obj){ //don't need
      return obj.Value;
    });
    //max value
    var maxValue = d3.max(num);
   
   var xScale = d3.scaleBand()
    .range([margin.left, width])
    .padding(0.05)
    .domain(types)
    
    var yScale = d3.scaleLinear()
      .range([margin.bottom, height])
      .domain([maxValue, 0]); //try to change to data.max

    //adding x axis
    svg.append("g")
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,'+ height + ')')
      .call(d3.axisBottom(xScale));
      
   //text for x
  svg.append("text")
    .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom+10) + ")")
    .style("text-anchor", "middle")
    .text("Type of Person");

    //adding y axis
    svg.append("g")
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + (margin.left) + ',0)')
      .call(d3.axisLeft(yScale).tickFormat(function(d){
             return d;
         }).ticks(10));
     //text for y
    svg.append("text")
      .attr('transform', 'rotate(-90)')
        .attr("y",margin.left-40)
        .attr("x",0-(height/2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text('Time taken to Exit');
        
  //title
  svg.append("text")
   .attr("x", width/2)
   .attr("y", margin.top)
   .attr("text-anchor", "middle")
   .style("font-size", "16px")
   .text("Average Exit Time");

    //plotting
    svg.selectAll(".bar")
     .data(data)
     .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return xScale(d.Type); })
      .attr("y", function(d) { return yScale(d.Value); })
      .attr("width", xScale.bandwidth())
      .attr("height", function(d) { return (height - yScale(d.Value)); })
      .style('fill', function(d){return d.Color;});
      
    svg.selectAll("myCircles")
     .data(data_total)
     .enter().append("circle")
      .attr("cx", function(d) { return xScale(d.Type)+(xScale.bandwidth()/2); })
      .attr("cy", function(d) { return yScale(d.Value); })
      .attr('r', 5);
      
    svg.selectAll("mySdLines")
     .data(data_sd)
     .enter().append('line')
      .style('stroke', 'black')
      .style('stroke-width', 3)
      .attr("x1", function(d) { return xScale(d.Type)+(xScale.bandwidth()/2); })
      .attr("y1", function(d) { return yScale(d.Avg-d.Value); })
      .attr("x2", function(d) { return xScale(d.Type)+(xScale.bandwidth()/2); })
      .attr("y2", function(d) { return yScale(d.Avg+d.Value); });
      
    svg.selectAll("myCirclesMin")
     .data(data_sd)
     .enter().append("circle")
      .attr("cx", function(d) { return xScale(d.Type)+(xScale.bandwidth()/2); })
      .attr("cy", function(d) { return yScale(d.Min); })
      .attr('r', 5);
      
    svg.selectAll("mySdBarLines")
     .data(data_sd)
     .enter().append('line')
      .style('stroke', 'black')
      .style('stroke-width', 3)
      .attr("x1", function(d) { return xScale(d.Type)+(xScale.bandwidth()/2)-5; })
      .attr("y1", function(d) { return yScale(d.Avg-d.Value); })
      .attr("x2", function(d) { return xScale(d.Type)+(xScale.bandwidth()/2)+5; })
      .attr("y2", function(d) { return yScale(d.Avg-d.Value); })
      
    svg.selectAll("moreLines")
     .data(data_sd)
     .enter().append('line')
      .style('stroke', 'black')
      .style('stroke-width', 3)
      .attr("x1", function(d) { return xScale(d.Type)+(xScale.bandwidth()/2)-5; })
      .attr("y1", function(d) { return yScale(d.Avg+d.Value); })
      .attr("x2", function(d) { return xScale(d.Type)+(xScale.bandwidth()/2)+5; })
      .attr("y2", function(d) { return yScale(d.Avg+d.Value); });
    
  }
  
  
  //use this to get the actual data
  //if (!gui.headless) { document.getElementById("total_" + object_type + "_exit").innerHTML = total_time; }

    // export JUST what we want to
    graph.simulate = simulate;
    graph.createBarGraph = createBarGraph;
    graph.heatmap = heatmap;
    graph.makeAvgGraph = makeAvgGraph;
    graph.makeAvgExitGraph = makeAvgExitGraph;
    graph.reset_graph = reset_graph;
//do i need a getter
    // make sure we keep reference so it can be retrieved AFTER simulation is over.
   // graph.get_graph = get_graph;

})(typeof graph === 'undefined'?
            this['graph']={}: graph);
