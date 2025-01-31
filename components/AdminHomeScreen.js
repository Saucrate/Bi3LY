import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Modal } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

const requests = [
  { id: 1, sellerName: 'بائع 1', type: 'طلب وضع لافتة', amount: 100, status: 'معلق', date: '2023-10-01' },
  { id: 2, sellerName: 'بائع 2', type: 'طلب منتج مميز', amount: 200, status: 'مكتمل', date: '2023-10-02' },
  // ... more requests
];

const AdminHomeScreen = () => {
  const [filter, setFilter] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const handleFilterPress = () => {
    setModalVisible(true);
  };

  const applyFilter = (status) => {
    setFilter(status);
    setModalVisible(false);
  };

  const handleRequestPress = (request) => {
    setSelectedRequest(request);
    setModalVisible(true);
  };

  const renderRequest = (request) => (
    <TouchableOpacity key={request.id} style={styles.requestCard} onPress={() => handleRequestPress(request)}>
      <View style={styles.requestHeader}>
        <Text style={styles.sellerName}>{request.sellerName}</Text>
        <Text style={styles.requestDate}>{request.date}</Text>
      </View>
      <View style={styles.requestBody}>
        <Text style={styles.requestType}>
          {request.type} <FontAwesome name="tag" size={16} color="#555" />
        </Text>
        <Text style={styles.amount}>المبلغ: {request.amount}</Text>
        <Text style={[styles.status, styles[`status${request.status}`]]}>{request.status}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.filterInput}
        placeholder="ابحث عن طلب..."
        value={filter}
        onChangeText={setFilter}
      />
      <ScrollView style={styles.scrollView}>
        <Text style={styles.header}>مرحبًا بك في الشاشة الرئيسية للإدارة!</Text>
        
        <View style={styles.filterButtonContainer}>
          
          <TouchableOpacity style={[styles.filterButton, filter === '' && styles.activeFilterButton]} onPress={() => setFilter('')}>
            <Text style={styles.filterButtonText}>الكل</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterButton, filter === 'معلق' && styles.activeFilterButton]} onPress={() => setFilter('معلق')}>
            <Text style={styles.filterButtonText}>معلق</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterButton, filter === 'مكتمل' && styles.activeFilterButton]} onPress={() => setFilter('مكتمل')}>
            <Text style={styles.filterButtonText}>مكتمل</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.summary}>
          <Text style={styles.summaryText}>إجمالي الطلبات اليوم: 10</Text>
          <Text style={styles.summaryText}>الطلبات المعلقة: 5</Text>
          <Text style={styles.summaryText}>الطلبات المكتملة: 5</Text>
        </View>
        {requests.filter(request => request.sellerName.includes(filter) || request.type.includes(filter) || request.status.includes(filter)).map(renderRequest)}
        
      </ScrollView>
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedRequest ? (
              <>
                <Text style={styles.modalTitle}>تفاصيل الطلب</Text>
                <Text style={styles.modalText}>البائع: {selectedRequest.sellerName}</Text>
                <Text style={styles.modalText}>النوع: {selectedRequest.type}</Text>
                <Text style={styles.modalText}>المبلغ: {selectedRequest.amount}</Text>
                <Text style={styles.modalText}>الحالة: {selectedRequest.status}</Text>
                <Text style={styles.modalText}>التاريخ: {selectedRequest.date}</Text>
                <View style={styles.requestActions}>
                  <TouchableOpacity style={styles.approveButton}>
                    <Text style={styles.actionButtonText}>موافقة</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectButton}>
                    <Text style={styles.actionButtonText}>رفض</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalButtonText}>إغلاق</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>تصفية الطلبات</Text>
                <TouchableOpacity style={styles.modalButton} onPress={() => applyFilter('معلق')}>
                  <Text style={styles.modalButtonText}>معلق</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={() => applyFilter('مكتمل')}>
                  <Text style={styles.modalButtonText}>مكتمل</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalButtonText}>إلغاء</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  filterInput: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    margin: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
    padding: 10,
    marginBottom: 50,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  filterButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  filterButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 25,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  activeFilterButton: {
    backgroundColor: '#0056b3',
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  requestCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sellerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  requestDate: {
    fontSize: 14,
    color: '#555',
  },
  requestBody: {
    marginVertical: 10,
  },
  requestType: {
    fontSize: 16,
    marginVertical: 5,
  },
  amount: {
    fontSize: 16,
    color: '#333',
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  statusمعلق: {
    color: 'blue',
  },
  statusمكتمل: {
    color: 'green',
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  approveButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginRight: 5,
  },
  rejectButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginLeft: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  summary: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  summaryText: {
    fontSize: 16,
    marginVertical: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalText: {
    fontSize: 16,
    marginVertical: 5,
  },
});

export default AdminHomeScreen;