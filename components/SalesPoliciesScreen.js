import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SalesPoliciesScreen = () => {
  const policies = [
    {
      title: 'سياسة البيع العامة',
      content: 'يجب على جميع البائعين الالتزام بسياسات البيع العامة للمنصة...'
    },
    {
      title: 'سياسة الإرجاع',
      content: 'يحق للعميل إرجاع المنتج خلال 14 يوماً من تاريخ الاستلام...'
    },
    {
      title: 'سياسة الشحن',
      content: 'يجب شحن المنتجات خلال 48 ساعة من تأكيد الطلب...'
    },
    {
      title: 'سياسة الضمان',
      content: 'تخضع جميع المنتجات لضمان المصنع وفقاً للشروط...'
    },
    {
      title: 'العمولات والرسوم',
      content: 'تطبق عمولة 10% على جميع المبيعات...'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {policies.map((policy, index) => (
          <View key={index} style={styles.policyCard}>
            <Text style={styles.policyTitle}>{policy.title}</Text>
            <Text style={styles.policyContent}>{policy.content}</Text>
          </View>
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
  policyCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  policyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3d4785',
    marginBottom: 8,
    textAlign: 'right',
  },
  policyContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'right',
  },
});

export default SalesPoliciesScreen; 