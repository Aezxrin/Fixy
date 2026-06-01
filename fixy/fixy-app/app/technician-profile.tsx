import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star, MapPin, CheckCircle, ShieldCheck, Image as ImageIcon } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import api from '../api/client';

// Хоёр цэгийн хоорондох зайг км-ээр бодох томьёо (Haversine formula)
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return '?';
  const R = 6371; // Дэлхийн радиус (км)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1); 
};

export default function TechnicianProfileScreen() {
  const params = useLocalSearchParams();
  
  // ЗАСВАР 1: latitude болон longitude гэсэн нэрээрээ хүлээж авах
  const { id, serviceType, description, address, imageUri, latitude, longitude } = params;
  
  const [isSending, setIsSending] = useState(false);
  const [technicianData, setTechnicianData] = useState<any>(null);
  const [completedJobs, setCompletedJobs] = useState<any[]>([]);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTechnicianDetails = async () => {
      if (!id) return;
      try {
        const response = await api.get(`/technicians/${id}`);
        if (response.data.success) {
          setTechnicianData(response.data.user);
          setCompletedJobs(response.data.completed_jobs || []);
          setCompletedCount(response.data.completed_count || response.data.completed_jobs?.length || 0);
        }
      } catch (error) {
        console.error("Засварчны мэдээлэл татахад алдаа:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTechnicianDetails();
  }, [id]);

  const handleSendRequest = async () => {
    if (!id || !serviceType || !description || !address) {
      Alert.alert('Мэдээлэл дутуу байна!', 'Та дуудлагын мэдээллээ бүрэн оруулна уу.');
      return;
    }

    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append('service_type', String(serviceType));
      formData.append('description', String(description));
      formData.append('address', String(address));
      formData.append('technician_id', String(id)); 

      // ЗАСВАР 2: Иргэний байршлыг API руу давхар илгээх
      if (latitude && longitude) {
        formData.append('latitude', String(latitude));
        formData.append('longitude', String(longitude));
      }

      if (imageUri && typeof imageUri === 'string' && imageUri !== '') {
        const localUri = Platform.OS === 'android' && !imageUri.startsWith('file://') ? `file://${imageUri}` : imageUri;
        const filename = localUri.split('/').pop() || 'repair_image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        
        // @ts-ignore
        formData.append('image', { uri: localUri, name: filename, type });
      }

      const response = await api.post('/calls', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        Alert.alert(
          "Амжилттай!", 
          "Таны дуудлага засварчин руу илгээгдлээ.",
          [{ text: "ОК", onPress: () => router.replace('/tabs') }] 
        );
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Алдаа гарлаа';
      Alert.alert('Алдаа', errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  const avatarUrl = technicianData?.avatar_path 
    ? `http://192.168.1.4:8000/storage/${technicianData.avatar_path}` 
    : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

  // 2. ЗАСВАР 3: Зай бодох хэсэгт latitude болон longitude ашиглах
  const distance = getDistance(
    Number(latitude), 
    Number(longitude), 
    Number(technicianData?.latitude), 
    Number(technicianData?.longitude)
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Засварчны профайл</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: avatarUrl }} 
              style={styles.avatar} 
            />
            <View style={styles.badge}>
              <ShieldCheck size={14} color="#fff" />
            </View>
          </View>
          
          <Text style={styles.name}>{technicianData?.name || 'Засварчин'}</Text>
          <Text style={styles.profession}>Мэргэжил: {technicianData?.service_type || serviceType}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Star size={20} color="#f59e0b" fill="#f59e0b" />
              <Text style={styles.statValue}>{technicianData?.rating || '4.9'}</Text>
              <Text style={styles.statLabel}>Үнэлгээ</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <CheckCircle size={20} color="#10b981" />
              <Text style={styles.statValue}>{completedCount}</Text>
              <Text style={styles.statLabel}>Дуусгасан</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <MapPin size={20} color="#3b82f6" />
              {/* АМЬД ЗАЙГ ХАРУУЛАХ */}
              <Text style={styles.statValue}>{distance !== '?' ? `${distance} км` : '...'}</Text>
              <Text style={styles.statLabel}>Ойрхон</Text>
            </View>
          </View>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>Танилцуулга</Text>
          <Text style={styles.aboutText}>
            {technicianData?.bio || `Сайн байна уу. Би ${serviceType || 'засварын'} чиглэлээр ажилладаг мэргэжлийн засварчин байна. Таны асуудлыг хурдан шуурхай шийдэж өгнө.`}
          </Text>
        </View>

        <View style={styles.portfolioSection}>
          <Text style={styles.sectionTitle}>Хийж гүйцэтгэсэн ажлууд</Text>
          {completedJobs && completedJobs.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.portfolioScroll}>
              {completedJobs.map((job, index) => (
                <View key={job.id || index} style={styles.portfolioItem}>
                  {job.completed_image_path ? (
                    <Image 
                      source={{ uri: `http://192.168.1.4:8000/storage/${job.completed_image_path}` }} 
                      style={styles.portfolioImage} 
                    />
                  ) : (
                    <View style={[styles.portfolioImage, styles.placeholderImage]}>
                      <ImageIcon size={32} color="#cbd5e1" />
                      <Text style={styles.placeholderText}>Зураггүй</Text>
                    </View>
                  )}
                  <Text style={styles.portfolioLabel} numberOfLines={1}>
                    {job.service_type || 'Засвар'}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>Одоогоор хийсэн ажил бүртгэгдээгүй байна.</Text>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitBtn, isSending && { opacity: 0.7 }]} 
          onPress={handleSendRequest}
          disabled={isSending}
        >
          {isSending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Энэ засварчинд дуудлага илгээх</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff' },
  backBtn: { padding: 8, backgroundColor: '#f1f5f9', borderRadius: 12 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  profileSection: { backgroundColor: '#fff', alignItems: 'center', paddingVertical: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#e2e8f0' },
  badge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#10b981', padding: 6, borderRadius: 15, borderWidth: 3, borderColor: '#fff' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  profession: { fontSize: 14, color: '#64748b', marginTop: 4, marginBottom: 20 },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', borderRadius: 20, paddingVertical: 15, paddingHorizontal: 20, width: '85%' },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginTop: 6 },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: '#cbd5e1' },
  aboutSection: { padding: 20, marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 12 },
  aboutText: { fontSize: 14, color: '#475569', lineHeight: 22 },
  portfolioSection: { paddingLeft: 20, marginTop: 10 },
  portfolioScroll: { flexDirection: 'row' },
  portfolioItem: { marginRight: 15, alignItems: 'flex-start', width: 150 },
  portfolioImage: { width: 150, height: 150, borderRadius: 16, backgroundColor: '#e2e8f0' },
  placeholderImage: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed' },
  placeholderText: { fontSize: 12, color: '#94a3b8', marginTop: 8 },
  portfolioLabel: { fontSize: 13, color: '#64748b', marginTop: 8, fontWeight: '600' },
  emptyText: { color: '#94a3b8', fontStyle: 'italic', paddingLeft: 5, marginTop: 5 },
  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  submitBtn: { backgroundColor: '#10b981', paddingVertical: 16, borderRadius: 16, alignItems: 'center', elevation: 4, shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});