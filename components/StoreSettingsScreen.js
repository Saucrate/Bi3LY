import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const StoreSettingsScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.pageTitle}>إعدادات المتجر</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إدارة المتجر</Text>
          <TouchableOpacity style={styles.sectionItem} onPress={() => navigation.navigate('EditStoreProfile')}>
            <Text style={styles.sectionItemText}>تعديل معلومات المتجر</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sectionItem} onPress={() => navigation.navigate('ManageOrders')}>
            <Text style={styles.sectionItemText}>إدارة الطلبات</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sectionItem} onPress={() => navigation.navigate('ManageCustomers')}>
            <Text style={styles.sectionItemText}>إدارة العملاء</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المالية والمدفوعات</Text>
          <TouchableOpacity style={styles.sectionItem} onPress={() => navigation.navigate('PaymentSettings')}>
            <Text style={styles.sectionItemText}>إعدادات الدفع</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sectionItem} onPress={() => navigation.navigate('SalesReports')}>
            <Text style={styles.sectionItemText}>تقارير المبيعات</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sectionItem} onPress={() => navigation.navigate('CommissionManagement')}>
            <Text style={styles.sectionItemText}>إدارة العمولات</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نمو المتجر</Text>
          <TouchableOpacity style={styles.sectionItem} onPress={() => navigation.navigate('SponsoredAds')}>
            <Text style={styles.sectionItemText}>إعلانات ممولة</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sectionItem} onPress={() => navigation.navigate('StoreAnalytics')}>
            <Text style={styles.sectionItemText}>تحليلات المتجر</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sectionItem} onPress={() => navigation.navigate('AddApproval')}>
            <Text style={styles.sectionItemText}>إضافة ✅ للموافقة</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الدعم والسياسات</Text>
          <TouchableOpacity style={styles.sectionItem} onPress={() => navigation.navigate('HelpCenter')}>
            <Text style={styles.sectionItemText}>مركز المساعدة</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sectionItem} onPress={() => navigation.navigate('SalesPolicies')}>
            <Text style={styles.sectionItemText}>سياسات البيع</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الإجراءات</Text>
          <TouchableOpacity style={styles.sectionItem} onPress={() => navigation.navigate('ReportIssue')}>
            <Text style={styles.sectionItemText}>إبلاغ عن مشكلة</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sectionItem} onPress={() => navigation.navigate('Logout')}>
            <Text style={styles.sectionItemText}>تسجيل الخروج</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate('AddNewItem')}>
          <FontAwesome name="plus" size={24} color="#fff" />
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
    paddingBottom: 29,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3d4785',
    marginBottom: 10,
  },
  sectionItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  sectionItemText: {
    fontSize: 16,
    color: '#333',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#ff0000',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 29,
  },
});

export default StoreSettingsScreen;
