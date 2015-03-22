'use strict';

module.exports = function (mapSource, dataSource, mapEl, graphEl, brushEl) {
  
  //Default configs
  var width, height, projection, path, svg, g;
  var viewColors = {
    econ: ["#FCDDC0","#FFBB83","#FF9933","#F27D14","#C15606"],
    rnd:  ["#C2F1F2","#7FC4C9","#74B1B2","#5E9999","#497C7B"],
    ent:  ["#EDEBDF","#D3D0C1","#AAA797","#878476","#605D51"],
    edu:  ["#FCDDC0","#FFBB83","#FF9933","#F27D14","#C15606"] 
  };

  width = 800;
  height = 600;

  // TODO: set values using brush/slider
  var selectedMinYear;
  var selectedMaxYear;
  var stateNames = ['Hawaii', 'United States', 'Nebraska'];
  // var yMaxVal = 70000;

  getDataSets(mapSource, dataSource); // Trigger getting data and drawing charts

  // get Source Data
  function getDataSets (mapSource, dataSource) {
    queue()
      .defer(d3.json, mapSource)
      .defer(d3.csv, dataSource)
      .await(ready);
  }

  function ready (err, sourceMap, sourceData) {
    setupMap(width, height);
    
    var data = window.transData = transformFIPSData(sourceData); // DEV ONLY
    // var data = transformFIPSData(sourceData); // PRODUCTION OK
    console.log('data set', data);

    var filteredStates = filterStateObjects (data, stateNames);
    var yMaxVal = findMaxFIPSVals(filteredStates).maxVal;
    // var yMinVal = 0;
    var yMinVal = findMinFIPSVals(filteredStates).minVal - 1; // sets min val to 1 below smallest value (in case we don't want chart to start at 0). allows some padding for very small Y values (e.g. Unemployment Rates)
    console.log('yMaxVal', yMaxVal);

    // TODO: maybe tweak so that only max values for that timespan (not just states) get returned
    var setMaxVals = findMaxFIPSVals(data);
    console.log('setMaxVals', setMaxVals);

    var setMinVals = findMinFIPSVals(data);
    console.log('setMinVals', setMinVals);

    selectedMinYear = setMinVals.minYear;
    selectedMaxYear = setMaxVals.maxYear;

    drawMap(sourceMap, data, selectedMinYear, selectedMaxYear);
    // drawGraph(data, setMinVals.minYear, selectedMaxYear, yMinVal, yMaxVal); // sets x axis (years) to minimimum year of loaded csv
    drawGraph(data, selectedMinYear, selectedMaxYear, yMinVal, yMaxVal); // sets x axis (years) to selected min year
    // drawBrush(data, setMinVals, setMaxVals);
    drawBrush(data, setMinVals, setMaxVals, sourceMap, yMinVal, yMaxVal);
    
  }

  // Setup Graph Components
  function setupMap (width, height) {
    projection = d3.geo.albersUsa()
      .scale(1000)
      .translate([width / 2, height / 2]);

    path = d3.geo.path()
      .projection(projection);

    svg = d3.select(mapEl).append('svg')
      .attr('width', width)
      .attr('height', height);

    g = svg.append('g');
  }

  function setupGraph (width, height) {
    // body...
  }

  function setupBrush (width, height) {
    // body...
  }


  // Draw Graph Compenents

  // This drawMap will only work with FIPS structured data on US map
  function drawMap (map, data, selectedMinYear, selectedMaxYear) {
    // Create object to hold each state and it corresponding value
    // based on a single year {"statename": value, ...}
    var valuesByState = window.vbs = {};

    // Iterate over the full dataset and move state name and value into object for the selectedMaxYear
    data.forEach(function (d, i) {
      valuesByState[d.State] = +d.Years[selectedMaxYear];
    });
    
    // Create an array containing the min and max values 
    var yearValuesRange = d3.extent(d3.values(valuesByState));
    var color = setQuantileColorScale(yearValuesRange,viewColors.econ);
    var states = topojson.feature(map, map.objects.units).features;

    g.selectAll(".states")
      .data(states)
      .enter().append("path")
      .attr("d", path)
      .style('stroke', '#FFF')
      .style('stroke-width', 1)
      .style('fill', function (d) {
        return color(valuesByState[d.properties.name]);
      });
  }

  function dataByState(data, state, selectedMinYear, selectedMaxYear) {
    var result = [];

    for (var i = 0; i < data.length; i++) {
      if (data[i].State === state) {

        var yearValuesArray = d3.entries(data[i].Years);

        for (var j = 0; j < yearValuesArray.length; j++) {
          var year = parseInt(yearValuesArray[j].key);

          // TODO: use D3's exit/enter methods to remove this data instead of manually cropping it out this way D:
          if (year >= selectedMinYear && year <= selectedMaxYear) {

            // TODO: see if we can plot points without reconfiguring data into this format
            result.push({
              year : year,
              value : data[i].Years[year]
            });
          }
        // });
          
        }
      }
    }

    return result;
  }

  // draw line graph
  function drawGraph (data, selectedMinYear, selectedMaxYear, yMinVal, yMaxVal) {
    //baked in state
    var hiStateData = dataByState(data, stateNames[0], selectedMinYear, selectedMaxYear);
    var usAvgData = dataByState(data, stateNames[1], selectedMinYear, selectedMaxYear);
    var selectedStateData = dataByState(data, stateNames[2], selectedMinYear, selectedMaxYear);

    d3.select("#line-graph").html("");
    var vis = d3.select('#line-graph');

    var width = 600;
    var height = 350;
    var margins = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 70
      };

    //TODO: set domains for xScale and yScale dynamically
    var xScale = d3.scale.linear().range([margins.left, width - margins.right]).domain([selectedMinYear, selectedMaxYear]);
    var yScale = d3.scale.linear().range([height - margins.top, margins.bottom]).domain([yMinVal,yMaxVal]);

    var formatXAxis = d3.format('.0f');

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .tickFormat(formatXAxis);
        // .outerTickSize(0);
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");
        // .outerTickSize(0);

    vis.append("svg:g")
       .attr("class", "x axis")
       .attr("transform", "translate(0," + (height - margins.bottom) + ")")
       .call(xAxis);

    vis.append("svg:g")
       .attr("class", "y axis")
       .attr("transform", "translate(" + (margins.left) + ",0)")
       .call(yAxis);

    vis.append("text")
      .attr("x", width/2)
      .attr("y", height + margins.bottom)
      .style("text-anchor", "middle")
      .text("Year");

    vis.append("text")
       .attr("transform", "rotate(-90)")
       .attr("x", 0 - (height) / 2)
       .attr("y", 0)
       .style("text-anchor", "middle")
       .text("Per Capita Personal Income ($)");

    // .defined insures that only non-negative values
    // are graphed
    var lineGen = d3.svg.line()
      .defined(function(d) {
        return d.value >= 0;
      })
      .x(function(d) {
        return xScale(d.year);
      })
      .y(function(d) {
        return yScale(d.value);
      })
      .interpolate("linear");

    vis.append("svg:path")
       .attr("d", lineGen(usAvgData))
       .attr("stroke", "#AAA797")
       .attr("stroke-width", 3)
       .attr("fill", "none");

    vis.append("svg:path")
       .attr("d", lineGen(hiStateData))
       .attr("stroke", "orange") //TODO: change color dynamically
       .attr("stroke-width", 3)
       .attr("fill", "none");
  }

  // draw slider
  function drawBrush (data, setMinVals, setMaxVals, sourceMap, yMinVal, yMaxVal) {
    // d3.select('#uh-brush-test')
    //   .call(d3.slider()
    //   .axis(true)
    //   .value( [selectedMinYear, selectedMaxYear] )
    //   .min(setMinVals.minYear)
    //   .max(setMaxVals.maxYear)
    //   .step(1)
    //   .on("slide", function(event, value) {
    //     selectedMinYear = value[0];
    //     selectedMaxYear = value[1];
    //     console.log (selectedMinYear, selectedMaxYear);
    //     d3.select('#textmin').text(value[0]);
    //     d3.select('#textmax').text(value[1]);
    // }));
    
    var tickFormat = d3.format('.0f');

    var scale = d3.scale.linear()
      .domain([setMinVals.minYear, setMaxVals.maxYear])
      .range([0, 768]);

    var brush = d3.svg.brush();
    brush.x(scale)
         .extent([selectedMinYear, selectedMaxYear]);
    brush.on("brushend", brushed);

    var savedExtent = brush.extent(); // FOR PREVENTING BRUSH EMPTYING

    function brushed() {
      savedExtent = brush.extent();
      savedExtent[0] = d3.round(savedExtent[0]);
      savedExtent[1] = d3.round(savedExtent[1]);

      d3.select(this).call(brush.extent(savedExtent));

      drawMap(sourceMap, data, savedExtent[0], savedExtent[1]);
      drawGraph(data, savedExtent[0], savedExtent[1], yMinVal, yMaxVal); 


      // if (!brush.empty()) {
      //   savedExtent = brush.extent();
      //   savedExtent[0] = d3.round(savedExtent[0]);
      //   savedExtent[1] = d3.round(savedExtent[1]);

      //   d3.select(this).call(brush.extent(savedExtent));
      //   console.log(savedExtent);
      // } else {
      //   d3.select(this).call(brush.extent(savedExtent));
      // }
    }

    /*
    Prevent default brush clear on click
     */
    // var oldMouseDown = brush.on('mousedown.brush');
    // brush.on('mousedown.brush', function() {
    //   brush.on('mouseup.brush', function() {
    //     clearHandlers();
    //   });

    //   brush.on('mousemove.brush', function() {
    //     clearHandlers();
    //     oldMouseDown.call(this);
    //     brush.on('mousemove.brush').call(this);
    //   });

    //   function clearHandlers() {
    //     brush.on('mousemove.brush', null);
    //     brush.on('mouseup.brush', null);
    //   }
    // });

    var brushSVG = d3.select("#uh-brush-test");

    var brushAxis = d3.svg.axis()
      .scale(scale)
      .orient("bottom")
      .tickFormat(tickFormat)
      .innerTickSize(20)
      // .ticks(4)
      .tickPadding(20);

    var axisG = brushSVG.append("g");
    brushAxis(axisG);
    axisG.attr("transform", "translate(20, 45)");
    axisG.selectAll("path")
      .style({ fill: "none" });
    axisG.selectAll("line")
      .style({ stroke: "#AAA797" });


    // appending brush after axis so ticks appear before slider
    var brushG = brushSVG.append('g');
    brush(brushG);
    brushG.attr("transform", "translate(20, 50)")
      .selectAll("rect").attr("height", 10);
    brushG.selectAll(".background")
      .style({ fill: "#D3D0C1", visibility: "visible" });
    brushG.selectAll(".extent")
      .style({ fill: "#F27D14", visibility: "visible" });
    brushG.selectAll(".resize rect")
      .attr("width", 12)
      .attr("height", 18)
      .attr("y", -4)
      .style({ fill: "#FF9933", visibility: "visible" });
  }

  // Utility functions

  // Instantiate into a function to take a value and return a color based on the range
  function setQuantileColorScale (domainArr, rangeArr) {
  return d3.scale.quantile()
    .domain(domainArr)
    .range(rangeArr);
  }

  // This function work takes a FIPS dataset 
  function transformFIPSData (data) {
    var yearKey = /^\d\d\d\d$/;
    return _.map(data, function (item) {
      return _.transform(item, function (result, n, key) {
        if (yearKey.test(key)) {
          var transformedVal = parseInt(n, 10);
          result.Years[key] = transformedVal ? transformedVal : -1;
        } else {
          result[key] = n;
        }
      }, {Years: {}});
    });  
  } //end transformFIPSData

  // Takes data and an array of state names (strings) to find
  function filterStateObjects (data, stateNamesArr) {
    return stateNamesArr.map(function(item) {
      // .filter returns array, so we need to pluck out element
      return _.filter(data, 'State', item)[0];
    });
  }

  function findMaxFIPSVals (data) {
    return _.reduce(data, function (result, item, key) {
      var keysArr = d3.keys(item.Years);
    
      if (keysArr.length > result.numOfYrs) {
        result.numOfYrs = keysArr.length;
        var maxKey = d3.max(keysArr);
        if (maxKey > result.maxYear) {
          result.maxYear = maxKey;  
        }
      }
      var stateMax = d3.max(d3.values(item.Years));
      if (stateMax > result.maxVal) {
        result.maxVal = stateMax;
      }
      return result;
    }, {numOfYrs: 0, maxYear: 0, maxVal: 0});
  } //end findMaxFIPSVals

  function findMinFIPSVals (data) {
    return _.reduce(data, function (result, item, key) {
      var keysArr = d3.keys(item.Years);
    
      if (keysArr.length > result.numOfYrs) {
        result.numOfYrs = keysArr.length;
        var minKey = d3.min(keysArr);
        if (minKey < result.minYear) {
          result.minYear = minKey;  
        }
      }
      var stateMin = d3.min(d3.values(item.Years));
      if (stateMin < result.minVal && stateMin != -1) {
        result.minVal = stateMin;
      }
      return result;
    }, {numOfYrs: 0, minYear: Infinity, minVal: Infinity});
  } //end findMinFIPSVals

}; // end module.exports

