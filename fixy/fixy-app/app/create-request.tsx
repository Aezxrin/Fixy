import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { Zap, Droplet, Wrench, Home, MapPin, Camera, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import api from '../api/client';

export default function CreateRequestScreen() {
  // Баазаас татах төрлүүд
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  
  // Form state
  const [selectedService, setSelectedService] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState<string | null>(null);

  // 1. Хуудас ачааллах үед үйлчилгээний төрлүүдийг баазаас татах
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get('/services');
        if (response.data.success) {
          // Баазаас ирсэн датаг массиваар авах
          const types = response.data.data.map((item: any) => item.name);
          setServiceTypes(types);
        }
      } catch (error) {
        console.error("Үйлчилгээний төрөл татахад алдаа:", error);
      } finally {
        setLoadingTypes(false);
      }
    };
    fetchServices();
  }, []);

  // 2. Нэрнээс хамаарч Icon тохируулах функц
  const getServiceIcon = (name: string, color: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('цахилгаан')) return <Zap size={24} color={color} />;
    if (lowerName.includes('сантехник') || lowerName.includes('ус')) return <Droplet size={24} color={color} />;
    if (lowerName.includes('тавилга') || lowerName.includes('мужаан')) return <Wrench size={24} color={color} />;
    return <Home size={24} color={color} />; // Үндсэн icon
  };

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
      setImage(result.assets[0].uri);
    }
  };

  const handleSearchTechnician = () => {
    if (!selectedService || !description.trim() || !address.trim()) {
      Alert.alert('Анхааруулга', 'Та үйлчилгээний төрөл, тайлбар болон хаягаа бүрэн оруулна уу.');
      return;
    }
    console.log("--- 1. CREATE-REQUEST хуудаснаас гарч буй дата ---", { serviceType: selectedService, description, address });
    // Бүх мэдээллээ дараагийн хуудас руу дамжуулж засварчин хайх
    router.push({
      pathname: '/search-technician',
      params: {
        serviceType: selectedService,
        description: description,
        address: address,
        imageUri: image || ''
      }
    } as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Толгой хэсэг */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Шинэ дуудлага</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* 1. Үйлчилгээний төрөл */}
        <Text style={styles.sectionTitle}>1. Үйлчилгээний төрөл</Text>
        {loadingTypes ? (
          <ActivityIndicator size="large" color="#10b981" style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.servicesGrid}>
            {serviceTypes.map((type, index) => {
              const isActive = selectedService === type;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.serviceCard, isActive && styles.activeServiceCard]}
                  onPress={() => setSelectedService(type)}
                >
                  <View style={[styles.iconBg, isActive && styles.activeIconBg]}>
                    {getServiceIcon(type, isActive ? '#10b981' : '#64748b')}
                  </View>
                  <Text style={[styles.serviceText, isActive && styles.activeServiceText]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* 2. Асуудлын тайлбар */}
        <Text style={styles.sectionTitle}>2. Асуудлын тайлбар</Text>
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

        {/* 3. Зураг хавсаргах */}
        <Text style={styles.sectionTitle}>3. Зураг хавсаргах (Нэмэлт)</Text>
        <TouchableOpacity style={styles.imageUploadBtn} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.uploadedImage} />
          ) : (
            <>
              <Camera size={32} color="#94a3b8" />
              <Text style={styles.uploadText}>Эвдэрсэн хэсгийн зургийг оруулах</Text>
            </>
          )}
        </TouchableOpacity>

        {/* 4. Очих хаяг (Бидний түрүүний зассан хэсэг) */}
        <Text style={styles.sectionTitle}>4. Очих хаяг</Text>
        <View style={styles.addressCard}>
          <View style={styles.addressIconBg}>
            <MapPin size={20} color="#10b981" />
          </View>
          <View style={styles.addressTextContainer}>
            <Text style={styles.addressLabel}>Таны хаяг (Орц, давхар, тоот)</Text>
            <TextInput
              style={styles.addressInput}
              placeholder="Жишээ: 12-р хороолол, 5-р байр..."
              placeholderTextColor="#94a3b8"
              value={address}
              onChangeText={setAddress}
              multiline
            />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Хайх товч */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitBtn, (!selectedService || !description || !address) && styles.submitBtnDisabled]} 
          onPress={handleSearchTechnician}
          disabled={!selectedService || !description || !address}
        >
          <Text style={styles.submitBtnText}>Засварчин хайх</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backBtn: { padding: 8, backgroundColor: '#f1f5f9', borderRadius: 12 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  
  scrollContent: { padding: 20, paddingBottom: 100 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginBottom: 16, marginTop: 10 },
  
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  serviceCard: { width: '48%', backgroundColor: '#fff', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 2, borderColor: '#f1f5f9' },
  activeServiceCard: { borderColor: '#10b981', backgroundColor: '#ecfdf5' },
  iconBg: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  activeIconBg: { backgroundColor: '#d1fae5' },
  serviceText: { fontSize: 14, fontWeight: '600', color: '#475569', textAlign: 'center' },
  activeServiceText: { color: '#10b981' },

  textArea: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', height: 120, fontSize: 15, color: '#1e293b' },
  
  imageUploadBtn: { backgroundColor: '#fff', borderRadius: 16, borderStyle: 'dashed', borderWidth: 2, borderColor: '#cbd5e1', height: 120, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  uploadText: { color: '#94a3b8', marginTop: 8, fontSize: 14 },
  uploadedImage: { width: '100%', height: '100%' },

  addressCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  addressIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ecfdf5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  addressTextContainer: { flex: 1 },
  addressLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  addressInput: { fontSize: 14, color: '#1e293b', minHeight: 40 },

  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  submitBtn: { backgroundColor: '#10b981', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#94a3b8' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});