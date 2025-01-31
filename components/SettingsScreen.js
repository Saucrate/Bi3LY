import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen = () => {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = React.useState(false);
  const [isDarkModeEnabled, setIsDarkModeEnabled] = React.useState(false);
  const [goal, setGoal] = React.useState('200000');
  const navigation = useNavigation();

  const toggleNotifications = () => setIsNotificationsEnabled(previousState => !previousState);
  const toggleDarkMode = () => setIsDarkModeEnabled(previousState => !previousState);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>الإعدادات</Text>
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>الإشعارات</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#3d4785' }}
          thumbColor={isNotificationsEnabled ? '#ffffff' : '#f4f3f4'}
          onValueChange={toggleNotifications}
          value={isNotificationsEnabled}
        />
      </View>
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>الوضع الداكن</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#3d4785' }}
          thumbColor={isDarkModeEnabled ? '#ffffff' : '#f4f3f4'}
          onValueChange={toggleDarkMode}
          value={isDarkModeEnabled}
        />
      </View>
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>تغيير الهدف</Text>
        <TextInput
          style={styles.goalInput}
          value={goal}
          onChangeText={setGoal}
          keyboardType="numeric"
        />
      </View>
      <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('ChangeProfile')}>
        <Text style={styles.settingText}>تغيير الملف الشخصي</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('SellersControl')}>
        <Text style={styles.settingText}>التحكم في البائعين</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>تسجيل الخروج</Text>
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  settingText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  goalInput: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 10,
    width: 100,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#ff4d4d',
    padding: 15,
    borderRadius: 20,
    marginTop: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SettingsScreen;
