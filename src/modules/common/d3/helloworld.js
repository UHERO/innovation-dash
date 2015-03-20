'use strict';
module.exports = 
function (csvPath, selector) {
/*
  d3.csv( csvPath,function(csvData){
    var hello = d3.select(".Education")
      .data(csvData)
      .enter()
      .append('svg:svg')
      .append('circle')
      .attr('r', function(d){
        console.log(d[2002]);
        return parseInt(d[2002]) / 1000 || 0;
      })
      .attr('cx', 20)
      .attr('cy', 20)
      .attr('fill', 'red');
  });*/
  d3.csv( csvPath,function(csvData){
    var hello = d3.select(selector)
      .append('svg:svg')
      .append('circle')
      .attr('r', 20)
      .attr('cx', 20)
      .attr('cy', 20)
      .attr('fill', 'red');
  });
}

