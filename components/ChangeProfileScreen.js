import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import CustomAlert from './CustomAlert';
import { Ionicons } from '@expo/vector-icons';

const ChangeProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [showImagePickerAlert, setShowImagePickerAlert] = useState(false);

  const handleSave = () => {
    // Handle save profile logic here
    console.log('Profile saved:', { name, email, phone, password, confirmPassword, profileImage });
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your photo library to select photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
    setShowImagePickerAlert(false);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your camera to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
    setShowImagePickerAlert(false);
  };

  const showImagePickerOptions = () => {
    setShowImagePickerAlert(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>تغيير الملف الشخصي</Text>
      <TouchableOpacity onPress={showImagePickerOptions}>
        <Image
          source={profileImage ? { uri: profileImage } : require('../assets/default-profile.png')}
          style={styles.profileImage}
        />
        <Text style={styles.changePhotoText}>تغيير الصورة</Text>
      </TouchableOpacity>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>الاسم</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="أدخل اسمك"
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>البريد الإلكتروني</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="أدخل بريدك الإلكتروني"
          keyboardType="email-address"
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>رقم الهاتف</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="أدخل رقم هاتفك"
          keyboardType="phone-pad"
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>كلمة المرور</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="أدخل كلمة المرور الجديدة"
          secureTextEntry
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>تأكيد كلمة المرور</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="أدخل كلمة المرور مرة أخرى"
          secureTextEntry
        />
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>حفظ</Text>
      </TouchableOpacity>
      <CustomAlert
        visible={showImagePickerAlert}
        message={
          <View style={styles.alertOptions}>
            <TouchableOpacity style={styles.alertOption} onPress={pickImage}>
              <Ionicons name="image" size={24} color="#3d4785" />
              <Text style={styles.alertOptionText}>اختيار من المعرض</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.alertOption} onPress={takePhoto}>
              <Ionicons name="camera" size={24} color="#3d4785" />
              <Text style={styles.alertOptionText}>التقاط صورة</Text>
            </TouchableOpacity>
          </View>
        }
        onClose={() => setShowImagePickerAlert(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 10,
  },
  changePhotoText: {
    textAlign: 'center',
    color: '#3d4785',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 10,
  },
  saveButton: {
    backgroundColor: '#3d4785',
    padding: 15,
    borderRadius: 20,
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  alertOptions: {
    width: '100%',
    alignItems: 'center',
  },
  alertOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    width: '100%',
    justifyContent: 'center',
  },
  alertOptionText: {
    fontSize: 16,
    color: '#3d4785',
    marginLeft: 10,
    textAlign: 'center',
  },
});

export default ChangeProfileScreen;
