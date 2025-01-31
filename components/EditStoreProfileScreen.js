import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const EditStoreProfileScreen = () => {
  const navigation = useNavigation();
  const [storeName, setStoreName] = useState('متجر الأناقة الأوروبية');
  const [ownerName, setOwnerName] = useState('محمد أحمد العتيبي');
  const [email, setEmail] = useState('store@email.com');
  const [phoneNumber, setPhoneNumber] = useState('+966 55 123 4567');
  const [businessCategory, setBusinessCategory] = useState('عطور وملابس');
  const [storeAddress, setStoreAddress] = useState('شارع الملك فهد، الرياض');
  const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.pageTitle}>تعديل معلومات المتجر</Text>
        <View style={styles.logoContainer}>
          <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.storeLogo} />
          <TouchableOpacity style={styles.editIcon}>
            <FontAwesome name="edit" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          value={storeName}
          onChangeText={setStoreName}
          placeholder="اسم المتجر"
        />
        <TextInput
          style={styles.input}
          value={ownerName}
          onChangeText={setOwnerName}
          placeholder="اسم المالك"
        />
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="البريد الإلكتروني"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="رقم الهاتف"
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          value={businessCategory}
          onChangeText={setBusinessCategory}
          placeholder="فئة العمل"
        />
        <TextInput
          style={styles.input}
          value={storeAddress}
          onChangeText={setStoreAddress}
          placeholder="عنوان المتجر"
        />
        <TextInput
          style={styles.input}
          value={businessRegistrationNumber}
          onChangeText={setBusinessRegistrationNumber}
          placeholder="رقم التسجيل التجاري (اختياري)"
        />
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>حفظ التغييرات</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollViewContent: {
    padding: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  storeLogo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: '#3d4785',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 10,
    backgroundColor: '#3d4785',
    borderRadius: 20,
    padding: 5,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 10,
    textAlign: 'right',
  },
  saveButton: {
    backgroundColor: '#ff0000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default EditStoreProfileScreen;
