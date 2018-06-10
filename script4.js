/////////////////////////////////////////////////////////Table//////////////////////////////////////////////////////////////////
 
var tabulate = function (data,columns) {
    $('.table').removeData()
    var table = d3.select('.table').append('table');
    var thead = table.append('thead');
    var tbody = table.append('tbody');
 
    thead.append('tr')
        .selectAll('th')
        .data(columns)
        .enter()
        .append('th')
        .text(function (d) { return d });
 
    var rows = tbody.selectAll('tr')
        .data(data)
        .enter()
        .append('tr');
 
    var cells = rows.selectAll('td')
        .data(function(row) {
            return columns.map(function (column) {
                return { column: column, value: row[column] }
            })
        })
        .enter()
        .append('td')
        .text(function (d) { return d.value })
 
    return table;
 
};
 
var tTable = function(){
    d3.csv("assets/treaties.csv").then(function (data) {
 
        var columns = ['Basin','Country','Description', 'DateSigned','IssueArea'];
 
        tabulate(data,columns)
    })
};
/////////////////////////////////////////THE CALLS////////////////////////////////////////////////////////////////////
 
tTable();
 
 
////////////////////////////////////////LISTEN FOR CHANGES ON THE MAP//////////////////////////////////////////////////
 
$(document).ready(function () {
    $("#myInput").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#myTable tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
 
 
});
 
 
window.onload = function() {
    console.log("window loaded")
    var a = document.getElementById('backbutton');
 
}
 
 
//////////////////////////////////////////ATLAS////////////////////////////////////////////////
 
//var colors = ['#afb6bc','#919ba3','#53626f','#374e60','#2f3942']
var positioning = 'map';
 
 
var width = $(window).width();
var height = $(window).height() *0.80 ;
 
$(window).on("resize",resize());
function resize(){
    $("svg")
        .attr("viewBox", "(0 , 0, 100, 100)")
        .attr("width", width)
        .attr("height", height);
}
 
 
/*window.onresize = function() {
 
    var width = $(window).width();
    var height = $(window).height();
    $("svg").attr("viewBox", "(0 , 0, " + height + ", " + width  + ")");
}*/
 
// var width = 1360
// var height = 800
 
 
var color = d3.scaleOrdinal(d3.schemePaired);
//var color = d3.scaleOrdinal(['#4F6168','#6E7E85','#2A9D8F','#7C9EB2','#2A9D8F','#476A6F']);
var projection = d3.geoBromley()
    .scale([width * 0.15])
    .translate([width / 2, height / 2]);
 
 
var path = d3.geoPath().projection(projection);
 
var linkForce = d3.forceLink()
    .id(function (d) { return d.id })
    .distance(40);
 
var simulation = d3.forceSimulation()
    .force('link', linkForce)
    .force('charge', d3.forceManyBody().strength(-90))
    .force('center', d3.forceCenter(width/2 , height/2 ))
    .stop();
 
var drag = d3.drag()
    .on('start', dragStarted)
    .on('drag', dragged)
    .on('end', dragEnded);
 
var files = ["assets/data.json", "assets/world.json"];
var promises = [];
 
files.forEach(function(url) {
    promises.push(d3.json(url))
});
 
Promise.all(promises).then(function(results) {
 
    var graph = results[0];
    var features = results[1].features;
 
    simulation.nodes(graph.nodes)
        .on('tick', ticked);
 
    simulation.force('link').links(graph.links);
 
    var svg = d3.select('#treaties')
        .append('svg')
        .attr('width', width)
        .attr('height', height);
 
//add encompassing group for the zoom
    var g = svg.append("g")
        .attr("class", "everything");
 
    var map = g.append('g')
        .attr('class', 'map')
        .selectAll('path')
        .data(features)
        .enter().append('path')
        .attr('d', path)
 
    var links = g.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(graph.links)
        .enter().append('line')
        .attr('stroke-width', function (d) { return d.count/6 })
 
    var nodes = g.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(graph.nodes)
        .enter()
        .append("g")
        .call(drag)
        .on('click', connectedNodes)
 
    var circles = nodes.append("circle")
        .attr("r", function(d) {  if (positioning === 'map') {return d.value/5;}} )
        .attr("fill", function(d) { return color(d.group); })
        .on('click', searchCountry)
    //Added code ;
 
    nodes.append("text")
        .text(function(d) {if (d.group === 'Basin'){
            return d.id;} else {}
        }).style("font-size", 2.5)
        .style("font-family", 'sans-serif')
        .attr('x', 1)
        .attr('y', 1)
 
    /*        .text(function(d) {
            return d.id;
            }).style("font-size", 2)
                .style("font-family", 'sans-serif')
                    .attr('x', 1)
                    .attr('y', 1)
            .style("fill", function(d) {if (d.group != 'Basin'){
                return "red";} else {return "green"}
            })
      */
    nodes.append('title')
        .text(function (d) { return d.id + ': ' + d.value + ' relations'})
    links.append('title')
        .text(function (d) { return d.count + ' relations'})
    fixed(true)
    d3.select('#toggle').on('click', toggle)
 
    function fixed(immediate) {
        graph.nodes.forEach(function (d) {
            var pos = projection([d.lon, d.lat])
            d.x = pos[0]
            d.y = pos[1]
        })
 
        var t = d3.transition()
            .duration(immediate ? 0 : 600)
            .ease(d3.easeElastic.period(0.5))
 
        update(links.transition(t), nodes.transition(t))
    }
 
    function ticked() {
        update(links, nodes)
    }
 
    function update(links, nodes) {
        links
            .attr('x1', function (d) { return d.source.x })
            .attr('y1', function (d) { return d.source.y })
            .attr('x2', function (d) { return d.target.x })
            .attr('y2', function (d) { return d.target.y })
 
        nodes
            .attr('cx', function (d) { return d.x })
            .attr('cy', function (d) { return d.y })
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
    }
 
    function toggle() {
        if (positioning === 'map') {
            positioning = 'sim'
            map.attr('opacity', 0)
            simulation.alpha(1).restart()
            links.attr('stroke-width', function (d) { return d.count/2 })
            circles.attr("r", function(d) { return d.value/2; })
            nodes.append("text")
                .text(function(d) {
                    return d.id;
                }).style("font-size", 12).style("font-family", 'sans-serif')
                .attr('x', 12)
                .attr('y', 3)
            circles.style("stroke-width", 0.5 )
            zoom_actions()
        }
    }
 
    function searchCountry(e){
        // var layer = e.target;
        var value = e.id;
        $("#myTable tr").filter(function () {
            $(this).toggle($(this).text().indexOf(value) > -1)
        });
 
    }
//FUNCTION TO HIGHLIGHT NODES
 
    //Toggle stores whether the highlighting is on
    var toggle = 0;
    //Create an array logging what is connected to what
    var linkedByIndex = {};
    for (i = 0; i < graph.nodes.length; i++) {
        linkedByIndex[i + "," + i] = 1;
    };
    graph.links.forEach(function (d) {
        linkedByIndex[d.source.index + "," + d.target.index] = 1;
    });
    //This function looks up whether a pair are neighbours
    function neighboring(a, b) {
        return linkedByIndex[a.index + "," + b.index];
    }
 
 
 
    function connectedNodes() {
        if (toggle == 0) {
            //Reduce the opacity of all but the neighbouring nodes
            d = d3.select(this).node().__data__;
            nodes.style("opacity", function (o) {
                return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
            });
            links.style("opacity", function (o) {
                return d.index==o.source.index | d.index==o.target.index ? 1 : 0.1;
            });
            //Reduce the op
            toggle = 1;
        } else {
            //Put them back to opacity=1
            nodes.style("opacity", 1);
            links.style("opacity", 1);
            toggle = 0;
        }
    }
 
 
//add zoom capabilities
    var zoom_handler = d3.zoom()
        .on("zoom", zoom_actions);
 
    zoom_handler(svg);
//Zoom functions
    function zoom_actions(){
        //if (positioning === 'map') { return }
        g.attr("transform", d3.event.transform)
    }
 
    function tickActions() {
        links
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
 
        nodes
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
    }
 
    /* LEGEND
    var legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
 
     legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);
 
     legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end").style("font-family", 'sans-serif')
        .text(function(d) { return d; });*/
 
    /* Popup window
     var tip;
     nodes.on("dblclick", function(d){
       if (tip) tip.remove();
 
       tip  = svg.append("g")
         .attr("transform", "translate(" + d.x  + "," + d.y + ")");
 
       var rect = tip.append("rect")
         .style("fill", "white")
         .style("stroke", "steelblue");
 
       tip.append("text")
         .text("Name: " + d.id)
         .attr("dy", "1em")
         .attr("x", 5);
 
       tip.append("text")
         .text("Continent: " + d.group)
         .attr("dy", "2em")
         .attr("x", 5);
 
       var con = graph.links
         .filter(function(d1){
           return d1.source.id === d.id;
         })
         .map(function(d1){
           return d1.target.id + " with weight " + d1.count;
         })
 
       tip.append("text")
         .text("Connected to: " + con.join(","))
         .attr("dy", "3em")
         .attr("x", 5);
 
       var bbox = tip.node().getBBox();
       rect.attr("width", bbox.width + 5)
           .attr("height", bbox.height + 5)
     });*/
    //function initialize(results) {}
 
    /* SEARCH functionality
       var optArray = [];
       for (var i = 0; i < graph.nodes.length - 1; i++) {
           optArray.push(graph.nodes[i].id);
       }
 
       optArray = optArray.sort();
 
       $(function () {
           $("#search").autocomplete({
               source: optArray
           });
       });
       function searchNode() {
 
       //find the node
 
       var selectedVal = document.getElementById('search').value;
       var node = svg.selectAll(".node");
 
       if (selectedVal == "none") {
           nodes.style("stroke", "white").style("stroke-width", "1");
       } else {
           var selected = node.filter(function (d, i) {
               return d.name != selectedVal;
           });
           selected.style("opacity", "0");
           var link = svg.selectAll(".link")
           link.style("opacity", "0");
           d3.selectAll(".node, .link").transition()
               .duration(5000)
               .style("opacity", 1);
 
       }
   }*/
 
});
 
function dragStarted(d) {
    if (positioning === 'map') { return }
    simulation.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
}
 
function dragged(d) {
    if (positioning === 'map') { return }
    d.fx = d3.event.x
    d.fy = d3.event.y
}
 
function dragEnded(d) {
    if (positioning === 'map') { return }
    simulation.alphaTarget(0)
    d.fx = null
    d.fy = null
}
 
// document.body.style.zoom="90%"