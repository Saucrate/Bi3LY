import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { sellerService } from '../services/sellerService';
import { useNavigation, useRoute } from '@react-navigation/native';

const EditStoreProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const initialStore = route.params?.store;
  const [loading, setLoading] = useState(false);
  
  const [storeData, setStoreData] = useState({
    name: initialStore?.name || '',
    description: initialStore?.description || '',
    category: initialStore?.category || '',
    location: initialStore?.location || '',
    contactPhone: initialStore?.contactPhone || '',
    contactEmail: initialStore?.contactEmail || '',
    logo: initialStore?.logo || '',
    banner: initialStore?.banner || '',
    socialMedia: {
      facebook: initialStore?.socialMedia?.facebook || '',
      instagram: initialStore?.socialMedia?.instagram || '',
      twitter: initialStore?.socialMedia?.twitter || '',
    },
    businessHours: {
      open: initialStore?.businessHours?.open || '',
      close: initialStore?.businessHours?.close || '',
      weekends: initialStore?.businessHours?.weekends || false,
    }
  });

  const pickImage = async (type) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'logo' ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setStoreData(prev => ({
          ...prev,
          [type]: result.assets[0].uri
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      
      // Temel bilgiler
      Object.keys(storeData).forEach(key => {
        if (key !== 'logo' && key !== 'banner' && key !== 'socialMedia' && key !== 'businessHours') {
          formData.append(key, storeData[key]);
        }
      });

      // Sosyal medya ve çalışma saatleri
      formData.append('socialMedia', JSON.stringify(storeData.socialMedia));
      formData.append('businessHours', JSON.stringify(storeData.businessHours));

      // Resimler
      if (storeData.logo && storeData.logo.startsWith('file://')) {
        formData.append('logo', {
          uri: storeData.logo,
          type: 'image/jpeg',
          name: 'logo.jpg'
        });
      }

      if (storeData.banner && storeData.banner.startsWith('file://')) {
        formData.append('banner', {
          uri: storeData.banner,
          type: 'image/jpeg',
          name: 'banner.jpg'
        });
      }

      const response = await sellerService.updateStoreProfile(formData);

      if (response.success) {
        Alert.alert('نجاح', 'تم تحديث معلومات المتجر بنجاح');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('خطأ', error.message || 'فشل تحديث معلومات المتجر');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#3d4785" />
          </View>
        )}

        {/* Banner Section */}
        <TouchableOpacity onPress={() => pickImage('banner')} style={styles.bannerContainer}>
          <Image
            source={{ uri: storeData.banner || 'https://via.placeholder.com/1200x300' }}
            style={styles.bannerImage}
          />
          <View style={styles.editOverlay}>
            <Ionicons name="camera" size={24} color="white" />
            <Text style={styles.editText}>تعديل الغلاف</Text>
          </View>
        </TouchableOpacity>

        {/* Logo Section */}
        <TouchableOpacity onPress={() => pickImage('logo')} style={styles.logoContainer}>
          <Image
            source={{ uri: storeData.logo || 'https://via.placeholder.com/150' }}
            style={styles.logoImage}
          />
          <View style={styles.editOverlay}>
            <Ionicons name="camera" size={24} color="white" />
          </View>
        </TouchableOpacity>

        {/* Basic Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المعلومات الأساسية</Text>
          
          <Text style={styles.label}>اسم المتجر</Text>
          <TextInput
            style={styles.input}
            value={storeData.name}
            onChangeText={(text) => setStoreData(prev => ({ ...prev, name: text }))}
            placeholder="أدخل اسم المتجر"
          />

          <Text style={styles.label}>الوصف</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={storeData.description}
            onChangeText={(text) => setStoreData(prev => ({ ...prev, description: text }))}
            placeholder="أدخل وصف المتجر"
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>الفئة</Text>
          <TextInput
            style={styles.input}
            value={storeData.category}
            onChangeText={(text) => setStoreData(prev => ({ ...prev, category: text }))}
            placeholder="أدخل فئة المتجر"
          />

          <Text style={styles.label}>الموقع</Text>
          <TextInput
            style={styles.input}
            value={storeData.location}
            onChangeText={(text) => setStoreData(prev => ({ ...prev, location: text }))}
            placeholder="أدخل موقع المتجر"
          />
        </View>

        {/* Contact Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات الاتصال</Text>
          
          <Text style={styles.label}>رقم الهاتف</Text>
          <TextInput
            style={[styles.input, { backgroundColor: '#f0f0f0' }]}
            value={storeData.contactPhone}
            editable={false}
            placeholder="رقم الهاتف"
          />

          <Text style={styles.label}>البريد الإلكتروني</Text>
          <TextInput
            style={[styles.input, { backgroundColor: '#f0f0f0' }]}
            value={storeData.contactEmail}
            editable={false}
            placeholder="البريد الإلكتروني"
          />
        </View>

        {/* Social Media Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>وسائل التواصل الاجتماعي</Text>
          
          <Text style={styles.label}>Facebook</Text>
          <TextInput
            style={styles.input}
            value={storeData.socialMedia.facebook}
            onChangeText={(text) => setStoreData(prev => ({
              ...prev,
              socialMedia: { ...prev.socialMedia, facebook: text }
            }))}
            placeholder="Enter Facebook profile URL"
          />

          <Text style={styles.label}>Instagram</Text>
          <TextInput
            style={styles.input}
            value={storeData.socialMedia.instagram}
            onChangeText={(text) => setStoreData(prev => ({
              ...prev,
              socialMedia: { ...prev.socialMedia, instagram: text }
            }))}
            placeholder="Enter Instagram profile URL"
          />

          <Text style={styles.label}>Twitter</Text>
          <TextInput
            style={styles.input}
            value={storeData.socialMedia.twitter}
            onChangeText={(text) => setStoreData(prev => ({
              ...prev,
              socialMedia: { ...prev.socialMedia, twitter: text }
            }))}
            placeholder="Enter Twitter profile URL"
          />
        </View>

        {/* Business Hours Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ساعات العمل</Text>
          
          <Text style={styles.label}>وقت الفتح</Text>
          <TextInput
            style={styles.input}
            value={storeData.businessHours.open}
            onChangeText={(text) => setStoreData(prev => ({
              ...prev,
              businessHours: { ...prev.businessHours, open: text }
            }))}
            placeholder="أدخل وقت الفتح (مثال: 09:00)"
          />

          <Text style={styles.label}>وقت الإغلاق</Text>
          <TextInput
            style={styles.input}
            value={storeData.businessHours.close}
            onChangeText={(text) => setStoreData(prev => ({
              ...prev,
              businessHours: { ...prev.businessHours, close: text }
            }))}
            placeholder="أدخل وقت الإغلاق (مثال: 18:00)"
          />

          <View style={styles.switchContainer}>
            <Text style={styles.label}>مفتوح في عطلة نهاية الأسبوع</Text>
            <Switch
              value={storeData.businessHours.weekends}
              onValueChange={(value) => setStoreData(prev => ({
                ...prev,
                businessHours: { ...prev.businessHours, weekends: value }
              }))}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>حفظ التغييرات</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  bannerContainer: {
    height: 200,
    marginBottom: 60,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  logoContainer: {
    position: 'absolute',
    top: 150,
    left: 16,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  editOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editText: {
    color: '#fff',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3d4785',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#3d4785',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditStoreProfileScreen;
