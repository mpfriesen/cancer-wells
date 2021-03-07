function addCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function resetSwitcher(layer) {
    $(".layer-checks .btn").removeClass("active");
    $(".layer-checks .btn."+layer).addClass("active");
}

function getBreaks(dataSource,breaks) {

    // Create an empty array to store the cancer rates
    var values = [];

    // Loop through each feature to get its cancer rate
    $.each(dataSource,function (k,v) {
        var value = v;

        // Push each number into the array
        values.push(value);
    });

    // Determine 5 clusters of statistically similar values, sorted in ascending order
    var breaks = ss.equalIntervalBreaks(values, breaks);

    // Return the array of class breaks
    return breaks;

}        


function getRegression(collected) {

    // Loop through the hexbin layer with nitrate concentrations and cancer rates
    // Create a two-dimensional array of [x, y] pairs where x is the nitrate concentration and y is the cancer rate

    // Loop through each of the collected hexbins
    for (var i in collected.features) {

        // Create a shorthand variable to access the layer properties
        var p = collected.features[i].properties;

        // Create variables to store the interpolated nitrate concentration and cancer rate
        var interp_nitrate = p.nitr_ran;
        var interp_cancer = p.canrate;

        // Create an array for the current feature of [nitrate concentration, cancer rate]
        var nitr_cancer = [parseFloat(interp_nitrate), parseFloat(interp_cancer)];

        // Push the array of the current feature's nitrate concentration and cancer rate into an array
        rates_array.push(nitr_cancer);

    }

    // Run the linearRegression method from the Simple Statistics library to return an object containing the slope and intercept of the linear regression line
    // where nitrate concentration is the independent variable (x) and cancer rate is the dependent variable (y)
    // The object returns m (slope) and b (y-intercept) that can be used to predict cancer rates (y) using the equation, y = mx + b
    var regress_eq = ss.linearRegression(rates_array);

    // Create variables for the slope and y-intercept
    var m = regress_eq.m;
    var b = regress_eq.b;
    
    var regress_eq_disp = "y = " + parseFloat(m).toFixed(5) + "x + " + parseFloat(b).toFixed(5);
    console.log("Regression Equation: " + regress_eq_disp);

    // Loop through each of the collected hexbins
    for (var j in collected.features) {

        // Create a shorthand variable to access the layer properties
        var collected_p = collected.features[j].properties;
        
        // Create variables to store the interpolated nitrate concentration and cancer rate
        var collected_nitr = collected_p.nitr_ran;
        var collected_canrate = collected_p.canrate;

        // Use the slope and y-intercept from the regression equation to calculate the predicted cancer rate from the interpolated nitrate concentration
        var pre_canrate = m * (parseFloat(collected_nitr)) + b;

        // Calculate the residual (pre_canrate - interpolatedCancerRate)
        var residual = pre_canrate - collected_canrate;

        // Add the predicted cancer rate and residual to the collected hexbin
        collected.features[j].properties.pre_canrate = pre_canrate;
        collected.features[j].properties.residual = residual;
        
        // Build an array of the observed nitrate concentration and cancer rate for the current feature
        var obs_nitr_canrate = [collected_nitr, collected_canrate];
        
        // Push the current nitrate concentration and cancer rate pair into an array
        obs_array.push(obs_nitr_canrate);

    }
    
    // Calculate the r-squared for the regression (https://simplestatistics.org/docs/#rSquared)
    // The function requires a linear regression line (https://simplestatistics.org/docs/#linearregressionline) and an array of nitrate concentration and cancer rate pairs
    
    // Build the linear regression line from the regression equation
    var regress_ln = ss.linearRegressionLine(regress_eq);
    
    // Calculate the r-squared
    var r_squared = parseFloat(ss.rSquared(obs_array, regress_ln)).toFixed(5); // 1 is a perfect fit, 0 indicates no correlation
    console.log("r-Squared: " + r_squared);
/*
    
    // Show the regression equation and r-squared labels and values in the sidebar
    $('#regress_eqLabel').show();
    $('#regress_eq').show();
    $('#r_squaredLabel').show();    
    $('#r_squared').show();
    
    // Select the regression equation inside the regress_eq div element's span tag and update it to the calculated regression equation
    var regress_eqDiv = $('#regress_eq');
    regress_eqDiv.html(regress_eqFormatted);
    
    // Select the r-squared inside the regress_eq div element's span tag
    var r_squaredDiv = $('#r_squared');
    r_squaredDiv.html(r_squared);

    // Convert the collected hexbins to a Leaflet GeoJson layer and add it to the regression residuals layer group
    regressionFeaturesHexbins = L.geoJson(collected, {

        // Set a default style for the collected hexbins
        style: function (feature) {
            return {
                color: '#999999', // Stroke Color
                weight: 0.5, // Stroke Weight
                fillOpacity: 0.5, // Override the default fill opacity
                opacity: 0.5 // Border opacity
            };
        }

    }).addTo(regressionResidualsLayerGroup);

    // Get the class breaks based on the ckmeans classification method
    var breaks = getRegressionResidualClassBreaks(regressionFeaturesHexbins);

    // Loop through each feature, set its symbology, and build and bind its popup
    regressionFeaturesHexbins.eachLayer(function (layer) {

        // Set its color based on the residual between the predicted and observed cancer rate
        layer.setStyle({
            fillColor: getRegressionResidualColor(layer.feature.properties.residual, breaks)
        });

        // Set the most accurately predicted hexbins to 10% opacity, so more of the basemap shows through
        if (getRegressionResidualColor(layer.feature.properties.residual, breaks) == '#f7f7f7') {
            layer.setStyle({
                fillOpacity: 0.1
            });
        }

        // Build the popup for the feature
        var popup = "<b>Nitrate Concentration: </b>" + layer.feature.properties.nitr_ran.toFixed(2) + " ppm" + "<br/>" +
            "<b>Observed Cancer Rate: </b>" + (layer.feature.properties.canrate * 100).toFixed(2).toLocaleString() + "% of census tract population" + "<br/>" +
            "<b>Predicted Cancer Rate: </b>" + (layer.feature.properties.pre_canrate * 100).toFixed(2).toLocaleString() + "% of census tract population";

        // Bind the popup to the feature
        layer.bindPopup(popup);

    });

    // Move the regression residuals to the front
    regressionFeaturesHexbins.bringToFront();

    // Turn off the interpolation layers
    map.removeLayer(nitrateRatesIDWLayerGroup);
    map.removeLayer(joinedCancerNitrateRatesIDWLayerGroup);

    // Draw the legend for the regression residuals
    drawRegressionResidualsLegend(breaks);
*/

} 


function getRegressBreaks(regress_grid) {
    // Create an empty array to store the residuals
    var values = [];

    // Loop through each feature to get its residual
    $.each(regress_grid.features,function (k,v) {
        var value = v.properties.residual;

        // Push each residual into the array
        values.push(value);
    });

    // Use Simple Statistics to get the standard deviation of the residuals (https://simplestatistics.org/docs/#standarddeviation)
    var st_dev = ss.sampleStandardDeviation(values);

    // Create an array of the break points for -2, -1, 0, 1, and 2 standard deviations
    var breaks = [-2 * st_dev, -1 * st_dev, st_dev, 2 * st_dev];

    console.log("Standard Deviation of Residuals: " + parseFloat(st_dev).toFixed(5));
    console.log(breaks);
    // Return the array of class breaks
    return breaks;

}        





    var cancertractData = {};
    var tract_canrate = [];
    var wellids = {};
    var rates_array = [];
    var obs_array = [];

    //pull in geojson  and loop through it to make some arrays for later use
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
/*
                p = v.properties;
                g = v.geometry;
*/
            })
         }
    });
    //get breaks for 
    cancer_breaks = getBreaks(tract_canrate,5)
    reds = ['#fef0d9','#fdcc8a','#fc8d59','#e34a33','#b30000'];
    orPu = ['#e66101','#fdb863','#f7f7f7','#b2abd2','#5e3c99'];

    $.ajax({
        type: 'GET',
        async: false,
        url: 'data/well_nitrate.geojson',
        data: { get_param: 'value' },
        dataType: 'json',
        success: function (data) {
            welldata = data;
/*
            $.each(data.features, function(k, v) {
                welldata = data;
                wellids[v.properties.TARGET_FID] = k;
                p = v.properties;
                g = v.geometry;
            })
*/
         }
    });

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

    var layers = ['cancer_tracts','nitrate_wells','grid','cancer_grid'];
    mapbox_path = "mapbox://mfriesenwisc.";

    mapboxgl.accessToken = 'pk.eyJ1IjoibWZyaWVzZW53aXNjIiwiYSI6ImNqenhjcjAzYjBlc3QzbmtpODI1YXZxNmgifQ.Zz-z-Ykof8NbNaQOdR6ouQ';
    var map = new mapboxgl.Map({
      container: 'map', // container id
      style: 'mapbox://styles/mapbox/dark-v10',
      fitBounds: [-122.5795,45.5283],
      zoom: 3
    });
    map.fitBounds([[-92.75,42.4],[-86.86,47]], {padding: {top: 100, bottom: 0, left: 200, right: 200} });

    var nav = new mapboxgl.NavigationControl({showCompass:false});
    map.addControl(nav,'top-left');
    var hoveredStateId = null;

    $(".info").on("click",function() {
        $(this).hide();
    })
    

    map.on('load',function() {

        var maplayers = map.getStyle().layers;
        // Find the index of the first symbol layer in the map style
        var firstSymbolId;
        for (var i = 0; i < maplayers.length; i++) {
            if (maplayers[i].type === 'symbol') {
                firstSymbolId = maplayers[i].id;
                break;
            }
        }
    

//         resetSwitcher("cancer_tracts");
        $('.info').hide();
        
        $('.gridbtn').on("click",function(){
            $('.layer-checks input').prop("checked", false);
            map.setLayoutProperty('cancer_tracts', 'visibility', 'none');
            $('.nitr_grid_switch').show();
            $('.nitr_grid_switch input').prop( "checked", true );
            $('.cancer_grid_switch').show();
            makeGrid(10,2);
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
                'fill-opacity': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    0.6,
                    1
                ],
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
                'fill-outline-color': '#aaaaaa'
            }
        },firstSymbolId)
        
        map.addLayer({
            'id': 'nitrate_wells',
            'type': 'circle',
            'source': 'wells',
            'layout': { 'visibility': 'none' },
            'paint': {
                'circle-radius': 3,
                'circle-color': [
                    'interpolate',
                    ['linear'],
                    ['get','nitr_ran'],
                     -2,
                    '#ffffcc',
                    3.4,
                    '#a1dab4',
                    6.8,
                    '#41b6c4',
                    10.2,
                    '#2c7fb8',
                    13.6,
                    '#2c7fb8'
               ]
            }
            

        },firstSymbolId)
        
        
        
        function makeGrid(size,exp) {
            
        
            var nitr_options = {gridType: 'polygon', property: 'nitr_ran', units: 'kilometers', gridType: 'hex', weight: exp};
            var nitr_grid = turf.interpolate(welldata, size, nitr_options);
            map.addSource('nitr_grid', {
              type: 'geojson',
              data: nitr_grid,
            })

            grid_nitrate = [];
            $.each(nitr_grid.features, function(k, v) {
                grid_nitrate.push(v.properties.nitr_ran);
            });
            nitr_breaks = getBreaks(grid_nitrate,5);
           
            
            var cancer_options = {
                gridType: 'point', // use points as the grid type, required to use the collect function
                property: 'canrate', // interpolate values from the cancer rates
                units: 'kilometers', // hexbin size units
                weight: exp // distance decay coefficient, q
            };
            var cancer_grid = turf.interpolate(cancerdata, size, cancer_options);
            
            
            collected = turf.collect(nitr_grid, cancer_grid, 'canrate', 'values');
                
            // Loop through each of the collected hexbins
            for (var i in collected.features) {
                
                // The collect function builds an array of cancer rates for features intersecting the current hexbin
                // Get the array of cancer rates for the current hexbin
                var canrates = collected.features[i].properties.values;
        
                // Loop through each feature in the cancer rates array and sum them
                var canrates_sum = 0;
                for (var j in canrates) {
        
                    if (canrates.length > 0) {
                        canrates_sum += parseFloat(canrates[j]);
                    }
        
                }
        
                // Get the average cancer rate (sum / number of features in the array)
                var canrates_avg = canrates_sum / canrates.length;
        
                // Add the average cancer rate to the canrate property of the current hexbin
                if (canrates_avg !== undefined) {
                    collected.features[i].properties.canrate = canrates_avg;
                } else {
                    collected.features[i].properties.canrate = "";
                }
        
            }
            
            map.addLayer({
                'id': 'nitr_grid',
                'type': 'fill',
                'source': 'nitr_grid',
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
                        reds[0],
                        nitr_breaks[1],
                        reds[1],
                        nitr_breaks[2],
                        reds[2],
                        nitr_breaks[3],
                        reds[3],
                        nitr_breaks[4],
                        reds[4]
                    ]

                }
       
            },'nitrate_wells');

            getRegression(collected);
            reg_breaks = getRegressBreaks(collected);
            
            map.addSource('regress_grid', {
              type: 'geojson',
              data: collected,
            })
           
           map.addLayer({
                'id': 'regress_grid',
                'type': 'fill',
                'source': 'regress_grid',
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
         
        map.on('click', 'nitr_grid', function (e) {
            new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(e.features[0].properties.nitr_ran)
            .addTo(map);
        });

/*
        ct = map.getSource('tracts')._data.features;
        
*/
    
 

        // loop through layers to add listeners to each
        $.each(layers,function(k,layer) {
             map.on('mouseenter', layer, function() {
                map.getCanvas().style.cursor = 'pointer';
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
 
            
        })


//             make legend
        // make a pointer cursor
        map.getCanvas().style.cursor = 'default';
/*         var legendblock = ""; */
/*
        $.each(colors, function(k,v) {
            var legend_break;
            if (k==0) {
                legend_break = "<$"+addCommas(breaks[1]);
            } else if (k==7) {
                legend_break = ">$"+addCommas(breaks[7]);
            } else {
                legend_break = "$" + addCommas(breaks[k]) + "-$" + addCommas(breaks[k+1]-1);
            }
            legendblock += "<div>"
                + "<span class='legend-key' style='background-color:"+v+"'></span>"
                + "<span class='legend-val'>"+legend_break+"</span>"
                + "</div>";
        })
*/
/*
        legendblock = "<div class='legend_parcels'><div class='legend-hed'>PROPERTY VALUE KEY</div>"+legendblock+"<div class='note'>" + cityData[city].name +" median single family home value: $"+addCommas(breaks[4])+"</div></div>";

        legendblock += "<div class='legend_demographics'><div class='legend-hed'>NON-WHITE POPULATION</div>"
        +        "<div class='legend-scale'>"
        +            "<ul class='YlGnBu legend-labels'>"
        +                "<li>"
        +                    "<span class='q0-5'></span>"
        +                "</li>"
        +                "<li>"
        +                    "<span class='q1-5'></span>"
        +                "</li>"
        +                "<li>"
        +                    "<span class='q2-5'></span>"
        +                "</li>"
        +                "<li>"
        +                    "<span class='q3-5'></span>"
        +                "</li>"
        +                "<li>"
        +                    "<span class='q4-5'></span>"
        +                "</li>"
        +            "</ul>"
        +            "<ul class='legend-labels tick-values'>"
        +                "<li style='width:10%'></li>"
        +                "<li>25%</li>"
        +                "<li>40%</li>"
        +                "<li>60%</li>"
        +                "<li>80%</li>"
        +            "</ul>"
        +        "</div>"
        +   "</div>";


        
        $("#legend").html(legendblock);
        $("#legend").show();
*/
        

        //Code for layer toggle
        $(".layer-checks").show();
        $(".layer-checks input").on("change",function(e) {
            var thisLayer = $(this).data("layer");
            map.setLayoutProperty(
                thisLayer,
                'visibility',
                e.target.checked ? 'visible' : 'none'
            );
            
//             resetSwitcher(thisLayer);
//             $("input."+thisLayer).toggleClass("active");
/*
            var visibility = map.getLayoutProperty(thisLayer,'visibility');
            if (visibility === 'visible') {
                $(".btn."+thisLayer).removeClass("active");
                map.setLayoutProperty(thisLayer, 'visibility', 'none');
            } else {
                $(".btn."+thisLayer).addClass("active");
                map.setLayoutProperty(thisLayer, 'visibility', 'visible');
            }
*/
            
/*
            
            var clickedLayer = thisLayer;
            $(".btn."+thisLayer).toggleClass("active");
            var visibility = map.getLayoutProperty(clickedLayer,'visibility');
            if (visibility === 'visible') {
                $(".btn."+thisLayer).removeClass("active");
                map.setLayoutProperty(clickedLayer, 'visibility', 'none');
            } else {
                $(".btn."+thisLayer).addClass("active");
                map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
            }
 
            if ($(".btn.parcels").hasClass("active")) {
                $(".legend_parcels").show();
            } else {
                $(".legend_parcels").hide();
            }
            if ($(".btn.demographics").hasClass("active")) {
                $(".legend_demographics").show();
            } else {
                $(".legend_demographics").hide();
            }
            if ((!$(".btn.parcels").hasClass("active")) && (!$(".btn.demographics").hasClass("active"))) {
                $("#legend").hide();
            }
*/
            
            
        })
    })

 
 
 
 
    //Function for a map click. 
    function mapClick(p) {
        console.log(p);
   }
    
    
    

