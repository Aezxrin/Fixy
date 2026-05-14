import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { User, Mail, Phone, Wrench, ShieldCheck, ChevronRight, LogOut, Lock, Edit3, Camera, FileText } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import api from '../../../api/client';

export default function TechnicianProfile() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/me'); 
      if (response.data) {
        setUser(response.data.user || response.data);
      }
    } catch (error) {
      console.error("Профайл татахад алдаа:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => { fetchProfile(); }, [])
  );

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      handleImageUpload(result.assets[0].uri);
    }
  };

  const handleImageUpload = async (uri: string) => {
    setUploading(true);
    let formData = new FormData();
    const filename = uri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    formData.append('avatar', {
      uri: uri,
      name: filename,
      type: type,
    } as any);

    try {
      const res = await api.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        fetchProfile(); 
        Alert.alert("Амжилттай", "Профайл зураг шинэчлэгдлээ.");
      }
    } catch (error) {
      Alert.alert("Алдаа", "Зураг хуулахад алдаа гарлаа.");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Гарах", "Та системээс гарахдаа итгэлтэй байна уу?", [
      { text: "Үгүй", style: "cancel" },
      { text: "Тийм", style: "destructive", onPress: async () => {
          try { await api.post('/logout'); } catch(e) {}
          await AsyncStorage.removeItem('userToken');
          router.replace('/'); 
      }}
    ]);
  };

  if (loading || !user) return <View style={styles.center}><ActivityIndicator size="large" color="#10b981" /></View>;

  const avatarUrl = user.avatar_path ? `http://192.168.137.1:8000/storage/${user.avatar_path}` : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Толгойн хэсэг */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} disabled={uploading}>
            {uploading ? (
              <ActivityIndicator color="#10b981" />
            ) : avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <User size={40} color="#94a3b8" />
            )}
            
            <View style={styles.verifiedBadge}><ShieldCheck size={14} color="#fff" /></View>
            <View style={styles.cameraBadge}><Camera size={14} color="#fff" /></View>
          </TouchableOpacity>

          <Text style={styles.userName}>{user.name}</Text>
          
          <View style={styles.serviceBadge}>
            <Wrench size={12} color="#10b981" style={{ marginRight: 6 }} />
            <Text style={styles.serviceBadgeText}>{user.service_type || 'Мэргэжил сонгоогүй'}</Text>
          </View>
        </View>

        {/* Хувийн мэдээлэл */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Хувийн мэдээлэл</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={styles.iconBg}><Phone size={18} color="#64748b" /></View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Утасны дугаар</Text>
                <Text style={styles.infoValue}>{user.phone || 'Оруулаагүй'}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.iconBg}><Mail size={18} color="#64748b" /></View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>И-мэйл хаяг</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Тохиргоо болон Гэрээний Цэснүүд */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Тохиргоо & Гэрээ</Text>
          <View style={styles.card}>
            
            {/* ШИНЭ: Цахим гэрээний цэс */}
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/technician/contract' as any)}>
              <View style={[styles.iconBg, { backgroundColor: '#ecfdf5' }]}><FileText size={18} color="#10b981" /></View>
              <View style={styles.menuTextWrapper}>
                <Text style={styles.menuText}>Цахим гэрээ</Text>
                <Text style={[
                  styles.statusLabel,
                  user.contract_status === 'approved' ? styles.statusApproved :
                  user.contract_status === 'sent' ? styles.statusSent :
                  user.contract_status === 'signed' ? styles.statusSigned :
                  styles.statusNone
                ]}>
                  {user.contract_status === 'approved' ? 'Батлагдсан' :
                   user.contract_status === 'sent' ? 'Гарын үсэг зурах шаардлагатай' :
                   user.contract_status === 'signed' ? 'Хянагдаж байна' : 'Илгээхийг хүлээж байна'}
                </Text>
              </View>
              <ChevronRight size={20} color="#cbd5e1" />
            </TouchableOpacity>
            
            <View style={styles.divider} />

            {/* Профайл засах */}
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/technician/edit-profile' as any)}>
              <View style={styles.iconBg}><Edit3 size={18} color="#64748b" /></View>
              <View style={styles.menuTextWrapper}>
                <Text style={styles.menuText}>Хувийн мэдээлэл засах</Text>
              </View>
              <ChevronRight size={20} color="#cbd5e1" />
            </TouchableOpacity>
            
            <View style={styles.divider} />

            {/* Нууц үг солих */}
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/technician/change-password' as any)}>
              <View style={[styles.iconBg, { backgroundColor: '#fef2f2' }]}><Lock size={18} color="#ef4444" /></View>
              <View style={styles.menuTextWrapper}>
                <Text style={styles.menuText}>Нууц үг солих</Text>
              </View>
              <ChevronRight size={20} color="#cbd5e1" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Системээс гарах</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', paddingVertical: 32, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', marginBottom: 16 },
  
  avatarContainer: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4, marginBottom: 16, position: 'relative' },
  avatarImage: { width: 82, height: 82, borderRadius: 41 },
  verifiedBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#3b82f6', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  cameraBadge: { position: 'absolute', bottom: 0, left: 0, backgroundColor: '#10b981', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  
  userName: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  serviceBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ecfdf5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#d1fae5' },
  serviceBadgeText: { color: '#10b981', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase' },
  
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' },
  
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  infoTextContainer: { flex: 1, marginLeft: 12 },
  infoLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 4 },
  infoValue: { fontSize: 15, fontWeight: '500', color: '#1e293b' },
  
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  menuTextWrapper: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  menuText: { fontSize: 15, fontWeight: '500', color: '#334155' },
  
  // Гэрээний төлөвийн стилиуд
  statusLabel: { fontSize: 12, marginTop: 4, fontWeight: '600' },
  statusApproved: { color: '#10b981' },
  statusSent: { color: '#ef4444' },
  statusSigned: { color: '#f59e0b' },
  statusNone: { color: '#94a3b8' },

  iconBg: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginLeft: 60 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fef2f2', marginHorizontal: 20, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#fee2e2' },
  logoutText: { marginLeft: 8, fontSize: 16, fontWeight: 'bold', color: '#ef4444' }
});