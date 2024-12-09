// Initialize the map
const map = L.map('map', { center: [20, 0], zoom: 2 });

// Base layers
const streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    
    attribution: '© OpenStreetMap contributors'
});

const satelliteMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    
    attribution: '© OpenTopoMap contributors'
});

const esriSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri &mdash; Source: Esri, DeLorme, NAVTEQ'
});

const usgsTopoMap = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Map data © USGS'
});
// Add the street map as the default base map
streetMap.addTo(map);

// Define overlay layers
const earthquakeLayer = new L.LayerGroup();
const tectonicPlateLayer = new L.LayerGroup();

// Fetch and add earthquake data
d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson').then(data => {
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
    }).addTo(earthquakeLayer);
});

// Fetch and add tectonic plate data
d3.json('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json').then(data => {
    L.geoJSON(data, {
        style: {
            color: 'orange',
            weight: 2
        }
    }).addTo(tectonicPlateLayer);
});

// Add both layers to the map
earthquakeLayer.addTo(map);
tectonicPlateLayer.addTo(map);

// Add layer controls
const baseMaps = {
    "Street Map": streetMap,
    "Satellite Map": satelliteMap,
    "ESRI Satellite Map": esriSatellite,
    "USGS Map": usgsTopoMap
};

const overlayMaps = {
    "Earthquakes": earthquakeLayer,
    "Tectonic Plates": tectonicPlateLayer
    
};

L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);

// Utility functions for styling
function getColor(depth) {
    return depth > 90 ? '#FF0000' :
        depth > 70 ? '#FF4500' :
        depth > 50 ? '#FF8C00' :
        depth > 30 ? '#FFD700' :
        depth > 10 ? '#ADFF2F' :
                        '#7FFF00';
}

function getSize(magnitude) {
    return magnitude ? magnitude * 4 : 2;
}

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
