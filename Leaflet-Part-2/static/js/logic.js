// URL for the JSON data (all earthquakes from the past week)
let earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
let tectonicPlatesUrl = "https://your-tectonic-plates-data-source"; // Replace with your tectonic plates data source if available

// Define base layers
let streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
});

let satelliteLayer = L.tileLayer('https://{s}.sat.earth/openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© SatelliteMap contributors'
});

// Initialize the map with the default layer
let map = L.map('map', {
    center: [37.7749, -122.4194],
    zoom: 4,
    layers: [streetLayer] // Default layer
});

// Function to determine color based on earthquake depth
function getColor(depth) {
    return depth > 90 ? '#d73027' :
           depth > 70 ? '#fc8d59' :
           depth > 50 ? '#fee08b' :
           depth > 30 ? '#d9ef8b' :
           depth > 10 ? '#91cf60' :
                        '#1a9850';
}

// Function to set marker radius based on magnitude
function getRadius(magnitude) {
    return magnitude ? magnitude * 3 : 1;
}

// Earthquake layer group
let earthquakes = new L.LayerGroup();

// Fetch earthquake data using D3 and add markers to the earthquake layer
d3.json(earthquakeUrl).then(data => {
    data.features.forEach(quake => {
        let [lon, lat, depth] = quake.geometry.coordinates;
        let magnitude = quake.properties.mag;
        let place = quake.properties.place;

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
});

// Tectonic Plates layer group
let tectonicPlates = new L.LayerGroup();

// Fetch tectonic plates data if available
d3.json(tectonicPlatesUrl).then(data => {
    L.geoJSON(data, {
        style: {
            color: "orange",
            weight: 2
        }
    }).addTo(tectonicPlates);
});

// Add earthquake and tectonic plates layers to the map
earthquakes.addTo(map);
tectonicPlates.addTo(map);

// Define baseMaps and overlayMaps for layer control
let baseMaps = {
    "Street View": streetLayer,
    "Satellite View": satelliteLayer
};

let overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicPlates
};

// Add layer control to the map
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false // Keep the layer control expanded
}).addTo(map);

// Create a legend for earthquake depth
let legend = L.control({ position: "bottomright" });

legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    let depths = [-10, 10, 30, 50, 70, 90];
    let colors = ["#1a9850", "#91cf60", "#d9ef8b", "#fee08b", "#fc8d59", "#d73027"];

    div.innerHTML += "<h4>Depth (km)</h4>";
    for (let i = 0; i < depths.length; i++) {
        div.innerHTML +=
            `<i style="background:${colors[i]}"></i> ${depths[i]}${depths[i + 1] ? "&ndash;" + depths[i + 1] : "+"}<br>`;
    }
    return div;
};

legend.addTo(map);
