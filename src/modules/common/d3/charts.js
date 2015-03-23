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

  // Check if map source is JSON or SVG
  var isSVGMap = false;
  var svgRE = /svg$/;
  
  isSVGMap = svgRE.test(mapSource) ? true : false;

  var selectedMinYear;
  var selectedMaxYear;
  var geoAreaCategory = 'County';
  var geoAreaNames;

  // TODO: do this dynamically
  if (geoAreaCategory === 'County') {
    geoAreaNames = ['Honolulu', 'Maui'];
  } else {
    geoAreaNames = ['Hawaii', 'California']; // filterStateObjects breaks when we try to check 'United States' object. I think we removed this when drawing the US map...
  }

  var knownSummaryRecords = ['United States'];
  var datasetSummaryRecords;
  var filteredStates;

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

    datasetSummaryRecords = popSummaryData(data, knownSummaryRecords);
    
    filteredStates = window.fStates = filterStateObjects(data, geoAreaNames);

    if (datasetSummaryRecords.length !== 0) {
      filteredStates.unshift(datasetSummaryRecords[0]);
    }

    var yMaxVal = findGraphMinMax(filteredStates).maxVal;
    var yMinVal = findGraphMinMax(filteredStates).minVal - 1; // sets min val to 1 below smallest value (in case we don't want chart to start at 0). allows some padding for very small Y values (e.g. Unemployment Rates)

    // TODO: maybe tweak so that only max values for selected timespan (not all years for filteredStates) get returned
    var setMaxVals = findMaxFIPSVals(data);
    var setMinVals = findMinFIPSVals(data);

    selectedMinYear = setMinVals.minYear;
    selectedMaxYear = setMaxVals.maxYear;

    drawMap(sourceMap, data);
    // drawGraph(data, setMinVals.minYear, selectedMaxYear, yMinVal, yMaxVal); // sets x axis (years) to minimimum year of loaded csv

    drawGraph(data, yMinVal, yMaxVal);
    drawBrush(sourceMap, data, setMinVals, setMaxVals, yMinVal, yMaxVal);
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


  // Draw Graph Components

  // This drawMap will only work with FIPS structured data on US map
  function drawMap (map, data) {
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
        .style('stroke-width', 1)
        .style('fill', function (d) {
          return color(valuesByArea[d.properties.name]);
        });
    }
  }

  function dataByState(data, state) {
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

  // Draw Line Graph
  function drawGraph (data, yMinVal, yMaxVal) {
    var width = 600;
    var height = 370;

    d3.select(graphEl).html("");
    var vis = d3.select(graphEl).append('svg')
      .attr('width', width + 200)
      .attr('height', height);
    var margins = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 70
      };

    var xScale = d3.scale.linear().domain([selectedMinYear, selectedMaxYear]).range([margins.left, width - margins.right]);
    var yScale = d3.scale.linear().domain([yMinVal,yMaxVal]).range([height - margins.top, margins.bottom]);

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
       //TODO: update text based on current Indicator
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

    // when there is a US Average data object
    if (datasetSummaryRecords.length !== 0) {
      var usAvgData = dataByState(filteredStates, knownSummaryRecords[0]);
  
      vis.append("svg:path")
         .attr("d", lineGen(usAvgData))
         .attr("stroke", "#D3D0C1")
         .attr("stroke-width", 3)
         .attr("fill", "none");
    }

    var hiStateData = dataByState(filteredStates, geoAreaNames[0]);
    var selectedStateData = dataByState(filteredStates, geoAreaNames[1]);

    vis.append("svg:path")
     .attr("d", lineGen(hiStateData))
     .attr("stroke", "#4F5050")
     .attr("stroke-width", 3)
     .attr("fill", "none");

    // adding selected state line
    vis.append("svg:path")
     .attr("d", lineGen(selectedStateData))
     .attr("stroke", "orange")
     .attr("stroke-width", 3)
     .attr("fill", "none");

    // Legend
    // appends line graph indicator heading
    vis.insert('g')
      .append('text')
      .attr('class','legend_text')
      .attr("x", width + 30)
      .attr("y", 10)
      .text('Legend');

    // deals with not having US average data or not:
    var legendData = geoAreaNames.slice(0); // prevents changes to geoAreaNames when modifying legendData
    if (datasetSummaryRecords.length !== 0 && legendData[0] !== knownSummaryRecords) {
      legendData.unshift(knownSummaryRecords);
    }

    // appends key labels 
    vis.insert('g')
      .selectAll('text')
      // .data(legendData)
      .data(legendData)
      .enter()
      .append('text')
      .attr('class','legend_text')
      .attr("x", width + 70)
      .attr("y", function(d, i){
        return i * 20 + 50;
      })
      .text(function(d){
        return d;
      });
   
   // adds colors to keys
    vis.insert('g')
      .selectAll('rect')
      .data(legendData)
      .enter()
      .append("rect")
      .attr("x", width + 30)
      .attr("y", function(d, i){
        return i * 20 + 42;
      })
      .attr("width", 30)
      .attr("height", 5)
      .style("fill", function(d){
        if (d == "United States") {
          return "#D3D0C1";
        } else if (d == "Hawaii") {
          return "#4F5050";
        } else {
          return "orange";
        }
      });

  }

  // Draw Slider
  function drawBrush (sourceMap, data, setMinVals, setMaxVals,  yMinVal, yMaxVal) {
    
    var tickFormat = d3.format('.0f');

    var scale = d3.scale.linear()
      .domain([setMinVals.minYear, setMaxVals.maxYear])
      .range([0, 760]) //TODO: check this value
      ;

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

      selectedMinYear = savedExtent[0];
      selectedMaxYear = savedExtent[1];

      drawMap(sourceMap, data);
      drawGraph(data, yMinVal, yMaxVal); 
    }

    var brushSVG = d3.select("#uh-brush-test");

    var brushAxis = d3.svg.axis()
      .scale(scale)
      .orient("bottom")
      .tickFormat(tickFormat)
      .innerTickSize(20)
      // .tickValues(scale.ticks(0).concat(scale.domain())) // shows only start and end ticks
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
          var transformedVal = +n;
          result.Years[key] = transformedVal ? transformedVal : -1;
        } else {
          result[key] = n;
        }
      }, {Years: {}});
    });  
  } //end transformFIPSData

  // Takes data and an array of state names (strings) to find
  function filterStateObjects (data, geoAreaNamesArr, geoAreaCategory) {
    return geoAreaNamesArr.map(function(item) {
      // .filter returns array, so we need to pluck out element
      return _.filter(data, geoAreaCategory, item)[0];
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
  
  // takes in array of data objects, and outputs array with min value and max value of all values in all data objects.
  function findGraphMinMax (data) {
    var allValuesArr = [];

    data.forEach(function (item, index) {
      allValuesArr = allValuesArr.concat(d3.values(item.Years));
    });

    // remove -1 from values array
    var filteredValues = _.remove(allValuesArr, function (value) {
      return value != -1;
    });
    
    return { 
      minVal : _.min(filteredValues), 
      maxVal : _.max(filteredValues)
    };
  } //end findGraphMinMax

}; // end module.exports
