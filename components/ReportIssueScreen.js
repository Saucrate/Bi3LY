import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { requestService } from '../services/requestService';
import * as ImagePicker from 'expo-image-picker';

const ReportIssueScreen = () => {
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImages([...images, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء اختيار الصورة');
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async () => {
    try {
      if (!description) {
        Alert.alert('خطأ', 'يرجى كتابة وصف للمشكلة');
        return;
      }

      const formData = new FormData();
      formData.append('description', description);
      formData.append('type', 'USER_COMPLAINT');

      // Resimleri ekle
      images.forEach((uri, index) => {
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('file', {
          uri,
          type,
          name: filename
        });
      });

      await requestService.createComplaintRequest(formData);
      Alert.alert('نجاح', 'تم إرسال الشكوى بنجاح');
      
      // Reset form
      setDescription('');
      setImages([]);
    } catch (error) {
      console.error('Error submitting complaint:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إرسال الشكوى');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <FontAwesome5 name="exclamation-circle" size={60} color="#3d4785" />
        </View>
        
        <Text style={styles.title}>تقديم شكوى</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>وصف المشكلة</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholder="اشرح المشكلة بالتفصيل..."
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>الصور (اختياري)</Text>
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
            <FontAwesome5 name="camera" size={20} color="#3d4785" />
            <Text style={styles.imagePickerText}>إضافة صورة</Text>
          </TouchableOpacity>

          <View style={styles.imagePreviewContainer}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imagePreview}>
                <Image source={{ uri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <FontAwesome5 name="times-circle" size={20} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>إرسال الشكوى</Text>
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
  content: {
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3d4785',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3d4785',
    borderStyle: 'dashed',
  },
  imagePickerText: {
    marginLeft: 10,
    color: '#3d4785',
    fontSize: 16,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  imagePreview: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  submitButton: {
    backgroundColor: '#3d4785',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ReportIssueScreen; 