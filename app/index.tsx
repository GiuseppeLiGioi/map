import Map from "@/components/my/Map";
import { StyleSheet } from "react-native";
export default function HomeScreen() {
  return (
    /*
    <Mapp
      placeholder="Ricerca un indirizzo..."
      placeholderColor="black"
      defaultPosition={{
        coordinates: { latitude: 40.9236, longitude: 9.4964 },
        zoom: 14,
      }}
      //style
    />*/

    <Map
      defaultPosition={{
        latitude: 40.9236,
        longitude: 9.4964,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
      placeholder="Cerca un indirizzo"
      placeholderColor="black"
      //style
    />
  );
}

const styles = StyleSheet.create({});
