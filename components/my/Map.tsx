import { useCallback, useState } from "react";
import {
  Alert,
  Button,
  StyleProp,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import MapView, {
  MapPressEvent,
  Marker,
  Region,
  UrlTile,
} from "react-native-maps";

type MapProps = {
  placeholder: string;
  placeholderColor: string;
  style?: StyleProp<ViewStyle>;
  defaultPosition: Region;
};
type Coordinates = {
  latitude: number;
  longitude: number;
};

//default region Olbia
const INITIAL_REGION: Region = {
  latitude: 40.9236,
  longitude: 9.4964,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};
export default function Map({
  placeholder,
  placeholderColor,
  style,
  defaultPosition,
}: MapProps) {
  const [region, setRegion] = useState<Region>(INITIAL_REGION);
  const [marker, setMarker] = useState<Coordinates | null>(null);
  const [address, setAddress] = useState<string>("");

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
      setRegion({
        ...coords,
        //lat/lng Delta is used to zoom in on the map
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Errore durante la ricerca");
    }
  };

  const onPressMap = useCallback((e: MapPressEvent) => {
    const coords = e.nativeEvent.coordinate;
    setMarker(coords);
    getAddressFromCoords(coords);
  }, []);

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

      <MapView
        style={styles.map}
        region={defaultPosition}
        onRegionChangeComplete={setRegion}
        onPress={onPressMap}
      >
        {/*This UrlTile displays the map using OpenStreetMap tiles.*/}
        <UrlTile
          urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
        />

        {marker && <Marker coordinate={marker} />}
      </MapView>
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
