import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Plus } from 'lucide-react-native';

const MapComponent = Platform.OS === 'web' ? View : MapView;
const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [region, setRegion] = useState<Region | null>(null);

  // 1. Хэрэглэгчийн өөрийнх нь байршлыг олох
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Байршил тогтоох эрх олгогдсонгүй!');
          setIsLoading(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(currentLocation);
        
        setRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.05, // Газрын зургийг арай өргөн харуулна
          longitudeDelta: 0.05,
        });
        setIsLoading(false);
      } catch (error) {
        setErrorMsg('Байршил тогтооход алдаа гарлаа.');
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header хэсэг */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Сайн байна уу! 👋</Text>
        <Text style={styles.subtitle}>Танд ямар тусламж хэрэгтэй вэ?</Text>
      </View>

      <View style={styles.mapContainer}>
        {errorMsg ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : (
          <MapComponent
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={region || undefined}
            showsUserLocation={true}
            showsMyLocationButton={true}
            // Зөвхөн хэрэглэгчийн байршил харагдах бөгөөд засварчдын Marker-уудыг устгасан
          />
        )}
      </View>

      {/* Үндсэн FAB товч */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/create-request')}
        activeOpacity={0.8}
      >
        <Plus color="#fff" size={24} strokeWidth={3} />
        <Text style={styles.fabText}>Дуудлага өгөх</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff', borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9', zIndex: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05,
  },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#334155', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#64748b' },
  mapContainer: { flex: 1 },
  map: { width: width, height: '100%' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: '#ef4444', fontSize: 16, textAlign: 'center', fontWeight: '500' },
  
  // FAB Товч
  fab: {
    position: 'absolute', bottom: 30, alignSelf: 'center', flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#10b981', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 30,
    elevation: 8, shadowColor: '#10b981', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 10,
  },
  fabText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
});