import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, SafeAreaView } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import MapView, { Marker } from 'react-native-maps';

const App = () => {
  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' veya 'map'
  const apiKey = 'AIzaSyDU2d1TOQo_JdF52r40OOjcvB8-2LzwweA';

  useEffect(() => {
    // Kullanıcının konumunu almak
    Geolocation.getCurrentPosition(
      (position) => {
        setLocation(position.coords);
      },
      (error) => {
        console.error(error);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  }, []);

  const fetchPlacesByName = async (latitude, longitude, name) => {
    const radius = 1500; // 1500 metre
    const types = 'restaurant|cafe|bar|food'; // Arama türleri

    let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&rankby=distance&type=${types}&key=${apiKey}`;
    if (name) {
      url += `&name=${name}`;
    }
    try {
      const response = await fetch(url);
      const result = await response.json();
      console.log(result.results.length);
      setPlaces(result.results);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = () => {
    if (location) {
      fetchPlacesByName(location.latitude, location.longitude, searchTerm);
    }
  };

  const handlePlaceSelect = async (placeId) => {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`;
    try {
      const response = await fetch(url);
      const result = await response.json();
      // Detaylı bilgileri işleme ve görüntüleme
      const detail = JSON.stringify(result.result, null, 2);
      console.log(detail);
      alert(detail);

    } catch (error) {
      console.error(error);
    }
  };

  const renderList = () => (
    <View style={{ flex: 1 }}>
      {places.map((place) => (
        <TouchableOpacity key={place.place_id}
          onPress={() => handlePlaceSelect(place.place_id)}
          style={{ margin: 10, height: 100, backgroundColor: 'white' }}>
          <Text>{place.name}</Text>
          <Text>{place.vicinity}</Text>
        </TouchableOpacity>
      ))}
      {!places.length && location && <Text>Aramanıza uygun işletme bulunamadı.</Text>}
    </View>
  );

  const renderMap = () => (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    >
      {places.map((place) => (
        <Marker
          key={place.place_id}
          coordinate={{
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
          }}
          title={place.name}
          onPress={() => handlePlaceSelect(place.place_id)}
        />
      ))}
    </MapView>
  );

  return (
    <SafeAreaView style={{ flex: 1, padding: 10 }}>
      <TextInput
        placeholder="İşletme adı girin"
        value={searchTerm}
        onChangeText={setSearchTerm}
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginVertical: 10, paddingHorizontal: 10 }}
      />
      <Button title="Ara" onPress={handleSearch} />

      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
        <Button title="Liste" onPress={() => setViewMode('list')} />
        <Button title="Harita" onPress={() => setViewMode('map')} />
      </View>

      {location && (viewMode === 'list' ? renderList() : renderMap())}
    </SafeAreaView>
  );
};

export default App;