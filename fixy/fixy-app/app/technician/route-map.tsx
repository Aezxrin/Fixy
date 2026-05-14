import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { ArrowLeft, Navigation, MapPin } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function RouteMapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mapRef = useRef<MapView>(null);
  
  // Үйлчлүүлэгчийн байршил
  const destination = {
    latitude: Number(params.destLat) || 49.4754, 
    longitude: Number(params.destLng) || 105.9545,
  };

  const [origin, setOrigin] = useState<any>(null);
  const [routeCoords, setRouteCoords] = useState<{latitude: number, longitude: number}[]>([]);
  const [distance, setDistance] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Засварчны байршлыг авах
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Байршил тогтоох эрх өгөгдсөнгүй!');
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });
        const currentLoc = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setOrigin(currentLoc);
        
        // Байршил олдмогц замыг тооцоолох
        fetchRoute(currentLoc, destination);
      } catch (error) {
        setErrorMsg('Байршил тогтооход алдаа гарлаа.');
      }
    })();
  }, []);

  // 2. 100% ҮНЭГҮЙ АРГА: OSRM ашиглан зам зурах координатыг татах
  const fetchRoute = async (startLoc: any, endLoc: any) => {
    try {
      // OSRM Public API (Уртраг, Өргөрөг гэсэн дарааллаар явуулна)
      const url = `http://router.project-osrm.org/route/v1/driving/${startLoc.longitude},${startLoc.latitude};${endLoc.longitude},${endLoc.latitude}?overview=full&geometries=geojson`;
      
      const response = await fetch(url);
      const json = await response.json();

      if (json.routes && json.routes.length > 0) {
        const route = json.routes[0];
        
        // GeoJSON координатуудыг React Native Maps-д тааруулж хөрвүүлэх
        const coords = route.geometry.coordinates.map((point: any) => ({
          latitude: point[1],
          longitude: point[0]
        }));

        setRouteCoords(coords);
        setDistance((route.distance / 1000).toFixed(1)); // Метрийг Километр болгох
        setDuration(Math.ceil(route.duration / 60)); // Секундыг Минут болгох

        // Газрын зургийг бүтэн зам харагдахаар голлуулах
        if (mapRef.current) {
          mapRef.current.fitToCoordinates(coords, {
            edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
            animated: true,
          });
        }
      }
    } catch (error) {
      console.log('Зам тооцоолоход алдаа гарлаа:', error);
    }
  };

  const handleArrived = () => {
    alert('Үйлчлүүлэгч дээр очлоо!');
    // router.push('/technician/start-job') гэх мэт дараагийн хуудас руу шилжинэ
  };

  if (errorMsg) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity style={styles.backBtnFallback} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Буцах</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!origin) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1a56ff" />
        <Text style={styles.loadingText}>Таны байршлыг тогтоож байна...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: origin.latitude,
          longitude: origin.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
      >
        <Marker coordinate={destination}>
          <View style={styles.destinationMarker}>
            <MapPin size={24} color="#fff" />
          </View>
        </Marker>

        {/* ШИНЭЧИЛСЭН: Үнэгүй цэнхэр зураас (Polyline) */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={5}
            strokeColor="#1a56ff"
          />
        )}
      </MapView>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={24} color="#0f172a" />
      </TouchableOpacity>

      <View style={styles.bottomSheet}>
        <View style={styles.sheetHeader}>
          <View style={styles.dragIndicator} />
        </View>
        
        <View style={styles.infoContainer}>
          <View style={styles.timeDistanceBox}>
            <Text style={styles.durationText}>
              {duration ? `${duration} мин` : 'Уншиж байна...'}
            </Text>
            <Text style={styles.distanceText}>
              {distance ? `${distance} км` : ''}
            </Text>
          </View>
          
          <View style={styles.customerInfoBox}>
            <View style={styles.iconCircle}>
              <Navigation size={20} color="#1a56ff" />
            </View>
            <View>
              <Text style={styles.customerLabel}>Очих хаяг</Text>
              <Text style={styles.customerAddress}>Үйлчлүүлэгчийн байршил руу...</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.arriveButton} onPress={handleArrived}>
          <Text style={styles.arriveButtonText}>Очсон</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  map: { width: width, height: height },
  
  loadingText: { marginTop: 12, fontSize: 16, color: '#64748b', fontWeight: '500' },
  errorText: { fontSize: 16, color: '#ef4444', marginBottom: 20 },
  backBtnFallback: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#f1f5f9', borderRadius: 8 },
  backBtnText: { fontWeight: 'bold', color: '#334155' },

  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: '#fff', padding: 12, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  destinationMarker: { backgroundColor: '#ef4444', padding: 8, borderRadius: 20, borderWidth: 3, borderColor: '#fff', shadowColor: '#ef4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },

  bottomSheet: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 12, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 20 },
  sheetHeader: { alignItems: 'center', marginBottom: 20 },
  dragIndicator: { width: 40, height: 5, backgroundColor: '#e2e8f0', borderRadius: 10 },
  
  infoContainer: { marginBottom: 24 },
  timeDistanceBox: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 16 },
  durationText: { fontSize: 32, fontWeight: '900', color: '#10b981' },
  distanceText: { fontSize: 16, fontWeight: '600', color: '#64748b' },
  
  customerInfoBox: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#f8fafc', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9' },
  iconCircle: { width: 48, height: 48, backgroundColor: '#eff6ff', borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  customerLabel: { fontSize: 13, color: '#64748b', fontWeight: '500', marginBottom: 4 },
  customerAddress: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },

  arriveButton: { backgroundColor: '#1a56ff', paddingVertical: 18, borderRadius: 20, alignItems: 'center', shadowColor: '#1a56ff', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  arriveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});