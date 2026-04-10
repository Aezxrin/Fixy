import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
// For web preview compatibility
const MapComponent = Platform.OS === 'web' ? View : MapView;
const MarkerComponent = Platform.OS === 'web' ? View : Marker;
import * as Location from 'expo-location';
import { Plus } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

/**
 * HomeScreen Component for "Fixy" Repair Service App
 * Features:
 * - Location permissions and live map centering
 * - Custom Header with Mongolian greeting
 * - Floating Action Button (FAB) for new service calls
 */
const HomeScreen: React.FC = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [region, setRegion] = useState<Region | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Request foreground location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          setErrorMsg('Байршил тогтоох эрх олгогдсонгүй!');
          setIsLoading(false);
          return;
        }

        // Fetch current position
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        setLocation(currentLocation);
        
        // Set initial region for the map
        setRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching location:', error);
        setErrorMsg('Байршил тогтооход алдаа гарлаа.');
        setIsLoading(false);
      }
    })();
  }, []);

  const handleCreateRequest = () => {
  router.push('/create-request');
};

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Сайн байна уу, Батаа! 👋</Text>
        <Text style={styles.subtitle}>Танд ямар тусламж хэрэгтэй вэ?</Text>
      </View>

      {/* Main Map View */}
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
          >
            {location && (
              <MarkerComponent
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                title="Таны байршил"
                description="Та энд байна"
              />
            )}
            {Platform.OS === 'web' && (
              <View style={styles.webMapPlaceholder}>
                <Text style={styles.webMapText}>
                  [ MapView is active on Mobile ]{"\n"}
                  Location: {location?.coords.latitude.toFixed(4)}, {location?.coords.longitude.toFixed(4)}
                </Text>
              </View>
            )}
          </MapComponent>
        )}
      </View>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateRequest}
        activeOpacity={0.8}
      >
        <Plus color="#fff" size={24} strokeWidth={3} />
        <Text style={styles.fabText}>Шинэ дуудлага хийх</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    // Elevation for Android
    elevation: 2,
    zIndex: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#334155', // Dark slate
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b', // Gray
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: width,
    height: '100%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981', // Emerald Green
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    // Shadow for iOS
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    // Elevation for Android
    elevation: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  webMapPlaceholder: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  webMapText: {
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default HomeScreen;
