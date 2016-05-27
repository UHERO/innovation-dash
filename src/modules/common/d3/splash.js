'use strict';

module.exports = function (eduDiagram,rndDiagram, entDiagram, econDiagram) {

  var width = 250,
  height = 250,
  radius = Math.min(width, height)/2;

  var eduDataset = {
    US: [1000 - 418, 418],
    HI: [1000 - 449, 449]
  };

  var rndDataset = {
    US: [100 - 3.99, 3.99],
    HI: [100 - 4.53, 4.53]
  };

  var entDataset = {
    US: [1000 - 458, 458],
    HI: [1000 - 476, 476]
  };

  var econDataset = {
    US: [100 - 6.20, 6.20],
    HI: [100 - 4.40, 4.40]
  };


  // var color = d3.scale.category20();
  var eduColors = ["#DEDCD1","#087F9B"];
  var econColors = ["#AAA797","#F27D14"];
  var entColors = ["#DEDCD1","#7FBB57"];
  var rndColors = ["#AAA797","#5E9999"];

  var eduLabels = {
     US: ["without a post-secondary degree", "with a post-secondary degree"],
     HI: ["without a post-secondary degree", "with a post-secondary degree"]
  };

  var entLabels = {
     US: ["did not survive", "survived"],
     HI: ["did not survive", "survived"]
  };

  drawDonut(eduDiagram, eduDataset, eduColors, eduLabels);
  //drawDonut(rndDiagram, rndDataset, rndColors);
  drawDonut(entDiagram, entDataset, entColors, entLabels);
  //drawDonut(econDiagram, econDataset, econColors);

  var percent = d3.format("%");

  function drawDonut (diagramContainer, dataset, viewColors, labels){
    var pie = d3.layout.pie()
        .sort(null);

    var arcHI = d3.svg.arc()
        .innerRadius(radius - 60)
        .outerRadius(radius - 45);
    var arcUS = d3.svg.arc()
        .innerRadius(radius - 80)
        .outerRadius(radius - 65);

    d3.select(diagramContainer).html("");
    var svg = d3.select(diagramContainer).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    svg.selectAll("g")
        .data(pie(dataset.US))
        .enter().append("path")
        .attr("fill", function(d, i) { return viewColors[i]; })
        .attr("d", arcUS)
        .append("title")
        .attr("transform", function(d) { return "translate(" + arcUS.centroid(d) + ")"; })
        .text(function(d, i) { return "US: " + ((dataset.US[i]/(dataset.US[0] + dataset.US[1])) * 100).toFixed(1) + "% " + labels.US[i]; });

    svg.selectAll("g")
        .data(pie(dataset.HI))
        .enter().append("path")
        .attr("fill", function(d, i) { return viewColors[i]; })
        .attr("d", arcHI)
        .append("title")
        .attr("transform", function(d) { return "translate(" + arcHI.centroid(d) + ")"; })
        .text(function(d, i) { return "HI: " + ((dataset.HI[i]/(dataset.HI[0] + dataset.HI[1])) * 100).toFixed(1) + "% " + labels.HI[i]; });

    // HI Key

    d3.selectAll(diagramContainer).select('g')
        .insert("text")
        .attr("class", "splash_text_hi")
        .attr("x", -75)
        .attr("y", -65)
        .text("HI");
    // US Key
    d3.selectAll(diagramContainer).select('g')
        .insert("text")
        .attr("class", "splash_text_us")
        .attr("x", -30)
        .attr("y", 20)
        .text("US");
    // HI Value
    d3.selectAll(diagramContainer).select('g')
        .insert("text")
        .attr("class", "splash_value_hi")
        .attr("x", -75)
        .attr("y", -80)
        .text((dataset.HI[1]/(dataset.HI[0] + dataset.HI[1]) * 100).toFixed(1) + "%");
    // US Value
    d3.selectAll(diagramContainer).select('g')
        .insert("text")
        .attr("class", "splash_value_us")
        .attr("x", -30)
        .attr("y", 5)
        .text((dataset.US[1]/(dataset.US[0] + dataset.US[1]) * 100).toFixed(1) + "%");
  }

};
 // end of module.exports
