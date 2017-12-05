// Set the margins for use with the svgs
// NB the dimensions of the bl.ocks window is 962 * 502
var margin = { top: 20, right: 20, bottom: 30, left: 40};

var width = 1100 - margin.left - margin.right;
var height = 502 - margin.top - margin.bottom;

// set the dimensions for the buttons - this influence the buttonBuffer
var buttonWidth = 100,
	buttonHeight = 19,
	buttonSpace = 1,
	buttonX0 = (width - (2 * buttonWidth) - 2),
	buttonY0 = 2,
	buttonBuffer = (2 * buttonWidth) + 10;

// Create percentage format variable for use in axes
var formatAsPercentage = d3.format(",.0%");

// set the colors for interactive buttons
var defaultColor = "#7777BB";
var hoverColor = "#0000ff";
var pressedColor = "red";

function draw(data) {
// Manipulate the data
// created a nested function, grouping the data by Occupation group.
	var nested = d3.nest()
		.key(function(d) {
			return d.OccGroup;
		})
		.sortKeys(d3.ascending)
		.entries(data);
	
	// created nestedIncome variable to average the APR across all occupations
	// use this to create the average APR line and circles only.
	var nestedIncome = d3.nest()
		.key(function(d) {
			return d.income;
		})
		.rollup(function(leaves) {
			var meanApr = d3.mean(leaves, function(d) {
				return d.apr;
			});

			var total = d3.sum(leaves, function(d) {
				return d.N;
			});
			return {
				"meanApr": meanApr,
				'N': total
			};
		})
		.entries(data);

// create linesArray which reshapes the data into easier format to use with linedraw function
	var linesArray = [];
	for (var i = 0; i < nested.length; i++) {
		pathInfo = [];
		for (var j = 0; j < nested[i].values.length; j++) {
			pathInfo.push({
				'id': nested[i].values[j].id,
				'apr': nested[i].values[j].apr,
				'income': nested[i].values[j].income
			});
		}

		linesArray.push({
			'key': nested[i].key,
			'values': pathInfo
		});
	}

	// Create svg variable to use with D3 code 
	var svg = d3.select("#container")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.attr("class", "svg");

	// Create myChart variable within the svg item to house the chart. 'g' is just an arbitrary containing child element in SVG
	// equivalent to 'div' in HTML
	var myChart = svg.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		.attr("width", width)
		.attr('height', height)
		.attr("class", "chart");

	// draw the Occupation text on the chart
	myChart.append('text')
		.attr("class", "occupTitle")
		.attr('x', (width - buttonBuffer) / 2)
		.attr('y', 41)
		.text("Run animation or click on Occupation");
	
	// Create a set of unique occupations called 'occupations' by adding to it.
	var occupations = d3.set();
	data.forEach(function(d) {
		occupations.add(d.OccGroup);
	});

	// then create an array of just the values in this set - makes the rest of the code much easier
	var uniqueOccupations = occupations.values();
	// sort them alphabetically
	uniqueOccupations.sort(d3.ascending);

	// the x axis data is categorical, so we need an ordinal scale.
	// Change the padding if the data is too close to edges  
	var xScale = d3.scalePoint()
		.domain(["$1-25k", "$25-50k", "$50-75k", "$75-100k", "$100k+"])
		.range([0, (width - buttonBuffer - 50)], 1);

	// create the x-axis object (note - not added yet, just defined the variable)
	var xAxis = d3.axisBottom()
		.scale(xScale)
		.tickSize(5);


	// Add the x-axis in it's own 'g' group.    
	myChart.append("g")
		.attr("transform", "translate(0," + height + ")")
		.attr("class", "x axis")
		.call(xAxis)
		.append('text')
		.attr("x", (width - buttonBuffer - 50))
		.attr("y", -6)
		.text("Income Bracket");

	// construct the y axis scale. This is linear as it is a range of apr values.
	var yScale = d3.scaleLinear()
		.domain([0, d3.max(data, function(d) {
			return d.apr;
		})])
		.range([height, 0])
		.nice();

	// create the y-axis object (note - not added yet, just defined)
	var yAxis = d3.axisLeft()
		.scale(yScale)
		.tickSize(5)
		.tickFormat(formatAsPercentage);

	// Add the y-axis in it's own 'g' group.
	myChart.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append('text')
		.attr('transform', "rotate(-90)")
		.attr('y', 6)
		.attr('x', -4)
		.attr('dy', ".71em")
		.text('Average Borrower APR');

	// create the y grid lines
	var y_grids = d3.axisLeft()
		.scale(yScale)
		.ticks(7)
		.tickSize(buttonBuffer - width, 0, 0)
		.tickFormat("");

	// Draw the y Grid lines
	myChart.append("g")
		.attr("class", "grid")
		.call(y_grids);

	// make button for the animation
	var animateButton = svg.append('g')
		.attr('class', 'animate button')
		.style('cursor', 'pointer')
		.on('click', function() {
			animationLoop();
			svg.selectAll('.buttonRect')
				.attr('fill', defaultColor);
			});

	animateButton.append('rect')
		.attr('x', 50)
		.attr('y', 450)
		.attr('height', 20)
		.attr('width', 90);

	animateButton.append('text')
		.attr('class', 'animateText')
		.attr('x', 56)
		.attr('y', 464)
		.attr('text-anchor', 'start')
		.text('Run animation');

	// make button to show all
	var showAllButton = svg.append('g')
		.attr('class', 'showAll button')
		.style('cursor', 'pointer')
		.on('click', function() {
			lineDraw(linesArray, lineColor = 'red', lineOpacity = 0.15);
			d3.selectAll(".plottedCircle")
				.style('opacity', 0);
			d3.selectAll('.occupPath')
				.attr('stroke-width', 1.5)
				.style('opacity', 0.15);
			d3.selectAll('.buttonRect')
				.attr('fill', defaultColor);
		});

	showAllButton.append('rect')
		.attr('x', 150)
		.attr('y', 450)
		.attr('width', 90)
		.attr('height', 20);

	showAllButton.append('text')
		.attr('class', 'showAllText')
		.attr('x', 156)
		.attr('y', 464)
		.attr('text-anchor', 'start')
		.text('Show all');

	
	// make buttons for the occupations
	// first make a container for the group of buttons
	var allButtons = svg.append("g")
		.attr("id", "allButtons");

	// creat a group for each button (rect and text)
	var buttonGroups = allButtons.selectAll("g.occupButton")
		.data(uniqueOccupations)
		.enter()
		.append("g")
		.attr("class", "occupButton")
		.style("cursor", "pointer")
		.on("click", function(d) {
			updateButtonColors(d3.select(this), d3.select(this.parentNode));
			update(d);
		})
		.on("mouseover", function() {
			if (d3.select(this).select("rect").attr("fill") != pressedColor) {
				d3.select(this)
				.select("rect")
				.attr("fill", hoverColor);
			}
		})
		.on("mouseout", function() {
			if (d3.select(this).select("rect").attr("fill") != pressedColor) {
				d3.select(this)
				.select("rect")
				.attr("fill", defaultColor);
			}
		});

		buttonGroups.append("rect")
			.attr("class", "buttonRect")
			.attr('fill', defaultColor)
			.attr("width", buttonWidth)
			.attr("height", buttonHeight)
			.attr("x", function(d, i) {
				return (buttonWidth + 5) * Math.floor(i / 25) + buttonX0;
			})
			.attr("y", function(d, i) {
				return buttonY0 + (buttonHeight + buttonSpace) * (i % 25);
			});

	//adding text to each button group, centered within the button rect
	buttonGroups.append("text")
		.attr("class", "buttonText")
		.attr('fill', 'white')
		.attr('font-size', 10)
		.attr("x", function(d, i) {
			return (buttonWidth + 5) * Math.floor(i / 25) + buttonX0 + 10;
		})
		.attr("y", function(d, i) {
			return buttonY0 + (buttonHeight + buttonSpace) * (i % 25) + buttonHeight / 2;
		})
		.attr("alignment-baseline", 'central')
		.text(function(d) {
			return d;
		});

	function updateButtonColors(button, parent) {
		parent.selectAll("rect")
			.attr("fill", defaultColor);
		button.select("rect")
			.attr("fill", pressedColor);
	}

	// create the circles for the average APR
	var avgCircles = svg.selectAll('.averageCircle')
		.data(nestedIncome);
	
	avgCircles.enter()
		.append('circle')
		.attr('class', 'averageCircle')
		.attr('cx', function(d) {
			return xScale(d.key) + margin.left;
		})
		.attr('cy', function(d) {
			return yScale(d.value.meanApr) + margin.top;
		})
		.attr('r', 5)
		.style('opacity', 0.5)
		.on("mouseover", function(d) {
			tooltip.transition()
				.duration(50)
				.style("opacity", 0.9);
			tooltip.html("Average" + "<br>" +
				"Income Group: " + d.key + "<br>" +
				"Mean APR: " + d3.format(",.1%")( d.value.meanApr))
				.style('font-size', "10pt")
				.style("left", (event.pageX + 5) + "px")
				.style("top", (event.pageY - 28) + "px")
				.style("background-color", "white");
		})
		.on("mouseout", function(d) {
			tooltip.transition()
				.duration(500)
				.style("opacity", 0);
		});
		
	// add the tooltip area to the div element with id 'container'
	var tooltip = d3.select('#container')
		.append("div")
		.attr("class", "tooltip")
		//.style("width", "180px")
		//.style('height', "60px")
		.style("opacity", 0);

	//add a selected circle variable 
	var selectedCircle = svg.append('circle')
		.attr('class', 'selectedCircle')
		.attr('cx', 100)
		.attr('cy', 300)
		.attr('r', 0);

	// create function to plot the circles - note, this is within the draw function    

	function plot_points(occupation_data, circleColor, circleOpacity) {
		// bind the data to the circles and enter them - using data, not nested.
		var circles = svg.selectAll('.plottedCircle')
			.data(occupation_data, function(d) {
			return d.id;
		});
	
		circles.exit()
			.remove();
	
		circles.enter()
			.append('circle')
			.attr('class', 'plottedCircle')
			.attr('cx', function(d) {
			return xScale(d.income) + margin.left;
		})
			.attr('cy', function(d) {
			return yScale(d.apr) + margin.top;
		})
			.attr('r', 8)
		
			.style('fill', circleColor)
			.style('opacity', circleOpacity)
			.on("mouseover", function(d) {
				tooltip.transition()
					.duration(200)
					.style("opacity", 0.9);
				tooltip.html(d.OccGroup + "<br>" +
					"Income Group: " + d.income + "<br>" +
					"Mean APR: " + d3.format(".1%")(d.apr) + "<br>" +
					"Sample size: " + d3.format(",")(d.N))
					.style('font-size', "10pt")
					.style("left", (d3.event.pageX + 5) + "px")
					.style("top", (d3.event.pageY - 28) + "px")
					.style("background-color", "white");
	
				selectedCircle.transition()
					.duration(50)
					.style('opacity', 1.0)
					.attr('cx', xScale(d.income) + margin.left)
					.attr('cy', yScale(d.apr) + margin.top)
					.attr('r', 10);
			})
			.on("mouseout", function(d) {
				tooltip.transition()
					.duration(500)
					.style("opacity", 0);

				selectedCircle.transition()
					.duration(500)
					.style('opacity', 0);
			});
	}
	// END of function plot points(data)    

	// Create function to draw a line for an occupation group
	function lineDraw(occupation_data, lineColor, lineOpacity) {
	
		// Create variable to define pixel points of the line
		var line = d3.line()
			.x(function(d) {
			return xScale(d.income) + margin.left;
		})
			.y(function(d) {
			return yScale(d.apr) + margin.top;
		});
		//.interpolate("cardinal");
	
		// create the linePath for all the individual occupations
		var linePath = d3.select('svg')
			.selectAll('.occupLine')
			.data(occupation_data, function(d) {
			return d.key;
		});
	
		linePath.enter()
			.append('g')
			.attr('class', 'occupLine');
	
		linePath.exit().remove();
	
		linePath.append('path')
		//.attr('class','line occupPath')
		.attr('class', 'linePath')
			.attr('d', function(d) {
				return line(d.values);
			})
			.style('opacity', lineOpacity = 0.5)
			.attr('stroke', lineColor)
			.attr('stroke-width', lineWidth = 1.5);
	
		linePath.exit().remove();
	}
	// End of function lineDraw(occupation)
	
	function lineDrawAverage(averagedata) {
		// now create the linePath for the average - this stays on the screen.
	
		// create slightly different line format to deal with the average data 
		var averageLine = d3.line()
			.x(function(d) {
			return xScale(d.key) + margin.left;
		})
			.y(function(d) {
			return yScale(d.value.meanApr) + margin.top;
		});
		//.curve("linear");       
	
		var averageLinePath = d3.select('svg')
			.append('path')
			.attr('class','averageLinePath')
			.attr('d', averageLine(averagedata))
			
	}
	// end of lineDrawAverage function
	
	// define update function, to plot the data for a specific occupation
	function update(occupation) {
		d3.select(".occupTitle")
			.text(occupation);
	
		// first filter the main data to return only datapoints equal to that occupation
		occup_points_data = data.filter(function(d) {
			return d.OccGroup === occupation;
		});
		// also filter the linesArray for datapoints equal to that occupation
		occup_line_data = linesArray.filter(function(d) {
			return d.key === occupation;
		});
		plot_points(occup_points_data, circleColor = 'red', circleOpacity = 1); // pass those points to the plot_points function
	
		lineDraw(occup_line_data, lineColor = 'red', lineOpacity = 1, lineWidth = 3); // pass those points to the lineDraw function
	
		lineDraw(linesArray, lineColor = 'red', lineOpacity = 0.15, lineWidth = 1.5);
	}
	
	// first draw the line for the averages
	lineDrawAverage(nestedIncome);
	lineDraw(linesArray, lineColor = 'red', lineOpacity = 0.15);
	
	function animationLoop() {
		// to loop through all occupations, drawing circles and points:   
	
		var occup_idx = 0;
	
		var occupation_interval = setInterval(function() {
			update(uniqueOccupations[occup_idx]);
			occup_idx++;
	
			if (occup_idx >= uniqueOccupations.length) {
				clearInterval(occupation_interval);
	
				//var circles = plot_points([], circleColor = "blue", circleOpacity = 0.0);
	
				lineDraw(linesArray, lineColor = 'red', lineOpacity = 1);
				// next bit of code re-styles the last line that was written (i.e. it wasn't part of the 'enter')
				d3.selectAll('.linePath')
					.style('opacity', 0.25);
				d3.selectAll('.plottedCircle')
					.style('opacity', 0);
	
				d3.select('.occupTitle')
					.text('Run animation or click on Occupation');
			}
		}, 75);
	} // END of function animationLoop

} // END of function draw(data
