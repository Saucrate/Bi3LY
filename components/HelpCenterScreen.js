import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

const HelpCenterScreen = () => {
  const helpTopics = [
    {
      title: 'كيفية إضافة منتج',
      icon: 'plus-circle',
      description: 'تعلم كيفية إضافة وإدارة منتجاتك في المتجر'
    },
    {
      title: 'إدارة الطلبات',
      icon: 'shopping-cart',
      description: 'كيفية التعامل مع الطلبات وتتبع الشحنات'
    },
    {
      title: 'المدفوعات والتسويات',
      icon: 'money-bill-wave',
      description: 'معلومات حول المدفوعات وتسوية الحسابات'
    },
    {
      title: 'الدعم الفني',
      icon: 'headset',
      description: 'تواصل مع فريق الدعم الفني للمساعدة'
    },
    {
      title: 'الأسئلة الشائعة',
      icon: 'question-circle',
      description: 'إجابات على الأسئلة المتكررة'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {helpTopics.map((topic, index) => (
          <TouchableOpacity key={index} style={styles.topicCard}>
            <FontAwesome5 name={topic.icon} size={24} color="#3d4785" />
            <View style={styles.topicContent}>
              <Text style={styles.topicTitle}>{topic.title}</Text>
              <Text style={styles.topicDescription}>{topic.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  topicContent: {
    marginLeft: 16,
    flex: 1,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3d4785',
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default HelpCenterScreen; 