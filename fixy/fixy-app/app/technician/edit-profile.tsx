import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { ArrowLeft, Save } from 'lucide-react-native';
import { router } from 'expo-router';
import api from '../../api/client';

export default function EditProfile() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', bio: '' });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // ЗАСВАР: Энд /user эсвэл /admin/me байсныг /me болгож өөрчлөх
        const res = await api.get('/me'); 
        const data = res.data.user || res.data;
        setForm({ name: data.name, phone: data.phone || '', email: data.email, bio: data.bio || '' });
      } catch (error) {
        console.error(error);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await api.patch('/profile/update', form);
      if (res.data.success) {
        Alert.alert('Амжилттай', 'Мэдээлэл шинэчлэгдлээ', [{ text: 'ОК', onPress: () => router.back() }]);
      }
    } catch (e) { Alert.alert('Алдаа', 'Мэдээлэл хадгалахад алдаа гарлаа'); } 
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#f8fafc'}}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color="#0f172a" /></TouchableOpacity>
        <Text style={styles.title}>Хувийн мэдээлэл засах</Text><View style={{width: 24}}/>
      </View>
      <View style={{padding: 20}}>
        <Text style={styles.label}>Овог нэр</Text>
        <TextInput style={styles.input} value={form.name} onChangeText={t => setForm({...form, name: t})} />
        
        <Text style={styles.label}>Утасны дугаар</Text>
        <TextInput style={styles.input} value={form.phone} keyboardType="numeric" onChangeText={t => setForm({...form, phone: t})} />
        
        <Text style={styles.label}>И-мэйл</Text>
        <TextInput style={styles.input} value={form.email} keyboardType="email-address" onChangeText={t => setForm({...form, email: t})} />
        <Text style={styles.label}>Өөрийн танилцуулга</Text>
        <TextInput 
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
          multiline 
          numberOfLines={4}
          placeholder="Би Цонх дулаалах чиглэлээр 5 жил ажиллаж байна..."
          value={form.bio} 
          onChangeText={t => setForm({...form, bio: t})} 
        />
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
  label: { fontSize: 14, color: '#64748b', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16 },
  btn: { backgroundColor: '#10b981', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});