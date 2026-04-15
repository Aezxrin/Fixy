import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import { ArrowLeft, MapPin, Clock, Info, CheckCircle, Camera } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import api from '../../api/client';
import { API_BASE_URL } from '../../config';

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);

  // Мэдээлэл татах (Хийгдэж буй болон Дууссан аль нь ч байж болно)
  useEffect(() => {
    const fetchJob = async () => {
      try {
        // Эхлээд хийгдэж буй дотроос хайна
        let response = await api.get('/technician/my-jobs?status=accepted');
        let foundJob = response.data.data.find((item: any) => item.id.toString() === id);
        
        // Олдохгүй бол дууссан дотроос хайна
        if (!foundJob) {
          response = await api.get('/technician/my-jobs?status=completed');
          foundJob = response.data.data.find((item: any) => item.id.toString() === id);
        }

        if (foundJob) setJob(foundJob);
        else {
          Alert.alert("Алдаа", "Мэдээлэл олдсонгүй");
          router.back();
        }
      } catch (error) {
        Alert.alert("Алдаа", "Мэдээлэл татахад алдаа гарлаа");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  // Ажлыг зурагтайгаар дуусгах
  const handleFinishJob = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Алдаа', 'Зургийн санд хандах эрх шаардлагатай.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;
      submitCompletion(selectedImage);
    }
  };

  const submitCompletion = async (imageUri: string) => {
    setIsFinishing(true);
    try {
      const formData = new FormData();
      
      const localUri = Platform.OS === 'android' && !imageUri.startsWith('file://') ? `file://${imageUri}` : imageUri;
      const filename = localUri.split('/').pop() || 'completed_job.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      
      formData.append('completed_image', { uri: localUri, name: filename, type } as any);

      // Backend API руу илгээх
      const response = await api.post(`/technician/calls/${id}/complete`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        Alert.alert('Амжилттай', 'Ажил амжилттай дууслаа!', [
          { text: 'ОК', onPress: () => router.replace('/technician/tabs/jobs') }
        ]);
      }
    } catch (error: any) {
      Alert.alert('Алдаа', error.response?.data?.message || 'Ажлыг дуусгахад алдаа гарлаа.');
    } finally {
      setIsFinishing(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#10b981" /></View>;
  if (!job) return null;

  // Зургийн замууд
  const beforeImageUrl = job.image_path ? `http://192.168.137.1:8000/storage/${job.image_path}` : null;
  const afterImageUrl = job.completed_image_path ? `http://192.168.137.1:8000/storage/${job.completed_image_path}` : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ажлын дэлгэрэнгүй</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>
            Төлөв: <Text style={{ color: job.status === 'completed' ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>
              {job.status === 'completed' ? 'ДУУССАН' : 'ХИЙГДЭЖ БУЙ'}
            </Text>
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Тайлбар</Text>
        <View style={styles.card}>
          <Text style={styles.cardText}>{job.description}</Text>
        </View>

        <Text style={styles.sectionTitle}>Хаяг</Text>
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <MapPin size={20} color="#3b82f6" />
            <Text style={styles.cardText}>{job.address}</Text>
          </View>
        </View>

        {beforeImageUrl && (
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.sectionTitle}>Эвдрэлийн зураг (Иргэнээс)</Text>
            <Image source={{ uri: beforeImageUrl }} style={styles.image} />
          </View>
        )}

        {afterImageUrl && job.status === 'completed' && (
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.sectionTitle}>Хийж дууссан зураг (Танаас)</Text>
            <Image source={{ uri: afterImageUrl }} style={styles.image} />
          </View>
        )}

      </ScrollView>

      {/* Хэрвээ ажил дуусаагүй (accepted) байвал "Дуусгах" товч харагдана */}
      {job.status === 'accepted' && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.finishBtn, isFinishing && { opacity: 0.7 }]} 
            onPress={handleFinishJob}
            disabled={isFinishing}
          >
            {isFinishing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Camera size={20} color="#fff" />
                <Text style={styles.finishBtnText}>Зураг оруулж ажлыг дуусгах</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backBtn: { padding: 8, backgroundColor: '#f1f5f9', borderRadius: 12 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  statusBox: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  statusText: { fontSize: 16, color: '#334155' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginBottom: 10, marginLeft: 5 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  cardText: { fontSize: 15, color: '#1e293b', flex: 1 },
  image: { width: '100%', height: 200, borderRadius: 16, backgroundColor: '#e2e8f0' },
  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  finishBtn: { flexDirection: 'row', backgroundColor: '#10b981', paddingVertical: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 10 },
  finishBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});