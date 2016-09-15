'use strict';

module.exports = function(scope, mapSource, dataSource, dataSource2,
  donutChartEl, currentYearEl, previousYearEl, currentPercentEl, summaryMeasurementEl, valueChangeEl, priceParityChangeEl,
  annualKaufmannEl, mapEl, graphEl, keyEl, histogramEl, brushEl, colorScheme, yUnitMeasure, legendText, measurementUnit, rawUnit) {
  //Default configs
  var width, height, projection, path, svg, g, mapLegend;
  var lineGen, lineGen2, numLegendLines;
  var viewColors = {
    econ: ["#FCDDC0", "#FFBB83", "#FF9933", "#F27D14", "#C15606"],
    rnd: ["#b2e5e6", "#7FC4C9", "#74B1B2", "#5E9999", "#497C7B"],
    ent: ["#D3F4B5", "#AADB83", "#7FBB57", "#537A31", "#3E5B23"],
    edu: ["#b0e5ed", "#69D0E8", "#47ABC6", "#087F9B", "#03627F"]
  };
  var measurement_units = {
    percent: '%',
    dollars: '$',
    number: ''
  };
  var graphColors = {
    usColor: "#AAA797",
    hiColor: viewColors[colorScheme][2],
    selectedColor: "#4F5050",
    /* hiColor: "#4F5050",
    selectedColor: viewColors[colorScheme][2], */
    text: "#6E7070"
  };
  var oddDataSetWithGaps = (yUnitMeasure === "Scaled Score");
  var wideYLabels = [
    "Per thousand($)",
    "($) Per Employed Worker",
    "$ from technology licenses and options executed"
  ];
  var eduText = (yUnitMeasure === "Percentage of the Labor Force") || (yUnitMeasure === "% of Population 16+");
  var entText = (yUnitMeasure === "% of Startup Establishments") || (yUnitMeasure === "% of All Occupations") || (yUnitMeasure === "% of Adults 20-64 Yrs");
  var farmJobs = (yUnitMeasure === 'Thousands of Jobs');
  var rpp = (yUnitMeasure === "Index");
  var techDollars = (yUnitMeasure === "$ from technology licenses and options executed");
  var gini = (yUnitMeasure === 'Gini Index');
  var extraWideGraphLabels = wideYLabels.indexOf(yUnitMeasure) !== -1;

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
    Hawaii: {
      top: '330px',
      left: '185px'
    },
    Honolulu: {
      top: '95px',
      left: '237px'
    }
  };

  var fixedMapTooltip = d3.select('#fixed-tooltip');
  var hoverMapTooltip = d3.select('#hover-tooltip');
  var selectedMapTooltip = d3.select('#selected-tooltip');
  var earlyValue,
    lateValue,
    earlyRawValue,
    lateRawValue;

  // Formatting functions:
  var fmtPercent = d3.format('%'); //usage: fmtPercent(number) => 98.5%

  var scaleNumber = function(number, formatter) {
    if (number > 999999) {
      return formatter(number / Math.pow(10, 6)) + 'M'; // 69000000 => 69M
    }
    if (number > 9999) {
      return formatter(number / Math.pow(10, 3)) + 'K'; // 69000 => 69K
    }
    return formatter(number);
  };

  // brandon's number converter for histogram/graphs
  function numberFormatConverter(num) {
    var intInt = d3.format('.0f');
    var perPer = d3.format('.1%');
    var extExt = d3.format('.2%');

    if (isNaN(num) || num === null) {
      return "N/A";
    }
    if (measurementUnit === 'integer') {
      return intInt(num); // 69
    }
    if (measurementUnit === 'percent') {
      return perPer(num); // 0.69 => 69%
    }
    if (measurementUnit === 'extended_percent') {
      return extExt(num); // 0.00069 => 0.069%
    }
    if (measurementUnit === 'dollars') {
      if (num > 99 & num < 1000000) {
        return "$" + scaleNumber(num, d3.format(',.0f'));
      } else {
        return "$" + scaleNumber(num, d3.format(',.2f'));
      }
    }
    if (measurementUnit === 'dollars_mill') {
      return "$" + scaleNumber(num / 1000, d3.format('.2f'));
    }
    if (measurementUnit === 'number') {
      if (farmJobs) {
        var scale = d3.format(',.0f');
        return scale(((num * 100000)) / Math.pow(10, 5)) + 'K';
      } else if (gini) {
        return scaleNumber(num, d3.format('.2f'));
      } else {
        return scaleNumber(num, d3.format('.1f'));
      }
    }
    return "N/A";
  }

  function rawNumberConverter(num) {
    var value = scaleNumber(num, d3.format(',.0f'));
    if (measurementUnit === 'dollars') {
      return "$" + value;
    }
    return value;
  }

  function valueChangeFormatConverter(num) {
    var intInt = d3.format('.0f');
    var perPer = d3.format('.1%');
    var extExt = d3.format('.2%');
    var formatNumber;
    //var dolVal = Math.ceil(num/10) * 10;
    var formatVal;

    if (num > 999) {
      formatVal = d3.format('$,.0f');
    } else {
      formatVal = d3.format('$,.2f');
    }

    if (farmJobs) {
      num = num * 1000;
      formatNumber = d3.format(',.0f');
    } else {
      formatNumber = d3.format('.1f');
    }

    if (isNaN(num) || num === null) {
      return "N/A";
    }

    if (measurementUnit === 'integer') {
      return intInt(num); // 69
    }
    if (measurementUnit === 'percent') {
      return perPer(num); // 0.69 => 69%
    }
    if (measurementUnit === 'extended_percent') {
      return extExt(num); // 0.00069 => 0.069%
    }
    if (measurementUnit === 'dollars' || measurementUnit === 'dollars_mill') {
      return formatVal(num);
    }
    if (measurementUnit === 'number') {
      //return scaleNumber(num, d3.format('.1f'));
      if (gini) {
        formatNumber = d3.format('.2f');
        return formatNumber(num);
      } else {
        return formatNumber(num);
      }
    }
    return "N/A";
  }

  function buildGeoNameList(isHawaii, selectedGeoArea) {
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
  var dataRaw;

  getDataSets(mapSource, dataSource, dataSource2); // Trigger getting data and drawing charts

  // get Source Data
  function getDataSets(mapSource, dataSource, dataSource2) {

    var q = queue().defer(d3.csv, dataSource).defer(d3.csv, dataSource2);


    if (isSVGMap) {
      q.defer(d3.xml, mapSource, 'image/svg+xml').await(function(err, dataSource, dataSource2, mapSource) {
        var hawaiiSvg = document.importNode(mapSource.documentElement, true);
        ready(err, dataSource, dataSource2, hawaiiSvg, isSVGMap);
      });
    } else {
      q.defer(d3.json, mapSource).await(function(err, dataSource, dataSource2, mapSource) {
        ready(err, dataSource, dataSource2, mapSource, isSVGMap);
      });
    }
  }

  function ready(err, sourceData, sourceDataRaw, sourceMap, isSVGMap) {
    setupMap(sourceMap, width, height);

    // DEV ONLY
    window.transData = transformFIPSData(sourceData);
    window.transAlternateData = transformFIPSData(sourceDataRaw);
    data = window.transData;
    dataRaw = window.transAlternateData;
    //var data = transformFIPSData(sourceData); // PRODUCTION OK
    datasetSummaryRecords = popSummaryData(data, knownSummaryRecords);

    window.fStates = filterStateObjects(data, geoAreaNames, geoAreaCategory);
    filteredStates = window.fStates;

    if (datasetSummaryRecords.length !== 0) {
      filteredStates.unshift(datasetSummaryRecords[0]);
    }

    // filter out Hawaii/Honolulu data and find min & max year where data is available for selected years on page load
    function findHawaiiData(data) {
      return _.reduce(data, function(result, item, key) {
        var hawaiiFilter;
        if (datasetSummaryRecords.length !== 0) {
          hawaiiFilter = filteredStates[1];
        } else {
          hawaiiFilter = filteredStates[0];
        }
        var hawaiiData = hawaiiFilter.Years;
        var dataAvail = _.filter(_.keys(hawaiiData), function(key) {
          return hawaiiData[key];
        });
        result.minYear = parseInt(_.first(dataAvail));
        result.maxYear = parseInt(_.last(dataAvail));
        return result;
      }, {
        minYear: 0,
        maxYear: 0
      });
    }

    var hiData = findHawaiiData(data);
    selectedMinYear = hiData.minYear;
    selectedMaxYear = hiData.maxYear;
    scope.currentyear = selectedMaxYear;

    var setMaxVals = findMaxFIPSVals(data);
    var setMinVals = findMinFIPSVals(data);

    drawMap(sourceMap, data, dataRaw);
    drawGraph();
    drawBrush(sourceMap, data, dataRaw, setMinVals, setMaxVals);
    renderSummaryText();
  }

  // Setup Graph Components
  function setupMap(sourceMap, width, height) {
    projection = d3.geo.albersUsa()
      .scale(800)
      .translate([(width / 2) - 75, (height / 2) - 100]);

    if (isSVGMap) {
      var parentNode = document.getElementById(mapEl.slice(1));
      parentNode.appendChild(sourceMap);
      svg = d3.select(mapEl).select('svg');

    } else {
      svg = d3.select(mapEl);
      projection = d3.geo.albersUsa()
        .scale(800)
        .translate([(width / 2) - 75, (height / 2) - 100]);

      path = d3.geo.path()
        .projection(projection);

      svg = d3.select(mapEl).append('svg');
      g = svg.append('g');
    }

    svg
      .attr('width', width)
      .attr('height', height);
  }

  // Draw Graph Components
  // This drawMap will only work with FIPS structured data on US map
  function drawMap(map, data, dataRaw) {
    // Create object to hold each state and it corresponding value
    // based on a single year {"statename": value, ...}
    window.vbs = {};
    var valuesByArea = window.vbs;

    var areaType = isSVGMap ? 'County' : 'State';

    // Iterate over the full dataset and move state name and value into object for the selectedMaxYear
    data.forEach(function(d, i) {
      valuesByArea[d[areaType]] = +d.Years[selectedMaxYear];
    });

    // Create an array containing the values
    var yearValuesRange = d3.values(valuesByArea);
    var color = setQuantileColorScale(yearValuesRange, viewColors[colorScheme]);

    resetMapTooltips(fixedMapTooltip);
    resetMapTooltips(hoverMapTooltip);
    resetMapTooltips(selectedMapTooltip);
    setHoverTooltipColor(colorScheme);

    // Draws the histogram for the main graph
    drawHistogram(yearValuesRange, color);

    //use dispatch to create toggle event for tooltips
    var dispatch = d3.dispatch('unselectAll', 'toggleSingle')
      .on('unselectAll', function() {
        d3.selectAll('.selectable').classed('active', false);
      })
      .on('toggleSingle', function(n) {
        var active = d3.select(n).classed('active');
        d3.selectAll('#usLine').classed('usAvgOn', false);
        dispatch.unselectAll();
        d3.select(n).classed('active', !active);
      });

    var countyClick = function() {
      passMapClickTarget(this.id);
      dispatch.toggleSingle(this);
      if (d3.select(this).classed('active')) {
        populateMapTooltip('selected', this.id, data, dataRaw, selectedMinYear, selectedMaxYear, true);
        positionMapTooltip('selected');
        d3.select('#hover-tooltip').classed('hidden', true);
      } else {
        resetMapTooltips(selectedMapTooltip);
        d3.select('#hover-tooltip').classed('hidden', false);
      }
    };

    var populateMapToolTipMouseOver = function() {
      populateMapTooltip('hover', this.id, data, dataRaw, selectedMinYear, selectedMaxYear, true);
    };

    var positionMapTooltipHover = function() {
      positionMapTooltip('hover');
    };

    var resetHoverTooltip = function() {
      resetMapTooltips(hoverMapTooltip);
    };

    if (isSVGMap) {
      for (var key in valuesByArea) {
        var countySvg = d3.select('#' + key);
        if (key !== 'Honolulu') {
          countySvg
            .attr('class', 'selectable')
            .on('click', countyClick)
            .on('mouseover', populateMapToolTipMouseOver)
            .on('mousemove', positionMapTooltipHover)
            .on('mouseleave', resetHoverTooltip);
        }
        countySvg.selectAll('path')
          .style('fill', color(valuesByArea[key]));
      }
      populateMapTooltip('fixed', 'Honolulu', data, dataRaw, selectedMinYear, selectedMaxYear, true);
      positionMapTooltip('fixed', fixedXYs.Honolulu);
    } else {
      var states = topojson.feature(map, map.objects.units).features;
      g.selectAll(".states")
        .data(states)
        .enter().append("path")
        .attr("d", path)
        .attr('class', 'selectable')
        .style('stroke', '#FFF')
        .style('stroke-width', 1)
        .style('fill', function(d) {
          if (isNaN(valuesByArea[d.properties.name])) {
            return "#EBEDDE";
          } else {
            return color(valuesByArea[d.properties.name]);
          }
        })
        .on('click', function(d) {
          if (d.properties.name !== 'Hawaii') {
            passMapClickTarget(d.properties.name);
            //toggle active class of state selected
            dispatch.toggleSingle(this);

            //if state is active, display selected-tooltip
            if (d3.select(this).classed('active')) {
              populateMapTooltip('selected', d.properties.name, data, dataRaw, selectedMinYear, selectedMaxYear, false);
              positionMapTooltip('selected');
              //hide hover-tooltip when state is active
              d3.select('#hover-tooltip').classed('hidden', true);
            } else {
              resetMapTooltips(selectedMapTooltip);
              //show hover-tooltip when no state is active
              d3.select('#hover-tooltip').classed('hidden', false);
            }

          }
        })
        .on('mouseover', function(d) {
          if (d.properties.name !== 'Hawaii') {
            return populateMapTooltip('hover', d.properties.name, data, dataRaw, selectedMinYear, selectedMaxYear, false);
          }
        })
        .on('mousemove', function(d) {
          if (d.properties.name !== 'Hawaii') {
            return positionMapTooltip('hover');
          }
        })
        // remove hover tooltip when mouse leaves map
        .on('mouseleave', function(d) {
          if (d.properties.name !== 'Hawaii') {
            return resetMapTooltips(hoverMapTooltip);
          }
        });
      populateMapTooltip('fixed', 'Hawaii', data, dataRaw, selectedMinYear, selectedMaxYear, false);
      positionMapTooltip('fixed', fixedXYs.Hawaii);
    }
  }

  // returns a pretty string for secondValue - firstValue.
  function getChangeString(firstValue, secondValue) {
    var change = secondValue - firstValue;
    var prefix;
    if (isNaN(change)) {
      return 'N/A';
    }

    if (change >= 0) {
      prefix = '+';
    } else {
      prefix = '-';
      change = Math.abs(change);
    }

    change = numberFormatConverter(change);
    if (measurementUnit === 'percent' || measurementUnit === 'extended_percent') {
      change = change.slice(0, -1);
    }

    /* if(measurementUnit === 'percent' || measurementUnit === 'extended_percent') {
      return change.slice(0,-1);
   } */

    return prefix + change;
  }

  function getRawChange(firstValue, secondValue) {
    var change = secondValue - firstValue;
    var prefix;
    if (isNaN(change)) {
      return 'N/A';
    }

    if (change >= 0) {
      prefix = '+';
    } else {
      prefix = '-';
      change = Math.abs(change);
    }

    change = rawNumberConverter(change);

    return prefix + change;
  }

  function populateMapTooltip(type, areaName, data, dataRaw, minYear, maxYear, isHawaii) {

    var targetType = isHawaii ? 'County' : 'State';

    if (isHawaii) {
      earlyValue = _.result(_.find(data, {
        'County': areaName
      }), 'Years')[minYear];
      lateValue = _.result(_.find(data, {
        'County': areaName
      }), 'Years')[maxYear];
      earlyRawValue = _.result(_.find(dataRaw, {
        'County': areaName
      }), 'Years')[minYear];
      lateRawValue = _.result(_.find(dataRaw, {
        'County': areaName
      }), 'Years')[maxYear];
    } else {
      earlyValue = _.result(_.find(data, {
        'State': areaName
      }), 'Years')[minYear];
      lateValue = _.result(_.find(data, {
        'State': areaName
      }), 'Years')[maxYear];
      earlyRawValue = _.result(_.find(dataRaw, {
        'State': areaName
      }), 'Years')[minYear];
      lateRawValue = _.result(_.find(dataRaw, {
        'State': areaName
      }), 'Years')[maxYear];
    }

    var arrow;
    if (type === 'fixed') {
      arrow = fixedMapTooltip.select('.arrow_box');
    } else if (type === 'hover') {
      arrow = hoverMapTooltip.select('.arrow_box');
    } else if (type === 'selected') {
      arrow = selectedMapTooltip.select('.arrow_box');
    }
    arrow.html(function() {
        return null;
      })
      .append('h3')
      .classed('tooltip-title', true)
      .text(areaName);
    arrow.append('p')
      .classed('tooltip-val', true)
      .text(selectedMaxYear + ': ' + numberFormatConverter(lateValue)); // blamebrandontag
    arrow.append('span')
      .classed('tooltip-diff', true)
      .text(selectedMinYear + '-' + selectedMaxYear + ': ');
    arrow.append('span')
      .text(getChangeString(earlyValue, lateValue))
      .attr('class', function() {
        if (getChangeString(earlyValue, lateValue).substring(0, 1) === '+') {
          return 'positive';
        } else if (getChangeString(earlyValue, lateValue) === 'N/A') {
          return 'not-available';
        } else {
          return 'negative';
        }
      });
    if (earlyRawValue !== earlyValue || lateRawValue !== lateValue) {
      d3.select('#hover-tooltip')
        .classed('raw-val', true);
      d3.select('#selected-tooltip')
        .classed('raw-val-selected', true);
      updateFixed(type, true);
      arrow.append('h3')
        .classed('tooltip-title', true)
        .text('Raw Values');
      arrow.append('p')
        .classed('tooltip-val', true)
        .text(selectedMaxYear + ': ' + rawNumberConverter(lateRawValue)); // blamebrandontag
      arrow.append('span')
        .classed('tooltip-diff', true)
        .text(selectedMinYear + '-' + selectedMaxYear + ': ');
      arrow.append('span')
        .text(getRawChange(earlyRawValue, lateRawValue))
        .attr('class', function() {
          if (getRawChange(earlyRawValue, lateRawValue).substring(0, 1) === '+') {
            return 'positive';
          } else if (getRawChange(earlyRawValue, lateRawValue) === 'N/A') {
            return 'not-available';
          } else {
            return 'negative';
          }
        });
    } else {
      d3.select('#hover-tooltip')
        .classed('raw-val', false);
      d3.select('#selected-tooltip')
        .classed('raw-val-selected', false);
      updateFixed(type, false);

    }
  }

  function updateFixed(type, hasRawValue) {
    if (type !== 'fixed') {
      return;
    }
    d3.select('#fixed-tooltip')
      .classed('raw-val', hasRawValue);
  }

  function positionMapTooltip(type, fixedXYsObj) {
    if (type === 'fixed') {
      fixedMapTooltip.style({
        top: function() {
          return fixedXYsObj.top;
        },
        left: function() {
          return fixedXYsObj.left;
        }
      });
    } else if (type === 'hover') {
      hoverMapTooltip.style({
        top: function() {
          return d3.event.pageY + 'px';
        },
        left: function() {
          return d3.event.pageX + 'px';
        }
      });
    } else if (type === 'selected') {
      selectedMapTooltip.style({
        top: function() {
          return d3.event.pageY + 'px';
        },
        left: function() {
          return d3.event.pageX + 'px';
        }
      });
    }
  }

  function resetMapTooltips(tooltipEl) {
    tooltipEl
      .style('left', '-9999px')
      .select('.arrow_box')
      .text('');
  }

  function setHoverTooltipColor(colorKey) {
    var colorKeyMap = {
      econ: 'economic',
      rnd: 'research',
      ent: 'entrepreneurship',
      edu: 'education'
    };
    var bodyEl = d3.select('body');
    bodyEl.classed('economic research entrepreneurship education', false);
    bodyEl.classed(colorKeyMap[colorKey], true);
  }


  function drawHistogram(yearValuesRange, colorScale) {

    var middleRanges = colorScale.quantiles();
    // mapRange array generation now within the drawHistogram func, using the yearValuesRange
    var mapRanges = [];
    // mapRanges[0] = [yearValuesRange[0], middleRanges[0]];
    mapRanges[0] = [0, middleRanges[0]];
    mapRanges[1] = [middleRanges[0], middleRanges[1]];
    mapRanges[2] = [middleRanges[1], middleRanges[2]];
    mapRanges[3] = [middleRanges[2], middleRanges[3]];
    // mapRanges[4] = [middleRanges[3], yearValuesRange[1]];
    mapRanges[4] = [middleRanges[3], yearValuesRange[1]];

    d3.select(histogramEl).html("");

    var svgHistogram = d3.select(histogramEl).append('svg').attr({
      "width": 210,
      "height": 207
    }).append('g');
    var histogramKeys = mapRanges.slice(0);

    svgHistogram
    // .append('text')
      .attr({
        "x": 5,
        "y": 15,
        "width": "100%",
        "height": "auto",
        "class": "histogram_text"
      })
      // below line is hardcoded. need to fix to dynamic with $scope or other
      .text(legendText)
      .style("fill", graphColors.text)
      .call(wrap, 184);

    // Histogram color blocks
    svgHistogram.insert('g')
      .selectAll('rect')
      .data(viewColors[colorScheme])
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", function(d, i) {
        return i * 26 + numLegendLines * 11 + 40;
      })
      .attr("rx", 2)
      .attr("ry", 2)
      .attr("width", 25)
      .attr("height", 15)
      .style({
        "fill": function(d) {
          return d;
        },
        "display": "inline-block",
      });

    // Histogram number ranges
    svgHistogram.insert('g')
      .selectAll('text')
      .data(histogramKeys)
      .enter()
      .append('text')
      .attr('class', 'histogram_text')
      .attr("fill", graphColors.text)
      .attr("x", 45)
      .attr("y", function(d, i) {
        return i * 26 + numLegendLines * 11 + 52;
      })
      .text(function(d, i) {
        if (i < 1) {
          return d[0] + " - " + numberFormatConverter(d[1]);
        }
        if (i < 4) {
          return numberFormatConverter(d[0]) + " - " + numberFormatConverter(d[1]);
        }
        if (i == 4) {
          return numberFormatConverter(d[0]) + "+";
        }
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
              year: year,
              value: data[i].Years[year]
            });
          }
          // });

        }
      }
    }
    return result;
  }

  // Renders summary text to Map and Line Graph
  function renderSummaryText() {
    // Appends summary text above US map
    // current selected year for map and line graph
    d3.selectAll(currentYearEl).html("")
      .insert('text')
      .text(selectedMaxYear);
    // percent change
    d3.selectAll(currentPercentEl).html("")
      .insert('text')
      .text(function() {
        if (isNaN(lateValue)) {
          return "not available";
        } else {
          //return numberFormatConverter(lateValue);
          return valueChangeFormatConverter(lateValue);
        }
      });
    //.text( numberFormatConverter(lateValue) ); // blamebrandontag
    // unit of measure - taken from legendText variable
    d3.select(summaryMeasurementEl).html("")
      .insert('text')
      .text(legendText);

    // calculate percent change for Regional Price Parity
    d3.select(priceParityChangeEl).html("")
      .insert('text')
      .text(function() {
        var priceChange = lateValue - 100;
        return valueChangeFormatConverter(priceChange);
      });

    // calculate annual value for Kaufmann
    d3.select(annualKaufmannEl).html("")
      .insert('text')
      .text(function() {
        var annualKaufmann = lateValue * 12;
        return valueChangeFormatConverter(annualKaufmann);
      });

    // change in value - from previous to current years
    d3.select(valueChangeEl).html("")
      .insert('text')
      .text(function() {
        var postfix = '',
          prefix, number, annual;
        var annualFormat = d3.format('.2f');
        var change = lateValue - earlyValue;
        if (change >= 0) {
          prefix = '';
          postfix = ' more';
          // prefix = 'an increase of ';
          //number = numberFormatConverter(change);
          number = valueChangeFormatConverter(change);
        } else if (isNaN(change)) {
          prefix = 'not available';
          postfix = ' more';
          number = '';
        } else {
          prefix = '';
          postfix = ' fewer';
          //prefix = 'a decrease of ';
          //number = numberFormatConverter(Math.abs(change));
          number = valueChangeFormatConverter(Math.abs(change));
        }

        if (measurementUnit === 'percent' || measurementUnit === 'extended_percent') {
          if (change >= 0) {
            prefix = 'an increase of ';
            number = number.slice(0, -1);
          } else if (isNaN(change)) {
            prefix = 'an increase of not available ';
            number = '';
          } else {
            prefix = 'a decrease of ';
            number = number.slice(0, -1);
          }
          postfix = ' percentage points ';
        }

        if (measurementUnit === 'dollars') {
          if (change >= 0) {
            prefix = '';
            postfix = ' more';
            //number = numberFormatConverter(change);
            number = valueChangeFormatConverter(change);
          } else if (isNaN(change)) {
            prefix = '$not available';
            postfix = ' more';
            number = '';
          } else {
            prefix = '';
            postfix = ' less';
            //numberFormatConverter(Math.abs(change));
            number = valueChangeFormatConverter(Math.abs(change));
          }
        }

        if (oddDataSetWithGaps) {
          if (change >= 0) {
            prefix = '';
            postfix = ' points higher';
            // prefix = 'an increase of ';
            //number = numberFormatConverter(change);
            number = valueChangeFormatConverter(change);
          } else if (isNaN(change)) {
            prefix = 'not available';
            postfix = ' points higher';
            number = '';
          } else {
            prefix = '';
            postfix = ' points lower';
            //prefix = 'a decrease of ';
            //number = numberFormatConverter(Math.abs(change));
            number = valueChangeFormatConverter(Math.abs(change));
          }
        }

        if (entText && measurementUnit === 'percent' || measurementUnit === 'extended_percent') {
          if (change >= 0) {
            prefix = '';
            //number = number.slice(0, -1);
            postfix = ' percentage points more';
          } else if (isNaN(change)) {
            prefix = '';
            number = '';
            postfix = 'not available percentage points more';
          } else {
            prefix = '';
            //number = number.slice(0, -1);
            postfix = ' percentage points less';
          }
        }

        if (eduText && measurementUnit === 'percent' || measurementUnit === 'extended_percent') {
          if (change >= 0) {
            prefix = '';
            //number = number.slice(0, -1);
            postfix = ' percentage points higher';
          } else if (isNaN(change)) {
            prefix = '';
            number = '';
            postfix = 'not available percentage points higher';
          } else {
            prefix = '';
            //number = number.slice(0, -1);
            postfix = ' percentage points lower';
          }
        }

        if (yUnitMeasure === 'Index') {
          if (change >= 0) {
            prefix = 'an increase of ';
            postfix = ' percentage points';
            //number = numberFormatConverter(change);
            number = valueChangeFormatConverter(change);
          } else if (isNaN(change)) {
            prefix = 'an increase of not available percentage points';
            postfix = '';
            number = '';
          } else {
            prefix = 'a decrease of ';
            postfix = ' percentage points';
            //number = numberFormatConverter(Math.abs(change));
            number = valueChangeFormatConverter(Math.abs(change));
          }
        }

        if (yUnitMeasure === '% of Adults 20-64 Yrs') {
          annual = number * 12;
          if (change >= 0) {
            prefix = '';
            number = valueChangeFormatConverter(change);
            postfix = 'x12=' + annualFormat(annual) + ' percentage points more';
            //number = numberFormatConverter(change);
          } else if (isNaN(change)) {
            prefix = 'not available percentage points more';
            postfix = '';
            number = '';
          } else {
            prefix = '';
            //number = numberFormatConverter(Math.abs(change));
            number = valueChangeFormatConverter(Math.abs(change));
            postfix = 'x12=' + annualFormat(annual) + ' percentage points less';
          }
        }

        if (gini) {
          if (change >= 0) {
            prefix = '';
            number = valueChangeFormatConverter(change);
            postfix = ' higher';
          } else if (isNaN(change)) {
            prefix = 'not available higher';
            postfix = '';
            number = '';
          } else {
            prefix = '';
            number = valueChangeFormatConverter(Math.abs(change));
            postfix = ' lower';
          }
        }

        return prefix + number + postfix;
      });
    // previous year
    d3.select(previousYearEl).html("")
      .insert('text')
      .text(selectedMinYear);
  }

  // Draw Line Graph
  function drawGraph() {
    var usAvgData, hiStateData, selectedStateData;

    var minMax = findGraphMinMax(filteredStates);
    var yMaxVal = minMax.maxVal;
    var yMinVal = minMax.minVal;

    // Use two y-axes for Non-Farm Jobs; RPP; Tech. Licensing in Dollars
    var stateData, hawaiiData, hawaiiMin, hawaiiMax, countyData, countyMin, countyMax, stateMin, stateMax, y2MinVal, y2MaxVal, y2range;

    // Find Min & Max values for Hawaii and selected state; Non-Farm Jobs
    // Use Hawaii values to scale left axis; State values (and US. avg when available) for right axis
    if (!isSVGMap && farmJobs && filteredStates.length === 2) {
      stateData = filteredStates[0];
      hawaiiData = filteredStates[1];
      y2MinVal = d3.min(d3.values(stateData.Years));
      y2MaxVal = d3.max(d3.values(stateData.Years));
      yMinVal = d3.min(d3.values(hawaiiData.Years));
      yMaxVal = d3.max(d3.values(hawaiiData.Years));
    } else if (!isSVGMap && farmJobs && filteredStates.length === 3) {
      stateData = filteredStates[2];
      hawaiiData = filteredStates[1];
      y2MinVal = d3.min(d3.values(stateData.Years));
      y2MaxVal = d3.max(d3.values(stateData.Years));
      yMinVal = d3.min(d3.values(hawaiiData.Years));
      yMaxVal = d3.max(d3.values(hawaiiData.Years));
    }

    // Find Min & Max values for Hawaii and selected state; Regional Price Parities & Tech. Licenses in Dollars
    if ((rpp || techDollars) && filteredStates.length === 1) {
      hawaiiData = filteredStates[0];
      yMinVal = d3.min(d3.values(hawaiiData.Years));
      yMaxVal = d3.max(d3.values(hawaiiData.Years));
    } else if ((rpp || techDollars) && filteredStates.length === 2) {
      stateData = filteredStates[1];
      hawaiiData = filteredStates[0];
      yMinVal = d3.min(d3.values(hawaiiData.Years));
      yMaxVal = d3.max(d3.values(hawaiiData.Years));
      y2MinVal = d3.min(d3.values(stateData.Years));
      y2MaxVal = d3.max(d3.values(stateData.Years));
    }

    // Find Min & Max values for selected county; Non-Farm Jobs County Comparison
    if (isSVGMap && filteredStates.length === 2) {
      countyData = filteredStates[1];
      countyMin = d3.min(d3.values(countyData.Years));
      countyMax = d3.max(d3.values(countyData.Years));
    }

    var width = 592;
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

    if (extraWideGraphLabels) {
      margins.left = 100;
    }

    var xScale = d3.scale.linear().domain([selectedMinYear, selectedMaxYear]).range([margins.left, width - margins.right]);
    var yScale = d3.scale.linear().domain([yMinVal, yMaxVal]).range([height - margins.top, margins.bottom]);
    var y2Scale = d3.scale.linear().domain([y2MinVal, y2MaxVal]).range([height - margins.top, margins.bottom]);
    var yBar = d3.scale.linear().domain([0, yMaxVal]).range([height - margins.top, margins.bottom]);

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

    var yAxis, y1Axis, y2Axis;

    if (oddDataSetWithGaps) {
      yAxis = d3.svg.axis()
        .scale(yBar)
        .tickFormat(numberFormatConverter)
        .ticks(4)
        .orient("left");
    }
    if (farmJobs || rpp || techDollars) {
      y1Axis = d3.svg.axis()
        .scale(yScale)
        .tickFormat(numberFormatConverter)
        .ticks(5)
        .orient("left");
      y2Axis = d3.svg.axis()
        .scale(y2Scale)
        .tickFormat(numberFormatConverter)
        .ticks(5)
        .orient("right");
    } else {
      yAxis = d3.svg.axis()
        .scale(yScale)
        .tickFormat(numberFormatConverter)
        // y-axis also duplicating labels when there are 6 or fewer ticks
        .ticks(5)
        .orient("left");
    }

    vis.append("svg:g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (height - margins.bottom) + ")")
      .call(xAxis)
      .selectAll("text")
      .attr("dx", "-2em")
      .attr("dy", "-.05em")
      .attr("transform", "rotate(-65)");

    if (farmJobs || rpp || techDollars) {
      vis.append("svg:g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (margins.left) + ",0)")
        .call(y1Axis);
      vis.append("svg:g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (width - margins.right) + ",0)")
        .call(y2Axis);
    } else {
      vis.append("svg:g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (margins.left) + ",0)")
        .call(yAxis);
    }

    vis.append("text")
      .attr("x", width / 2)
      .attr("y", height + margins.bottom + margins.top + 10)
      .attr("class", "label")
      .style("text-anchor", "middle")
      .text("Year");

    vis.append("text")
      .attr("x", width / 2)
      .attr("y", 0)
      .attr("class", "label")
      .style("text-anchor", "middle")
      .text(yUnitMeasure);
    /* END OF LINE GRAPH AXES */

    /* START OF LINE DRAWINGS */
    // .defined insures that only non-negative values are graphed
    lineGen = d3.svg.line()
      .defined(function(d) {
        //return d.value !== null;
        return !isNaN(d.value);
      })
      .x(function(d) {
        return xScale(d.year);
      })
      .y(function(d) {
        return yScale(d.value);
      })
      .interpolate("linear");

    lineGen2 = d3.svg.line()
      .defined(function(d) {
        return !isNaN(d.value);
      })
      .x(function(d) {
        return xScale(d.year);
      })
      .y(function(d) {
        return y2Scale(d.value);
      })
      .interpolate("linear");

    // Draw plot points
    function drawPoints(graphSVG, data, color) {
      graphSVG.selectAll("dot")
        .data(data.filter(function(d) {
          return !isNaN(d.value);
        }))
        .enter().append("circle")
        .attr("r", 2.5)
        .attr("cx", function(d) {
          return xScale(d.year);
        })
        .attr("cy", function(d) {
          return yScale(d.value);
        })
        .attr('id', 'usPoints')
        .style("fill", color);
    }

    function drawPointsY2(graphSVG, data, color) {
      graphSVG.selectAll("dot")
         .data(data.filter(function(d) {
          return !isNaN(d.value);
         }))
         .enter().append("circle")
         .attr("r", 2.5)
         .attr("cx", function(d) {
          return xScale(d.year);
         })
         .attr("cy", function(d) {
          return y2Scale(d.value);
         })
         .attr('id', 'usPoints')
         .style("fill", color);
    }

    // scale for bar charts
    var x0 = d3.scale.linear().domain([selectedMinYear, selectedMaxYear]).range([margins.left, width - margins.right - 29]);

    // Draw bar graph for 4th & 8th grade scores
    function drawUSBar(graphSVG, data, color) {
      var yearList = data.map(function(d) {
        return d.year;
      });
      var valueList = data.map(function(d) {
        return d.value;
      });
      var seriesName = ['United States'];

      data.forEach(function(d) {
        d.series = seriesName.map(function(name) {
          return {
            name: name,
            year: d.year,
            value: d.value
          };
        });
      });

      var series = graphSVG.selectAll("g.series")
        .data(data)
        .enter().append("svg:g")
        .attr("class", "series")
        .attr("fill", color)
        .attr("transform", function(d, i) {
          return "translate(" + (x0(d.year) + 10) + ",0)";
        });

      var us = series.selectAll("rect")
        .data(function(d) {
          return d.series;
        })
        .enter().append("svg:rect")
        .attr("class", ".usbar")
        .attr("y", function(d) {
          return yBar(d.value);
        })
        .attr("height", function(d) {
          return height - yBar(d.value) - margins.bottom;
        })
        .attr("width", 10);
    }

    function drawHIBar(graphSVG, data, color) {
      var yearList = data.map(function(d) {
        return d.year;
      });
      var valueList = data.map(function(d) {
        return d.value;
      });
      var seriesName = ['Hawaii'];

      data.forEach(function(d) {
        d.series = seriesName.map(function(name) {
          return {
            name: name,
            year: d.year,
            value: d.value
          };
        });
      });

      var series = graphSVG.selectAll("g.series2")
        .data(data)
        .enter().append("svg:g")
        .attr("class", "series2")
        .attr("fill", color)
        .attr("transform", function(d, i) {
          return "translate(" + x0(d.year) + ",0)";
        });

      var hi = series.selectAll("rect")
        .data(function(d) {
          return d.series;
        })
        .enter().append("svg:rect")
        .attr("class", ".hibar")
        .attr("y", function(d) {
          return yBar(d.value);
        })
        .attr("height", function(d) {
          return height - yBar(d.value) - margins.bottom;
        })
        .attr("width", 10);
    }

    function drawStateBar(graphSVG, data, color) {
      var yearList = data.map(function(d) {
        return d.year;
      });
      var valueList = data.map(function(d) {
        return d.value;
      });
      var seriesName = ['State'];

      data.forEach(function(d) {
        d.series = seriesName.map(function(name) {
          return {
            name: name,
            year: d.year,
            value: d.value
          };
        });
      });

      var series = graphSVG.selectAll("g.series3")
        .data(data)
        .enter().append("svg:g")
        .attr("class", "series3")
        .attr("fill", color)
        .attr("transform", function(d, i) {
          return "translate(" + (x0(d.year) + 20) + ",0)";
        });

      var state = series.selectAll("rect")
        .data(function(d) {
          return d.series;
        })
        .enter().append("svg:rect")
        .attr("class", ".statebar")
        .attr("y", function(d) {
          return yBar(d.value);
        })
        .attr("height", function(d) {
          return height - yBar(d.value) - margins.bottom;
        })
        .attr("width", 10);
    }

    // when there is a US Average data object
    if (datasetSummaryRecords.length !== 0) {
      window.usData = dataByState(filteredStates, knownSummaryRecords[0], geoAreaCategory);
      usAvgData = window.usData;

      if (oddDataSetWithGaps) {
        drawUSBar(vis, usAvgData, graphColors.usColor);
      } else if(!isSVGMap && farmJobs) {
        drawDashY2(vis, usAvgData, graphColors.usColor);
        drawPointsY2(vis, usAvgData, graphColors.usColor);
      } else {
        drawDash(vis, usAvgData, graphColors.usColor);
        drawPoints(vis, usAvgData, graphColors.usColor);
      }
    }

    window.hiData = dataByState(filteredStates, geoAreaNames[0], geoAreaCategory);
    hiStateData = window.hiData;

    if (oddDataSetWithGaps) {
      drawHIBar(vis, hiStateData, graphColors.hiColor);
    } else {
      drawLine(vis, hiStateData, graphColors.hiColor);
      drawPoints(vis, hiStateData, graphColors.hiColor);
    }

    window.selStateData = dataByState(filteredStates, geoAreaNames[1], geoAreaCategory);
    selectedStateData = window.selStateData;

    if (selectedStateData.length !== 0) {

      if (oddDataSetWithGaps) {
        drawStateBar(vis, selectedStateData, graphColors.selectedColor);
      } else if (farmJobs || rpp || techDollars) {
        drawLineY2(vis, selectedStateData, graphColors.selectedColor);
        drawPointsY2(vis, selectedStateData, graphColors.selectedColor);
      } else {
        drawLine(vis, selectedStateData, graphColors.selectedColor);
        drawPoints(vis, selectedStateData, graphColors.selectedColor);
      }

    }
    /* END OF LINE DRAWINGS */

    /* START OF LINE HOVER */

    var verticalLine = vis.append('line')
      .attr({
        'x1': 0,
        'y1': margins.top,
        'x2': 0,
        'y2': height - margins.bottom
      })
      .attr("stroke", "#AAA797")
      .attr("class", "verticalLine")
      .attr("visibility", "hidden");

    vis.on("mousemove", function() {
      var mouseX = d3.mouse(this)[0];
      var mouseY = d3.mouse(this)[1];
      var flipTextOverLine = (mouseX > width - width / 3);
      var flipTextAboveCursor = (mouseY > height - height / 3);

      if ((mouseX <= width - margins.right) && mouseX >= margins.left) {
        var yearAtX = Math.round(xScale.invert(mouseX));
        window.hData = [
            [knownSummaryRecords[0], usAvgData, graphColors.usColor],
            [geoAreaNames[0], hiStateData, graphColors.hiColor],
            [geoAreaNames[1], selectedStateData, graphColors.selectedColor]
          ]
          .filter(function(item) {
            // case for missing US avg
            if ((item[0] === knownSummaryRecords[0]) && (!item[1])) {
              return false;
            }
            return item[0] !== undefined;
          })
          .map(function(item) {
            return [item[0], findGeoValueAtYear(item[1], yearAtX), item[2]];
          });
        var hoverData = window.hData;

        hoverData.unshift(["Year", yearAtX, graphColors.text]);

        d3.selectAll('.tooltip').remove();

        var tooltipGroup = vis.insert('g')
          .classed('tooltip', true);

        tooltipGroup.selectAll('text')
          .data(hoverData)
          .enter()
          .append('text')
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
          .attr('y', function(d, i) {
            if (flipTextAboveCursor) {
              return mouseY - 100 + i * 30;
            }
            return mouseY + 30 + i * 30;
          })
          .text(function(d) {
            if (typeof d[1] === 'undefined' || d[1] === null) {
              d[1] = "N/A"; // may need to remove this
            }
            if (d[0] === "Year") {
              return d[1];
            } else {
              return d[0] + ": " + numberFormatConverter(d[1]); // blamebrandontag
            }
          });

        tooltipGroup.insert('rect', 'text')
          .attr('x', function() {
            if (flipTextOverLine) {
              return mouseX - 170;
            }
            return mouseX + 15;
          })
          .attr('y', function(d, i) {
            if (flipTextAboveCursor) {
              return mouseY - 130 + i * 30;
            }
            return mouseY + 0 + i * 30;
          })
          .attr('width', '160px')
          .attr('height', '135px')
          .attr('class', 'line-hover-text');

        vis.select(".verticalLine")
          .attr("visibility", "visible")
          .attr("transform", function() {
            return "translate(" + mouseX + ", 0)";
          });
      }
    });

    vis.on("mouseout", function() {
      d3.selectAll('.tooltip').remove();
      vis.select(".verticalLine").attr("visibility", "hidden");
    });

    /* START OF GRAPH LEGEND */
    // appends line graph indicator heading
    vis.insert('g')
      .append('text')
      .attr('class', 'legendText')
      .attr("x", width + 30);
    d3.select(keyEl).html("");
    var svgKey = d3.select(keyEl)
      .append('svg')
      .classed('dualaxes', function() {
        if (farmJobs || rpp || techDollars) {
          return true;
        } else {
          return false;
        }
      })
      .attr({
        "width": "100%",
        "height": 250,
      })
      .append('g');

    /* svgKey.insert('g')
      //.append('text')
      .attr('class','key_text')
      .attr("x", 0)
      .attr("y", 10)
      .attr('fill', graphColors.text)
      .text(legendText)
      .call(wrap,128); */

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
      .attr('class', 'key_text')
      .attr('fill', graphColors.text)
      .attr("x", 40)
      .attr("y", function(d, i) {
        return i * 20 + numLegendLines * 11 + 46;
      })
      .text(function(d) {
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
      .attr("y", function(d, i) {
        return i * 20 + numLegendLines * 11 + 40;
      })
      .attr("width", 30)
      .attr("height", 5)
      .style("fill", function(d) {
        if (d == "United States") {
          return graphColors.usColor;
        } else if ((d == "Hawaii" && geoAreaCategory !== "County") || d == "Honolulu") {
          return graphColors.hiColor;
        } else {
          return graphColors.selectedColor;
        }
      });
    /* END OF GRAPH LEGEND */
  }

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
      numLegendLines = lineNumber;
    });
  }

  // Draw Slider
  function drawBrush(sourceMap, data, dataRaw, setMinVals, setMaxVals) {

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

      brushG.selectAll(".resize.w")
        .style("display", "inline");

      brushG.selectAll(".resize.e")
        .style("display", "inline");

      drawMap(sourceMap, data, dataRaw);
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

    var numBrushTicks = d3.range(brushAxis.scale().domain()[0], brushAxis.scale().domain()[1] + 1).length;

    // sets tick values to only odd years (steps of two), for the fourth and eight grade education datasets
    if (oddDataSetWithGaps) {
      brushAxis.tickValues(d3.range(brushAxis.scale().domain()[0], brushAxis.scale().domain()[1] + 1, 2));
    } else if (numBrushTicks < 7) {
      brushAxis.tickValues(d3.range(brushAxis.scale().domain()[0], brushAxis.scale().domain()[1] + 1));
    }

    var axisG = brushSVG.append("g");
    brushAxis(axisG);
    axisG.attr("transform", "translate(20, 5)");
    axisG.selectAll("path")
      .style({
        fill: "none"
      });
    axisG.selectAll("line")
      .style({
        stroke: "#AAA797"
      });

    // appending brush after axis so ticks appear before slider
    var brushG = brushSVG.append('g');
    brush(brushG);
    brushG.attr("transform", "translate(20, 10)")
      .selectAll("rect").attr("height", 10);
    brushG.selectAll(".background")
      .style({
        fill: "#D3D0C1",
        visibility: "visible"
      });
    brushG.selectAll(".extent")
      .style({
        fill: viewColors[colorScheme][4],
        visibility: "visible"
      });
    brushG.selectAll(".resize rect")
      .attr("width", 12)
      .attr("height", 18)
      .attr("y", -4)
      .style({
        fill: viewColors[colorScheme][2],
        visibility: "visible"
      });
  }

  // Utility functions
  function passMapClickTarget(targetName) {
    buildGeoNameList(isSVGMap, targetName);

    var selectedGeoAreaObj = filterStateObjects(data, [targetName], geoAreaCategory)[0];
    // sometimes there won't be US Average data (datasetSumaryRecords)
    // also we pluck out the US Average data object in the beginning, so geoAreaNames only has States/Counties (minus US average object)
    filteredStates[geoAreaNames.length + datasetSummaryRecords.length - 1] = selectedGeoAreaObj;

    drawGraph();
  }

  // Instantiate into a function to take a value and return a color based on the range
  function setQuantileColorScale(domainArr, rangeArr) {
    return d3.scale.quantile()
      .domain(domainArr)
      .range(rangeArr);
  }

  // This function work takes a FIPS dataset
  function transformFIPSData(data) {
    var yearKey = /^\d\d\d\d$/;
    return _.map(data, function(item) {
      return _.transform(item, function(result, n, key) {
        if (yearKey.test(key)) {
          var transformedVal = +n;
          result.Years[key] = typeof transformedVal === 'number' ? transformedVal : null;
        } else {
          result[key] = n;
        }
      }, {
        Years: {}
      });
    });
  } //end

  // Takes data and an array of state names (strings) to find
  function filterStateObjects(data, geoAreaNamesArr, geoAreaCategory) {
    return geoAreaNamesArr.map(function(item) {
      // .filter returns array, so we need to pluck out element
      return _.filter(data, geoAreaCategory, item)[0];
    });
  }

  function popSummaryData(data, knownSumRecArr) {

    var summarizedDataRecords = [];

    data.map(function(record, idx, arr) {
      for (var i = knownSumRecArr.length - 1; i >= 0; i--) {
        if (record.State === knownSumRecArr[i]) {
          summarizedDataRecords.push(arr.splice(idx, 1)[0]);
        }
      }
    });
    return summarizedDataRecords;
  } //end popSummaryData

  function findMaxFIPSVals(data) {
    return _.reduce(data, function(result, item, key) {
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
    }, {
      numOfYrs: 0,
      maxYear: 0,
      maxVal: 0
    });
  } //end findMaxFIPSVals

  function findMinFIPSVals(data) {
    return _.reduce(data, function(result, item, key) {
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
    }, {
      numOfYrs: 0,
      minYear: Infinity,
      minVal: Infinity
    });
  } //end findMinFIPSVals

  // takes in array of data objects, and outputs array with min value and max value of all values in all data objects.
  function findGraphMinMax(data) {
    var allValuesArr = [];

    data.forEach(function(item, index) {
      allValuesArr = allValuesArr.concat(d3.values(item.Years));
    });

    // remove -1 from values array
    var filteredValues = _.remove(allValuesArr, function(value) {
      return value != -1;
    });

    return {
      minVal: _.min(filteredValues),
      maxVal: _.max(filteredValues)
    };
  } //end findGraphMinMax

  function drawLine(graphSVG, data, color) {
    graphSVG.append("svg:path")
      .attr("d", lineGen(data))
      .attr("stroke", color)
      .attr("stroke-width", 3)
      .attr("fill", "none");
  } //end drawLine

  // Draw Hawaii & Selected State Lines scaled to right axis (Non-Farm Jobs State Comparison)
  function drawLineY2(graphSVG, data, color) {
    graphSVG.append("svg:path")
      .attr("d", lineGen2(data))
      .attr("stroke", color)
      .attr("stroke-width", 3)
      .attr("fill", "none");
  }

  //Draw dashed lines for US Avg in line graphs
  function drawDash(graphSVG, data, color) {
    graphSVG.append("svg:path")
      .attr("d", lineGen(data))
      .attr("stroke", color)
      .attr("stroke-width", 3)
      .attr("fill", "none")
      .attr("id", "usLine")
      .classed("usAvgOn", true)
      .style("stroke-dasharray", ("15, 5"));
  }

  function drawDashY2(graphSVG, data, color) {
     graphSVG.append("svg:path")
      .attr("d", lineGen2(data))
      .attr("stroke", color)
      .attr("stroke-width", 3)
      .attr("fill", "none")
      .attr("id", "usLine")
      .classed("usAvgOn", true)
      .style("stroke-dasharray", ("15, 5"));
  }

  function findGeoValueAtYear(lineData, year) {
    return _.result(_.find(lineData, {
      'year': year
    }), 'value');
  }

}; // end module.exports
