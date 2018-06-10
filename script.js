//fitbounds
//intro slide - streach video
//second button goes to TFDD  "access to Map"
//change text to 'Access Database'
//son serif for button fonts
// map font and side menu fonts the same
//combine about and credit section
//facebook icon
//turturial button on top of the map
//icons in navbar
//search bar add database
//km2 in pop den
//table pop den spell out
//credits on bottom of landing page
//add legend

$("#2").hide();


var colors = ['#afb6bc', '#919ba3', '#53626f', '#374e60', '#2f3942']
var areadimChart = dc.pieChart("#areaChart");
var areadimChart2 = dc.pieChart("#areaChart2")
var popdimChart = dc.pieChart("#popCount");
var popdimChart2 = dc.pieChart("#popCount2");
var visCount = dc.dataCount(".dc-data-count");
var visTable = dc.dataTable("#myTable");
var base = "assets/Basin310_Master_20180511.geojson";
var bcu = 'assets/BCU310_Master_20180511.geojson';
var world = 'assets/world.geojson';

var search = null;

var RBO = d3.csv('assets/TFDD_RBODatabase_20131015.csv');
var treaty = d3.csv('assets/WorkingMasterTreatiesDB_20180428.csv');

// create a map object for us to input the map and it's components into.

var map = L.map('map', {zoomControl: false, scrollWheelZoom: true}).setView([40, 0], 1.5);
var legend = L.control({position: 'bottomright'});
L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png').addTo(map);
// mapbox_token = 'pk.eyJ1IjoiZnJpZWRyaWgiLCJhIjoiY2o4eGYyZzllMGtiYjMzcGp0cTM5NXZ0cCJ9.BPCA9enT7iq6naVIOEHK9w';
//

var cover = function (base) {
    map.eachLayer(function (layer) {
        map.removeLayer(layer);
    });

    L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png').addTo(map);

   // L.mapboxGL({
   //     accessToken: mapbox_token,
   //     style: 'assets/style.json',
   //     attribution: 'Created By <a href="https://github.com/hannahfriedrich/">Hannah Friedrich</a> based on the <a href="assets/license.txt">Mapbox basic style</a>'
   // }).addTo(map);

    d3.json(base).then(function (data) {
        d3.json(bcu).then(function (datum) {

            //////////////////////////////////////////////////PREP THE DATA////////////////////////////////////////////////////////
            //create crossfilter passes each feature to the filter
            var filter_basin = crossfilter(data.features); //passes the features to the crossfilter
            var bcufilter = crossfilter(datum.features);


// groups everything together into one group, this is used to quickly search all of the data at once
            var all = filter_basin.groupAll();

            var geometry = filter_basin.dimension(function (d) {
                return d.geometry
            });
            var bcugeometry = bcufilter.dimension(function (d) {
                return d.geometry
            });


//Takes each of the records of the dataset and returns each individual line so that they can be used. .dimension() puts
// the data into an easily searchable/manipulable format for DC
            var everything = filter_basin.dimension(function (d) {
                return d
            });


            var everything2 = bcufilter.dimension(function (d) {
                return d
            });
            var all2 = bcufilter.groupAll();


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
                var area = d.properties.Area_km2;
                return area < 10000 ? '0-10000' :
                    area < 20000 ? '10000 - 20000' :


                        area < 30000 ? '20000 - 30000' :
                            area < 40000 ? '30000 - 40000' :
                                area < 50000 ? '40000 - 50000' :
                                    '>50000'
            });

            var areaDim2 = bcufilter.dimension(function (d) {
                var area = d.properties.Area_km2;
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
            var areaGroup2 = areaDim2.group();
            var popdimbcugroup = popdimbcu.group();

///////////////////////////////////////////////ADD THE MARKERS TO THE MAP///////////////////////////////////////////////

/////////////////////////////////////CREATE THE CHARTS////////////////////////////////////////////////////////////////

            popdimChart
                .slicesCap(4)
                .innerRadius(0)
                .externalLabels(25)
                .externalRadiusPadding(35)
                .drawPaths(true)
                .dimension(popDimension)
                .group(popGroup)
                .ordinalColors(['#afb6bc', '#919ba3', '#53626f', '#374e60', '#2f3942']);


            popdimChart2
                .slicesCap(4)
                .innerRadius(0)
                .externalLabels(25)
                .externalRadiusPadding(35)
                .drawPaths(true)
                .dimension(popdimbcu)
                .group(popdimbcugroup)
                .ordinalColors(['#afb6bc', '#919ba3', '#53626f', '#374e60', '#2f3942']);

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
                .group(areaGroup);
            // .elasticX(true);

            areadimChart2
                .ordinalColors(['#afb6bc', '#919ba3', '#53626f', '#374e60', '#2f3942'])
                // .height(200)
                // .width(300)
                .slicesCap(4)
                .innerRadius(0)
                .externalLabels(25)
                .externalRadiusPadding(35)
                .drawPaths(true)
                .dimension(areaDim2)
                .group(areaGroup2);
            // .elasticX(true);

            visCount
                .dimension(filter_basin)
                .group(all);

            visTable
                .dimension(codeDim)
                // .width(500)
                .group(function (d) {
                    return d.properties.Basin_Name
                })

                .columns([
                    function (d) {
                        return d.properties.BCODE
                    },

                    function (d) {
                        return d.properties.PopDen12_P
                    },

                    function (d) {
                        return d.properties.PopDen2015
                    },
                    function (d) {
                        return d.properties.PopDen2020
                    },
                    function (d) {
                        return d.properties.Dams_Exist
                    },
                    function (d) {
                        return d.properties.Dam_Plnd
                    },
                    function (d) {
                        return d.properties.adm0_name
                    },
                ])
                // .showGroups(false)
                .size(325)

            dc.renderAll();

            var geoJsonLayer = L.geoJson({
                type: 'FeatureCollection',
                features: geometry.top(Infinity)//starts selecting from the .top() and goes until...infinity
            }, {
                style: style,

                onEachFeature: onEachFeature
            }).addTo(map);

            var geoJsonLayer2 = L.geoJson({
                type: 'FeatureCollection',
                features: bcugeometry.top(Infinity)//starts selecting from the .top() and goes until...infinity
            }, {
                style: style,

                onEachFeature: onEachFeature2
            });



            function highlightFeature(e) {
                // e indicates the current event
                // var layer = e.target; //the target capture the object which the event associates with
                this.setStyle({
                    weight: 5,
                    opacity: 0.8,
                    color: '#e3e3e3',
                    fillColor: '#12d0e3',
                    fillOpacity: 0.5
                });

                this.bindPopup(e.target.feature.properties.Basin_Name)
                this.openPopup()
            }

            // 3.2.2 zoom to the highlighted feature when the mouse is clicking onto it.
            function zoomToFeature(e) {

                map.fitBounds(e.target.getBounds());
                var basin = e.target.feature.properties.BCODE;
                //var bcu_names = codeDim.filter(basin);

                // geoJsonLayer.clearLayers();
                //  var bcode = e.target.feature.properties.BCODE;

                search = codeDim.filter(basin);
                geoJsonLayer.clearLayers();
                geoJsonLayer2.clearLayers();
                geoJsonLayer2.addData({
                    type: 'FeatureCollection',
                    features: search.top(Infinity)
                }).addTo(map);

                $("#1").hide();
                $("#2").show();

                var bcu = search.top(Infinity);
                bcu_names = "";
                for (var i = 0; i < bcu.length; i++) {

                    bcu_names += bcu[i].properties.adm0_name + ", "

                }
                $('#bcuName').text(bcu_names);
                $('#bcuName2').text(bcu_names);
                $('#basinName').text(e.target.feature.properties.Basin_Name);
                $('#basinName2').text(e.target.feature.properties.Basin_Name);
                $('#damCount').text(e.target.feature.properties.Dams_Exist);
                $('#damCount2').text(e.target.feature.properties.Dams_Exist);
            }


            // 3.2.3 reset the hightlighted feature when the mouse is out of its region.
            function resetHighlight() {
                geoJsonLayer.resetStyle(this);
                this.closePopup()
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

            function highlightFeature2(e) {
                // e indicates the current event
                // var layer = e.target; //the target capture the object which the event associates with
                this.setStyle({
                    weight: 5,
                    opacity: 0.8,
                    color: '#e3e3e3',
                    fillColor: '#12d0e3',
                    fillOpacity: 0.5
                });

                this.bindPopup(e.target.feature.properties.adm0_name)
                this.openPopup()
            }

            function onEachFeature2(feature, layer) {
                layer.on({
                    mouseover: highlightFeature2,
                    // click: zoomToFeature,
                    mouseout: resetHighlight
                });
            };

            function setColor(pop) {
                var id = 0;
                if (pop > 150) {
                    id = 4;
                }
                else if (pop > 125 && pop <= 150) {
                    id = 3;
                }
                else if (pop > 100 && pop <= 125) {
                    id = 2;
                }
                else if (pop > 75 && pop <= 100) {
                    id = 1;
                }
                else if (pop > 50 && pop <= 75) {
                    id = 0;
                }
                // else {
                //     id = 0;
                // }

                return colors[id];
            };



            legend.onAdd = function(){
                var div = L.DomUtil.create('div','legend');
                div.innerHTML+='<b> Population Density (per km<sup>2</sup></sup>)</b></br>';
                // div.innerHTML += '<i style="background: ' + colors[5] + '; "></i><p>>150</p>';
                div.innerHTML += '<i style="background: ' + colors[4] + '; opacity: 0.5"></i><p>125 - 150</p>';
                div.innerHTML += '<i style="background: ' + colors[3] + '; opacity: 0.5"></i><p>100 - 125</p>';
                div.innerHTML += '<i style="background: ' + colors[2] + '; opacity: 0.5"></i><p>75 - 100</p>';
                div.innerHTML += '<i style="background: ' + colors[1] + '; opacity: 0.5"></i><p>50 - 75</p>';
                div.innerHTML += '<i style="background: ' + colors[0] + '; opacity: 0.5"></i><p>0 - 50</p>'
                return div
            };
            legend.addTo(map);

            function style(feature) {
                return {
                    weight: 1,
                    opacity: 1,
                    color: 'black',
                    dashArray: '3',
                    fillOpacity: 0.7,
                    fillColor: setColor(feature.properties.PopDen2015),
                }
            };


            function updateMapFilter() {
                geometry.filter(function (d) {
                    return map.getBounds().contains(L.geoJSON(d).getBounds())
                });

                bcugeometry.filter(function (d) {


                    return map.getBounds().contains(L.geoJSON(d).getBounds());

                });


                dc.redrawAll();
            }

            function updateMap() {
                geoJsonLayer.clearLayers();//removes everything
                geoJsonLayer.addData({//adds the new data to the map/chart within the scope of the filter
                    type: 'FeatureCollection',
                    features: everything.top(Infinity)
                });
            };


            function updateMap2() {
                var basinName = $('#basinName2').text();
                geoJsonLayer2.clearLayers();//removes everything
                geoJsonLayer2.addData({//adds the new data to the map/chart within the scope of the filter
                    type: 'FeatureCollection',
                    features: everything2.top(Infinity)
                })
            };


//When the chart is "filtered" it runs the function to update the map
            popdimChart.on('filtered', function (chart, filter) {
                updateMap();//calls the update map function

            });

            popdimChart2.on('filtered', function (chart, filter) {
                updateMap2();//calls the update map function

            });
            areadimChart.on('filtered', function (chart, filter) {
                updateMap();

            });

            areadimChart2.on('filtered', function (chart, filter) {
                updateMap2();

            });

            //
            // dateChart.on('filtered', function(chart, filter) {
            //     updateMap();
            // });
            visTable.on('filtered', function (e) {
                var basin = e.target();
                zoomToFeature(basin)
            });
            visTable.on('filtered', function () {
                updateMap()
            });

            map.on('zoomend moveend', function () {//passes the zoom and move locations as the new filter
                updateMapFilter(); //triggers the new function
            });

        });
    })

};
//
// var tabulate = function (data, columns) {
//     // $('.table').removeData()
//     var table = d3.select('.table').append('table');
//     var thead = table.append('thead');
//     var tbody = table.append('tbody');
//
//     thead.append('tr')
//         .selectAll('th')
//         .data(columns)
//         .enter()
//         .append('th')
//         .text(function (d) {
//             return d
//         });
//
//     var rows = tbody.selectAll('tr')
//         .data(data)
//         .enter()
//         .append('tr');
//
//     var cells = rows.selectAll('td')
//         .data(function (row) {
//             return columns.map(function (column) {
//                 return {column: column, value: row[column]}
//             })
//         })
//         .enter()
//         .append('td')
//         .text(function (d) {
//             return d.value
//         })
//
//     return table;
//
// };

/////////////////////////////////////////Tiles////////////////////////////////////////////////////////////////////

var giam = function () {
    // map.eachLayer(function (layer) {
    //     map.removeLayer(layer);
    // });
    L.tileLayer('assets/giam/giam/{z}/{x}/{y}.png', {
        maxZoom: 10,
        tms: false,
        attribution: 'Generated by QTiles',

    }).addTo(map)
}

var gmrca = function () {
    L.tileLayer('assets/gmrca/gmrca/{z}/{x}/{y}.png', {
        maxZoom: 10,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
};

var popTile = function () {
    L.tileLayer('assets/popTiles/GPW_3/{z}/{x}/{y}.png', {
        maxZoom: 10,
        tms: false,
        attribution: 'Generated by QTiles'
    }).addTo(map);
};
//////////////////////////////////////////Topic Layers//////////////////////////////////////////////////////////////////


function zoomToFeatureoutside(e) {

    map.fitBounds(e.target.getBounds());
}

function resetHighlightoutside(e) {
    b.resetStyle(e.target);
    this.closePopup()
    // $(".update").html("Hover over a state");
}

///////////////////////////////////////Dams/////////////////////////////////////////////////

function onEachFeaturedams(feature, layer) {
    layer.on({
        mouseover: highlightFeaturedams,
        click: zoomToFeatureoutside,
        // mouseout: resetHighlightoutside
    });
}

function highlightFeaturedams(e) {
    var list = 'Basin Name: ' + e.target.feature.properties.Basin_Name + '<br>' + 'Dams: ' + e.target.feature.properties.Dams_Exist
    // this.bindPopup ('Basin Name: ' + e.target.feature.properties.Basin_Name)
    this.bindPopup(list)
    this.openPopup()

};

////////////////////////////////////////////////////////////DAMs//////////////////////////////////////////////////////
// 3.3 add these event the layer object.

function damColor(d) {
    var id = 0;
    var dam_color = ['#7ba7e9', '#4c8cf2', '#0d6ef6', '#004cf5', '#1217eb'];
    if (d > 711) {
        id = 5;
    }
    else if (d > 186 && d <= 710) {
        id = 4;
    }
    else if (d > 102 && d <= 185) {
        id = 3;
    }
    else if (d > 60 && d <= 101) {
        id = 2;
    }
    else if (d > 18 && d <=59) {
        id = 1;
    }
    else {
        id = 0;
    }

    return dam_color[id];
}


function damStyle(feature) {
    return {
        weight: 1,
        opacity: 1,
        color: 'black',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: damColor(feature.properties.Dams_Exist),
    }
};

function damBasin() {
    map.eachLayer(function (layer) {
        map.removeLayer(layer);
        map.removeControl(legend)
    });

    L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png').addTo(map);
    // L.mapboxGL({
    //     accessToken: mapbox_token,
    //     style: 'assets/style.json',
    //     attribution: 'Created By <a href="https://github.com/hannahfriedrich/">Hannah Friedrich</a> based on the <a href="assets/license.txt">Mapbox basic style</a>'
    // }).addTo(map);
    var dams = L.geoJSON.ajax('assets/Basin310_Master_20180511.geojson', {
        style: damStyle,
        onEachFeature: onEachFeaturedams,
    }).addTo(map)


    legend.onAdd = function(){
        var dam_color = ['#7ba7e9', '#4c8cf2', '#0d6ef6', '#004cf5', '#1217eb'];
        var div = L.DomUtil.create('div','legend');
        div.innerHTML+='<b> Dams </b></br>';
        // div.innerHTML += '<i style="background: ' + colors[5] + '; opacity: 0.5"></i><p>>711</p>';
        div.innerHTML += '<i style="background: ' + dam_color[4] + '; opacity: 0.5"></i><p>176 - 710</p>';
        div.innerHTML += '<i style="background: ' + dam_color[3] + '; opacity: 0.5"></i><p>102 - 185</p>';
        div.innerHTML += '<i style="background: ' + dam_color[2] + '; opacity: 0.5"></i><p>60 - 101</p>';
        div.innerHTML += '<i style="background: ' + dam_color[1] + '; opacity: 0.5"></i><p>18 - 59</p>';
        div.innerHTML += '<i style="background: ' + dam_color[0] + '; opacity: 0.5"></i><p>0 - 17</p>'
        return div
    };
    legend.addTo(map);
}

///////////////////////////////////////////////////Runoff/////////////////////////////////////////////////////////////
function onEachFeaturerunoff(feature, layer) {
    layer.on({
        mouseover: highlightFeaturerunoff,
        click: zoomToFeatureoutside,
        // mouseout: resetHighlightoutside
    });
}

function highlightFeaturerunoff(e) {
    var list = 'Basin Name: ' + e.target.feature.properties.Basin_Name + '<br>' + 'Runoff:' + e.target.feature.properties.runoff_ + ' mm/yr'
    // this.bindPopup ('Basin Name: ' + e.target.feature.properties.Basin_Name)
    this.bindPopup(list)
    this.openPopup()
};


// 3.3 add these event the layer obejct.

function runoffColor(d) {
    var id = 0;
    //different runoff colors because 9999 is used as a null value, greys our the nulls
    var colors_runoff = ['#a2a3a2', '#99a299', '#889788', '#4e724e', '#4a564a', '#f0f0f0']
    if (d > 2778) {
        id = 5;
    }
    else if (d > 1707 && d <= 2777) {
        id = 4;
    }
    else if (d > 965 && d <= 1706) {
        id = 3;
    }
    else if (d > 419 && d <= 964) {
        id = 2;
    }
    else if (d > 1 && d <= 418) {
        id = 1;
    }
    else {
        id = 0;
    }

    return colors_runoff[id];
}


function runoffStyle(feature) {
    return {
        weight: 1,
        opacity: 1,
        color: 'black',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: runoffColor(feature.properties.runoff_),
    }
};

function runoffBasin() {
    map.eachLayer(function (layer) {
        map.removeLayer(layer);
        map.removeControl(legend);
    });
    L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png').addTo(map);
    // L.mapboxGL({
    //     accessToken: mapbox_token,
    //     style: 'assets/style.json',
    //     attribution: 'Created By <a href="https://github.com/hannahfriedrich/">Hannah Friedrich</a> based on the <a href="assets/license.txt">Mapbox basic style</a>'
    // }).addTo(map);
    L.geoJSON.ajax('assets/Basin310_Master_20180511.geojson', {
        style: runoffStyle,
        onEachFeature: onEachFeaturerunoff,
    }).addTo(map)
    legend.onAdd = function(){
        var div = L.DomUtil.create('div','legend');
        var colors_runoff = ['#a2a3a2', '#99a299', '#889788', '#4e724e', '#4a564a', '#f0f0f0']
        div.innerHTML+='<b> Runoff (mm/yr)</b></br>';
        // div.innerHTML += '<i style="background: ' + colors[5] + '; opacity: 0.5"></i><p>>711</p>';
        div.innerHTML += '<i style="background: ' + colors_runoff[4] + '; opacity: 0.5"></i><p>1707 - 2777</p>';
        div.innerHTML += '<i style="background: ' + colors_runoff[3] + '; opacity: 0.5"></i><p>965 - 1706</p>';
        div.innerHTML += '<i style="background: ' + colors_runoff[2] + '; opacity: 0.5"></i><p>419 - 964</p>';
        div.innerHTML += '<i style="background: ' + colors_runoff[1] + '; opacity: 0.5"></i><p>1 - 418</p>';
        div.innerHTML += '<i style="background: ' + colors_runoff[0] + '; opacity: 0.5"></i><p>0 - 17</p>'
        return div
    };
    legend.addTo(map);
}

///////////////////////////////////////////consumption////////////////////////////////////////////////////////////
function onEachFeatureconsum(feature, layer) {
    layer.on({
        mouseover: highlightFeatureconsum,
        click: zoomToFeatureoutside,
        // mouseout: resetHighlightoutside
    });
}

function highlightFeatureconsum(e) {
    var list = 'Basin Name: ' + e.target.feature.properties.Basin_Name + '<br>' + 'Consumption: ' + e.target.feature.properties.consumption + ' km<sup>3</sup>/yr'
    // this.bindPopup ('Basin Name: ' + e.target.feature.properties.Basin_Name)
    this.bindPopup(list)
    this.openPopup()
};


// 3.3 add these event the layer obejct.

function consumColor(d) {
    var id = 0;
    //different runoff colors because 9999 is used as a null value, greys our the nulls
    var colors_consum = ['#acbed1', '#92abca', '#4b6281', '#1b557f', '#042c50', '#ffffff']
    if (d > 170000) {
        id = 5;
    }
    else if (d > 63357 && d <= 165389) {
        id = 4;
    }
    else if (d > 20788 && d <= 63356) {
        id = 3;
    }
    else if (d > 5553 && d <= 20787) {
        id = 2;
    }
    else if (d > 1 && d <= 5552) {
        id = 1;
    }
    else {
        id = 0;
    }

    return colors_consum[id];
}


function consumStyle(feature) {
    return {
        weight: 1,
        opacity: 1,
        color: 'black',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: consumColor(feature.properties.consumption),
    }
};

function consumBasin() {
    map.eachLayer(function (layer) {
        map.removeLayer(layer);
        map.removeControl(legend);
    });
    // L.mapboxGL({
    //     accessToken: mapbox_token,
    //     style: 'assets/style.json',
    //     attribution: 'Created By <a href="https://github.com/hannahfriedrich/">Hannah Friedrich</a> based on the <a href="assets/license.txt">Mapbox basic style</a>'
    // }).addTo(map);
    L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png').addTo(map);
    L.geoJSON.ajax('assets/Basin310_Master_20180511.geojson', {
        style: consumStyle,
        onEachFeature: onEachFeatureconsum,
    }).addTo(map)
    legend.onAdd = function(){
        var div = L.DomUtil.create('div','legend');
        var colors_consum = ['#acbed1', '#92abca', '#4b6281', '#1b557f', '#042c50', '#ffffff']
        div.innerHTML+='<b> Consumption (km<sup>3</sup>/yr)</b></br>';
        // div.innerHTML += '<i style="background: ' + colors[5] + '; opacity: 0.5"></i><p>>711</p>';
        div.innerHTML += '<i style="background: ' + colors_consum[4] + '; opacity: 0.5"></i><p>63357 - 170000</p>';
        div.innerHTML += '<i style="background: ' + colors_consum[3] + '; opacity: 0.5"></i><p>20788 - 63356</p>';
        div.innerHTML += '<i style="background: ' + colors_consum[2] + '; opacity: 0.5"></i><p>5553 - 20787</p>';
        div.innerHTML += '<i style="background: ' + colors_consum[1] + '; opacity: 0.5"></i><p>1 - 5552</p>';
        div.innerHTML += '<i style="background: ' + colors_consum[0] + '; opacity: 0.5"></i><p>0</p>'
        return div
    };
    legend.addTo(map);
}

///////////////////////////////////////////withdrawal////////////////////////////////////////////////////////////
function onEachFeaturewith(feature, layer) {
    layer.on({
        mouseover: highlightFeaturewith,
        click: zoomToFeatureoutside,
        // mouseout: resetHighlightoutside
    });
}

function highlightFeaturewith(e) {
    var list = 'Basin: ' + e.target.feature.properties.Basin_Name + '<br>' + 'Withdrawal: ' + e.target.feature.properties.withdrawl_ + ' km<sup>3</sup>/yr'
    // this.bindPopup ('Basin Name: ' + e.target.feature.properties.Basin_Name)
    this.bindPopup(list)
    this.openPopup()
};


// 3.3 add these event the layer obejct.

function withColor(d) {
    var id = 0;
    //different runoff colors because 9999 is used as a null value, greys our the nulls
    var colors_with = ['#a7dod6', '#78b9c1', '#92acaf', '#546f72', '#274144', '#ffffff']
    if (d > 600000) {
        id = 5;
    }
    else if (d > 111709 && d <= 500084) {
        id = 4;
    }
    else if (d > 55583 && d <= 111708) {
        id = 3;
    }
    else if (d > 15871 && d <= 55582) {
        id = 2;
    }
    else if (d > 1 && d <= 15871) {
        id = 1;
    }
    else {
        id = 0;
    }

    return colors_with[id];
}


function withStyle(feature) {
    return {
        weight: 1,
        opacity: 1,
        color: 'black',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: withColor(feature.properties.withdrawl_),
    }
};

function withBasin() {
    map.eachLayer(function (layer) {
        map.removeLayer(layer);
        map.removeControl(legend)
    });
    L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png').addTo(map);
    // L.mapboxGL({
    //     accessToken: mapbox_token,
    //     style: 'assets/style.json',
    //     attribution: 'Created By <a href="https://github.com/hannahfriedrich/">Hannah Friedrich</a> based on the <a href="assets/license.txt">Mapbox basic style</a>'
    // }).addTo(map);
    L.geoJSON.ajax('assets/Basin310_Master_20180511.geojson', {
        style: withStyle,
        onEachFeature: onEachFeaturewith,
    }).addTo(map)
    legend.onAdd = function(){
        var div = L.DomUtil.create('div','legend');

        var colors_with = ['#a7dod6', '#78b9c1', '#92acaf', '#546f72', '#274144', '#ffffff']
        div.innerHTML+='<b> Withdrawal (km<sup>3</sup>/yr</b>)</br>';
        // div.innerHTML += '<i style="background: ' + colors[5] + '; opacity: 0.5"></i><p>>711</p>';
        div.innerHTML += '<i style="background: ' + colors_with[4] + '; opacity: 0.5"></i><p>111709 - 500084</p>';
        div.innerHTML += '<i style="background: ' + colors_with[3] + '; opacity: 0.5"></i><p>55583 - 111708</p>';
        div.innerHTML += '<i style="background: ' + colors_with[2] + '; opacity: 0.5"></i><p>15871 - 55582</p>';
        div.innerHTML += '<i style="background: ' + colors_with[1] + '; opacity: 0.5"></i><p>1 - 15871</p>';
        div.innerHTML += '<i style="background: ' + colors_with[0] + '; opacity: 0.5"></i><p>0</p>'
        return div
    };
    legend.addTo(map);
}


///////////////////////////////////////////hydropolte////////////////////////////////////////////////////////////
function onEachFeaturehydropol(feature, layer) {
    layer.on({
        mouseover: highlightFeaturehydropol,
        click: zoomToFeatureoutside,
        // mouseout: resetHighlightoutside
    });
}

function highlightFeaturehydropol(e) {
    var list = 'Basin: ' + e.target.feature.properties.Basin_Name + '<br>' + 'Political Tension: ' + e.target.feature.properties.HydroPolTe_
    // this.bindPopup ('Basin Name: ' + e.target.feature.properties.Basin_Name)
    this.bindPopup(list)
    this.openPopup()
};


// 3.3 add these event the layer obejct.

function hydropolColor(d) {
    var id = 0;
    //different runoff colors because 9999 is used as a null value, greys our the nulls
    var colors_tension=['#87a7ad', '#51828c', '#3b747f', '#33575e', '#213a3f', '#ffffff']
    if (d > 600000) {
        id = 5;
    }
    else if (d === 4) {
        id = 4;
    }
    else if (d === 3) {
        id = 3;
    }
    else if (d === 2) {
        id = 2;
    }
    else if (d === 1) {
        id = 1;
    }
    else {
        id = 0;
    }

    return colors_tension[id];
}


function hydropolStyle(feature) {
    return {
        weight: 1,
        opacity: 1,
        color: 'black',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: hydropolColor(feature.properties.HydroPolTe_),
    }
};

function hydropolBasin() {
    map.eachLayer(function (layer) {
        map.removeLayer(layer);
    });
    L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png').addTo(map);
    // L.mapboxGL({
    //     accessToken: mapbox_token,
    //     style: 'assets/style.json',
    //     attribution: 'Created By <a href="https://github.com/hannahfriedrich/">Hannah Friedrich</a> based on the <a href="assets/license.txt">Mapbox basic style</a>'
    // }).addTo(map);
    L.geoJSON.ajax('assets/Basin310_Master_20180511.geojson', {
        style: hydropolStyle,
        onEachFeature: onEachFeaturehydropol,
    }).addTo(map)
    legend.onAdd = function(){
        var div = L.DomUtil.create('div','legend');
        var colors_tension=['#87a7ad', '#51828c', '#3b747f', '#33575e', '#213a3f', '#ffffff']
        div.innerHTML+='<b> Hydropolitical Tension </b></br>';
        // div.innerHTML += '<i style="background: ' + colors[5] + '; opacity: 0.5"></i><p>5</p>';
        div.innerHTML += '<i style="background: ' + colors_tension[4] + '; opacity: 0.5"></i><p>5</p>';
        div.innerHTML += '<i style="background: ' + colors_tension[3] + '; opacity: 0.5"></i><p>4</p>';
        div.innerHTML += '<i style="background: ' + colors_tension[2] + '; opacity: 0.5"></i><p>3</p>';
        div.innerHTML += '<i style="background: ' + colors_tension[1] + '; opacity: 0.5"></i><p>2</p>';
        div.innerHTML += '<i style="background: ' + colors_tension[0] + '; opacity: 0.5"></i><p>1</p>'
        return div
    };
    legend.addTo(map);
}


///////////////////////////////////////////InstitVuln////////////////////////////////////////////////////////////
function onEachFeatureInstitVuln(feature, layer) {
    layer.on({
        mouseover: highlightFeatureInstitVuln,
        click: zoomToFeatureoutside,
        // mouseout: resetHighlightoutside
    });
}

function highlightFeatureInstitVuln(e) {
    var list = 'Basin: ' + e.target.feature.properties.Basin_Name + '<br>' + 'Institutional' + '<br>' + 'Vulnerability: ' + e.target.feature.properties.InstitVuln
    // this.bindPopup ('Basin Name: ' + e.target.feature.properties.Basin_Name)
    this.bindPopup(list)
    this.openPopup()
};


// 3.3 add these event the layer obejct.

function InstitVulnColor(d) {
    var id = 0;
    //different runoff colors because 9999 is used as a null value, greys our the nulls
    var colors_instit = ['#e2dcf2', '#d1ccdc', '#837c93', '#554e66', '#312c3d', '#ffffff']
    if (d === '5') {
        id = 4;
    }
    else if (d === '4') {
        id = 3;
    }
    else if (d === '3') {
        id = 2;
    }
    else if (d === '2') {
        id = 1;
    }
    else if (d === '1') {
        id = 0;
    }
    else {
        id = 0;
    }

    return colors_instit[id];
}


function InstitVulnStyle(feature) {
    return {
        weight: 1,
        opacity: 1,
        color: 'black',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: InstitVulnColor(feature.properties.InstitVuln),
    }
};

function InstitVulnBasin() {
    map.eachLayer(function (layer) {
        map.removeLayer(layer);
        map.removeControl(legend)
    });
    L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png').addTo(map);
    // L.mapboxGL({
    //     accessToken: mapbox_token,
    //     style: 'assets/style.json',
    //     attribution: 'Created By <a href="https://github.com/hannahfriedrich/">Hannah Friedrich</a> based on the <a href="assets/license.txt">Mapbox basic style</a>'
    // }).addTo(map);
    L.geoJSON.ajax('assets/BCU310_Master_20180511.geojson', {
        style: InstitVulnStyle,
        onEachFeature: onEachFeatureInstitVuln,
    }).addTo(map)
    legend.onAdd = function(){
        var div = L.DomUtil.create('div','legend');
        var colors_instit = ['#e2dcf2', '#d1ccdc', '#837c93', '#554e66', '#312c3d', '#ffffff']
        div.innerHTML+='<b> Institutional Vulnerability </b></br>';
        // div.innerHTML += '<i style="background: ' + colors[5] + '; opacity: 0.5"></i><p>5</p>';
        div.innerHTML += '<i style="background: ' + colors_instit[4] + '; opacity: 0.5"></i><p>5</p>';
        div.innerHTML += '<i style="background: ' + colors_instit[3] + '; opacity: 0.5"></i><p>4</p>';
        div.innerHTML += '<i style="background: ' + colors_instit[2] + '; opacity: 0.5"></i><p>3</p>';
        div.innerHTML += '<i style="background: ' + colors_instit[1] + '; opacity: 0.5"></i><p>2</p>';
        div.innerHTML += '<i style="background: ' + colors_instit[0] + '; opacity: 0.5"></i><p>1</p>'
        return div
    };
    legend.addTo(map);
}


///////////////////////////////////////////GDP////////////////////////////////////////////////////////////
function onEachFeatureGDP(feature, layer) {
    layer.on({
        mouseover: highlightFeatureGDP,
        click: zoomToFeatureoutside,
        // mouseout: resetHighlightoutside
    });
}

function highlightFeatureGDP(e) {
    var list = 'Country: ' + e.target.feature.properties.adm0_name + '<br>' + 'GDP: ' + '$' + e.target.feature.properties.gdp_2016
    // this.bindPopup ('Basin Name: ' + e.target.feature.properties.Basin_Name)
    this.bindPopup(list)
    this.openPopup()
};


// 3.3 add these event the layer obejct.

function GDPColor(d) {
    var id = 0;
    //different runoff colors because 9999 is used as a null value, greys our the nulls
    var colors_GDP= ['#c6cec9', '#b8c1b6', '#889685', '#66915e', '#21381c', '#ffffff']
    if (d > 64176) {
        id = 5;
    }
    else if (d > 45638&& d <= 64175) {
        id = 4;
    }
    else if (d > 21650 && d <= 45637) {
        id = 3;
    }
    else if (d > 6924 && d <= 21649) {
        id = 2;
    }
    else if (d > 285 && d <= 6923) {
        id = 1;
    }
    else {
        id = 0;
    }

    return colors_GDP[id];
}


function GDPStyle(feature) {
    return {
        weight: 1,
        opacity: 1,
        color: 'black',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: GDPColor(feature.properties.gdp_2016),
    }
};

function GDPBasin() {
    map.eachLayer(function (layer) {
        map.removeLayer(layer);
        map.removeControl(legend)
    });
    L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png').addTo(map);
    // L.mapboxGL({
    //     accessToken: mapbox_token,
    //     style: 'assets/style.json',
    //     attribution: 'Created By <a href="https://github.com/hannahfriedrich/">Hannah Friedrich</a> based on the <a href="assets/license.txt">Mapbox basic style</a>'
    // }).addTo(map);
    L.geoJSON.ajax('assets/BCU310_Master_20180511.geojson', {
        style: GDPStyle,
        onEachFeature: onEachFeatureGDP,
    }).addTo(map)
    legend.onAdd = function(){
        var div = L.DomUtil.create('div','legend');
        var colors_GDP= ['#c6cec9', '#b8c1b6', '#889685', '#66915e', '#21381c', '#ffffff']
        div.innerHTML+='<b> GDP (per Capita USD) </b></br>';
        // div.innerHTML += '<i style="background: ' + colors[5] + '; opacity: 0.5"></i><p>>64176</p>';
        div.innerHTML += '<i style="background: ' + colors_GDP[4] + '; opacity: 0.5"></i><p>45638 - 64175</p>';
        div.innerHTML += '<i style="background: ' + colors_GDP[3] + '; opacity: 0.5"></i><p>21650 - 45637</p>';
        div.innerHTML += '<i style="background: ' + colors_GDP[2] + '; opacity: 0.5"></i><p>6924 - 21649</p>';
        div.innerHTML += '<i style="background: ' + colors_GDP[1] + '; opacity: 0.5"></i><p>285 - 6923</p>';
        div.innerHTML += '<i style="background: ' + colors_GDP[0] + '; opacity: 0.5"></i><p><285</p>'
        return div
    };
    legend.addTo(map);
}



///////////////////////////////////////////////////call Cover/////////////////////////////////////////////////////////

cover(base);
// treatyTable();


////////////////////////////////////////LISTEN FOR CHANGES ON THE MAP//////////////////////////////////////////////////

$(document).ready(function () {
    $("#myInput").on("keyup", function () {


        var value = $(this).val().toLowerCase();

        $("#myTable tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });

    });
    $(".dc-table-column._0").on("click", function () {
        console.log("boom")
    });


});


window.onload = function () {
    console.log("window loaded")
    var a = document.getElementById('backbutton');
    a.onclick = function () {
        console.log("button clicked");
        $("#2").hide();
        $("#1").show();
        $(".clear").text("Please select a Basin")


        map.setView([40, 0], 1.5);
        cover(base)


        return false
    }
}
// document.body.style.zoom="90%"
