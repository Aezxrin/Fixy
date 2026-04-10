import React, { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Modal,
  Switch,
  Image,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { router } from 'expo-router';
const API_URL = 'http://192.168.137.1:8000/api'; // Таны Hotspot-ийн хаяг


import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  ShieldCheck, 
  Image as ImageIcon, 
  CheckCircle2, 
  ChevronRight,
  Info
} from 'lucide-react-native';

/**
 * @file AuthScreen.tsx
 * @description Expertly crafted Authentication Screen for a Repair Service Expo App.
 * @features Login, Registration, Conditional Technician UI, Scroll-to-Accept Terms of Service.
 * @language Mongolian
 */

const { width } = Dimensions.get('window');

// Primary Colors & Theme
const COLORS = {
  primary: '#10b981', // Emerald 500
  background: '#f8fafc', // Slate 50
  text: '#1e293b', // Slate 800
  muted: '#64748b', // Slate 500
  border: '#e2e8f0', // Slate 200
  white: '#ffffff',
  error: '#ef4444',
};

export default function AuthScreen() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login'); 
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Registration Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<4 | 5>(4); // 4: Customer (Иргэн), 5: Technician (Засварчин)
  const [idImage, setIdImage] = useState<string | null>(null);
  const [certImage, setCertImage] = useState<string | null>(null); 

  // Terms of Service Logic State
  const [showTerms, setShowTerms] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [modalAccepted, setModalAccepted] = useState(false);
  const [mainTermsAccepted, setMainTermsAccepted] = useState(false);

  const isTechnician = role === 5;

  /**
   * Handles image selection using expo-image-picker
   */
  const pickImage = async (type: 'id' | 'cert') => {
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
      if (type === 'id') setIdImage(result.assets[0].uri);
      else setCertImage(result.assets[0].uri);
    }
  };

  /**
   * Mock Login function
   */
  const handleLogin = useCallback(async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      Alert.alert('Анхааруулга', 'Бүх талбарыг бөглөнө үү.');
      return;
    }
    
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: loginEmail.toLowerCase(),
        password: loginPassword,
        source: 'app'
      });

      if (response.data.success || response.data.token) {
        // Токен болон хэрэглэгчийн мэдээллийг хадгалах
        await AsyncStorage.setItem('token', response.data.token);
        
        const user = response.data.user;
        if (user) {
          await AsyncStorage.setItem('user', JSON.stringify(user));
        }

        // role_id: 4 (Иргэн), 5 (Засварчин) гэж үзвэл:
        if (user && user.role_id === 5) {
          // Хэрэв засварчин бол эхлээд статусыг нь шалгана
          if (user.status === 'pending') {
             // Баталгаажаагүй бол хүлээлгийн хуудас руу шиднэ
             router.replace('/technician/pending' as any);
          } else {
             // Баталгаажсан (active) бол Засварчны Дашборд руу шиднэ
             router.replace('/technician/tabs' as any);
          }
        } else {
          // Иргэн бол урьдын адил Иргэний нүүр хуудас руу шиднэ
          router.replace('/tabs' as any);
        }
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Нэвтрэхэд алдаа гарлаа.';
      Alert.alert('Алдаа', errorMsg);
    }
  }, [loginEmail, loginPassword]);

  /**
   * Mock Registration function
   */
  const handleRegister = useCallback(async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      Alert.alert('Анхааруулга', 'Бүх талбарыг бөглөнө үү.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Алдаа', 'Нууц үг зөрүүтэй байна.');
      return;
    }
    if (isTechnician && (!idImage || !certImage)) {
      Alert.alert('Анхааруулга', 'Мэргэжлийн мэдээллээ бүрэн оруулна уу.');
      return;
    }

    try {
  const formData = new FormData();
  formData.append('name', name.trim());
  formData.append('email', email.trim().toLowerCase());
  formData.append('phone', phone.trim());
  formData.append('password', password);
  formData.append('type', role === 4 ? 'customer' : 'technician');

  // Зөвхөн засварчин бол зураг хавсаргах хэсэг
  if (isTechnician) {
    if (idImage) {
      const fixedUri = Platform.OS === 'android' && !idImage.startsWith('file://') 
        ? `file://${idImage}` 
        : idImage;
      formData.append('id_card_image', { 
        uri: fixedUri, 
        name: 'id_card.jpg', 
        type: 'image/jpeg' 
      } as any);
    }
    
    if (certImage) {
      const fixedUri = Platform.OS === 'android' && !certImage.startsWith('file://') 
        ? `file://${certImage}` 
        : certImage;
      formData.append('certificate_image', { 
        uri: fixedUri, 
        name: 'cert.jpg', 
        type: 'image/jpeg' 
      } as any);
    }
  } // <--- ЭНД хаалтыг хаах ёстой! (isTechnician дууслаа)

  // Одоо Илгээх хэсэг нь if-ийн гадна байгаа тул хэн ч бүртгүүлсэн ажиллана
  console.log('Илгээж байна...');
  const response = await axios.post(`${API_URL}/register`, formData, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'multipart/form-data',
    },
  });

  if (response.status === 201 || response.data.success) {
    Alert.alert('Баяр хүргэе!', 'Та амжилттай бүртгүүллээ.');
    console.log("Бүртгэл амжилттай:", response.data);
    setActiveTab('login'); 
  }
} catch (error: any) {
  console.error("Бүртгэлийн алдаа:", error.response?.data || error.message);
  Alert.alert('Алдаа', 'Бүртгэл амжилтгүй боллоо.');
}
  }, [name, email, phone, password, confirmPassword, role, idImage, certImage, isTechnician]);

  /**
   * Detects when user reaches the bottom of the terms ScrollView
   */
  const handleTermsScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  // Validation logic for the submit button
  const isRegisterDisabled = 
    !name.trim() || 
    !email.trim() || 
    !phone.trim() || 
    !password || 
    !confirmPassword || 
    !mainTermsAccepted || 
    (isTechnician && (!idImage || !certImage));

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          
          {/* Brand Header */}
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <ShieldCheck size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Засвар Үйлчилгээ</Text>
            <Text style={styles.subtitle}>Тавтай морил, үйлчилгээгээ эхлүүлцгээе</Text>
            
            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.tab, activeTab === 'login' && styles.activeTab]}
                onPress={() => setActiveTab('login')}
              >
                <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>Нэвтрэх</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.tab, activeTab === 'register' && styles.activeTab]}
                onPress={() => setActiveTab('register')}
              >
                <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>Бүртгүүлэх</Text>
              </TouchableOpacity>
            </View>
          </View>

          {activeTab === 'login' ? (
            /* --- LOGIN FORM --- */
            <View style={styles.form}>
              <View style={styles.inputWrapper}>
                <Mail size={20} color={COLORS.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="И-мэйл хаяг"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={loginEmail}
                  onChangeText={setLoginEmail}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Lock size={20} color={COLORS.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Нууц үг"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                />
              </View>

              <TouchableOpacity 
                activeOpacity={0.8}
                style={styles.primaryButton} 
                onPress={handleLogin}
              >
                <Text style={styles.primaryButtonText}>Нэвтрэх</Text>
                <ChevronRight size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          ) : (
            /* --- REGISTRATION FORM --- */
            <View style={styles.form}>
              <View style={styles.inputWrapper}>
                <User size={20} color={COLORS.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Бүтэн нэр"
                  placeholderTextColor="#94a3b8"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Mail size={20} color={COLORS.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="И-мэйл хаяг"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Phone size={20} color={COLORS.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Утасны дугаар"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Lock size={20} color={COLORS.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Нууц үг"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Lock size={20} color={COLORS.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Нууц үг давтах"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              {/* Role Selection */}
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.roleBtn, role === 4 && styles.activeRoleBtn]}
                  onPress={() => setRole(4)}
                >
                  <Text style={[styles.roleBtnText, role === 4 && styles.activeRoleBtnText]}>Иргэн</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.roleBtn, role === 5 && styles.activeRoleBtn]}
                  onPress={() => setRole(5)}
                >
                  <Text style={[styles.roleBtnText, role === 5 && styles.activeRoleBtnText]}>Засварчин</Text>
                </TouchableOpacity>
              </View>

              {/* Technician UI Section */}
              {isTechnician && (
                <View style={styles.techBox}>
                  <View style={styles.techHeader}>
                    <Info size={16} color={COLORS.primary} />
                    <Text style={styles.techTitle}>Мэргэжлийн мэдээлэл</Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.uploadBtn} 
                    onPress={() => pickImage('id')}
                  >
                    <ImageIcon size={20} color={COLORS.primary} />
                    <Text style={styles.uploadBtnText}>
                      {idImage ? 'Иргэний үнэмлэх сонгогдсон' : 'Иргэний үнэмлэхний зураг'}
                    </Text>
                    {idImage && <CheckCircle2 size={18} color={COLORS.primary} />}
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.uploadBtn} 
                    onPress={() => pickImage('cert')}
                  >
                    <ShieldCheck size={20} color={COLORS.primary} />
                    <Text style={styles.uploadBtnText}>
                      {certImage ? 'Мэргэжлийн үнэмлэх сонгогдсон' : 'Мэргэжлийн үнэмлэх'}
                    </Text>
                    {certImage && <CheckCircle2 size={18} color={COLORS.primary} />}
                  </TouchableOpacity>
                </View>
              )}

              {/* Terms of Service Section */}
              <View style={styles.termsBox}>
                <TouchableOpacity 
                  onPress={() => setShowTerms(true)}
                  style={styles.termsLinkBtn}
                >
                  <Text style={styles.termsLinkText}>Үйлчилгээний нөхцөл унших</Text>
                </TouchableOpacity>
                
                <View style={styles.switchRow}>
                  <Switch
                    value={mainTermsAccepted}
                    onValueChange={setMainTermsAccepted}
                    disabled={!modalAccepted}
                    trackColor={{ false: '#cbd5e1', true: COLORS.primary }}
                  />
                  <Text style={[styles.switchLabel, !modalAccepted && { opacity: 0.4 }]}>
                    Би үйлчилгээний нөхцөлийг хүлээн зөвшөөрч байна
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                activeOpacity={0.8}
                style={[styles.primaryButton, isRegisterDisabled && styles.disabledBtn]} 
                onPress={handleRegister}
                disabled={isRegisterDisabled}
              >
                <Text style={styles.primaryButtonText}>Бүртгүүлэх</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* --- TERMS MODAL --- */}
      <Modal 
        visible={showTerms} 
        animationType="slide" 
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Үйлчилгээний нөхцөл</Text>
          </View>
          
          <ScrollView 
            style={styles.modalBody} 
            onScroll={handleTermsScroll}
            scrollEventThrottle={16}
          >
            <Text style={styles.termsContent}>
              <Text style={styles.termsHeading}>Нэгдүгээр бүлэг. Ерөнхий заалт{"\n\n"}</Text>
              1.1. Энэхүү үйлчилгээний нөхцөл нь засвар үйлчилгээний аппликейшн ашиглахтай холбоотой харилцааг зохицуулна.{"\n\n"}
              1.2. Хэрэглэгч бүртгүүлэхээс өмнө энэхүү нөхцөлтэй бүрэн танилцах үүрэгтэй.{"\n\n"}
              
              <Text style={styles.termsHeading}>Хоёрдугаар бүлэг. Хэрэглэгчийн эрх, үүрэг{"\n\n"}</Text>
              2.1. Хэрэглэгч өөрийн мэдээллийг үнэн зөв оруулах үүрэгтэй.{"\n\n"}
              2.2. Засварчин нь мэргэжлийн үнэмлэх, иргэний үнэмлэхний зургаа баталгаажуулна.{"\n\n"}
              
              <Text style={styles.termsHeading}>Гуравдугаар бүлэг. Нууцлал{"\n\n"}</Text>
              3.1. Бид таны мэдээллийг гуравдагч этгээдэд задруулахгүй.{"\n\n"}
              
              [Энд маш урт текст үргэлжилнэ...] {"\n\n"}
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.{"\n\n"}
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.{"\n\n"}
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.{"\n\n"}
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.{"\n\n"}
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.{"\n\n"}
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.{"\n\n"}
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.{"\n\n"}
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.{"\n\n"}
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.{"\n\n"}
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.{"\n\n"}
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.{"\n\n"}
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.{"\n\n"}
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.{"\n\n"}
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.{"\n\n"}
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.{"\n\n"}
              Энэхүү нөхцөлийг уншиж дууссанаар та зөвшөөрөх боломжтой болно.
            </Text>
          </ScrollView>

          <View style={styles.modalFooter}>
            <View style={styles.switchRow}>
              <Switch
                value={modalAccepted}
                onValueChange={setModalAccepted}
                disabled={!hasScrolledToBottom}
                trackColor={{ false: '#cbd5e1', true: COLORS.primary }}
              />
              <Text style={[styles.switchLabel, !hasScrolledToBottom && { opacity: 0.4 }]}>
                Би нөхцөлийг уншиж танилцсан
              </Text>
            </View>
            <TouchableOpacity 
              activeOpacity={0.8}
              style={[styles.primaryButton, !modalAccepted && styles.disabledBtn]} 
              onPress={() => setShowTerms(false)}
              disabled={!modalAccepted}
            >
              <Text style={styles.primaryButtonText}>Хаах</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 24,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 14,
    padding: 4,
    width: '100%',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.muted,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  form: {
    gap: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    height: 58,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  disabledBtn: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  roleBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  activeRoleBtn: {
    borderColor: COLORS.primary,
    backgroundColor: '#ecfdf5',
  },
  roleBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.muted,
  },
  activeRoleBtnText: {
    color: COLORS.primary,
  },
  techBox: {
    marginTop: 10,
    gap: 12,
    padding: 18,
    backgroundColor: '#f1f5f9',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  techHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  techTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  uploadBtnText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  termsBox: {
    marginTop: 12,
    gap: 14,
    paddingHorizontal: 4,
  },
  termsLinkBtn: {
    alignSelf: 'center',
  },
  termsLinkText: {
    color: COLORS.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchLabel: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  modalBody: {
    flex: 1,
    padding: 24,
  },
  termsContent: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 26,
  },
  termsHeading: {
    fontWeight: '800',
    color: COLORS.text,
    fontSize: 16,
  },
  modalFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 20,
    backgroundColor: COLORS.white,
  },
});