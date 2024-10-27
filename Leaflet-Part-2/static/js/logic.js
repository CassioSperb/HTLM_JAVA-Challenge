// URLs for the data sources
const earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
const tectonicPlatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Initialize the map
const map = L.map('map').setView([37.7749, -122.4194], 4);

// Define base layers for different map styles
const grayscale = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors',
    opacity: 0.8
});

const satellite = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors',
    opacity: 0.8
});

const outdoors = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors',
    opacity: 0.8
});

// Add default layer to map
grayscale.addTo(map);

// Function to determine color based on earthquake depth
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

// Layer groups for earthquakes and tectonic plates
const earthquakeLayer = L.layerGroup();
const tectonicPlatesLayer = L.layerGroup();

// Fetch and display earthquake data
fetch(earthquakeUrl)
    .then(response => response.json())
    .then(data => {
        data.features.forEach(quake => {
            const [lon, lat, depth] = quake.geometry.coordinates;
            const magnitude = quake.properties.mag;
            const place = quake.properties.place;

            // Create a circle marker and add it to the earthquake layer
            const marker = L.circleMarker([lat, lon], {
                radius: getRadius(magnitude),
                fillColor: getColor(depth),
                color: getColor(depth),
                weight: 0.5,
                opacity: 1,
                fillOpacity: 0.7
            })
            .bindPopup(`<h3>${place}</h3><p>Magnitude: ${magnitude}</p><p>Depth: ${depth} km</p>`);

            marker.addTo(earthquakeLayer);
        });
    })
    .catch(error => console.error("Error fetching earthquake data:", error));

// Fetch and display tectonic plate boundaries data
fetch(tectonicPlatesUrl)
    .then(response => response.json())
    .then(plateData => {
        L.geoJSON(plateData, {
            style: {
                color: "#ff7800",
                weight: 2
            }
        }).addTo(tectonicPlatesLayer);
    })
    .catch(error => console.error("Error fetching tectonic plate data:", error));

// Add layer control with checkboxes for earthquakes and tectonic plates
const baseMaps = {
    "Grayscale": grayscale,
    "Satellite": satellite,
    "Outdoors": outdoors
};

const overlayMaps = {
    "Earthquakes": earthquakeLayer,
    "Tectonic Plates": tectonicPlatesLayer
};

// Add control to toggle base maps and overlays
L.control.layers(baseMaps, overlayMaps).addTo(map);

// Initially add both earthquake and tectonic plates layers to the map
earthquakeLayer.addTo(map);
tectonicPlatesLayer.addTo(map);

// Create and add a legend to explain the depth color scale
const legend = L.control({ position: "bottomright" });

legend.onAdd = function () {
    const div = L.DomUtil.create("div", "info legend");
    const depths = [-10, 10, 30, 50, 70, 90];
    const colors = ["#c7e9c0", "#74c476", "#41ab5d", "#238b45", "#006d2c", "#00441b"];

    div.style.backgroundColor = "white";
    div.style.padding = "10px";
    div.innerHTML += "<h4>Depth (km)</h4>";

    for (let i = 0; i < depths.length; i++) {
        div.innerHTML +=
            `<i style="background:${colors[i]}; width: 18px; height: 18px; display: inline-block;"></i> ` +
            `${depths[i]}${depths[i + 1] ? "&ndash;" + depths[i + 1] : "+"}<br>`;
    }
    return div;
};

legend.addTo(map);
