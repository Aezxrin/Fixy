import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, HelpCircle, LogOut, Camera, ChevronRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import api from '../../api/client'; // Өөрийн замаар тохируулна уу

export default function CustomerProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // 1. Хэрэглэгчийн мэдээллийг татах
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/me');
      setUser(res.data.user || res.data);
    } catch (error) {
      console.error("Профайл татахад алдаа:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  // 2. Галерейгаас зураг сонгох
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

  // 3. Зургийг сервер рүү илгээх
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
        fetchProfile(); // Зураг солигдсон тул датаг дахин татаж зургийг шинэчлэх
      }
    } catch (error) {
      Alert.alert("Алдаа", "Зураг хуулахад алдаа гарлаа.");
    } finally {
      setUploading(false);
    }
  };

  // 4. Системээс гарах
  const handleLogout = () => {
    Alert.alert("Гарах", "Та системээс гарахдаа итгэлтэй байна уу?", [
      { text: "Үгүй", style: "cancel" },
      { 
        text: "Тийм", 
        style: "destructive", 
        onPress: async () => {
          try { await api.post('/logout'); } catch(e) {}
          await AsyncStorage.removeItem('userToken');
          router.replace('/'); 
        }
      }
    ]);
  };

  if (loading || !user) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  // Зургийн хаяг болон Нэрний эхний үсэг
  const avatarUrl = user.avatar_path ? `http://192.168.137.1:8000/storage/${user.avatar_path}` : null;
  const initial = user.name ? user.name.charAt(0).toUpperCase() : 'Х';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Толгойн хэсэг: Зураг болон Нэр */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} disabled={uploading}>
            {uploading ? (
              <View style={[styles.avatarPlaceholder, { backgroundColor: '#e2e8f0' }]}>
                <ActivityIndicator color="#10b981" />
              </View>
            ) : avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
            )}
            
            {/* Зураг солих боломжтойг илтгэх жижиг камерын айкон */}
            <View style={styles.cameraBadge}>
              <Camera size={14} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userPhone}>{user.phone || user.email}</Text>
        </View>

        {/* Цэснүүдийн хэсэг */}
        <View style={styles.menuContainer}>
          {/* Хувийн мэдээлэл */}
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/customer/edit-profile' as any)}>
            <View style={styles.menuIconBg}>
              <User size={20} color="#64748b" />
            </View>
            <Text style={styles.menuText}>Хувийн мэдээлэл</Text>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>

          {/* Тохиргоо */}
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBg}>
              <Settings size={20} color="#64748b" />
            </View>
            <Text style={styles.menuText}>Тохиргоо</Text>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>

          {/* Тусламж */}
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBg}>
              <HelpCircle size={20} color="#64748b" />
            </View>
            <Text style={styles.menuText}>Тусламж</Text>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

        {/* Системээс гарах товч */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#ef4444" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Системээс гарах</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 40 },
  
  header: { alignItems: 'center', marginTop: 40, marginBottom: 40 },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: '#fff' },
  avatarImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#10b981' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#0f172a', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  
  userName: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  userPhone: { fontSize: 15, color: '#64748b' },

  menuContainer: { paddingHorizontal: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, marginBottom: 12 },
  menuIconBg: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginRight: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  menuText: { flex: 1, fontSize: 16, fontWeight: '500', color: '#1e293b' },

  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fef2f2', marginHorizontal: 20, padding: 18, borderRadius: 16, marginTop: 40 },
  logoutText: { fontSize: 16, fontWeight: 'bold', color: '#ef4444' }
});