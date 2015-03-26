'use strict';

module.exports = function (scope, mapSource, dataSource, currentYearEl, previousYearEl, currentPercentEl, summaryMeasurementEl, valueChangeEl, mapEl, graphEl, keyEl, histogramEl, brushEl, colorScheme, yUnitMeasure, legendText, measurementUnit) {

  //Default configs
  var width, height, projection, path, svg, g, mapLegend;
  var lineGen;
  var viewColors = {
    econ: ["#FCDDC0","#FFBB83","#FF9933","#F27D14","#C15606"],
    rnd:  ["#C2F1F2","#7FC4C9","#74B1B2","#5E9999","#497C7B"],
    ent:  ["#D3F4B5","#AADB83","#7FBB57","#537A31","#3E5B23"],
    edu:  ["#C2EDF2","#69D0E8","#47ABC6","#087F9B","#03627F"] 
  };
  var measurement_units = {
    percent : '%',
    dollars : '$',
    number : ''
  };
  var graphColors = {
    usColor: "#AAA797",
    hiColor: "#4F5050",
    selectedColor: viewColors[colorScheme][2],
    text: "#6E7070"
  };
  var oddDataSetWithGaps = (yUnitMeasure === "Scaled Score");

  width = 800;
  height = 600;

  // Check if map source is JSON or SVG
  var isSVGMap = false;
  var svgRE = /svg$/;
  isSVGMap = svgRE.test(mapSource) ? true : false;

  var selectedMinYear;
  var selectedMaxYear;
  var geoAreaCategory;
  var geoAreaNames;
  var fixedXYs = {
        Hawaii: {top:'454px', left:'250px' },
        Honolulu: {top:'114px', left:'340px' }
      };

  function buildGeoNameList (isHawaii, selectedGeoArea) {
    geoAreaNames = [];
    if (isHawaii) {
      geoAreaCategory = 'County';
      geoAreaNames[0] = 'Honolulu';
    } else {
      geoAreaCategory = 'State';
      geoAreaNames[0] = 'Hawaii';
    }
    if (selectedGeoArea) geoAreaNames.push(selectedGeoArea);
  }

  buildGeoNameList(isSVGMap);

  var knownSummaryRecords = ['United States'];
  var datasetSummaryRecords;
  var filteredStates;
  var data; // TODO: check whether or not we REALLY need to set data var outside of ready function

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
    
    data = window.transData = transformFIPSData(sourceData); // DEV ONLY
    // var data = transformFIPSData(sourceData); // PRODUCTION OK

    datasetSummaryRecords = popSummaryData(data, knownSummaryRecords);
    
    filteredStates = window.fStates = filterStateObjects(data, geoAreaNames, geoAreaCategory);

    if (datasetSummaryRecords.length !== 0) {
      filteredStates.unshift(datasetSummaryRecords[0]);
    }

    var setMaxVals = findMaxFIPSVals(data);
    var setMinVals = findMinFIPSVals(data);

    selectedMinYear = setMinVals.minYear;
    selectedMaxYear = setMaxVals.maxYear;
    scope.currentyear = selectedMaxYear;

    drawMap(sourceMap, data);
    drawGraph();
    drawBrush(sourceMap, data, setMinVals, setMaxVals);
    renderSummaryText();
    
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
    var color = setQuantileColorScale(yearValuesRange,viewColors[colorScheme]);
    var middleRanges = color.quantiles();
    var mapRanges = [];
    mapRanges[0] = [yearValuesRange[0], middleRanges[0]];
    mapRanges[1] = [middleRanges[0], middleRanges[1]];
    mapRanges[2] = [middleRanges[1], middleRanges[2]];
    mapRanges[3] = [middleRanges[2], middleRanges[3]];
    mapRanges[4] = [middleRanges[3], yearValuesRange[1]];

    resetMapTooltips();
    setHoverTooltipColor(colorScheme);

    // Draws the histogram for the main graph
    drawHistogram(yearValuesRange, color);

    if (isSVGMap) {
      for (var key in valuesByArea) {
        var countySvg = d3.select('#'+key);
          if (key !== 'Honolulu') {
            countySvg.on('click', function () {
              return passMapClickTarget(this.id);
            });
            countySvg.on('mousemove', function () {
              return drawMapTooltip(this.id, 'hover');
            });
          }
          countySvg.selectAll('path')
            .style('fill', color(valuesByArea[key]));
      }
      drawMapTooltip('Honolulu', 'fixed', fixedXYs);
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
        })
        .on('click', function (d) {
          if (d.properties.name !== 'Hawaii') {
            return passMapClickTarget(d.properties.name);
          }
        })
        .on('mousemove', function (d) {  
          if (d.properties.name !== 'Hawaii') {
            return drawMapTooltip(d.properties.name, 'hover');
          }
        });
        drawMapTooltip('Hawaii', 'fixed', fixedXYs);
    }
  }

  function drawMapTooltip (name, type, fixedXYs) {
    var tooltip = d3.select('#' + type + '-tooltip');
    if (type === 'fixed') {
      tooltip.style('top', function () {
        return fixedXYs[name].top;
      });
      tooltip.style('left', function () {
        return fixedXYs[name].left;
      }); 
      tooltip.select('.arrow_box').text(name);
    } else {
      tooltip.style('top', function () {
        return d3.event.pageY +'px';
      });
      tooltip.style('left', function () {
        return d3.event.pageX +'px';
      }); 
      tooltip.select('.arrow_box').text(name);
    }
  }

  function resetMapTooltips () {
    var tooltips = d3.selectAll('#fixed-tooltip, #hover-tooltip');
    tooltips.style('left', '-9999px');
  }

  function setHoverTooltipColor (colorKey) {
    var colorKeyMap = {
      econ: 'economic',
      rnd:  'research',
      ent:  'entrepreneurship',
      edu:  'education'
    };
    var bodyEl = d3.select('body');
    bodyEl.classed('economic research entrepreneurship education', false);
    bodyEl.classed(colorKeyMap[colorKey], true);
  }


function drawHistogram (yearValuesRange, colorScale) {

  var middleRanges = colorScale.quantiles();
  // mapRange array generation now within the drawHistogram func, using the yearValuesRange
  var mapRanges = [];
  mapRanges[0] = [yearValuesRange[0], middleRanges[0]];
  mapRanges[1] = [middleRanges[0], middleRanges[1]];
  mapRanges[2] = [middleRanges[1], middleRanges[2]];
  mapRanges[3] = [middleRanges[2], middleRanges[3]];
  mapRanges[4] = [middleRanges[3], yearValuesRange[1]];

  d3.select(histogramEl).html("");

  var svgHistogram = d3.select(histogramEl).append('svg').attr({"width": "100%", "height": 150}).append('g');
  var histogramKeys = mapRanges.slice(0);

  svgHistogram.append('text')
    .attr({"x": 5,"y": 15, "width":"100%","height":"auto","class":"histogram_text"})
    // below line is hardcoded. need to fix to dynamic with $scope or other
    .text(legendText)
    .style("fill", "black");

  // Histogram color blocks
  svgHistogram.insert('g')
    .selectAll('rect')
    .data(viewColors[colorScheme])
    .enter()
    .append("rect")
    .attr("x", 5)
    .attr("y", function(d, i){
      return i * 26 + 29;
    })
    .attr("rx", 2)
    .attr("ry", 2)
    .attr("width", 25)
    .attr("height", 15)
    .style({
      "fill": function(d){ return d;},
      "display" : "inline-block",
    });

  // Histogram number ranges
  svgHistogram.insert('g')
    .selectAll('text')
    .data(histogramKeys)
    .enter()
    .append('text')
    .attr('class','histogram_text')
    .attr("x", 45)
    .attr("y", function(d, i){
      return i * 26 + 40;
    })
    .text(function(d,i){
      // may have to convert to percents depending on chart
      // return d[0].toFixed(0) + " - " + d[1].toFixed(0);
      return d[0].toFixed(4) + " - " + d[1].toFixed(4);
      // return d[0] + " - " + d[1];
    });
  }

  function dataByState(data, geoAreaName, geoAreaCategory) {
    var result = [];

    for (var i = 0; i < data.length; i++) {

      if (data[i][geoAreaCategory] === geoAreaName) {

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

  // Renders summary text to Map and Line Graph
  function renderSummaryText(){
  // Appends summary text above US map
    // current selected year for map and line graph
    d3.selectAll(currentYearEl).html("")
      .insert('text')
      .text(selectedMaxYear);
    // percent change
    d3.select(currentPercentEl).html("")
      .insert('text')
      .text("{{ insert % }}"); 
    // unit of measure - taken from legendText variable
    d3.select(summaryMeasurementEl).html("")
      .insert('text')
      .text(legendText);

    // change in value - from previous to current years
    d3.select(valueChangeEl).html("")
      .insert('text')
      .text("{{ increase / decrease in value }}"); 
    // previous year
    d3.select(previousYearEl).html("")
      .insert('text')
      .text(selectedMinYear);
  }

  // Draw Line Graph
  function drawGraph () {
    var usAvgData;
    var hiStateData;
    var selectedStateData;

    var yMaxVal = findGraphMinMax(filteredStates).maxVal;
    var yMinVal = findGraphMinMax(filteredStates).minVal;

    var width = 600;
    var height = 370;

    d3.select(graphEl).html("");
    var vis = d3.select(graphEl).append('svg')
      .attr('width', width)
      .attr('height', height);
    var margins = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 70
      };

    var xScale = d3.scale.linear().domain([selectedMinYear, selectedMaxYear]).range([margins.left, width - margins.right]);
    var yScale = d3.scale.linear().domain([yMinVal,yMaxVal]).range([height - margins.top, margins.bottom]);

    /* START OF LINE GRAPH AXES */
    var formatXAxis = d3.format('.0f');

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .tickFormat(formatXAxis);

    var numXAxisTicks = d3.range(xAxis.scale().domain()[0], xAxis.scale().domain()[1] + 1).length;

    // based on our svg width, when there's 7 or fewer ticks, duplicate year labels are shown
    if (numXAxisTicks < 8) {
      xAxis.tickValues(d3.range(xAxis.scale().domain()[0], xAxis.scale().domain()[1] + 1));
    }

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");

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
      .attr("class", "label")
      .style("text-anchor", "middle")
      .text("Year");

    vis.append("text")
       .attr("transform", "rotate(-90)")
       .attr("x", 0 - (height) / 2)
       .attr("y", 0)
       .attr("class", "label")
       .style("text-anchor", "middle")
       .text(yUnitMeasure);
    /* END OF LINE GRAPH AXES */

    /* START OF LINE DRAWINGS */
    // .defined insures that only non-negative values are graphed
    lineGen = d3.svg.line()
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
      usAvgData = window.usData = dataByState(filteredStates, knownSummaryRecords[0], geoAreaCategory);
    
      drawLine(vis, usAvgData, graphColors.usColor);
    }

    hiStateData = window.hiData = dataByState(filteredStates, geoAreaNames[0], geoAreaCategory);
    drawLine(vis, hiStateData, graphColors.hiColor);

    selectedStateData = window.selStateData = dataByState(filteredStates, geoAreaNames[1], geoAreaCategory);

    if (selectedStateData.length !== 0) {
      drawLine(vis, selectedStateData, graphColors.selectedColor);
    }
    /* END OF LINE DRAWINGS */

    /* START OF LINE HOVER */

     var verticalLine = vis.append('line')
      .attr({ 'x1': 0, 'y1': 0, 'x2' : 0, 'y2': height })
      .attr("stroke", "#AAA797")
      .attr("class", "verticalLine")
      .attr("visibility", "hidden");

     vis.on("mousemove", function() {
        var mouseX = d3.mouse(this)[0];
        var mouseY = d3.mouse(this)[1];
        var flipTextOverLine = (mouseX > width - width/3);
        var flipTextAboveCursor = (mouseY > height - height/3);

        if ((mouseX <= width - margins.right) && mouseX >= margins.left) {
          var yearAtX = Math.round(xScale.invert(mouseX));
          var hoverData = window.hData = [
              [knownSummaryRecords[0], usAvgData, graphColors.usColor], 
              [geoAreaNames[0], hiStateData, graphColors.hiColor], 
              [geoAreaNames[1], selectedStateData, graphColors.selectedColor]
            ]
            .filter(function (item) {
              return item[0] !== undefined;
            })
            .map(function (item) {
              return [item[0], findGeoValueAtYear(item[1], yearAtX), item[2]];
            });

          hoverData.unshift(["Year", yearAtX, graphColors.text]);

          vis.selectAll('.tooltip').remove();

          vis.insert('g')
            .selectAll('text')
            .data(hoverData)
            .enter()
            .append('text')
            .attr('class', 'tooltip')
            .attr('fill', function(d) {
              return d[2];
            })
            .attr('text-anchor', function() {
              if (flipTextOverLine) {
                return "end";
              } else {
                return "start";
              }
            })
            .attr('x', function() {
              if (flipTextOverLine) {
                return mouseX - 20;
              }
              return mouseX + 20;
            })
            .attr('y', function (d, i) {
              if (flipTextAboveCursor) {
                return mouseY - 100 + i * 30;
              }
              return mouseY + 10 + i * 30;
            })
            .html(function(d) {
              if (d[1] === undefined || d[1] === null) {
                d[1] = "N/A"; // may need to remove this
              }
              if (d[0] === "Year") {
                return d[1];
              } else {
                return d[0] + ": " + d[1];
              }
            });

          vis.select(".verticalLine")
            .attr("visibility", "visible")
            .attr("transform", function() {
              return "translate(" + mouseX + ", 0)";
            });
        }
    });

    vis.on("mouseout", function() {
      vis.selectAll('.tooltip').remove();
      vis.select(".verticalLine").attr("visibility", "hidden");
    });

    /* START OF GRAPH LEGEND */
    // appends line graph indicator heading
    vis.insert('g')
      .append('text')
      .attr('class','legendText')
      .attr("x", width + 30);
    d3.select(keyEl).html("");
    var svgKey = d3.select(keyEl).append('svg').attr({"width": "100%", "height": 250}).append('g');

    svgKey.insert('g')
      .append('text')
      .attr('class','key_text')
      .attr("x", 0)
      .attr("y", 10)
      .text(legendText)
      .call(wrap,130);

    // deals with not having US average data or not:
    var legendData = geoAreaNames.slice(0); // prevents changes to geoAreaNames when modifying legendData
    if (datasetSummaryRecords.length !== 0 && legendData[0] !== knownSummaryRecords) {
      legendData.unshift(knownSummaryRecords);
    }

    // appends key labels 
    vis.insert('g');
    svgKey.insert('g')
      .selectAll('text')
      .data(legendData)
      .enter()
      .append('text')
      .attr('class','key_text')
      .attr("x", 40)
      .attr("y", function(d, i){
        return i * 20 + 70;
      })
      .text(function (d){
        return d;
      });
   
   // adds colors to keys
    vis.insert('g');
    svgKey.insert('g')
      .selectAll('rect')
      .data(legendData)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", function(d, i){
        return i * 20 + 64;
      })
      .attr("width", 30)
      .attr("height", 5)
      .style("fill", function (d) {
        if (d == "United States") {
          return graphColors.usColor;
        } else if ((d == "Hawaii" && geoAreaCategory !== "County") || d == "Honolulu") {
          return graphColors.hiColor;
        } else {
          return graphColors.selectedColor;
        }
      });

    function wrap(text, width) {
      text.each(function() {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = 0,
            tspan = text.text(null)
              .append("tspan")
              .attr("x", 0)
              .attr("y", y)
              .attr("dy", dy + "em");
        while (words.length > 0) {
          var word = words.pop();
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan").attr("x", 0)
              .attr("y", y)
              .attr("dy", ++lineNumber * lineHeight + dy + "em")
              .text(word);
          }
        }
      });
    }   
    /* END OF GRAPH LEGEND */
  }

  // Draw Slider
  function drawBrush (sourceMap, data, setMinVals, setMaxVals) {
    
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

      // snaps brush to odd years if even year is selected
      // we want this behavior for fourth and eight grade datasets only
      if (oddDataSetWithGaps) {
        savedExtent = savedExtent.map(function(c) {
          if (c % 2 === 0) {
            return c + 1;
          } else {
            return c;
          }
        });
      }

      d3.select(this).call(brush.extent(savedExtent));

      selectedMinYear = savedExtent[0];
      selectedMaxYear = savedExtent[1];

      drawMap(sourceMap, data, false);
      drawGraph();
      renderSummaryText(); 
    }

    var brushSVG = d3.select("#uh-brush-test");

    var brushAxis = d3.svg.axis()
      .scale(scale)
      .orient("bottom")
      .tickFormat(tickFormat)
      .innerTickSize(20)
      .tickPadding(20);

    // sets tick values to only odd years (steps of two), for the fourth and eight grade education datasets
    if (oddDataSetWithGaps) {
      brushAxis.tickValues(d3.range(brushAxis.scale().domain()[0], brushAxis.scale().domain()[1]+1, 2));
    }

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
      .style({ fill: viewColors[colorScheme][4], visibility: "visible" });
    brushG.selectAll(".resize rect")
      .attr("width", 12)
      .attr("height", 18)
      .attr("y", -4)
      .style({ fill: viewColors[colorScheme][2], visibility: "visible" });
  }

  // Utility functions
  function passMapClickTarget (targetName) {
    buildGeoNameList(isSVGMap, targetName);

    var selectedGeoAreaObj = filterStateObjects(data, [targetName], geoAreaCategory)[0];

    // sometimes there won't be US Average data (datasetSumaryRecords)
    // also we pluck out the US Average data object in the beginning, so geoAreaNames only has States/Counties (minus US average object)
    filteredStates[geoAreaNames.length + datasetSummaryRecords.length - 1] = selectedGeoAreaObj;

    drawGraph();
  }

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
          result.Years[key] = transformedVal ? transformedVal : null;
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

  function drawLine(graphSVG, data, color) {
    graphSVG.append("svg:path")
       .attr("d", lineGen(data))
       .attr("stroke", color)
       .attr("stroke-width", 3)
       .attr("fill", "none");
  } //end drawLine

  function findGeoValueAtYear (lineData, year) {
    return _.result(_.find(lineData, { 'year': year}), 'value');
  }

}; // end module.exports
