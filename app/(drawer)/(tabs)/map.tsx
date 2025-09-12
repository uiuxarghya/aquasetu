import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";

const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";
const GEOJSON_URL = process.env.EXPO_PUBLIC_GEOJSON_URL ?? "";

export default function MapScreen() {
  const router = useRouter();
  const [latitude, setLatitude] = useState<number>(78);
  const [longitude, setLongitude] = useState<number>(22);
  const [accuracy, setAccuracy] = useState<number>(0);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest, // fine-grained accuracy
      });

      // console.log("Latitude:", location.coords.latitude);
      // console.log("Longitude:", location.coords.longitude);
      // console.log("Accuracy:", location.coords.accuracy, "meters");

      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
      if (
        location.coords.accuracy !== null &&
        location.coords.accuracy !== undefined
      ) {
        setAccuracy(location.coords.accuracy);
      }
    })();
  }, []);

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
  <meta charset="utf-8">
  <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no">
  <link href="https://api.mapbox.com/mapbox-gl-js/v3.14.0/mapbox-gl.css" rel="stylesheet">
  <script src="https://api.mapbox.com/mapbox-gl-js/v3.14.0/mapbox-gl.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      height: 100vh !important;
      width: 100vw !important;
      font-family: sans-serif;
      overflow: hidden !important;
    }
    #map {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100% !important;
      height: 100% !important;
    }
    #search-container {
      position: absolute;
      top: max(24px, env(safe-area-inset-top, 24px) + 14px);
      left: 50%;
      transform: translateX(-50%);
      z-index: 1001;
      width: min(85%, 380px);
      margin: 0 auto;
      padding: 0 16px;
      box-sizing: border-box;
    }
    #search-box {
      width: 100%;
      padding: 12px 16px;
      font-size: 16px;
      border-radius: 25px;
      border: 2px solid rgba(0, 0, 0, 0.1);
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      outline: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-weight: 400;
    }
    #search-box:focus {
      border-color: #0074D9;
      box-shadow: 0 0 0 3px rgba(0, 116, 217, 0.15), 0 4px 25px rgba(0, 0, 0, 0.15);
      background: rgba(255, 255, 255, 0.98);
    }
    #search-box::placeholder {
      color: #9ca3af;
      font-weight: 400;
    }
    #autocomplete-list {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      right: 0;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px);
      border-radius: 16px;
      border: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      max-height: 240px;
      overflow-y: auto;
      z-index: 1002;
      display: none;
      margin-top: 4px;
    }
    .autocomplete-item {
      padding: 14px 18px;
      cursor: pointer;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .autocomplete-item:hover {
      background-color: rgba(0, 116, 217, 0.08);
      transform: translateX(2px);
    }
    .autocomplete-item:last-child {
      border-bottom: none;
    }
    .station-name {
      font-weight: 600;
      color: #1f2937;
      font-size: 15px;
      line-height: 1.2;
    }
    .station-location {
      font-size: 13px;
      color: #6b7280;
      font-weight: 400;
    }
    .mapboxgl-ctrl-geolocate {
      background: rgba(255, 255, 255, 0.9) !important;
      border: 1px solid rgba(0, 0, 0, 0.1) !important;
      border-radius: 4px !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
      transition: all 0.2s ease !important;
    }
    .mapboxgl-ctrl-geolocate:hover {
      background: rgba(255, 255, 255, 0.95) !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
    }
    .mapboxgl-ctrl-geolocate .mapboxgl-ctrl-icon {
      font-size: 18px !important;
      line-height: 1 !important;
    }
    .user-location-marker {
      background: rgba(0, 116, 217, 0.9);
      border: 2px solid white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      animation: pulse 2s infinite;
    }
    .mapboxgl-ctrl-geolocate:disabled {
      opacity: 0.6 !important;
      cursor: not-allowed !important;
    }
    .mapboxgl-ctrl-geolocate.loading {
      animation: spin 1s linear infinite !important;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Map Controls Styling */
    .mapboxgl-ctrl {
      font-family: inherit !important;
    }
    .mapboxgl-ctrl-group {
      border-radius: 8px !important;
      overflow: hidden !important;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
    }
    .mapboxgl-ctrl-group button {
      width: 36px !important;
      height: 36px !important;
      background: rgba(255, 255, 255, 0.9) !important;
      border: none !important;
      border-right: 1px solid rgba(0, 0, 0, 0.1) !important;
      transition: all 0.2s ease !important;
    }
    .mapboxgl-ctrl-group button:hover {
      background: rgba(255, 255, 255, 0.95) !important;
    }
    .mapboxgl-ctrl-group button:last-child {
      border-right: none !important;
    }
    .mapboxgl-ctrl-group .mapboxgl-ctrl-icon {
      font-size: 16px !important;
      line-height: 1 !important;
    }

    /* Bottom-right positioning */
    .mapboxgl-ctrl-bottom-right {
      bottom: 24px !important;
      right: 16px !important;
    }

    @media (max-width: 480px) {
      #search-container {
        width: 90%;
        max-width: 350px;
      }
      #search-box {
        font-size: 16px; /* Prevents zoom on iOS */
        padding: 14px 18px;
      }
      #autocomplete-list {
        max-height: 200px;
      }
      .autocomplete-item {
        padding: 16px 20px;
      }
      .mapboxgl-ctrl-bottom-right {
        bottom: 16px !important;
        right: 12px !important;
      }
      .mapboxgl-ctrl-group button {
        width: 32px !important;
        height: 32px !important;
      }
    }

    @media (max-width: 360px) {
      #search-container {
        width: 95%;
        max-width: 320px;
      }
      .mapboxgl-ctrl-bottom-right {
        bottom: 12px !important;
        right: 8px !important;
      }
    }
    .popup-button {
      display: inline-block;
      margin-top: 5px;
      padding: 4px 8px;
      background: #0074D9;
      color: #fff;
      text-decoration: none;
      border-radius: 4px;
      font-size: 12px;
    }
  </style>
  </head>
  <body>
  <div id="search-container">
    <input type="text" id="search-box" placeholder="Search for station..." autocomplete="off" />
    <div id="autocomplete-list"></div>
  </div>
  <div id="map"></div>
  <script>
    // Check if Mapbox token is available
    if (!'${MAPBOX_ACCESS_TOKEN}') {
      document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;"><div style="text-align:center;"><h2>Mapbox Configuration Error</h2><p>Please add EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN to your .env file</p></div></div>';
    } else {
      mapboxgl.accessToken = '${MAPBOX_ACCESS_TOKEN}';

      try {
        const map = new mapboxgl.Map({
          container: 'map',
          style: 'mapbox://styles/mapbox/standard',
          center: [78, 22],
          zoom: 5
        });

        // Add navigation control to bottom-right
        map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

        // Custom Geolocation Control
        class GeolocationControl {
          onAdd(map) {
            this.map = map;
            this.container = document.createElement('div');
            this.container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';

            const button = document.createElement('button');
            button.className = 'mapboxgl-ctrl-geolocate';
            button.type = 'button';
            button.title = 'Find my location';
            button.innerHTML = '<span class="mapboxgl-ctrl-icon" aria-hidden="true" title="Find my location">📍</span>';

            // Check geolocation availability on button creation
            const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
            const isDevelopment = location.protocol === 'http:' && (isLocalhost || location.hostname.includes('.local'));
            const geolocationAllowed = isLocalhost || isDevelopment || location.protocol === 'https:';

            if (!geolocationAllowed) {
              button.title = 'Geolocation requires HTTPS (use localhost for development)';
              button.style.opacity = '0.5';
            } else if (!navigator.geolocation) {
              button.title = 'Geolocation not supported by this browser';
              button.style.opacity = '0.5';
              button.disabled = true;
            }

            button.addEventListener('click', () => {
              if (navigator.geolocation) {
                button.innerHTML = '<span class="mapboxgl-ctrl-icon" aria-hidden="true">⏳</span>';
                button.disabled = true;

                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const { latitude, longitude, accuracy } = position.coords;

                    // Remove any existing user location markers
                    document.querySelectorAll('.user-location-marker').forEach(marker => {
                      marker.remove();
                    });

                    map.flyTo({
                      center: [longitude, latitude],
                      zoom: Math.max(12, Math.min(16, 18 - Math.log2(accuracy / 10))),
                      essential: true
                    });

                    // Add user location marker with accuracy circle
                    const userLocation = document.createElement('div');
                    userLocation.className = 'user-location-marker';
                    userLocation.innerHTML = '📍';
                    userLocation.title = 'Accuracy: ' + Math.round(accuracy) + 'm';

                    const marker = new mapboxgl.Marker(userLocation)
                      .setLngLat([longitude, latitude])
                      .addTo(map);

                    // Add accuracy circle
                    if (accuracy < 1000) { // Only show if accuracy is reasonable
                      map.addSource('user-accuracy', {
                        type: 'geojson',
                        data: {
                          type: 'Feature',
                          geometry: {
                            type: 'Point',
                            coordinates: [longitude, latitude]
                          }
                        }
                      });

                      map.addLayer({
                        id: 'user-accuracy-circle',
                        type: 'circle',
                        source: 'user-accuracy',
                        paint: {
                          'circle-radius': accuracy / 10, // Scale for visibility
                          'circle-color': 'rgba(0, 116, 217, 0.2)',
                          'circle-stroke-color': 'rgba(0, 116, 217, 0.5)',
                          'circle-stroke-width': 1
                        }
                      });
                    }

                    button.innerHTML = '<span class="mapboxgl-ctrl-icon" aria-hidden="true" title="Find my location">📍</span>';
                    button.disabled = false;
                  },
                  (error) => {
                    console.error('Geolocation error:', error);
                    let errorMessage = 'Unable to get your location. ';

                    switch(error.code) {
                      case error.PERMISSION_DENIED:
                        errorMessage += 'Please enable location permissions in your browser settings and refresh the page.';
                        break;
                      case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Location information is unavailable. Please check your GPS settings.';
                        break;
                      case error.TIMEOUT:
                        errorMessage += 'Location request timed out. Please try again.';
                        break;
                      default:
                        errorMessage += 'Please check your browser permissions and try again.';
                        break;
                    }

                    //alert(errorMessage);

                    const map_latitude = ${latitude}
                    const map_longitude = ${longitude}
                    const map_accuracy = ${accuracy}

                    // Remove any existing user location markers
                      document
                        .querySelectorAll(".user-location-marker")
                        .forEach((marker) => {
                          marker.remove();
                        });
                    
                        
                    map.flyTo({
                        center: [map_longitude, map_latitude],
                        zoom: Math.max(
                          12,
                          Math.min(16, 18 - Math.log2(map_accuracy / 10))
                        ),
                        essential: true,
                      });
                    
                    const userLocation = document.createElement("div");
                      userLocation.className = "user-location-marker";
                      userLocation.innerHTML = "📍";
                      userLocation.title =
                        "Accuracy: " + Math.round(map_accuracy) + "m";

                    const marker = new mapboxgl.Marker(userLocation)
                        .setLngLat([map_longitude, map_latitude])
                        .addTo(map);
                    
                    // Add accuracy circle
                    if (map_accuracy < 1000) {
                      // Only show if accuracy is reasonable
                      map.addSource("user-accuracy", {
                        type: "geojson",
                        data: {
                          type: "Feature",
                          geometry: {
                            type: "Point",
                            coordinates: [map_longitude, map_latitude],
                          },
                        },
                      });

                     map.addLayer({
                          id: "user-accuracy-circle",
                          type: "circle",
                          source: "user-accuracy",
                          paint: {
                            "circle-radius": accuracy / 10, // Scale for visibility
                            "circle-color": "rgba(0, 116, 217, 0.2)",
                            "circle-stroke-color": "rgba(0, 116, 217, 0.5)",
                            "circle-stroke-width": 1,
                          },
                        });
                      }

                    button.innerHTML = '<span class="mapboxgl-ctrl-icon" aria-hidden="true" title="Find my location">📍</span>';
                    button.disabled = false;
                  },
                  {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 300000
                  }
                );
              } else {
                alert('Geolocation is not supported by this browser. Please use a modern browser with location services enabled.');
              }

              // Development helper
              if (isLocalhost || isDevelopment) {
                console.log('✅ Geolocation allowed for development environment');
              }
            });

            this.container.appendChild(button);
            return this.container;
          }

          onRemove() {
            this.container.parentNode.removeChild(this.container);
            this.map = undefined;
          }
        }

        // Add geolocation control to bottom-right
        map.addControl(new GeolocationControl(), 'bottom-right');

        let stationsData = null;

        // Add loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading';
        loadingDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1000;background:rgba(255,255,255,0.95);padding:20px 30px;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.15);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.2);text-align:center;font-family:sans-serif;';
        loadingDiv.innerHTML = '<p style="margin:0;color:#333;">Loading groundwater stations...</p>';
        document.body.appendChild(loadingDiv);

        fetch('${GEOJSON_URL}')
          .then(res => {
            if (!res.ok) throw new Error('Failed to fetch GeoJSON data');
            return res.json();
          })
          .then(geojson => {
            stationsData = geojson;

            map.addSource('stations', { type: 'geojson', data: geojson });

            map.addLayer({
              id: 'points',
              type: 'circle',
              source: 'stations',
              paint: {
                'circle-radius': 6,
                'circle-color': '#11b4da',
                'circle-stroke-width': 1,
                'circle-stroke-color': '#fff'
              }
            });

            // Remove loading indicator with fade out
            const loading = document.getElementById('loading');
            if (loading) {
              loading.style.transition = 'opacity 0.5s ease-out';
              loading.style.opacity = '0';
              setTimeout(() => {
                if (loading.parentNode) {
                  loading.parentNode.removeChild(loading);
                }
              }, 500);
            }

            map.on('click', 'points', (e) => {
              const coordinates = e.features[0].geometry.coordinates.slice();
              const props = e.features[0].properties;

              while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
              }

              if (props.station_code) {
                new mapboxgl.Popup()
                  .setLngLat(coordinates)
                  .setHTML(
                    '<h3>' + (props.station_name || 'Station') + '</h3>' +
                    '<p>' + (props.district__name || '') + ', ' + (props.state_name || '') + '</p>' +
                    '<p>Lat: ' + coordinates[1].toFixed(4) + ', Lng: ' + coordinates[0].toFixed(4) + '</p>' +
                    '<a class="popup-button" href="https://webview/' + props.station_code + '">View Details</a>'
                  )
                  .addTo(map);
              }
            });

            map.on('mouseenter', 'points', () => map.getCanvas().style.cursor = 'pointer');
            map.on('mouseleave', 'points', () => map.getCanvas().style.cursor = '');
          })
          .catch(err => {
            console.error('Failed to load GeoJSON', err);
            const loading = document.getElementById('loading');
            if (loading) {
              loading.innerHTML = '<p style="color:red;">Error loading map data. Please check your internet connection.</p>';
            }
          });

        // Enhanced Search functionality with autocomplete
        const searchBox = document.getElementById('search-box');
        const autocompleteList = document.getElementById('autocomplete-list');
        let selectedIndex = -1;
        let debounceTimer;

        // Development helper for geolocation debugging
        console.log('🌍 Map Environment Info:', {
          protocol: location.protocol,
          hostname: location.hostname,
          port: location.port,
          geolocation: !!navigator.geolocation,
          https: location.protocol === 'https:',
          localhost: location.hostname === 'localhost' || location.hostname === '127.0.0.1'
        });

        // Debounce function to limit API calls
        function debounce(func, wait) {
          return function executedFunction(...args) {
            const later = () => {
              clearTimeout(debounceTimer);
              func(...args);
            };
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(later, wait);
          };
        }

        // Function to show autocomplete suggestions
        function showSuggestions(query) {
          if (!stationsData || query.length < 2) {
            autocompleteList.style.display = 'none';
            return;
          }

          const matches = stationsData.features
            .filter(f => {
              const stationName = (f.properties.station_name || '').toLowerCase();
              const districtName = (f.properties.district__name || '').toLowerCase();
              const stateName = (f.properties.state_name || '').toLowerCase();
              const searchTerm = query.toLowerCase();

              return stationName.includes(searchTerm) ||
                     districtName.includes(searchTerm) ||
                     stateName.includes(searchTerm);
            })
            .slice(0, 6); // Limit to 6 suggestions

          if (matches.length === 0) {
            autocompleteList.innerHTML = '<div class="no-results">No stations found</div>';
            autocompleteList.style.display = 'block';
            return;
          }

          const suggestionsHtml = matches.map((match, index) => {
            const props = match.properties;
            const stationName = props.station_name || 'Unknown Station';
            const districtName = props.district__name || '';
            const stateName = props.state_name || '';
            const stationData = JSON.stringify(match).replace(/"/g, '&quot;');

            return '<div class="autocomplete-item" data-index="' + index + '" data-station="' + stationData + '">' +
                   '<div class="station-name">' + stationName + '</div>' +
                   '<div class="station-location">' + districtName + ', ' + stateName + '</div>' +
                   '</div>';
          }).join('');

          autocompleteList.innerHTML = suggestionsHtml;
          autocompleteList.style.display = 'block';
          selectedIndex = -1;
        }

        // Function to hide suggestions
        function hideSuggestions() {
          setTimeout(() => {
            autocompleteList.style.display = 'none';
          }, 150);
        }

        // Function to select a suggestion
        function selectSuggestion(station) {
          const props = station.properties;
          const coordinates = station.geometry.coordinates;

          // Fly to the station
          map.flyTo({ center: coordinates, zoom: 12 });

          // Show popup
          if (props.station_code) {
            new mapboxgl.Popup()
              .setLngLat(coordinates)
              .setHTML(
                '<h3>' + (props.station_name || 'Station') + '</h3>' +
                '<p>' + (props.district__name || '') + ', ' + (props.state_name || '') + '</p>' +
                '<p>Lat: ' + coordinates[1].toFixed(4) + ', Lng: ' + coordinates[0].toFixed(4) + '</p>' +
                '<a class="popup-button" href="https://webview/' + props.station_code + '">View Details</a>'
              )
              .addTo(map);
          }

          // Clear search and hide suggestions
          searchBox.value = '';
          hideSuggestions();
        }

        // Search box event listeners
        searchBox.addEventListener('input', debounce((e) => {
          const query = e.target.value;
          showSuggestions(query);
        }, 300));

        searchBox.addEventListener('keydown', (e) => {
          const items = autocompleteList.querySelectorAll('.autocomplete-item');

          if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateSelection(items);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelection(items);
          } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && items[selectedIndex]) {
              const stationData = JSON.parse(items[selectedIndex].getAttribute('data-station'));
              selectSuggestion(stationData);
            }
          } else if (e.key === 'Escape') {
            hideSuggestions();
            selectedIndex = -1;
          }
        });

        searchBox.addEventListener('blur', hideSuggestions);

        // Function to update visual selection
        function updateSelection(items) {
          items.forEach((item, index) => {
            if (index === selectedIndex) {
              item.style.backgroundColor = 'rgba(0, 116, 217, 0.2)';
            } else {
              item.style.backgroundColor = '';
            }
          });
        }

        // Autocomplete item click handlers
        autocompleteList.addEventListener('click', (e) => {
          const item = e.target.closest('.autocomplete-item');
          if (item) {
            const stationData = JSON.parse(item.getAttribute('data-station'));
            selectSuggestion(stationData);
          }
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
          if (!searchBox.contains(e.target) && !autocompleteList.contains(e.target)) {
            hideSuggestions();
          }
        });
      } catch (error) {
        console.error('Map initialization error:', error);
        document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;"><div style="text-align:center;"><h2>Map Loading Error</h2><p>Please check your Mapbox configuration</p></div></div>';
      }
    }
  </script>
  </body>
  </html>
  `;

  return (
    <View className="flex-1 bg-background mb-14">
      <WebView
        source={{ html }}
        originWhitelist={["*"]}
        style={{
          flex: 1,
          marginTop: 0,
          marginBottom: 0,
          paddingTop: 0,
          paddingBottom: 0,
        }}
        javaScriptEnabled
        domStorageEnabled
        onShouldStartLoadWithRequest={(request) => {
          const { url } = request;

          // Intercept "webview" links
          if (url.startsWith("https://webview/")) {
            const stationCode = url.split("/").pop();
            if (stationCode) router.push(`/station/${stationCode}`);
            return false; // Prevent WebView from actually loading
          }

          return true; // Allow other links
        }}
        className="flex-1 m-0 p-0"
      />
    </View>
  );
}
