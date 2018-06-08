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
    d3.csv("events.csv").then(function (data) {
    
        var columns = ['Basin','Country 1','Country 2', 'Description','Scale'];
    
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


///////////////////////////////////////////////ATLAS//////////////////////////////////////////////////////////////////////
var i,
    width = 1800,
    height = 600,
    transitionTime = 1500,
    spacing = 11,
    margin = 20,
    nodeY = 380,
    nodes = events.nodes,
    links = events.links,
    colors = d3.scaleOrdinal(d3.schemePaired);
    τ = 2 * Math.PI; // http://tauday.com/tau-manifesto

var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)

function mapRange(value, inMin, inMax, outMin, outMax){
    var inVal = Math.min(Math.max(value, inMin), inMax);
    return outMin + (outMax-outMin)*((inVal - inMin)/(inMax-inMin));
}

// Set each node's value to the sum of all incoming and outgoing link values
var nodeValMin = 100000000,
    nodeValMax = 0;
for(i=0; i<nodes.length; i++){
    nodes[i].value = 0;
    nodes[i].displayOrder = i;
}
for(i=0; i<links.length; i++){
    var link = links[i];
        value = link.value;
    nodes[link.source].value += link.value;
    nodes[link.target].value += link.value;
}
for(i=0; i<nodes.length; i++){
    nodeValMin = Math.min(nodeValMin, nodes[i].value);
    nodeValMax = Math.max(nodeValMax, nodes[i].value);
}

var arcBuilder = d3.arc()
    .startAngle(-τ/4)
    .endAngle(τ/4);
arcBuilder.setRadii = function(d){
        var arcHeight = 0.5 * Math.abs(d.x2-d.x1);
        this
            .innerRadius(arcHeight - d.thickness/2)
            .outerRadius(arcHeight + d.thickness/2);
    };
function arcTranslation(d){
    return "translate(" + (d.x1 + d.x2)/2 + "," + nodeY + ")";
}
function nodeDisplayX(node){
    return node.displayOrder * spacing + margin;
}

var path;

function update(){
    // DATA JOIN
    path = svg.selectAll("path")
        .data(links);
    // UPDATE
    path.transition()
      .duration(transitionTime)
      .call(pathTween, null);
    // ENTER
    path.enter()
        .append("path")
        .attr("transform", function(d,i){ 
            d.x1 = nodeDisplayX(nodes[d.target]);
            d.x2 = nodeDisplayX(nodes[d.source]);
            return arcTranslation(d);
            })
        .attr("fill", function(d,i) { if (d.value <= "8") {return d3.rgb(255, 0, 0)} else {return  d3.rgb(0, 0, 255)}})
        .attr("d", function(d,i){
            d.thickness = 1 + d.value/8;
            arcBuilder.setRadii(d);
            return arcBuilder();
            });

    // DATA JOIN
    var circle = svg.selectAll("circle")
        .data(nodes);
    // UPDATE
    circle.transition()
        .duration(transitionTime)
        .attr("cx", function(d,i) {return nodeDisplayX(d);});
    // ENTER
    circle.enter()
        .append("circle")
        .attr("cy", nodeY)
        .attr("cx", function(d,i) {return nodeDisplayX(d);})
        .attr("r", function(d,i) {return Math.sqrt(d.treaties);})
        .attr("fill", function(d,i) {return colors(d.group);})
        .attr("stroke", function(d,i) {return d3.rgb(colors(d.group)).darker(1);})
        .on('click', connectedNodes);
    circle.append('title')
        .text(function (d) { return d.nodeName + ': ' + d.treaties+ ' events' })
    function textTransform(node){
        return ("rotate(55 " + (nodeDisplayX(node) - 15) + " " + (nodeY + 12) + ")");
    }
    // DATA JOIN
    var text = svg.selectAll("text")
        .data(nodes);
    // UPDATE
    text.transition()
        .duration(transitionTime)
        .attr("x", function(d,i) {return nodeDisplayX(d) - 5;})
        .attr("transform", function(d,i) { return textTransform(d); });
    // ENTER
    text.enter()
        .append("text")
        .attr("y", nodeY + 12)
        .attr("x", function(d,i) {return nodeDisplayX(d) - 5;})
        .attr("transform", function(d,i) { return textTransform(d); })
        .attr("font-size", "10px")
        .text(function(d,i) {return d.nodeName;});

/////////////////////HIGHLIGHT FUNCTION/////////////////
//Toggle stores whether the highlighting is on
var toggle = 0;
//Create an array logging what is connected to what
var linkedByIndex = {};
for (i = 0; i < nodes.length; i++) {
    linkedByIndex[i + "," + i] = 1;
};
links.forEach(function (d) {
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
        circle.style("opacity", function (o) {
            return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
        });
        path.style("opacity", function (o) {
            return d.index==o.source.index | d.index==o.target.index ? 1 : 0.1;
        });
        //Reduce the op
        toggle = 1;
    } else {
        //Put them back to opacity=1
        circle.style("opacity", 1);
        path.style("opacity", 1);
        toggle = 0;
    }
}
///////////////////////////////END HIGHLIGHT FUNCTION//////////////////////////////

}

doSort(0);
update();

function pathTween(transition, dummy){
    transition.attrTween("d", function(d){
        var interpolateX1 = d3.interpolate(d.x1, nodeDisplayX(nodes[d.target]));
        var interpolateX2 = d3.interpolate(d.x2, nodeDisplayX(nodes[d.source]));
        return function(t){
            d.x1 = interpolateX1(t);
            d.x2 = interpolateX2(t);
            arcBuilder.setRadii(d);
            return arcBuilder();
        };
    });

    transition.attrTween("transform", function(d){
        var interpolateX1 = d3.interpolate(d.x1, nodeDisplayX(nodes[d.target]));
        var interpolateX2 = d3.interpolate(d.x2, nodeDisplayX(nodes[d.source]));
        return function(t){
            d.x1 = interpolateX1(t);
            d.x2 = interpolateX2(t);
            return arcTranslation(d);
        };
    });
}

d3.select("#selectSort").on("change", function() {
    doSort(this.selectedIndex);
    update();
});

function doSort(sortMethod){
    var nodeMap = [],
        sortFunciton;

    for(i=0; i<nodes.length; i++){
        var node = $.extend({index:i}, nodes[i]); // Shallow copy
        nodeMap.push(node);
    }

    if (sortMethod == 0){
        // GROUP
        sortFunction = function(a, b){
            return b.group - a.group;
        };
    }
    else if (sortMethod == 1){
        // FREQUENCY
        sortFunction = function(a, b){
            return b.value - a.value;
        };
    }
    else if(sortMethod == 2){
        // ALPHABETICAL
        sortFunction = function(a, b){
            return a.nodeName.localeCompare(b.nodeName)
        };
    }

    nodeMap.sort(sortFunction);
    for(i=0; i<nodeMap.length; i++){
        nodes[nodeMap[i].index].displayOrder = i;
    }
}
