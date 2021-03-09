
function addCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//validation function that prevents non-numerical characters being input in input field
function isValid(el, evnt) { 
    var charC = (evnt.which) ? evnt.which : evnt.keyCode; 
    if (charC == 46) { 
        if (el.value.indexOf('.') === -1) { 
            return true; 
        } else { 
            return false; 
        } 
    } else { 
        if (charC > 31 && (charC < 48 || charC > 57)) 
            return false; 
    } 
    return true; 
} 




function getBreaks(dataSource,breaks) {
    var values = [];
    $.each(dataSource,function (k,v) {
        var value = v;
        values.push(value);
    });
    var breaks = ss.equalIntervalBreaks(values, breaks);
    return breaks;
}        



function getRegression(collected) {
    var rates_array = [],
        obs_array = [];

    for (var i in collected.features) {
        var p = collected.features[i].properties;
        var interp_nitrate = p.nitr_ran;
        var interp_cancer = p.canrate;
        var nitr_cancer = [parseFloat(interp_nitrate), parseFloat(interp_cancer)];
        rates_array.push(nitr_cancer);
    }

    var regress_eq = ss.linearRegression(rates_array);

    // Create variables for the slope and y-intercept
    var m = regress_eq.m;
    var b = regress_eq.b;
    
    var regress_eq_disp = "y = " + parseFloat(m).toFixed(5) + "x + " + parseFloat(b).toFixed(5);
    console.log("Regression Equation: " + regress_eq_disp);

    // Loop through each of the collected hexbins
    for (var j in collected.features) {
        var collected_p = collected.features[j].properties;
        var collected_nitr = collected_p.nitr_ran;
        var collected_canrate = collected_p.canrate;
        var pre_canrate = m * (parseFloat(collected_nitr)) + b;
        var residual = pre_canrate - collected_canrate;

        // Add the predicted cancer rate and residual to the collected hexbin
        collected.features[j].properties.pre_canrate = pre_canrate;
        collected.features[j].properties.residual = residual;
        
        // Build an array of the observed nitrate concentration and cancer rate for the current feature
        var obs_nitr_canrate = [collected_nitr, collected_canrate];
        
        // Push the current nitrate concentration and cancer rate pair into an array
        obs_array.push(obs_nitr_canrate);

    }
    
    // Build the linear regression line from the regression equation
    var regress_ln = ss.linearRegressionLine(regress_eq);
    
    // Calculate the r-squared
    var r_squared = parseFloat(ss.rSquared(obs_array, regress_ln)).toFixed(5); // 1 is a perfect fit, 0 indicates no correlation
    console.log("r-Squared: " + r_squared);
    
    var statblock = "<div class='eq_line'><strong>Regression equation:</strong> <span class='equation'>"+regress_eq_disp+"</span></div>"
        +   "<div class='r2_line'><strong>R-squared:</strong> <span class='rsquared'>"+r_squared+"</span></div>";
        
    $(".regression").html(statblock);
    

} 

// get standard deviation breaks for residual map styling
function getRegressBreaks(regress_grid) {
    var values = [];
    $.each(regress_grid.features,function (k,v) {
        var value = v.properties.residual;
        values.push(value);
    });
    var st_dev = ss.sampleStandardDeviation(values);

    // Create an array of the break points for -2, -1, 0, 1, and 2 standard deviations
    var breaks = [-2 * st_dev, -1 * st_dev, st_dev, 2 * st_dev];

    console.log("Standard Deviation of Residuals: " + parseFloat(st_dev).toFixed(5));
    console.log(breaks);
    return breaks;

}        

//removes grid layers and sources added in the makeGrid function
function removeGrids() {
    if (map.getSource('collected')) { map.removeLayer('nitr_grid');  map.removeLayer('regress_grid'); map.removeSource('collected'); }
    if (map.getSource('border')) { map.removeLayer('border'); map.removeSource('border'); }
}

//resets map back to load state
function resetMap() {
    removeGrids();
    $('.layer-checks input').prop("checked", false);
    $('.legends,.nitr_grid_switch,.regress_grid_switch,#export-file').hide();
    $('#hexbin_size,#coeff').val('')
    map.fitBounds([[-92.75,42.4],[-86.86,47]], {padding: {top: 100, bottom: 0, left: 200, right: 200} });
    map.setLayoutProperty('nitrate_wells', 'visibility', 'none');
    map.setLayoutProperty('cancer_tracts', 'visibility', 'visible');
    $('.cancer_tracts_switch input').prop( "checked", true );
    $('.tract-legend').show();
    $('.reset-btn').addClass('disabled');
}




var tract_canrate = [],
    well_nitrate = [],
    reds = ['#fef0d9','#fdcc8a','#fc8d59','#e34a33','#b30000'],
    orPu = ['#e66101','#fdb863','#f7f7f7','#b2abd2','#5e3c99'],
    blues = ['#ffffcc','#a1dab4','#41b6c4','#2c7fb8','#253494'],
    devs = ['< -2 Std. Dev.', '-2 Std. Dev. - -1 Std. Dev.', '-1 Std. Dev. - 1 Std. Dev.', '1 Std. Dev. - 2 Std. Dev.', '> 2 Std. Dev.'];


//get geojson data for tracts, wells and the state border
$.ajax({
    type: 'GET',
    async: false,
    url: 'data/cancer_tracts.geojson',
    data: { get_param: 'value' },
    dataType: 'json',
    success: function (data) {
        tractdata = data;
        $.each(data.features, function(k, v) {
            tract_canrate.push(v.properties.canrate);
        })
     }
});

var break_num = 5;
var cancer_breaks = getBreaks(tract_canrate,break_num);



$.ajax({
    type: 'GET',
    async: false,
    url: 'data/well_nitrate.geojson',
    data: { get_param: 'value' },
    dataType: 'json',
    success: function (data) {
        welldata = data;
         $.each(data.features, function(k, v) {
            well_nitrate.push(v.properties.nitr_ran);
        })
    }
});

var well_breaks = getBreaks(well_nitrate,break_num);
for (var i=0;i<break_num;i++) {
    $('.tract-legend tr.class_'+i+' td.grade').css({'background-color':reds[i]});
    $('.tract-legend tr.class_'+i+' td.desire').text(cancer_breaks[i].toFixed(1)*1000+'-'+cancer_breaks[i+1].toFixed(1)*1000);
    $('.wells-legend tr.class_'+i+' td.grade').css({'background-color':blues[i]});
    $('.wells-legend tr.class_'+i+' td.desire').text(well_breaks[i].toFixed(1)+'-'+well_breaks[i+1].toFixed(1));
    $('.stdev-legend tr.class_'+i+' td.grade').css({'background-color':orPu[i]});
    $('.stdev-legend tr.class_'+i+' td.desire').text(devs[i]);
}

$.ajax({
    type: 'GET',
    async: false,
    url: 'data/cancer_tracts_cent.geojson',
    data: { get_param: 'value' },
    dataType: 'json',
    success: function (data) {
        cancerdata = data;
     }
});

$.ajax({
    type: 'GET',
    async: false,
    url: 'data/wisconsin.geojson',
    data: { get_param: 'value' },
    dataType: 'json',
    success: function (data) {
        border = data;
     }
});

var layers = ['cancer_tracts','nitrate_wells','regress_grid','nitr_grid'];
mapbox_path = "mapbox://mfriesenwisc.";

mapboxgl.accessToken = 'pk.eyJ1IjoibWZyaWVzZW53aXNjIiwiYSI6ImNqenhjcjAzYjBlc3QzbmtpODI1YXZxNmgifQ.Zz-z-Ykof8NbNaQOdR6ouQ';
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/dark-v10',
  zoom: 3
});
map.fitBounds([[-92.75,42.4],[-86.86,47]], {padding: {top: 100, bottom: 0, left: 200, right: 200} });

var nav = new mapboxgl.NavigationControl({showCompass:false});
map.addControl(nav,'top-left');
var hoveredStateId = null;

$(".reset-btn").on("click",function() {
    resetMap();
})


map.on('load',function() {
    var maplayers = map.getStyle().layers;
    
    // Find the index of the first symbol layer in the map style;
    var firstSymbolId;
    for (var i = 0; i < maplayers.length; i++) {
        if (maplayers[i].type === 'symbol') {
            firstSymbolId = maplayers[i].id;
            break;
        }
    }

    
    $('.gridbtn').on("click",function(){
        var hex_size = Number($('#hexbin_size').val());
        var exp = Number($('#coeff').val());
        if (exp<1) {
            $('.error-text').text('Please enter a number greater than 1');
            $('#coeff').val('');
        } else {
            makeGrid(hex_size,exp);
        }
    })
    
    
    //add geojson data as source for map layers
    map.addSource('tracts', {
        'type': 'geojson',
        'data': tractdata,
        'generateId': true
    });

    map.addSource('wells', {
        'type': 'geojson',
        'data': welldata,
        'generateId': true
    });


    //add different map layers

    map.addLayer({
        'id': 'cancer_tracts',
        'type': 'fill',
        'source': 'tracts',
        'layout': { 'visibility': 'visible' },
        'paint': {
            'fill-color': [
                'interpolate',
                ['linear'],
                ['get','canrate'],    
                cancer_breaks[0],
                reds[0],
                cancer_breaks[1],
                reds[1],
                cancer_breaks[2],
                reds[2],
                cancer_breaks[3],
                reds[3],
                cancer_breaks[4],
                reds[4],
            ],
            'fill-outline-color': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                '#000000',
                '#aaaaaa'
            ],
            'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                0.6,
                1
            ]
        }
    },firstSymbolId)
    
    map.addLayer({
        'id': 'nitrate_wells',
        'type': 'circle',
        'source': 'wells',
        'layout': { 'visibility': 'none' },
        'paint': {
            'circle-radius': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                10,
                3
            ],
            'circle-color': [
                'interpolate',
                ['linear'],
                ['get','nitr_ran'],
                well_breaks[0],
                blues[0],
                well_breaks[1],
                blues[1],
                well_breaks[2],
                blues[2],
                well_breaks[3],
                blues[3],
                well_breaks[4],
                blues[4],
            ]

        }
        

    },firstSymbolId)
        now = ["cancer_tracts","nitrate_wells"];

/*
        map.on('click', function(e) {
            var features = map.queryRenderedFeatures(e.point, {
                layers: now
            });
            if (!features.length) {
                return;
            }
            var feature = features[0];
            console.log(feature.properties);

            var popup = new mapboxgl.Popup()
                .setLngLat(map.unproject(e.point))
                .setHTML('<h3>Collision Detail</h3>' +
                    '<ul>' +
                    '<li>Year: <b>' + feature.properties.YEAR + '</b></li>' +
                    '<li>Pedestrian Injuries: <b>' + feature.properties.PED_INJ + '</b></li>' +
                    '<li>Pedestrian Fatalities: <b>' + feature.properties.PED_KIL + '</b></li>' +
                    '<li>Cyclist Injuries: <b>' + feature.properties.CYC_INJ + '</b></li>' +
                    '<li>Cyclist Fatalities: <b>' + feature.properties.CYC_KIL + '</b></li>' +
                    '</ul>')
                .addTo(map);
        });
*/




    
    // loop through layers to add listeners to each
         map.on('click', "cancer_tracts", function (e) {
            new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML("<strong>Cancer rate:</strong> "+(e.features[0].properties.canrate*1000).toFixed())
            .addTo(map);
        });

         map.on('click', "nitrate_wells", function (e) {
            new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML("<strong>Nitrate levels:</strong> "+e.features[0].properties.nitr_ran.toFixed(1)+"ppm")
            .addTo(map);
        });

         map.on('click', "nitr_grid", function (e) {
            new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML("<strong>Nitrate levels:</strong> "+e.features[0].properties.nitr_ran.toFixed(1)+"ppm")
            .addTo(map);
        });

         map.on('click', "regress_grid", function (e) {
            var p = e.features[0].properties;
            var html = "<div class='pophed'>Cancer incidence per 100,000</div>"
                + "<div><strong>Predicted rate:</strong> "+(p.pre_canrate*1000).toFixed()+"</div>"
                + "<div><strong>Observed rate:</strong> "+(p.canrate*1000).toFixed()+"</div>";
            new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(html)
            .addTo(map);
        });


       var tractID = null;
    
        map.on('mousemove', 'cancer_tracts', (e) => {
    
          map.getCanvas().style.cursor = 'pointer';
          // Set variables equal to the current feature's magnitude, location, and time
          var canrate = e.features[0].properties.canrate;
    
          // Check whether features exist
          if (e.features.length > 0) {
            // Display the magnitude, location, and time in the sidebar
//             canDisplay.textContent = canrate;
    
            // If quakeID for the hovered feature is not null,
            // use removeFeatureState to reset to the default behavior
            if (tractID) {
              map.removeFeatureState({
                source: "tracts",
                id: tractID
              });
            }
    
            tractID = e.features[0].id;
    
            // When the mouse moves over the earthquakes-viz layer, set the
            // feature state for the feature under the mouse
            map.setFeatureState({
              source: 'tracts',
              id: tractID,
            }, {
              hover: true
            });
    
          }
        });
    
        map.on("mouseleave", "cancer_tracts", function() {
    
          if (tractID) {
            map.setFeatureState({
              source: 'tracts',
              id: tractID
            }, {
              hover: false
            });
          }
          tractID = null;
          // Remove the information from the previously hovered feature from the sidebar
//           canDisplay.textContent = '';
          // Reset the cursor style
          map.getCanvas().style.cursor = '';
        });




       var wellID = null;
    
        map.on('mousemove', 'nitrate_wells', (e) => {
    
          map.getCanvas().style.cursor = 'pointer';
          // Check whether features exist
          if (e.features.length > 0) {
            // If quakeID for the hovered feature is not null,
            // use removeFeatureState to reset to the default behavior
            if (wellID) {
              map.removeFeatureState({
                source: "wells",
                id: wellID
              });
            }
    
            wellID = e.features[0].id;
    
            // When the mouse moves over the earthquakes-viz layer, set the
            // feature state for the feature under the mouse
            map.setFeatureState({
              source: 'wells',
              id: wellID,
            }, {
              hover: true
            });
    
          }
        });
    
        map.on("mouseleave", "nitrate_wells", function() {
    
          if (tractID) {
            map.setFeatureState({
              source: 'wells',
              id: wellID
            }, {
              hover: false
            });
          }
          wellID = null;
          // Remove the information from the previously hovered feature from the sidebar
//           canDisplay.textContent = '';
          // Reset the cursor style
          map.getCanvas().style.cursor = '';
        });



/*
        map.on('mousemove', layer, function(e) {
            if (e.features.length > 0) {
                if (hoveredStateId) {
                    map.setFeatureState(
                        { source: 'tracts', id: hoveredStateId },
                        { hover: false }
                    );
                }
                hoveredStateId = e.features[0].id;
                map.setFeatureState(
                    { source: 'tracts', id: hoveredStateId },
                    { hover: true }
                );
            }
        });
        map.on('mouseleave', layer, function() {
            map.getCanvas().style.cursor = '';
            if (hoveredStateId) {
                map.setFeatureState(
                    { source: 'tracts', id: hoveredStateId },
                    { hover: false }
                );
            }
        });
*/



    // make a pointer cursor
    map.getCanvas().style.cursor = 'default';
   

    //Code for layer toggle
    $(".layer-checks").show();
    $(".layer-checks input").on("change",function(e) {
        var thisLayer = $(this).data("layer");
        var thisLegend = $(this).data("legend");
        var thisHide = $(this).data("others");
        if (thisHide=='hide') {
            $('.legends').hide();
            $.each(layers,function(k,v) {
               map.setLayoutProperty(v, 'visibility', 'none'); 
            })
            $('.layer-checks input').prop("checked", false);
            $('.'+thisLayer+'_switch input').prop("checked", true);
            map.setLayoutProperty(thisLayer, 'visibility', 'visible');
        }
        if (e.target.checked) {
            $("."+thisLegend+"-legend").show();
        } else {
            $("."+thisLegend+"-legend").hide();
        }
        
        map.setLayoutProperty(
            thisLayer,
            'visibility',
            e.target.checked ? 'visible' : 'none'
        );
    })


    //function that makes grids and runs analysis on interpolated data given parameters input by user        
    function makeGrid(size,exp) {
        removeGrids();
        $(".regression").html("");
        $(".tract-legend").hide();
        $('.error-text').text('');
        $('.reset-btn').removeClass('disabled');
        $('.layer-checks input').prop("checked", false);
        map.setLayoutProperty('cancer_tracts', 'visibility', 'none');
        $('.nitr_grid_switch,.regress_grid_switch,.interp-legend,#export-file').show();
        $('.nitr_grid_switch input').prop( "checked", true );
    
        var nitr_options = {gridType: 'polygon', property: 'nitr_ran', units: 'kilometers', gridType: 'hex', weight: exp};
        var nitr_grid = turf.interpolate(welldata, size, nitr_options);
    
        grid_nitrate = [];
        $.each(nitr_grid.features, function(k, v) {
            grid_nitrate.push(v.properties.nitr_ran);
        });
        nitr_breaks = getBreaks(grid_nitrate,break_num);
        for (var i=0;i<break_num;i++) {
            $('.interp-legend tr.class_'+i+' td.grade').css({'background-color':blues[i]});
            $('.interp-legend tr.class_'+i+' td.desire').text(nitr_breaks[i].toFixed(1)+'-'+nitr_breaks[i+1].toFixed(1));
        }
        
        var cancer_options = { gridType: 'point', property: 'canrate', units: 'kilometers', weight: exp };
        var cancer_grid = turf.interpolate(cancerdata, size, cancer_options);
    
        collected = turf.collect(nitr_grid, cancer_grid, 'canrate', 'values');
            
        // Loop through collected hexbins, sum the array of cancer rates for points inside and calculate mean
        for (var i in collected.features) {
            var canrates = collected.features[i].properties.values;
            canrates_sum = canrates.reduce((pv,cv)=>pv+cv,0)
            var canrates_avg = canrates_sum / canrates.length;
            // Add the mean as a property to the current hexbin
            if (canrates_avg !== undefined) {
                collected.features[i].properties.canrate = canrates_avg;
            } else {
                collected.features[i].properties.canrate = "";
            }
        }
        console.log(collected);


        document.getElementById('export').onclick = function(e) {
            var data = collected;
            var convertedData = 'text/json;charset=utf-8,' + JSON.stringify(data);
            // Create export
            document.getElementById('export').setAttribute('href', 'data:' + convertedData);
            document.getElementById('export').setAttribute('download','grid_data.geojson');    
        };




        getRegression(collected);
        reg_breaks = getRegressBreaks(collected);
        map.addSource('collected', {
          type: 'geojson',
          data: collected,
          'generateId': true
        })
    
        map.addLayer({
            'id': 'nitr_grid',
            'type': 'fill',
            'source': 'collected',
            'layout': { 'visibility': 'visible' },
            'paint': {
                'fill-opacity': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    0.6,
                    1
                ],
                'fill-color': [
                    'interpolate',
                    ['linear'],
                    ['get','nitr_ran'],    
                    nitr_breaks[0],
                    blues[0],
                    nitr_breaks[1],
                    blues[1],
                    nitr_breaks[2],
                    blues[2],
                    nitr_breaks[3],
                    blues[3],
                    nitr_breaks[4],
                    blues[4]
                ]
    
            }
    
        },'nitrate_wells');
    
       map.addLayer({
            'id': 'regress_grid',
            'type': 'fill',
            'source': 'collected',
            'layout': { 'visibility': 'none' },
            'paint': {
                'fill-opacity': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    0.6,
                    1
                ],
                'fill-color': [
                    'step',
                    ['get','residual'],    
                    orPu[0],
                    reg_breaks[0],
                    orPu[1],
                    reg_breaks[1],
                    orPu[2],
                    reg_breaks[2],
                    orPu[3],
                    reg_breaks[3],
                    orPu[4]
                ],
                'fill-outline-color': '#aaaaaa'
    
            }
    
        },'nitrate_wells');
    
        map.addSource('border', {
            'type': 'geojson',
            'data': border,
            'generateId': true
        });
        map.addLayer({
            'id': 'border',
            'type': 'line',
            'source': 'border',
            'paint': {
                'line-color': '#999999',
                'line-width': 1
            }
        },firstSymbolId)
        
    
    }





})
        

         
    
    

