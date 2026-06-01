import React, { useState, useCallback, useEffect } from 'react';
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
const API_URL = 'http://192.168.1.4:8000/api'; 

import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  ShieldCheck, 
  Image as ImageIcon, 
  CheckCircle2, 
  ChevronRight,
  Info,
  Wrench,
  Eye,       
  EyeOff     
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Primary Colors & Theme
const COLORS = {
  primary: '#10b981',
  background: '#f8fafc',
  text: '#1e293b',
  muted: '#64748b',
  border: '#e2e8f0',
  white: '#ffffff',
  error: '#ef4444',
};

export default function AuthScreen() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login'); 
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false); 
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 
  const [role, setRole] = useState<4 | 5>(4);
  const [idImage, setIdImage] = useState<string | null>(null);
  const [certImage, setCertImage] = useState<string | null>(null); 
  const [selectedService, setSelectedService] = useState('');
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [showTerms, setShowTerms] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [modalAccepted, setModalAccepted] = useState(false);
  const [mainTermsAccepted, setMainTermsAccepted] = useState(false);

  const isTechnician = role === 5;

  useEffect(() => {
    const fetchServiceTypes = async () => {
      try {
        const response = await axios.get(`${API_URL}/services`);
        if (response.data && response.data.data) {
           const types = response.data.data.map((item: any) => item.name);
           setServiceTypes(types);
        }
      } catch (error) {
        setServiceTypes(['Сантехник', 'Цахилгаан', 'Мужаан', 'Орон сууц', 'Компьютер засвар']);
      }
    };
    fetchServiceTypes();
  }, []);

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
        await AsyncStorage.setItem('token', response.data.token);
        
        const user = response.data.user;
        if (user) {
          await AsyncStorage.setItem('user', JSON.stringify(user));
        }

        if (user && user.role_id === 5) {
          router.replace('/technician/tabs' as any);
        } else {
          router.replace('/tabs' as any);
        }
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Нэвтрэхэд алдаа гарлаа.';
      Alert.alert('Алдаа', errorMsg);
    }
  }, [loginEmail, loginPassword]);

  const handleRegister = useCallback(async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      Alert.alert('Анхааруулга', 'Бүх талбарыг бөглөнө үү.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Алдаа', 'Нууц үг зөрүүтэй байна.');
      return;
    }
    if (isTechnician && (!idImage || !certImage || !selectedService)) {
      Alert.alert('Анхааруулга', 'Мэргэжлийн мэдээлэл болон үйлчилгээний төрлөө бүрэн оруулна уу.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('email', email.trim().toLowerCase());
      formData.append('phone', phone.trim());
      formData.append('password', password);
      formData.append('type', role === 4 ? 'customer' : 'technician');

      if (isTechnician) {
        formData.append('service_type', selectedService);

        if (idImage) {
          const fixedUri = Platform.OS === 'android' && !idImage.startsWith('file://') ? `file://${idImage}` : idImage;
          formData.append('id_card_image', { uri: fixedUri, name: 'id_card.jpg', type: 'image/jpeg' } as any);
        }
        
        if (certImage) {
          const fixedUri = Platform.OS === 'android' && !certImage.startsWith('file://') ? `file://${certImage}` : certImage;
          formData.append('certificate_image', { uri: fixedUri, name: 'cert.jpg', type: 'image/jpeg' } as any);
        }
      }

      const response = await axios.post(`${API_URL}/register`, formData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201 || response.data.success) {
        Alert.alert('Баяр хүргэе!', 'Та амжилттай бүртгүүллээ.');
        setActiveTab('login'); 
      }
    } catch (error: any) {
      console.error("Бүртгэлийн алдаа:", error.response?.data || error.message);
      Alert.alert('Алдаа', 'Бүртгэл амжилтгүй боллоо.');
    }
  }, [name, email, phone, password, confirmPassword, role, idImage, certImage, selectedService, isTechnician]);

  const handleTermsScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const isRegisterDisabled = 
    !name.trim() || 
    !email.trim() || 
    !phone.trim() || 
    !password || 
    !confirmPassword || 
    !mainTermsAccepted || 
    (isTechnician && (!idImage || !certImage || !selectedService));

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
          
          {/* --- ӨӨРЧИЛСӨН ТОЛГОЙ ХЭСЭГ (ЛОГО БОЛОН ТЕКСТ) --- */}
          <View style={styles.header}>
            <Image 
              source={require('./assets/images/logo.png')} 
              style={styles.logoImage} 
              resizeMode="contain"
            />
            <Text style={styles.title}>Засварын дуудлагын программ</Text>
            <Text style={styles.subtitle}>Мэргэжлийн засварчдын нэгдсэн платформ</Text>
            
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
          {/* ---------------------------------------------------- */}

          {activeTab === 'login' ? (
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
                  secureTextEntry={!showLoginPassword} 
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                />
                <TouchableOpacity onPress={() => setShowLoginPassword(!showLoginPassword)} style={styles.eyeIcon}>
                  {showLoginPassword ? (
                    <Eye size={20} color={COLORS.primary} />
                  ) : (
                    <EyeOff size={20} color={COLORS.muted} />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.forgotPasswordBtn}
                onPress={() => router.push('/forgot-password' as any)} 
              >
                <Text style={styles.forgotPasswordText}>Нууц үгээ мартсан уу?</Text>
              </TouchableOpacity>

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
                  secureTextEntry={!showRegisterPassword} 
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowRegisterPassword(!showRegisterPassword)} style={styles.eyeIcon}>
                  {showRegisterPassword ? <Eye size={20} color={COLORS.primary} /> : <EyeOff size={20} color={COLORS.muted} />}
                </TouchableOpacity>
              </View>

              <View style={styles.inputWrapper}>
                <Lock size={20} color={COLORS.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Нууц үг давтах"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showConfirmPassword} 
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                  {showConfirmPassword ? <Eye size={20} color={COLORS.primary} /> : <EyeOff size={20} color={COLORS.muted} />}
                </TouchableOpacity>
              </View>

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

              {isTechnician && (
                <View style={styles.techBox}>
                  <View style={styles.techHeader}>
                    <Info size={16} color={COLORS.primary} />
                    <Text style={styles.techTitle}>Мэргэжлийн мэдээлэл</Text>
                  </View>
                  
                  <Text style={styles.inputLabel}>Үйлчилгээний төрөл сонгох:</Text>
                  <View style={styles.servicesGrid}>
                    {serviceTypes.map((type, index) => (
                      <TouchableOpacity 
                        key={index}
                        style={[styles.serviceTypeBtn, selectedService === type && styles.serviceTypeBtnActive]}
                        onPress={() => setSelectedService(type)}
                      >
                        <Text style={[styles.serviceTypeText, selectedService === type && styles.serviceTypeTextActive]}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.inputLabel}>Баримт бичиг хавсаргах:</Text>
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
              <Text style={styles.termsHeading}>1. ЕРӨНХИЙ ЗҮЙЛ{"\n\n"}</Text>
              1.1. “Fixy” нь гэр ахуй, албан тасалгаанд шаардлагатай засвар үйлчилгээг авах хүсэлтэй иргэдийг, тухайн чиглэлээр мэргэшсэн засварчидтай газрын зураг болон байршилд тулгуурлан шууд холбох, зуучлах үйлчилгээ үзүүлдэг Мобайл аппликейшн /цаашид “Платформ” гэх/ юм.{"\n\n"}
              1.2. Энэхүү үйлчилгээний нөхцөлийн зорилго нь "Fixy" ХХК /цаашид “Компани” гэх/ болон Платформоор дамжуулан үйлчилгээ авах хүсэлт гаргасан иргэн /цаашид “Захиалагч” гэх/, ажил үйлчилгээ гүйцэтгэх “Засварчин” /цаашид “Гүйцэтгэгч” гэх/ нарын хооронд үүсэх харилцааг зохицуулахад оршино.{"\n\n"}
              1.3. Энэхүү Үйлчилгээний нөхцөлд хэрэглэсэн нэр томьёог дор дурдсан утгаар ойлгоно. Үүнд:{"\n"}
              • “Хэрэглэгч” гэж Платформыг ашиглаж буй иргэн, хуулийн этгээдийг;{"\n"}
              • “Захиалагч” гэж Платформд бүртгэл үүсгэн, засвар үйлчилгээний дуудлага илгээж буй хувь хүн, хуулийн этгээдийг;{"\n"}
              • “Засварчин” (Гүйцэтгэгч) гэж Платформд бүртгүүлж, баталгаажсаны үндсэн дээр Захиалагчийн дуудлагыг хүлээн авч, биечлэн очиж засвар үйлчилгээ үзүүлэх хувь хүнийг;{"\n\n"}
              
              Энэхүү нөхцөлийг бүрэн уншиж танилцсанаар та доорх товчийг идэвхжүүлж зөвшөөрөх боломжтой болно.
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
  container: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 60 },
  header: { marginBottom: 32, alignItems: 'center' },
  
  // --- ШИНЭ: Логоны загвар ---
  logoImage: { width: 100, height: 100, marginBottom: 16 }, 
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 24, textAlign: 'center', fontWeight: '500' },
  // ---------------------------------
  
  tabContainer: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 14, padding: 4, width: '100%' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: COLORS.white, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 15, fontWeight: '600', color: COLORS.muted },
  activeTabText: { color: COLORS.primary },
  form: { gap: 16 },
  
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 16, height: 58 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: COLORS.text },
  
  eyeIcon: { padding: 8, marginRight: -8 },
  forgotPasswordBtn: { alignSelf: 'flex-end', marginTop: -6, marginBottom: 8 },
  forgotPasswordText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },

  primaryButton: { backgroundColor: COLORS.primary, borderRadius: 14, height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4, gap: 8 },
  disabledBtn: { backgroundColor: '#94a3b8', shadowOpacity: 0, elevation: 0 },
  primaryButtonText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  roleContainer: { flexDirection: 'row', gap: 12, marginTop: 8 },
  roleBtn: { flex: 1, height: 50, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white },
  activeRoleBtn: { borderColor: COLORS.primary, backgroundColor: '#ecfdf5' },
  roleBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.muted },
  activeRoleBtnText: { color: COLORS.primary },
  
  techBox: { marginTop: 10, gap: 12, padding: 18, backgroundColor: '#f1f5f9', borderRadius: 18, borderWidth: 1, borderColor: COLORS.border },
  techHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  techTitle: { fontSize: 15, fontWeight: '700', color: '#334155' },
  
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#64748b', marginTop: 4 },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  serviceTypeBtn: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#cbd5e1' },
  serviceTypeBtnActive: { backgroundColor: '#10b981', borderColor: '#10b981' },
  serviceTypeText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  serviceTypeTextActive: { color: '#fff', fontWeight: 'bold' },

  uploadBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  uploadBtnText: { flex: 1, fontSize: 14, color: '#475569', fontWeight: '500' },
  
  termsBox: { marginTop: 12, gap: 14, paddingHorizontal: 4 },
  termsLinkBtn: { alignSelf: 'center' },
  termsLinkText: { color: COLORS.primary, fontWeight: '600', textDecorationLine: 'underline', fontSize: 14 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  switchLabel: { flex: 1, fontSize: 14, color: '#475569', lineHeight: 20 },
  modalContainer: { flex: 1, backgroundColor: COLORS.white },
  modalHeader: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  modalBody: { flex: 1, padding: 24 },
  termsContent: { fontSize: 15, color: '#475569', lineHeight: 26 },
  termsHeading: { fontWeight: '800', color: COLORS.text, fontSize: 16 },
  modalFooter: { padding: 24, borderTopWidth: 1, borderTopColor: '#f1f5f9', gap: 20, backgroundColor: COLORS.white },
});