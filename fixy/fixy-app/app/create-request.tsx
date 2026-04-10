import AsyncStorage from '@react-native-async-storage/async-storage';
// Мөн өмнө нь үүсгэсэн API_BASE_URL-ээ оруулж ирвэл IP солигдоход амар болно
import { API_BASE_URL } from '../config';
import React, { useState } from 'react';
import axios from 'axios';
import * as Location from 'expo-location';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image
} from 'react-native';
import { ArrowLeft, Wrench, Zap, Droplets, Home, Camera, MapPin, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const SERVICES = [
  { id: '1', name: 'Цахилгаан', icon: Zap },
  { id: '2', name: 'Сантехник', icon: Droplets },
  { id: '3', name: 'Мужаан', icon: Wrench },
  { id: '4', name: 'Орон сууц', icon: Home },
];

export default function CreateRequestScreen() {
  const [selectedService, setSelectedService] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('Дархан-Уул аймаг, ШУТИС-ийн ойролцоо'); // Жишээ хаяг
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Зураг оруулах функц
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Алдаа', 'Зургийн санд хандах эрх шаардлагатай.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Дуудлага илгээх функц
// Дуудлага илгээх функц
  const handleSubmit = async () => {
    if (!selectedService) {
      Alert.alert('Анхааруулга', 'Үйлчилгээний төрлөө сонгоно уу.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Анхааруулга', 'Асуудлаа дэлгэрэнгүй тайлбарлана уу.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Алдаа", "Token олдсонгүй. Дахин нэвтэрнэ үү.");
        return;
      }

      const formData = new FormData();
      const serviceName = SERVICES.find(s => s.id === selectedService)?.name || '';
      
      formData.append('service_type', serviceName);
      formData.append('description', description);
      formData.append('address', address);

      if (imageUri) {
        const localUri = imageUri;
        const filename = localUri.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('image', {
          uri: localUri,
          name: filename,
          type: type,
        } as any);
      }

      // Дуудлагыг POST хийж Draft (ноорог) үүсгэнэ
      const response = await fetch(`${API_BASE_URL}/calls`, {
        method: "POST",
        headers: {
          'Accept': "application/json",
          'Authorization': `Bearer ${token}`,
        },
        body: formData, 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Дуудлага үүсгэж чадсангүй");
      }

      router.push({
        pathname: '/search-technician',
        params: { 
          requestId: data.data.id, // Backend-ээс ирсэн шинэ дуудлагын ID
          serviceType: serviceName 
        }
      } as any);
      
    } catch (error: any) {
      Alert.alert("Алдаа", error.message || "Дуудлага бүртгэхэд алдаа гарлаа.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {/* Толгой хэсэг */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Шинэ дуудлага</Text>
          <View style={{ width: 24 }} /> {/* Буцаах товчтой тэнцвэржүүлэх */}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* 1. Үйлчилгээ сонгох */}
          <Text style={styles.sectionTitle}>1. Үйлчилгээний төрөл</Text>
          <View style={styles.servicesGrid}>
            {SERVICES.map((service) => (
              <TouchableOpacity 
                key={service.id}
                style={[styles.serviceCard, selectedService === service.id && styles.serviceCardActive]}
                onPress={() => setSelectedService(service.id)}
              >
                <View style={[styles.serviceIconBg, selectedService === service.id && styles.serviceIconBgActive]}>
                  <service.icon size={24} color={selectedService === service.id ? '#fff' : '#64748b'} />
                </View>
                <Text style={[styles.serviceName, selectedService === service.id && styles.serviceNameActive]}>
                  {service.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 2. Асуудлын тайлбар */}
          <Text style={styles.sectionTitle}>2. Асуудлын тайлбар</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="Яг юу эвдэрсэн, ямар тусламж хэрэгтэй байгаагаа дэлгэрэнгүй бичнэ үү..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* 3. Зураг хавсаргах (Нэмэлт) */}
          <Text style={styles.sectionTitle}>3. Зураг хавсаргах (Нэмэлт)</Text>
          <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
            ) : (
              <>
                <Camera size={28} color="#94a3b8" />
                <Text style={styles.uploadText}>Эвдэрсэн зүйлийн зураг оруулах</Text>
              </>
            )}
          </TouchableOpacity>

          {/* 4. Байршил (HomeScreen-ээс авсан гэж үзнэ) */}
          <Text style={styles.sectionTitle}>4. Очих хаяг</Text>
          <TouchableOpacity style={styles.addressCard}>
            <View style={styles.addressIconBg}>
              <MapPin size={20} color="#10b981" />
            </View>
            <View style={styles.addressTextContainer}>
              <Text style={styles.addressLabel}>Таны одоогийн байршил</Text>
              <Text style={styles.addressValue} numberOfLines={2}>{address}</Text>
            </View>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>

          <View style={{ height: 40 }} /> {/* Хоосон зай */}
        </ScrollView>

        {/* Илгээх товч */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.submitBtn, (!selectedService || !description.trim()) && styles.submitBtnDisabled]} 
            onPress={handleSubmit}
            disabled={!selectedService || !description.trim()}
          >
            <Text style={styles.submitBtnText}>Засварчин хайх</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  content: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#334155', marginBottom: 12, marginTop: 8 },
  
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  serviceCard: { width: '48%', backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  serviceCardActive: { borderColor: '#10b981', backgroundColor: '#ecfdf5' },
  serviceIconBg: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  serviceIconBgActive: { backgroundColor: '#10b981' },
  serviceName: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  serviceNameActive: { color: '#10b981' },

  inputContainer: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 24 },
  textArea: { padding: 16, fontSize: 15, color: '#1e293b', minHeight: 120 },

  uploadBtn: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 2, borderColor: '#e2e8f0', borderStyle: 'dashed', height: 120, justifyContent: 'center', alignItems: 'center', marginBottom: 24, overflow: 'hidden' },
  uploadText: { marginTop: 8, fontSize: 14, color: '#94a3b8', fontWeight: '500' },
  uploadedImage: { width: '100%', height: '100%' },

  addressCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 24 },
  addressIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ecfdf5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  addressTextContainer: { flex: 1 },
  addressLabel: { fontSize: 12, color: '#64748b', marginBottom: 2 },
  addressValue: { fontSize: 14, fontWeight: '600', color: '#1e293b' },

  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  submitBtn: { backgroundColor: '#10b981', paddingVertical: 16, borderRadius: 16, alignItems: 'center', shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  submitBtnDisabled: { backgroundColor: '#94a3b8', shadowOpacity: 0, elevation: 0 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});