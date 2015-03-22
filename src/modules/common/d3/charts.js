'use strict';

module.exports = function (mapSource, dataSource, mapEl, graphEl, brushEl) {
  // console.log(mapEl, graphEl)
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

  // Check if map source is JSON or SVG
  var isSVGMap = false;
  var svgRE = /svg$/;
  
  isSVGMap = svgRE.test(mapSource) ? true : false;

  // TODO: set values using brush/slider
  var selectedMinYear = 2006;
  var selectedMaxYear = 2013;
  var stateNames = ['Hawaii', 'United States', 'Nebraska'];
  // var yMaxVal = 70000;
  
  var knownSummaryRecords = ['United States'];

  getDataSets(mapSource, dataSource); // Trigger getting data and drawing charts

  // get Source Data
  function getDataSets (mapSource, dataSource) {

    var q = queue().defer(d3.csv, dataSource);
    
    if (isSVGMap) {
      q.defer(d3.xml, mapSource, 'image/svg+xml').await(function (err, dataSource, mapSource) {
        var hawaiiSvg = document.importNode(mapSource.documentElement, true);
        ready(err, dataSource, hawaiiSvg, isSVGMap);
      });
    } else {
      q.defer(d3.json, mapSource).await(function (err, dataSource, mapSource) {
        ready(err, dataSource, mapSource, isSVGMap);
      });
    }
  }

  function ready (err, sourceData, sourceMap, isSVGMap) {

    setupMap(sourceMap, width, height);
    
    var data = window.transData = transformFIPSData(sourceData); // DEV ONLY
    // var data = transformFIPSData(sourceData); // PRODUCTION OK

    var datasetSummaryRecords = popSummaryData(data, knownSummaryRecords);
    // var stateNames = ['Hawaii', 'United States', 'Nebraska'];
    // var filteredStates = filterStateObjects (data, stateNames);
    // var yMaxVal = findMaxFIPSVals(filteredStates).maxVal;
    // // var yMinVal = 0;
    // var yMinVal = findMinFIPSVals(filteredStates).minVal - 1; // sets min val to 1 below smallest value (in case we don't want chart to start at 0). allows some padding for very small Y values (e.g. Unemployment Rates)

    // TODO: maybe tweak so that only max values for that timespan (not just states) get returned
    var setMaxVals = findMaxFIPSVals(data);
    // console.log('setMaxVals', setMaxVals);

    var setMinVals = findMinFIPSVals(data);
    // console.log('setMinVals', setMinVals);

    drawMap(sourceMap, data, selectedMinYear, selectedMaxYear);
    // drawGraph(data, setMinVals.minYear, selectedMaxYear, yMinVal, yMaxVal); // sets x axis (years) to minimimum year of loaded csv
    // drawGraph(data, selectedMinYear, selectedMaxYear, yMinVal, yMaxVal); // sets x axis (years) to selected min year
    drawBrush(data);
    
  }

  // Setup Graph Components
  function setupMap (sourceMap, width, height) {
    projection = d3.geo.albersUsa()
      .scale(1000)
      .translate([width / 2, height / 2]);

    if (isSVGMap) {
      var parentNode = document.getElementById(mapEl.slice(1));
      parentNode.appendChild(sourceMap);
      svg = d3.select(mapEl).select('svg');

    } else {
      svg = d3.select(mapEl);
      projection = d3.geo.albersUsa()
        .scale(1000)
        .translate([width / 2, height / 2]);

      path = d3.geo.path()
        .projection(projection);
      
      svg = d3.select(mapEl).append('svg');
      g = svg.append('g');
    }

    svg
      .attr('width', width)
      .attr('height', height);
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
    var valuesByArea = window.vbs = {};

    var areaType = isSVGMap ? 'County' : 'State';

    // Iterate over the full dataset and move state name and value into object for the selectedMaxYear
    data.forEach(function (d, i) {
      valuesByArea[d[areaType]] = +d.Years[selectedMaxYear];
    });
    
    // Create an array containing the min and max values 
    var yearValuesRange = d3.extent(d3.values(valuesByArea));
    // console.log('yearvalrange', yearValuesRange);
    var color = setQuantileColorScale(yearValuesRange,viewColors.econ);

    if (isSVGMap) {
      for (var key in valuesByArea) {
        var countySvg = d3.select('#'+key);
          countySvg.selectAll('path').style('fill', color(valuesByArea[key]));
      }
    } else {
      var states = topojson.feature(map, map.objects.units).features;
      g.selectAll(".states")
        .data(states)
        .enter().append("path")
        .attr("d", path)
        .style('stroke', '#FFF')
        .style('stroke-width', 3)
        .style('fill', function (d) {
          return color(valuesByArea[d.properties.name]);
        });
    }
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

    var width = 600;
    var height = 370;
    var vis = d3.select(graphEl).append('svg')
      .attr('width', width)
      .attr('height', height);
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

  function popSummaryData (data, knownSumRecArr) {
    
    var summarizedDataRecords = [];

    data.map(function (record, idx, arr) {
      for (var i = knownSumRecArr.length - 1; i >= 0; i--) {
        if (record.State === knownSumRecArr[i]) {
          summarizedDataRecords.push(arr.splice(idx, 1)[0]);
        }    
      }
    });
    return summarizedDataRecords;
  } //end popSummaryData

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
