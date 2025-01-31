import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SellersControlScreen = () => {
  // Sample data for sellers
  const sellers = [
    { id: '1', name: 'متجر علي' },
    { id: '2', name: 'متجر هناء' },
    { id: '3', name: 'متجر عمر' },
  ];

  const renderSellerItem = ({ item }) => (
    <View style={styles.sellerItem}>
      <Text style={styles.sellerName}>{item.name}</Text>
      <TouchableOpacity style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>حذف</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>التحكم في البائعين</Text>
      <FlatList
        data={sellers}
        renderItem={renderSellerItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>إضافة بائع جديد</Text>
      </TouchableOpacity>
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
  listContainer: {
    paddingBottom: 20,
  },
  sellerItem: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sellerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#3d4785',
    padding: 15,
    borderRadius: 20,
    marginTop: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SellersControlScreen;
