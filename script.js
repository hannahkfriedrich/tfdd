


var colors = ['#afb6bc','#919ba3','#53626f','#374e60','#2f3942']
var areadimChart = dc.pieChart("#areaChart");
var popdimChart = dc.pieChart("#popCount");
var visCount = dc.dataCount(".dc-data-count");
var visTable = dc.dataTable("#myTable");
var base = "assets/basins_simplified.geojson";
var bcu = 'assets/BCU_simplified.geojson';
var world = 'assets/world.geojson';
var treaty = 'assets/WorkingMasterTreatiesDB_20180428.csv';
// var RBO = d3.csv('assets/TFDD_RBODatabase_20131015.csv')


// create a map object for us to input the map and it's components into.

var map = L.map('map', {zoomControl: false, scrollWheelZoom: true}).setView([40,0], 1.5);
L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png').addTo(map);

var RBO = function (){


}
var cover = function(base) {
    map.eachLayer(function (layer) {
        map.removeLayer(layer);
    });

    L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png').addTo(map);

    d3.json(base).then(function (data) {d3.json(bcu).then(function(datum){

        //////////////////////////////////////////////////PREP THE DATA////////////////////////////////////////////////////////
        //create crossfilter passes each feature to the filter
        var filter_basin = crossfilter(data.features); //passes the features to the crossfilter
        var bcufilter = crossfilter(datum.features);


// groups everything together into one group, this is used to quickly search all of the data at once
        var all = filter_basin.groupAll();

        var geometry = filter_basin.dimension(function (d) {
            return d.geometry
        });
        var bcugeometry = bcufilter.dimension(function (d){
            return d.geometry
        });


//Takes each of the records of the dataset and returns each individual line so that they can be used. .dimension() puts
// the data into an easily searchable/manipulable format for DC
        var everything = filter_basin.dimension(function (d) {
            return d
        });



//////////////////////////////////////////////SORT THE DATA///////////////////////////////////////////////////////////
//returns the geometry for each feature; this is the points at which each earthquake happened
        var popDimension = filter_basin.dimension(function (d) {
            var pop = d.properties.PopDen2015;
            return pop < 50 ? '0-50' :
                pop < 75 ? '50-75' :
                    pop < 100 ? '75-100' :
                        pop < 125 ? '100-125' :
                            pop < 150 ? '125-150' :
                                '>150'


        });

        var popdimbcu = bcufilter.dimension(function (d) {
            var pop = d.properties.PopDen2015;
            return pop < 50 ? '0-50' :
                pop < 75 ? '50-75' :
                    pop < 100 ? '75-100' :
                        pop < 125 ? '100-125' :
                            pop < 150 ? '125-150' :
                                '>150'
        });


        var areaDim = filter_basin.dimension(function (d) {
            var area = d.properties.Area_km2
            return area < 10000 ? '0-10000' :
                area < 20000 ? '10000 - 20000' :
                    area < 30000 ? '20000 - 30000' :
                        area < 40000 ? '30000 - 40000' :
                            area < 50000 ? '40000 - 50000' :
                                '>50000'
        });

        var codeDim = bcufilter.dimension(function (d) {
            return d.properties.BCODE
        });

        var codeGroup = codeDim.group();
/////////////////////////////////////////GROUP THE DATA///////////////////////////////////////////////////////////////
// Now that we have the mag dimension captured in an object we have to group them all together so that we can use them
        var popGroup = popDimension.group();
        var areaGroup = areaDim.group();
        var popdimbcugroup = popdimbcu.group()

///////////////////////////////////////////////ADD THE MARKERS TO THE MAP///////////////////////////////////////////////

/////////////////////////////////////CREATE THE CHARTS////////////////////////////////////////////////////////////////

        popdimChart
        // .height(200)
        // .width(300)
            .slicesCap(4)
            .innerRadius(0)
            .externalLabels(25)
            .externalRadiusPadding(35)
            .drawPaths(true)
            .dimension(popDimension)
            .group(popGroup)
            .ordinalColors(['#afb6bc', '#919ba3', '#53626f', '#374e60', '#2f3942'])
        // .legend(dc.legend());


        areadimChart
            .ordinalColors(['#afb6bc', '#919ba3', '#53626f', '#374e60', '#2f3942'])
            // .height(200)
            // .width(300)
            .slicesCap(4)
            .innerRadius(0)
            .externalLabels(25)
            .externalRadiusPadding(35)
            .drawPaths(true)
            .dimension(areaDim)
            .group(areaGroup)
        // .elasticX(true);

        visCount
            .dimension(filter_basin)
            .group(all);

        visTable
            .dimension(codeDim)
            .group(function (d) {
                return d
            })

            .columns([
                function (d) {
                    return d.properties.BCODE
                },
                function (d) {
                    return d.properties.Basin_Name
                },
                // function(d) {return d.properties.Continent_},
                function (d) {
                    return d.properties.Area_km2
                },
                function (d) {
                    return d.properties.PopDen2015
                },
                function (d) {
                    return d.properties.Dams_Exist
                }
            ]);


        dc.renderAll()

        var geoJsonLayer = L.geoJson({
            type: 'FeatureCollection',
            features: geometry.top(Infinity)//starts selecting from the .top() and goes until...infinity
        }, {
            style: style,

            onEachFeature: onEachFeature
        }).addTo(map);




        function highlightFeature() {
            // e indicates the current event
            // var layer = e.target; //the target capture the object which the event associates with
            this.setStyle({
                weight: 5,
                opacity: 0.8,
                color: '#e3e3e3',
                fillColor: '#12d0e3',
                fillOpacity: 0.5
            });
            // bring the layer to the front.;
            // select the update class, and update the contet with the input value.
            // $(".update").html('<b>' + layer.feature.properties.name + '</b>   ' + layer.feature.properties.pop + ' people / mi<sup>2</sup>');
        }

        // 3.2.2 zoom to the highlighted feature when the mouse is clicking onto it.
        function zoomToFeature(e) {
            map.fitBounds(e.target.getBounds());
            var basin = e.target.feature.properties.BCODE
            var bcu_names = codeDim.filter(basin)

            fade(e);

            // $('#bcuName').text(print(bcu_names));
            $('#basinName').text(e.target.feature.properties.Basin_Name);
            $('#damCount').text(e.target.feature.properties.Dams_Exist);
        }


        function fade(e) {
            geoJsonLayer.clearLayers();
            var bcode = e.target.feature.properties.BCODE;

            var search = codeDim.filter(bcode);
            geoJsonLayer.clearLayers();
            geoJsonLayer.addData({
                type: 'FeatureCollection',
                features: search.top(Infinity)
            })
        }


        // 3.2.3 reset the hightlighted feature when the mouse is out of its region.
        function resetHighlight() {
            geoJsonLayer.resetStyle(this);
            // $(".update").html("Hover over a state");
        }

        // 3.3 add these event the layer obejct.
        function onEachFeature(feature, layer) {
            layer.on({
                mouseover: highlightFeature,
                click: zoomToFeature,
                mouseout: resetHighlight
            });
        }
        function setColor(pop) {
            var id = 0;
            if (pop > 150) {
                id = 5;
            }
            else if (pop > 125 && pop <= 150) {
                id = 4;
            }
            else if (pop > 100 && pop <= 125) {
                id = 3;
            }
            else if (pop > 75 && pop <= 100) {
                id = 2;
            }
            else if (pop > 50 && pop <= 75) {
                id = 1;
            }
            else {
                id = 0;
            }

            return colors[id];
        }

        function style(feature) {
            return {
                weight: 2,
                opacity: 1,
                color: 'black',
                dashArray: '3',
                fillOpacity: 0.7,
                fillColor: setColor(feature.properties.PopDen2015),


            }
        };


        function cleanChart(filter ){
            var popdimfilters = popdimChart.filters();
            var areadimfilters = areadimChart.filters();
            var vistable = vistable.filters();
            popdimChart.filter(null);
            areadimChart.filter(null);
            filter_basin.remove();
            popdimChart.filter([popdimfilters]);
            areadimChart.filter([areadimfilters]);
            console.log('update charts');

        }


        function updateMapFilter() {
            geometry.filter(function (d) {
                return map.getBounds().contains(L.geoJSON(d).getBounds())
            });
            dc.redrawAll();
        }

        function updateMap() {
            geoJsonLayer.clearLayers();//removes everything
            geoJsonLayer.addData({//adds the new data to the map/chart within the scope of the filter
                type: 'FeatureCollection',
                features: everything.top(Infinity)
            })
        };


//When the chart is "filtered" it runs the function to update the map
        popdimChart.on('filtered', function (chart, filter) {
            updateMap()//calls the update map function

        });


        areadimChart.on('filtered', function (chart, filter) {
            updateMap()

        });
        //
        // dateChart.on('filtered', function(chart, filter) {
        //     updateMap()
        // });
        visTable.on('filtered', function (e) {
            var basin = e.target();
            zoomToFeature(basin)
        });
        visTable.on('filtered', function(){
            updateMap()
        });

        map.on('zoomend moveend', function() {//passes the zoom and move locations as the new filter
            updateMapFilter(); //triggers the new function
        });

    });
    })};




/////////////////////////////////////////THE CALLS////////////////////////////////////////////////////////////////////

cover(base);


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
    a.onclick = function() {
        console.log("button clicked");


        map.setView([40,0], 1.5);
        cover(base)


        return false
    }
}

