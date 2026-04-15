import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star, MapPin, CheckCircle, ShieldCheck } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

export default function TechnicianProfileScreen() {
  // Өмнөх хуудаснаас ирсэн дата: id (Засварчны ID), requestId (Таны үүсгэсэн дуудлагын ID)
  const { id, requestId } = useLocalSearchParams();
  const [isSending, setIsSending] = useState(false);

  // Засварчин руу дуудлагаа баталгаажуулж илгээх функц
  const handleSendRequest = async () => {
    if (!requestId || !id) {
      Alert.alert('Алдаа', 'Дуудлагын мэдээлэл дутуу байна.');
      return;
    }

    setIsSending(true);
    try {
      const token = await AsyncStorage.getItem('token');
      
      // Саяны бидний үүсгэсэн Backend API руу илгээх
      const response = await fetch(`${API_BASE_URL}/calls/${requestId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ technician_id: id }) // Засварчны ID-г явуулах
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert(
          "Амжилттай!", 
          "Таны дуудлага засварчин руу илгээгдлээ. Засварчин хүлээж авахыг хүлээнэ үү.",
          [{ text: "ОК", onPress: () => router.replace('/tabs/requests') }] // Илгээгээд өөрийн дуудлагуудын жагсаалт руу буцах
        );
      } else {
        throw new Error(data.message || 'Алдаа гарлаа');
      }
    } catch (error: any) {
      Alert.alert('Алдаа', error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Толгой хэсэг */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Засварчны профайл</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Профайл мэдээлэл */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} 
              style={styles.avatar} 
            />
            <View style={styles.badge}>
              <ShieldCheck size={14} color="#fff" />
            </View>
          </View>
          
          <Text style={styles.name}>Батболд .Э</Text>
          <Text style={styles.profession}>Ахлах Сантехникч</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Star size={20} color="#f59e0b" fill="#f59e0b" />
              <Text style={styles.statValue}>4.9</Text>
              <Text style={styles.statLabel}>Үнэлгээ</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <CheckCircle size={20} color="#10b981" />
              <Text style={styles.statValue}>124</Text>
              <Text style={styles.statLabel}>Хийсэн ажил</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <MapPin size={20} color="#3b82f6" />
              <Text style={styles.statValue}>1.2 км</Text>
              <Text style={styles.statLabel}>Зай</Text>
            </View>
          </View>
        </View>

        {/* Танилцуулга */}
        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>Танилцуулга</Text>
          <Text style={styles.aboutText}>
            Сайн байна уу. Би сантехникийн чиглэлээр 8 жил ажиллаж байгаа туршлагатай засварчин байна. Паар солих, ус алдалт зогсоох, шугам хоолойн гэмтэл зэргийг найдвартай, хурдан шуурхай хийж гүйцэтгэнэ.
          </Text>
        </View>

        {/* Сүүлд хийсэн ажлууд (Жишээ дата) */}
        <View style={styles.portfolioSection}>
          <Text style={styles.sectionTitle}>Сүүлд хийсэн ажлууд</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.portfolioScroll}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=200' }} style={styles.portfolioImage} />
            <Image source={{ uri: 'https://images.unsplash.com/photo-1607472586893-edb57cb31328?q=80&w=200' }} style={styles.portfolioImage} />
            <Image source={{ uri: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=200' }} style={styles.portfolioImage} />
          </ScrollView>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Дуудлага илгээх товч */}
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff' },
  backBtn: { padding: 5 },
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
  portfolioImage: { width: 120, height: 120, borderRadius: 16, marginRight: 12, backgroundColor: '#e2e8f0' },

  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  submitBtn: { backgroundColor: '#10b981', paddingVertical: 16, borderRadius: 16, alignItems: 'center', elevation: 4, shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});