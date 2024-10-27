// URL for the JSON data (all earthquakes from the past week)
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Initialize the map, centered on the continental U.S.
let map = L.map('map').setView([37.7749, -122.4194], 4);

// Set up the tile layer (OpenStreetMap tiles)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

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

// Fetch earthquake data and add it to the map
fetch(url)
    .then(response => response.json())
    .then(data => {
        data.features.forEach(quake => {
            let [lon, lat, depth] = quake.geometry.coordinates;
            let magnitude = quake.properties.mag;
            let place = quake.properties.place;

            // Create a circle marker with radius and color based on magnitude and depth
            L.circleMarker([lat, lon], {
                radius: getRadius(magnitude),
                fillColor: getColor(depth),
                color: getColor(depth),
                weight: 0.5,
                opacity: 1,
                fillOpacity: 0.7
            })
            .bindPopup(`<h3>${place}</h3><p>Magnitude: ${magnitude}</p><p>Depth: ${depth} km</p>`)
            .addTo(map);
        });
    })
    .catch(error => console.error("Error fetching the earthquake data:", error));

// Create a legend to explain the depth color scale
let legend = L.control({ position: "bottomright" });

legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    let depths = [-10, 10, 30, 50, 70, 90];
    let colors = ["#1a9850", "#91cf60", "#d9ef8b", "#fee08b", "#fc8d59", "#d73027"];

    // Add legend title
    div.innerHTML += "<h4>Earthquake Depth (km)</h4>";

    // Loop through depth intervals to generate a colored square for each range
    for (let i = 0; i < depths.length; i++) {
        div.innerHTML +=
            `<i style="background:${colors[i]}"></i> ` +
            `${depths[i]}${depths[i + 1] ? "&ndash;" + depths[i + 1] : "+"}<br>`;
    }
    return div;
};

legend.addTo(map);
