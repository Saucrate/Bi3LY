import React from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const UserManagementScreen = () => {
  // Sample data for users
  const users = [
    { id: '1', name: 'علي محمد', purchase: 'هاتف ذكي', status: '✅ مكتمل' },
    { id: '2', name: 'هناء صالح', purchase: 'حذاء رياضي', status: '⏳ قيد الانتظار' },
    { id: '3', name: 'عمر سعيد', purchase: 'سماعات', status: '❌ ملغي' },
  ];

  const renderUserItem = ({ item }) => (
    <View style={styles.userItem}>
      <Text style={styles.userName}>{item.name}</Text>
      <Text style={styles.userPurchase}>{item.purchase}</Text>
      <Text style={styles.userStatus}>{item.status}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <Text style={styles.title}>إدارة العملاء</Text>
      <View style={styles.searchContainer}>
        <TextInput style={styles.searchBar} placeholder="بحث عن العملاء" />
      </View>

      {/* Client Statistics */}
      <View style={styles.statisticsContainer}>
        <Text style={styles.statisticsText}>👥 إجمالي العملاء: 10,500 عميل مسجل</Text>
        <Text style={styles.statisticsText}>⭐ العملاء المميزين: 250 عضو مميز</Text>
        <Text style={styles.statisticsText}>📦 إجمالي الطلبات من العملاء: 5,000 طلب</Text>
      </View>

      {/* Client Activity Log */}
      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />

      {/* Actionable Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>ترقية إلى VIP</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>إرسال إشعار</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    paddingBottom: 80, // Add padding to the bottom
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchBar: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 20,
  },
  statisticsContainer: {
    marginBottom: 20,
  },
  statisticsText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  listContainer: {
    paddingBottom: 20,
  },
  userItem: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userPurchase: {
    fontSize: 14,
    color: 'gray',
  },
  userStatus: {
    fontSize: 14,
    color: 'gray',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#3d4785',
    padding: 15,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default UserManagementScreen;