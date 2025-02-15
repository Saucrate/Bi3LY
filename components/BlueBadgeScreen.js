import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { requestService } from '../services/requestService';
import { sellerService } from '../services/sellerService';

const BlueBadgeScreen = () => {
  const [store, setStore] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
    try {
      const response = await sellerService.getStoreProfile();
      if (response.success) {
        setStore(response.data);
      }
    } catch (error) {
      console.error('Load store error:', error);
      Alert.alert('خطأ', 'فشل في تحميل معلومات المتجر');
    } finally {
      setLoading(false);
    }
  };

  const handleBlueBadgeRequest = async () => {
    try {
      if (!store) {
        Alert.alert('خطأ', 'لم يتم العثور على معلومات المتجر');
        return;
      }

      if (!description) {
        Alert.alert('خطأ', 'يرجى كتابة سبب طلب العلامة الزرقاء');
        return;
      }

      const requestData = {
        type: 'BLUE_BADGE',
        store: store._id,
        description: description
      };

      await requestService.createRequest(requestData);
      Alert.alert('نجاح', 'تم إرسال طلب العلامة الزرقاء بنجاح');
      setDescription('');
    } catch (error) {
      console.error('Blue badge request error:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إرسال الطلب');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#3d4785" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <FontAwesome5 name="check-circle" size={60} color="#3d4785" />
        </View>
        
        <Text style={styles.title}>طلب العلامة الزرقاء</Text>
        
        <Text style={styles.description}>
          العلامة الزرقاء هي علامة تميز المتاجر الموثوقة والنشطة في منصتنا. للحصول على العلامة الزرقاء، يجب أن يكون لديك:
        </Text>

        <View style={styles.requirementsList}>
          <View style={styles.requirementItem}>
            <FontAwesome5 name="check" size={16} color="#4CAF50" />
            <Text style={styles.requirementText}>متجر نشط لمدة 3 أشهر على الأقل</Text>
          </View>
          <View style={styles.requirementItem}>
            <FontAwesome5 name="check" size={16} color="#4CAF50" />
            <Text style={styles.requirementText}>تقييم لا يقل عن 4.5 نجوم</Text>
          </View>
          <View style={styles.requirementItem}>
            <FontAwesome5 name="check" size={16} color="#4CAF50" />
            <Text style={styles.requirementText}>50 طلب مكتمل على الأقل</Text>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>سبب الطلب</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholder="اشرح لماذا تستحق العلامة الزرقاء..."
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleBlueBadgeRequest}>
          <Text style={styles.submitButtonText}>إرسال الطلب</Text>
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
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  requirementsList: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  requirementText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
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

export default BlueBadgeScreen; 