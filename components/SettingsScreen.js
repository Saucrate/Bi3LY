import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import { adminService } from '../services/adminService';

const SettingsScreen = ({ navigation }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('ar');
  const [monthlyTarget, setMonthlyTarget] = useState('');

  useEffect(() => {
    loadMonthlyTarget();
  }, []);

  const loadMonthlyTarget = async () => {
    try {
      const response = await adminService.getStatistics();
      setMonthlyTarget(response.data.monthlyStats.target.toString());
    } catch (error) {
      console.error('Error loading target:', error);
    }
  };

  const handleUpdateTarget = async () => {
    try {
      const target = parseInt(monthlyTarget);
      if (isNaN(target) || target < 0) {
        Alert.alert('خطأ', 'الرجاء إدخال رقم صحيح');
        return;
      }

      await adminService.updateMonthlyTarget(target);
      Alert.alert('نجاح', 'تم تحديث الهدف الشهري بنجاح');
    } catch (error) {
      console.error('Error updating target:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحديث الهدف');
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تسجيل الخروج');
    }
  };

  const settingsSections = [
    {
      title: 'العامة',
      items: [
        {
          icon: 'moon',
          title: 'الوضع الليلي',
          type: 'switch',
          value: darkMode,
          onValueChange: setDarkMode
        },
        {
          icon: 'bell',
          title: 'الإشعارات',
          type: 'switch',
          value: notifications,
          onValueChange: setNotifications
        },
        {
          icon: 'globe',
          title: 'اللغة',
          type: 'select',
          value: language === 'ar' ? 'العربية' : 'English',
          onPress: () => Alert.alert('قريباً', 'هذه الميزة قيد التطوير')
        }
      ]
    },
    {
      title: 'MRU الهدف',
      items: [
        {
          icon: 'bullseye',
          title: 'الهدف الشهري',
          type: 'input',
          value: monthlyTarget,
          onChangeText: setMonthlyTarget,
          onSubmit: handleUpdateTarget
        }
      ]
    },
    {
      title: 'الدعم',
      items: [
        {
          icon: 'question-circle',
          title: 'المساعدة',
          type: 'link',
          onPress: () => Alert.alert('قريباً', 'هذه الميزة قيد التطوير')
        },
        {
          icon: 'info-circle',
          title: 'عن التطبيق',
          type: 'link',
          onPress: () => Alert.alert('عن التطبيق', 'الإصدار 1.0.0')
        }
      ]
    }
  ];

  const renderSettingItem = (item) => {
    return (
      <TouchableOpacity
        key={item.title}
        style={styles.settingItem}
        onPress={item.type === 'link' ? item.onPress : undefined}
      >
        <View style={styles.settingLeft}>
          <FontAwesome5 name={item.icon} size={20} color="#3d4785" />
          <Text style={styles.settingTitle}>{item.title}</Text>
        </View>

        {item.type === 'switch' && (
          <Switch
            value={item.value}
            onValueChange={item.onValueChange}
            trackColor={{ false: '#767577', true: '#3d4785' }}
            thumbColor={item.value ? '#fff' : '#f4f3f4'}
          />
        )}

        {item.type === 'input' && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={item.value}
              onChangeText={item.onChangeText}
              keyboardType="numeric"
              placeholder="أدخل الهدف"
            />
            <TouchableOpacity 
              style={styles.updateButton}
              onPress={item.onSubmit}
            >
              <Text style={styles.updateButtonText}>تحديث</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.type === 'select' && (
          <View style={styles.settingRight}>
            <Text style={styles.settingValue}>{item.value}</Text>
            <FontAwesome5 name="chevron-left" size={16} color="#666" />
          </View>
        )}

        {item.type === 'link' && (
          <FontAwesome5 name="chevron-left" size={16} color="#666" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {settingsSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map(renderSettingItem)}
          </View>
        ))}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <FontAwesome5 name="sign-out-alt" size={20} color="#f44336" />
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3d4785',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 16,
    color: '#666',
    marginRight: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f44336',
  },
  logoutText: {
    fontSize: 16,
    color: '#f44336',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 8,
    width: 120,
    marginRight: 10,
    textAlign: 'right',
  },
  updateButton: {
    backgroundColor: '#3d4785',
    padding: 8,
    borderRadius: 8,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
