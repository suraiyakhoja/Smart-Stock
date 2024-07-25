import React, { useEffect, useState } from 'react';
import '@tomtom-international/web-sdk-maps/dist/maps.css'; 
import tt from '@tomtom-international/web-sdk-maps'; 
import AddressModal from './AddressModal';
import {  Button, FormGroup, Input } from "reactstrap" 
import { Feature, LineString } from 'geojson';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { IoSearchSharp } from "react-icons/io5";
import { FaLocationDot } from "react-icons/fa6";
import { TbPlusMinus } from "react-icons/tb";


interface Coordinates {
  lat: number;
  lng: number;
}

/*
MAP FEATURE, suraiya 
Uses TomTOm API and SDK to display map. Includes markers and popups to show user/product locations and tracking. 
https://developer.tomtom.com/blog/build-different/adding-tomtom-maps-modern-react-app/
https://developer.tomtom.com/maps-sdk-web-js/tutorials/use-cases/how-add-and-customize-location-marker
*/
const MapFeature: React.FC = () => {
  // Set variables for changes on frontend
  const [map, setMap] = useState<tt.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<{ address: string, marker: tt.Marker, popup: tt.Popup }[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchOrder, setSearchOrder] = useState('');
  const [newLocation, setNewLocation] = useState('');

  /*
  GET ADDRESS
  Makes backend request to get address of user to display with marker when map is opened. 
  */
  useEffect(() => {
    const fetchUserAddress = async () => {
      try {
        const username = localStorage.getItem("username")
        const response = await fetch(`http://127.0.0.1:5000/map_get_address?username=${username}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'credentials': 'include',
          },
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Error: ${response.status} - ${errorMessage}`);
        }

        const { address } = await response.json();

        // TOMTOM API information to set up map. 
        const mapInstance = tt.map({
          key: 'P2UKHO4MG64AGnfS0vAHaUKtEY9mL7UG',
          container: 'map-container',
          center: {lat: 40.7128, lng: 74.0060},
          zoom: 18,
        });

        // Creates map with setup
        setMap(mapInstance);

        // API request to create markers to display addresses. 
        const addressResponse = await fetch(`https://api.tomtom.com/search/2/geocode/${encodeURIComponent(address)}.json?key=P2UKHO4MG64AGnfS0vAHaUKtEY9mL7UG`);
        const addressData = await addressResponse.json();
        const { lat, lon } = addressData.results[0].position;

        // Create marker with latitude and longitude of users address. 
        const marker = new tt.Marker()
          .setLngLat([lon, lat])
          .addTo(mapInstance);

        // Create popup showing users username. 
        const popup = new tt.Popup({ offset: 35 }).setHTML('<p>' + localStorage.getItem("username") + '</p>');
        marker.setPopup(popup);

        // Open map to users locations
        mapInstance.setCenter([lon, lat]);
      } catch (error) {
        console.error('Error fetching user address:', error);
        setError('Error fetching user address');
      }
    };

    fetchUserAddress();

    // Cleanup to remove map 
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  // Modals to update address/search products. 
  const handleOpenModal = () => {
    setModalVisible(true);
  };
  
  const handleCloseModal = () => {
    setModalVisible(false);
  };

  /*
  ADD ADDRESS
  In manage addresses, user can add addresses which will show markers on map. 
  */
  const handleAddAddress = async (newAddress: string) => {
    try {
      // Fetch geocode data for the new address
      const addressResponse = await fetch(`https://api.tomtom.com/search/2/geocode/${encodeURIComponent(newAddress)}.json?key=P2UKHO4MG64AGnfS0vAHaUKtEY9mL7UG`);
      const addressData = await addressResponse.json();
      const { lat, lon } = addressData.results[0].position;

      // Add marker with popup to the map
      if (map) {
        const marker = new tt.Marker()
          .setLngLat([lon, lat])
          .addTo(map);

        const popup = new tt.Popup({ offset: 35 }).setHTML(`<p>${newAddress}</p>`);
        marker.setPopup(popup);

        // Update addresses state
        setAddresses([...addresses, { address: newAddress, marker, popup }]);
      }
    } catch (error) {
      console.error('Error adding address:', error);
    }
  };

  /*
  DELETE ADDRESS,
  In manage addresses, user can delete addresses which will delete markers from map. 
  */
  const handleDeleteAddress = (index: number) => {
    // Remove marker and popup associated with the deleted address
    const addressData = [...addresses];
    const { marker, popup } = addressData[index];
    if (marker && popup) {
      marker.remove();
      popup.remove();

      // Update addresses state
      setAddresses(addresses.filter((_, i) => i !== index));
    }
  };

  /*
  HANDLE SEARCH
  User can search product by order number. Map will display route from purchase location to its current
  location. 
  */
  const handleSearch = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/search_product?query=${searchOrder}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { purchase_coords, current_coords } = data[0];
        if (map) {
          // Add markers for both locations
          const purchaseMarker = new tt.Marker()
            .setLngLat([purchase_coords.lng, purchase_coords.lat])
            .addTo(map);

          const currentMarker = new tt.Marker()
            .setLngLat([current_coords.lng, current_coords.lat])
            .addTo(map);

          // Set addresses in manage addresses. 
          setAddresses([
            { address: 'Purchase Location', marker: purchaseMarker, popup: new tt.Popup().setHTML('<p>' + 'Purchased Location' + '</p>') },
            { address: 'Current Location', marker: currentMarker, popup: new tt.Popup().setHTML('<p>' + 'Current Location' + '</p>') }
          ]);

          // Draws route from purchase address to current address. 
          drawRoute(purchase_coords, current_coords);
        }
          
      } else {
        console.error('No data found for the search query.');
      }

    } catch (error) {
      console.error('Error searching products: ', error);
    }
  };

  /*
  FETCH PRODUCT LOCATION, currently not using
  Trying to implement tracking. 
  */
  const fetchProductLocation = async (productId: number) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/get_product_locations?productId={productId}');
      const data = await response.json();
      const purchaseCoords: Coordinates = data.purchase_address;
      const currentCoords: Coordinates = data.current_location;
      drawRoute(purchaseCoords, currentCoords);
    } catch (error) {
      console.error('Failed to fetch product locations', error);
    }
  };

  /*
  DRAW ROUTE
  API request to calculate route between two locations.
  Given the purchase address and current address calculates a route between origin and destination using TomTom Routing API. 
  Adds new line layer showing route. 
  */
  const drawRoute = (origin: Coordinates, destination: Coordinates) => {
    const routeURL = `https://api.tomtom.com/routing/1/calculateRoute/${origin.lat},${origin.lng}:${destination.lat},${destination.lng}/json?key=P2UKHO4MG64AGnfS0vAHaUKtEY9mL7UG`;
    
    fetch(routeURL)
      .then(response => response.json())
      .then(data => {
        const points = data.routes[0].legs[0].points;
        
        const geoJson: Feature<LineString> = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: points.map((point: { latitude: number; longitude: number }) => [point.longitude, point.latitude])
          }
        };
  
        // Mapbox GL JS library to display route. 
        // If source exists, it is updated with new route data. If it does not exist, a new source with data from TT API is added. 
        if (map) {
          if (map.getSource('route')) {
            const source = map.getSource('route') as mapboxgl.GeoJSONSource;
            source.setData(geoJson);
          } else {
            map.addSource('route', {
              type: 'geojson',
              data: geoJson
            });
  
            // Adds line layer on top of source to draw route between two coordinates. 
            map.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#FF0000',
                'line-width': 5
              }
            });
          }
        }
      })
      .catch(error => console.error('Error fetching the route:', error));
  };
  
  

  /*
  UPDATE LOCATION
  To show product movement, update location feature added. It updates current location of products in database. 
  */
  const handleUpdateLocation = async () => {
    //const product_id = 16;
    //const new_location = "695 Park Avenue, New York, NY 10065";

    try {
      // Backend request to update current location. Sends order number and new location. 
      const response = await fetch('http://127.0.0.1:5000/update_location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          searchOrder: searchOrder,
          //product_id: product_id,
          newLocation: newLocation
        })
      });

      const data = await response.json();
      if (response.ok) {
        alert('Location updated successfully!');
      } else {
        alert('Failed to update location: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating location:', error);
      alert('Error updating location');
    }  
  };



  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      <Popup
        trigger={<Button className="rounded-circle" style={{ backgroundColor: '#C70039', position: 'absolute', top: '20px', left: '20px', zIndex: 1000 }}><FaLocationDot />
        </Button>}
        modal
        nested
      >
        <div>
          {/*<button className="close">&times;</button>*/}
          <div>Update Location:</div>
          <input
            type="text"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            placeholder="Enter new address"
          />
          <button onClick={() => { handleUpdateLocation(); }}>Submit</button>
        </div>
      </Popup>

      <Popup
        trigger={<Button className="rounded-circle" style={{ backgroundColor: '#1F51FF', position: 'absolute', top: '20px', left: '70px', zIndex: 1000 }}><IoSearchSharp />

        </Button>}
        modal
        nested
      >
        <div>
          <div>Search Order</div>
          <input
            type="text"
            value={searchOrder}
            onChange={(e) => setSearchOrder(e.target.value)}
            placeholder = "Order number"
          />
          <button onClick={() => {handleSearch(); }}>Search</button>
        </div>
      </Popup>
  
            <Button className="rounded-circle"
            onClick={handleOpenModal}
            style = {{
              backgroundColor: '#2E8B57',
              position:'absolute',
              top: '20px',
              right: '20px',
              zIndex: 1000,
            }}><TbPlusMinus />
            </Button>
       
      {modalVisible && (
        <AddressModal
          addresses={addresses.map(data => data.address)}
          onAddAddress={handleAddAddress}
          onDeleteAddress={handleDeleteAddress}
          onClose={handleCloseModal}
        />
      )}
      {error ? (
        <div>{error}</div>
      ) : (
        <div id="map-container" style={{ height: '100%' }}></div>
      )}
    </div>
  );
};

export default MapFeature;
