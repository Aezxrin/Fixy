import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, BackHandler } from 'react-native';
import { Clock, LogOut, ShieldAlert } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TechnicianPendingScreen() {
  
  // Android утасны "Буцах" (Back) товчийг дарахад өмнөх хуудас руу үсрэхийг хориглоно.
  useEffect(() => {
    const backAction = () => {
      return true; // true буцаавал Back үйлдэл цуцлагдана
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  // Системээс гарах функц
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      router.replace('/');
    } catch (error) {
      console.error('Гарахад алдаа гарлаа', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Clock size={50} color="#d97706" />
        </View>
        
        <Text style={styles.title}>Бүртгэл хүлээгдэж байна</Text>
        
        <Text style={styles.description}>
          Таны илгээсэн мэдээлэл болон мэргэжлийн үнэмлэхийг манай админ баг шалгаж байна. 
          Шалгаж баталгаажуулсны дараа таны эрх нээгдэж, систем рүү нэвтрэх боломжтой болно.
        </Text>
        
        <View style={styles.infoBox}>
          <ShieldAlert size={20} color="#3b82f6" />
          <Text style={styles.infoText}>Баталгаажуулах хугацаа: 1-24 цаг</Text>
        </View>
        
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <LogOut size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Системээс гарах</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
  },
  infoText: {
    color: '#1e3a8a',
    fontWeight: '600',
    fontSize: 14,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 10,
    backgroundColor: '#fff', 
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
});