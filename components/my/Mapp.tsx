import { AppleMaps, GoogleMaps } from "expo-maps";
import { useState } from "react";
import { Platform, StyleSheet, Text, TextInput, View } from "react-native";

type Coordinates = {
  latitude: number;
  longitude: number;
};
type ExpoMapClickEvent = {
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
};

export default function Mapp() {
  const [address, setAddress] = useState<string>("");
  const [marker, setMarker] = useState<Coordinates | null>(null);

  //when user click, from coords to address
  const getAddressFromCoords = async (coords: Coordinates): Promise<void> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
      );
      if (!res.ok) {
        throw new Error("Errore nel fetch per ottenere indirizzo");
      }

      const data = await res.json();
      if (!data.display_name) {
        setAddress(`${coords.latitude} - ${coords.longitude}`);
      } else {
        setAddress(data.display_name);
      }
    } catch (error) {
      setAddress(`${coords.latitude} - ${coords.longitude}`);
      console.error(error);
    }
  };

  const onMapPress = (event: ExpoMapClickEvent) => {
    const coords = event.coordinates;
    if (!coords?.latitude || !coords?.longitude) return;

    const position = { latitude: coords.latitude, longitude: coords.longitude };
    setMarker(position);
    getAddressFromCoords(position);
  };

  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    return <Text>Maps are only available on Android and iOS</Text>;
  }

  const MapComponent =
    Platform.OS === "android" ? GoogleMaps.View : AppleMaps.View;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Cerca un indirizzo"
        placeholderTextColor="black"
        value={address}
        onChangeText={setAddress}
        returnKeyType="search"
      />

      <MapComponent
        style={styles.map}
        cameraPosition={{
          coordinates: { latitude: 40.9236, longitude: 9.4964 },
          zoom: 14,
        }}
        onMapClick={onMapPress}
        markers={
          marker
            ? [
                {
                  coordinates: {
                    latitude: marker.latitude,
                    longitude: marker.longitude,
                  },
                },
              ]
            : []
        }
      ></MapComponent>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  map: {
    flex: 1,
  },
});
