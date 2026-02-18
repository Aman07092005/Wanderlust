const redIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [35, 35],
    iconAnchor: [20, 30],
});

const map = L.map("map").setView([coordinates[1],coordinates[0]], 11);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    Zoom: 9,
    attribution: "© OpenStreetMap"
    }).addTo(map);
    L.marker([coordinates[1],coordinates[0]],{ icon: redIcon })
    .addTo(map)
    .openPopup();