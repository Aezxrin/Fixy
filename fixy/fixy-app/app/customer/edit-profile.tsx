import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Phone, Mail } from 'lucide-react-native';
import { router } from 'expo-router';
import api from '../../api/client';

export default function EditCustomerProfileScreen() {
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Одоогийн мэдээллийг татаж авах
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/me');
        const data = res.data.user || res.data;
        setForm({ 
          name: data.name || '', 
          phone: data.phone || '', 
          email: data.email || '' 
        });
      } catch (error) {
        console.error('Мэдээлэл татахад алдаа:', error);
        Alert.alert('Алдаа', 'Мэдээлэл татаж чадсангүй.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // 2. Мэдээллийг хадгалах
  const handleSave = async () => {
    if (!form.name || !form.email) {
      Alert.alert('Анхааруулга', 'Нэр болон И-мэйл хаягаа заавал оруулна уу.');
      return;
    }

    setSaving(true);
    try {
      // Backend дээрх profile update API руу илгээх
      const res = await api.patch('/profile/update', form);
      if (res.data.success) {
        Alert.alert(
          'Амжилттай', 
          'Таны мэдээлэл шинэчлэгдлээ.',
          [{ text: 'ОК', onPress: () => router.back() }]
        );
      }
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.message || 'Мэдээлэл хадгалахад алдаа гарлаа.';
      Alert.alert('Алдаа', errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Хувийн мэдээлэл</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Овог, нэр</Text>
            <View style={styles.inputContainer}>
              <User size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
                placeholder="Таны нэр"
                placeholderTextColor="#cbd5e1"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Утасны дугаар</Text>
            <View style={styles.inputContainer}>
              <Phone size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={(text) => setForm({ ...form, phone: text })}
                placeholder="Жишээ нь: 99112233"
                placeholderTextColor="#cbd5e1"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>И-мэйл хаяг</Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={form.email}
                onChangeText={(text) => setForm({ ...form, email: text })}
                placeholder="example@mail.com"
                placeholderTextColor="#cbd5e1"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

        </ScrollView>

        {/* Хадгалах товч */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.saveBtn, saving && { opacity: 0.7 }]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Мэдээлэл хадгалах</Text>
            )}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backBtn: { padding: 8, backgroundColor: '#f1f5f9', borderRadius: 12 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  scrollContent: { padding: 20 },
  
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8, marginLeft: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, paddingHorizontal: 16, height: 56 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#1e293b' },
  
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  saveBtn: { backgroundColor: '#10b981', paddingVertical: 16, borderRadius: 16, alignItems: 'center', shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});