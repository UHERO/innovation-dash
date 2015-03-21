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
  var selectedMinYear = 1969;
  var selectedMaxYear = 2013;
  var yMaxVal = 70000;

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

    var stateNames = ['Hawaii', 'United States', 'Nebraska'];
    var filteredStates = filterStateObjects (data, stateNames);
    // var yMaxVal = findMaxFIPSVals(filteredStates).maxVal;
    // console.log('yMaxVal', yMaxVal);

    // TODO: maybe tweak so that only max values for that timespan (not just states) get returned
    var setMaxVals = findMaxFIPSVals(data);
    console.log('setMaxVals', setMaxVals);

    var setMinVals = findMinFIPSVals(data);
    console.log('setMinVals', setMinVals);

    drawMap(sourceMap, data, selectedMinYear, selectedMaxYear);
    drawGraph(data, selectedMinYear, selectedMaxYear, yMaxVal);
    drawBrush(data);
    
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
    console.log('yearvalrange', yearValuesRange);
    var color = setQuantileColorScale(yearValuesRange,viewColors.econ);
    var states = topojson.feature(map, map.objects.units).features;

    g.selectAll(".states")
      .data(states)
      .enter().append("path")
      .attr("d", path)
      .style('stroke', '#FFF')
      .style('stroke-width', 3)
      .style('fill', function (d) {
        console.log('color', color(valuesByState[d.properties.name]),'val',valuesByState[d.properties.name]);
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

        // Object.keys(data[i].Years).forEach(function(year) {
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
  function drawGraph (data, selectedMinYear, selectedMaxYear, yMaxVal) {
    //baked in state
    var hiStateData = dataByState(data, "Hawaii", selectedMinYear, selectedMaxYear);
    var usAvgData = dataByState(data, "United States", selectedMinYear, selectedMaxYear);
    console.log(d3.entries(usAvgData));
    var selectedStateData = dataByState(data, "Ohio", selectedMinYear, selectedMaxYear);

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
    var yScale = d3.scale.linear().range([height - margins.top, margins.bottom]).domain([0,yMaxVal]);

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
       // .data(usAvgData)
       // .enter()
       // .attr("d", lineGen())
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
  function drawBrush (data) {
    // body...
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

