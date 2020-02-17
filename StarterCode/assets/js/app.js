// Step 1: Set up our chart
// Define SVG area dimensions 
var svgWidth = 750;
var svgHeight = 500;

// Define the chart's margins as an object
var margin = {
  top: 30,
  right: 40,
  bottom: 50, 
  left: 100
};

// Define dimensions of the chart area
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Step 2: Create an SVG wrapper
// append an SVG group that will hold our chart 
// and shift the latter by left and top margins
var svg = d3.select("#scatter").append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append a group to the SVG area and shift ('translate') it to the right and down to adhere
// to the margins set in the "chartMargin" object.
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Step 3:
// Import data from data.csv file
d3.csv("assets/data/data.csv").then(function(censusData) {
    
    // Step 4: Format the data using the unary + operator
    censusData.forEach(function(data) {
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
    });
    // console.log(censusData)

    // Step 5: Create the scales for the chart
    var xScale = d3.scaleLinear()
      .domain(d3.extent(censusData, d => d.poverty))
      .range([0, width]);

    var yScale = d3.scaleLinear()
      .domain([0, d3.max(censusData, d => d.healthcare)])
      .range([height, 0]);
    
    // Step 6: Set up the y-axis domain
    // find the max of the healthcare data
    var healthcareMax = d3.max(censusData, d => d.healthcare);
    
    // find the max of the poverty data
    var povertyMax = d3.max(censusData, d => d.poverty);
    
    var yMax;
    if (healthcareMax > povertyMax) {
      yMax = healthcareMax;
    } 
    else {
      yMax = povertyMax;
    }
    
    // Use the yMax value to set the yScale domain
    yScale.domain([0, yMax]);

    // Step 7: Create the axes
    var xAxis = d3.axisBottom(xScale).scale(xScale);
    var yAxis = d3.axisLeft(yScale).scale(yScale);

    // Step 8: Append the axes to the chartGroup
    // Add x-axis
    chartGroup.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis);

    // Add y-axis
    chartGroup.append('g')
      .call(yAxis);

    //  Create circles
    var circlesGroup = chartGroup.selectAll("Circle").data(censusData).enter();

    // Tool Tip Step 1: Initialize tooltip
    var toolTip = d3.tip() 
    .attr("class", "tooltip")
    .html(function(d) {
      return  `${d.state}<br>Poverty: ${d.poverty}%<br>Healthcare: ${d.healthcare}%`; 
    });

    chartGroup.call(toolTip);

    // Tool Tip Step 2: Create "mouseover" event listener
    circlesGroup
      .append("circle")
      .attr("cx", d => xScale(d.poverty))
      .attr("cy", d => yScale(d.healthcare))
      .attr("r", "15")
      .attr("fill", "#89bdd3") 
      // Define event handler for hovering
      .on("mouseover", function(d) {
        toolTip.show(d, this);
      })
      // Tool Tip Step 3: Create "mouseout" event listener
      .on("mouseout", function(d) {
        toolTip.hide(d);
      });
   

    // Append labels for the circles with state abbr
    circlesGroup
      .append("text")
      .text(function(d) {
        return d.abbr;
      })
      .attr("dx", function(d) {
        return xScale(d.poverty);
      })
      .attr("dy", function(d) {
        return yScale(d.healthcare);
      })      
      .attr("font-family", "sans-serif")
      .attr("font-size", "15px")
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .style("display", "block")
     
    // Create Y-axis labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 50)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .style("text-anchor", "middle")
      .text("Lacks Healthcare (%)");

    // Create X-axis labels
    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`)
      .attr("class", "axisText")
      .style("text-anchor", "middle")
      .text("In Poverty (%)");
  
  }).catch(function(error){
    console.log(error);
  });