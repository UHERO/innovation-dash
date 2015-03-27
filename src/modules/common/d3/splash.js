'use strict';

module.exports = function (donutChartEl) {

  // function renderDonutChart(){
    var width = 250,
    height = 250,
    radius = Math.min(width, height)/2;

    var dataset = {
      US: [50245, 40000],
      HI: [50245, 28479]
    };
    // var color = d3.scale.category20();
    var viewColors = {
    hi:  ["#AAA797","#087F9B"],
    us:  ["#AAA797","#087F9B"] 
  };
    var pie = d3.layout.pie()
        .sort(null);

    var arcHI = d3.svg.arc()
        .innerRadius(radius - 60)
        .outerRadius(radius - 45);
    var arcUS = d3.svg.arc()
        .innerRadius(radius - 80)
        .outerRadius(radius - 65);

    d3.select(donutChartEl).html("");
    var svgDonutChart = d3.select(donutChartEl).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    svgDonutChart.selectAll("g")
        .data(pie(dataset.US))
        .enter().append("path")
        .attr("fill", function(d, i) { return viewColors.us[i]; })
        .attr("d", arcUS);

    svgDonutChart.selectAll("g")
        .data(pie(dataset.HI))
        .enter().append("path")
        .attr("fill", function(d, i) { return viewColors.hi[i]; })
        .attr("d", arcHI);

    d3.select("g")
        .insert("text")
        .attr("class", "splash_text_hi")
        .attr("x", -75)
        .attr("y", -65)
        .text("HI");

    d3.select("g")
        .insert("text")
        .attr("class", "splash_text_us")
        .attr("x", 10)
        .attr("y", 20)
        .text("US");

    d3.select("g")
        .insert("text")
        .attr("class", "splash_value_hi")
        .attr("x", -75)
        .attr("y", -80)
        .text("31.2%");

    d3.select("g")
        .insert("text")
        .attr("class", "splash_value_us")
        .attr("x", -14)
        .attr("y", 4)
        .text("29.6%");
  };
 // end of module.exports