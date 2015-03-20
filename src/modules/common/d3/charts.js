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
    
    var data = transformFIPSData(sourceData);

    drawMap(sourceMap, data);
    drawGraph(data);
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
  function drawMap (map, data) {
    var setMaxVals = findMaxFIPSVals(data);
    var setMinVals = findMinFIPSVals(data);

    // Create object to hold each state and it corresponding value
    // based on a single year {"statename": value, ...}
    var valuesByState = window.vbs = {};

    // Iterate over the full dataset and move state name and value into object for the maxYear
    data.forEach(function (d, i) {
      valuesByState[d.GeoName] = +d.Years[setMaxVals.maxYear];
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

  // draw line graph
  function drawGraph (data) {
    
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

