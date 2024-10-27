// URLs for the data
let earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
let tectonicPlatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Initialize the map with a default view
let map = L.map('map').setView([37.7749, -122.4194], 4);

// Define base maps
let streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: '© OpenTopoMap contributors'
});

let satelliteMap = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap, HOT'
});

// Function to determine color based on earthquake depth (green color scale)
function getColor(depth) {
    return depth > 90 ? '#00441b' :
           depth > 70 ? '#006d2c' :
           depth > 50 ? '#238b45' :
           depth > 30 ? '#41ab5d' :
           depth > 10 ? '#74c476' :
                        '#c7e9c0';
}

// Function to set marker radius based on magnitude
function getRadius(magnitude) {
    return magnitude ? magnitude * 3 : 1;
}

// Layer for earthquake data
let earthquakes = new L.LayerGroup();
d3.json(earthquakeUrl).then(data => {
        data.features.forEach(quake => {
        let [lon, lat, depth] = quake.geometry.coordinates;
        let magnitude = quake.properties.mag;
        let place = quake.properties.place;

            // Create a circle marker for each earthquake
            L.circleMarker([lat, lon], {
                radius: getRadius(magnitude),
                fillColor: getColor(depth),
                color: getColor(depth),
                weight: 0.5,
                opacity: 1,
                fillOpacity: 0.7
            })
            .bindPopup(`<h3>${place}</h3><p>Magnitude: ${magnitude}</p><p>Depth: ${depth} km</p>`)
            .addTo(earthquakes);
        });
    })
    
// Layer for tectonic plates data
let tectonicPlates = new L.LayerGroup();
d3.json(tectonicPlatesUrl).then(data => {
    L.geoJSON(data, {
        style: {
            color: "orange",
            weight: 2
        }
    }).addTo(tectonicPlates);
});

// Create a legend to explain the depth color scale
let legend = L.control({ position: "bottomright" });

legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    let depths = [-10, 10, 30, 50, 70, 90];
    let colors = ["#c7e9c0", "#74c476", "#41ab5d", "#238b45", "#006d2c", "#00441b"];

    // Add a white background and legend title
    div.style.backgroundColor = "white";
    div.style.padding = "10px";
    div.innerHTML += "<h4>Depth (km)</h4>";

    // Loop through depth intervals to generate a colored square for each range
    for (let i = 0; i < depths.length; i++) {
        div.innerHTML +=
            `<i style="background:${colors[i]}; width: 18px; height: 18px; display: inline-block;"></i> ` +
            `${depths[i]}${depths[i + 1] ? "&ndash;" + depths[i + 1] : "+"}<br>`;
    }
    return div;
};

legend.addTo(map);

// Base maps object
let baseMaps = {
    "Street Map": streetMap,
    "Topographic Map": topoMap,
    "Satellite Map": satelliteMap
};

// Overlay maps object
let overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicPlates
};

// Add layer control
L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);
