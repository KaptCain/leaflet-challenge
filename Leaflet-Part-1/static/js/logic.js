// Initialize the map
const map = L.map('map').setView([20, 0], 2);

// Add a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
}).addTo(map);

// Function to determine marker color based on depth
function getColor(depth) {
    return depth > 90 ? '#FF0000' :
        depth > 70 ? '#FF4500' :
        depth > 50 ? '#FF8C00' :
        depth > 30 ? '#FFD700' :
        depth > 10 ? '#ADFF2F' :
                        '#7FFF00';
}

// Function to determine marker size based on magnitude
function getSize(magnitude) {
    return magnitude ? magnitude * 4 : 2;
}

// Fetch GeoJSON data
d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson').then(data => {
    // Add GeoJSON layer to the map
    L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: getSize(feature.properties.mag),
                fillColor: getColor(feature.geometry.coordinates[2]),
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup(
                `<strong>Location:</strong> ${feature.properties.place}<br>
                <strong>Magnitude:</strong> ${feature.properties.mag}<br>
                <strong>Depth:</strong> ${feature.geometry.coordinates[2]} km`
            );
        }
    }).addTo(map);
});

// Add a legend
const legend = L.control({ position: 'bottomright' });

legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'legend');
    
    // Legend box
    div.style.backgroundColor = 'white';  
    div.style.padding = '10px';  
    div.style.borderRadius = '5px';  
    div.style.boxShadow = '2px 2px 10px rgba(0, 0, 0, 0.3)';
    
    
    const grades = [-10, 10, 30, 50, 70, 90];
    const labels = [];
    
    div.innerHTML += '<strong>Depth (km)</strong><br>';
    for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
            `<i style="background:${getColor(grades[i] + 1)}">&nbsp;&nbsp;&nbsp;&nbsp;</i> ` +
            grades[i] + (grades[i + 1] ? `-${grades[i + 1]}<br>` : '+');
    }
    return div;
};

legend.addTo(map);
