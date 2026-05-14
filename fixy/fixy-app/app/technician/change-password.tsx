import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import api from '../../api/client';

export default function ChangePassword() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ current_password: '', new_password: '' });

  const handleSave = async () => {
    if(form.new_password.length < 6) return Alert.alert('Алдаа', 'Шинэ нууц үг 6-аас дээш тэмдэгт байх ёстой.');
    setLoading(true);
    try {
      const res = await api.patch('/profile/password', form);
      if (res.data.success) {
        Alert.alert('Амжилттай', 'Нууц үг солигдлоо.', [{ text: 'ОК', onPress: () => router.back() }]);
      }
    } catch (e: any) { 
      Alert.alert('Алдаа', e.response?.data?.message || 'Одоогийн нууц үг буруу байна.'); 
    } 
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#f8fafc'}}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color="#0f172a" /></TouchableOpacity>
        <Text style={styles.title}>Нууц үг солих</Text><View style={{width: 24}}/>
      </View>
      <View style={{padding: 20}}>
        <Text style={styles.label}>Одоогийн нууц үг</Text>
        <TextInput style={styles.input} secureTextEntry value={form.current_password} onChangeText={t => setForm({...form, current_password: t})} />
        
        <Text style={styles.label}>Шинэ нууц үг</Text>
        <TextInput style={styles.input} secureTextEntry value={form.new_password} onChangeText={t => setForm({...form, new_password: t})} />

        <TouchableOpacity style={styles.btn} onPress={handleSave}>
          {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.btnText}>Нууц үг шинэчлэх</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e2e8f0' },
  title: { fontSize: 18, fontWeight: 'bold' },
  label: { fontSize: 14, color: '#64748b', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16 },
  btn: { backgroundColor: '#ef4444', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});