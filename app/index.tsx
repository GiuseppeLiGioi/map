import Mapp from "@/components/my/Mapp";
import { StyleSheet } from "react-native";
export default function HomeScreen() {
  return (
    <Mapp
      placeholder="Ricerca un indirizzo..."
      placeholderColor="black"
      defaultPosition={{
        coordinates: { latitude: 40.9236, longitude: 9.4964 },
        zoom: 14,
      }}
    />
  );
}

const styles = StyleSheet.create({});
