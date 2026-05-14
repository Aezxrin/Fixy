import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, Platform, TextInput, KeyboardAvoidingView } from 'react-native';
import { ArrowLeft, MapPin, Info, CheckCircle2, Camera, UploadCloud, Banknote } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import api from '../../api/client';

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Тайлагнах хэсгийн State-ууд
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [price, setPrice] = useState<string>(''); // Гараар бичих үнэ
  const [isFinishing, setIsFinishing] = useState(false);

  // 1. Мэдээлэл татах (Хийгдэж буй болон Дууссан)
  useEffect(() => {
    const fetchJob = async () => {
      try {
        let response = await api.get('/technician/my-jobs?status=accepted');
        let foundJob = response.data.data.find((item: any) => item.id.toString() === id);
        
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

  const handlePickImage = async () => {
    Alert.alert(
      'Ажлын үр дүн баталгаажуулах',
      'Зассаны дараах зургийг хэрхэн оруулах вэ?',
      [
        {
          text: 'Камер нээх',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Алдаа', 'Камер ашиглах эрх шаардлагатай.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              quality: 0.8,
            });
            if (!result.canceled) setSelectedImage(result.assets[0].uri);
          },
        },
        {
          text: 'Зургийн сангаас',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Алдаа', 'Зургийн санд хандах эрх шаардлагатай.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              quality: 0.8,
            });
            if (!result.canceled) setSelectedImage(result.assets[0].uri);
          },
        },
        { text: 'Цуцлах', style: 'cancel' },
      ]
    );
  };

  // 3. Ажлыг баталгаажуулж дуусгах
  const submitCompletion = async () => {
    // 1. Үнэ оруулсан эсэхийг шалгах
    if (!price || Number(price) <= 0) {
      Alert.alert('Анхааруулга', 'Засварын нийт хөлсийг зөв оруулна уу.');
      return;
    }

    // 2. Зураг оруулсан эсэхийг шалгах
    if (!selectedImage) {
      Alert.alert('Анхааруулга', 'Та зассаны дараах зургаа оруулна уу.');
      return;
    }

    setIsFinishing(true);
    try {
      const formData = new FormData();
      
      // Зургийн мэдээллийг бэлдэх
      const localUri = Platform.OS === 'android' && !selectedImage.startsWith('file://') ? `file://${selectedImage}` : selectedImage;
      const filename = localUri.split('/').pop() || 'completed_job.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      
      formData.append('completed_image', { uri: localUri, name: filename, type } as any);
      
      // Засварчны гараар оруулсан үнийг илгээх
      formData.append('price', price); 

      // Backend API руу илгээх
      const response = await api.post(`/technician/calls/${id}/complete`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        Alert.alert('Нэхэмжлэх илгээгдлээ', 'Иргэн төлбөр төлөхийг хүлээж байна.', [
          { text: 'ОК', onPress: () => router.replace('/technician/tabs/jobs') }
        ]);
      }
    } catch (error: any) {
      console.error('Completion Error:', error);
      Alert.alert('Алдаа', error.response?.data?.message || 'Ажлыг дуусгахад алдаа гарлаа.');
    } finally {
      setIsFinishing(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#10b981" /></View>;
  if (!job) return null;

  // ТАЙЛБАР: Өөрийнхөө IP хаягийг энд шалгаарай
  const beforeImageUrl = job.image_path ? `http://192.168.137.1:8000/storage/${job.image_path}` : null;
  const afterImageUrl = job.completed_image_path ? `http://192.168.137.1:8000/storage/${job.completed_image_path}` : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Толгойн хэсэг */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ажлын дэлгэрэнгүй</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Төлөв харуулах */}
          <View style={[styles.statusBox, job.status === 'completed' ? styles.statusCompleted : styles.statusProgress]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {job.status === 'completed' ? (
                <CheckCircle2 size={24} color="#10b981" />
              ) : (
                <ActivityIndicator color="#f59e0b" />
              )}
              <Text style={[styles.statusText, { color: job.status === 'completed' ? '#047857' : '#b45309' }]}>
                {job.status === 'completed' ? 'АЖИЛ ДУУССАН' : 'ЗАСВАР ХИЙГДЭЖ БАЙНА'}
              </Text>
            </View>
          </View>

          {/* Дуудлагын мэдээлэл */}
          <Text style={styles.sectionTitle}>Дуудлагын мэдээлэл</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={styles.iconCircle}><Info size={18} color="#3b82f6" /></View>
              <Text style={styles.cardText}>{job.description || 'Тайлбар оруулаагүй.'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={[styles.iconCircle, { backgroundColor: '#fee2e2' }]}><MapPin size={18} color="#ef4444" /></View>
              <Text style={styles.cardText}>{job.address}</Text>
            </View>
          </View>

          {/* ХИЙГДЭЖ БУЙ ҮЕД ХАРАГДАХ НЭХЭМЖЛЭХИЙН ХЭСЭГ */}
          {job.status === 'accepted' || job.status === 'on_the_way' ? (
            <View style={styles.completionForm}>
              <Text style={styles.sectionTitle}>Нэхэмжлэх үүсгэх</Text>
              <View style={styles.formCard}>
                
                {/* Үнэ оруулах хэсэг */}
                <Text style={styles.label}>Засварын нийт хөлс *</Text>
                <View style={styles.priceInputContainer}>
                  <View style={{ paddingLeft: 16 }}>
                    <Banknote size={20} color="#94a3b8" />
                  </View>
                  <TextInput 
                    style={styles.priceInput}
                    keyboardType="numeric"
                    placeholder="Жишээ нь: 45000"
                    placeholderTextColor="#cbd5e1"
                    value={price}
                    onChangeText={setPrice}
                  />
                  <Text style={styles.currencyText}>₮</Text>
                </View>

                <View style={{ height: 24 }} />

                {/* Зураг оруулах */}
                <Text style={styles.label}>Зассаны дараах зураг *</Text>
                <TouchableOpacity style={styles.imageUploadBtn} onPress={handlePickImage}>
                  {selectedImage ? (
                    <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <UploadCloud size={32} color="#94a3b8" />
                      <Text style={styles.uploadText}>Зураг дарах эсвэл сонгох</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {/* Өмнөх зураг */}
          {beforeImageUrl && (
            <View style={{ marginTop: 24 }}>
              <Text style={styles.sectionTitle}>Эвдрэлийн байдал (Өмнөх)</Text>
              <Image source={{ uri: beforeImageUrl }} style={styles.image} resizeMode="cover" />
            </View>
          )}

          {/* Дууссан үед харагдах зургууд */}
          {afterImageUrl && job.status === 'completed' && (
            <View style={{ marginTop: 24, marginBottom: 24 }}>
              <Text style={styles.sectionTitle}>Зассаны дараа (Тайлан)</Text>
              <Image source={{ uri: afterImageUrl }} style={styles.image} resizeMode="cover" />
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Нэхэмжлэх илгээх товч */}
      {(job.status === 'accepted' || job.status === 'on_the_way') && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.finishBtn, isFinishing && { opacity: 0.7 }]} 
            onPress={submitCompletion}
            disabled={isFinishing}
          >
            {isFinishing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Banknote size={22} color="#fff" />
                <Text style={styles.finishBtnText}>Нэхэмжлэх илгээх</Text>
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
  
  scrollContent: { padding: 20, paddingBottom: 120 }, 
  
  statusBox: { padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1 },
  statusCompleted: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
  statusProgress: { backgroundColor: '#fffbeb', borderColor: '#fde68a' },
  statusText: { fontSize: 14, fontWeight: 'bold', letterSpacing: 0.5 },

  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#475569', marginBottom: 12, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  
  card: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 24, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  cardText: { fontSize: 15, color: '#334155', flex: 1, lineHeight: 22 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginLeft: 64 }, 
  
  image: { width: '100%', height: 220, borderRadius: 20, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  
  completionForm: { marginTop: 10 },
  formCard: { backgroundColor: '#fff', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 10 },
  
  imageUploadBtn: { width: '100%', height: 160, borderRadius: 16, borderWidth: 2, borderColor: '#e2e8f0', borderStyle: 'dashed', backgroundColor: '#f8fafc', overflow: 'hidden', marginBottom: 24 },
  uploadPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  uploadText: { color: '#64748b', fontSize: 14, fontWeight: '500' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  
  // ШИНЭЧИЛСЭН: Үнэ оруулах хэсгийн стиль
  priceInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, height: 56 },
  priceInput: { flex: 1, fontSize: 18, fontWeight: 'bold', color: '#0f172a', paddingHorizontal: 12, height: '100%' },
  currencyText: { fontSize: 18, fontWeight: 'bold', color: '#94a3b8', marginRight: 16 },

  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 10 },
  finishBtn: { flexDirection: 'row', backgroundColor: '#10b981', paddingVertical: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  finishBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
});