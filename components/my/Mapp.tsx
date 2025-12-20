import { AppleMaps, GoogleMaps } from "expo-maps";
import { useState } from "react";
import {
  Alert,
  Button,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";

type MappProps = {
  placeholder: string;
  placeholderColor: string;
  style?: StyleProp<ViewStyle>;
  defaultPosition: {
    coordinates: { latitude: number; longitude: number };
    zoom: number;
  };
};
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

export default function Mapp({
  placeholder,
  placeholderColor,
  style,
  defaultPosition,
}: MappProps) {
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

  const searchAddress = async (): Promise<void> => {
    if (!address) return; //if there isn't address return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}`
      );

      if (!res.ok) throw new Error("Errore nel fetch con indirizzo");

      const data = await res.json();

      if (!data.length) {
        Alert.alert("Attenzione", "Indirizzo non trovato");
        return;
      }

      const coords: Coordinates = {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };

      setMarker(coords);
    } catch (error) {
      console.error(error);
      Alert.alert("Errore durante la ricerca");
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
    <View style={[styles.container, style]}>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          value={address}
          onChangeText={setAddress}
          onSubmitEditing={searchAddress}
          returnKeyType="search"
        />
        <Button title="Clear" onPress={() => setAddress("")} />
      </View>
      <MapComponent
        style={styles.map}
        cameraPosition={defaultPosition}
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
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
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
