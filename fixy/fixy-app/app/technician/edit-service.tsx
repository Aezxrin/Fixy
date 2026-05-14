import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import api from '../../api/client';

export default function EditService() {
  const [loading, setLoading] = useState(false);
  const [service, setService] = useState('');
  
  const SERVICES = ['Цахилгаан', 'Сантехник', 'Мужаан', 'Тавилга угсрах, засах', 'Цонх дулаалах', 'Ахуйн үйлчилгээ'];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/me');
        setService((res.data.user || res.data).service_type || '');
      } catch (error) {
        console.error(error);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await api.patch('/profile/update', { service_type: service });
      if (res.data.success) Alert.alert('Амжилттай', 'Мэргэжил шинэчлэгдлээ', [{ text: 'ОК', onPress: () => router.back() }]);
    } catch (e) { Alert.alert('Алдаа', 'Алдаа гарлаа'); } 
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#f8fafc'}}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color="#0f172a" /></TouchableOpacity>
        <Text style={styles.title}>Мэргэжил тохируулах</Text><View style={{width: 24}}/>
      </View>
      <View style={{padding: 20}}>
        <Text style={{color: '#64748b', marginBottom: 20}}>Та зөвхөн 1 үндсэн мэргэжил сонгох боломжтой. Энэ нь танд ирэх дуудлагыг шүүнэ.</Text>
        
        <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 10}}>
          {SERVICES.map((item) => (
            <TouchableOpacity 
              key={item} 
              style={[styles.chip, service === item && styles.chipActive]}
              onPress={() => setService(item)}
            >
              <Text style={[styles.chipText, service === item && styles.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleSave}>
          {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.btnText}>Хадгалах</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e2e8f0' },
  title: { fontSize: 18, fontWeight: 'bold' },
  chip: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 20 },
  chipActive: { backgroundColor: '#ecfdf5', borderColor: '#10b981' },
  chipText: { fontSize: 14, color: '#64748b' },
  chipTextActive: { color: '#10b981', fontWeight: 'bold' },
  btn: { backgroundColor: '#10b981', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 40 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});