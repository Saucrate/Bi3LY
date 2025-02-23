import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import SellerHomeScreen from './SellerHomeScreen';
import StatisticsScreen from './StatisticsScreen';
import ProductsScreen from './SellerProductsScreen';
import StoreSellerProfileScreen from './StoreSellerProfileScreen';
import StoreSettingsScreen from './StoreSettingsScreen';
import EditStoreProfileScreen from './EditStoreProfileScreen';
import AddProductScreen from './AddProductScreen';
import ProductDetailScreen from './ProductDetailScreen';
import HelpCenterScreen from './HelpCenterScreen';
import SalesPoliciesScreen from './SalesPoliciesScreen';
import SponsoredAdsScreen from './SponsoredAdsScreen';
import BlueBadgeScreen from './BlueBadgeScreen';
import ReportIssueScreen from './ReportIssueScreen';
import EditProductScreen from './EditProductScreen';
import { Platform } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ProductsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProductsList" component={ProductsScreen} />
      <Stack.Screen 
        name="AddProduct" 
        component={AddProductScreen}
        options={{
          headerShown: true,
          title: 'إضافة منتج جديد',
          headerStyle: {
            backgroundColor: '#3d4785',
          },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen 
        name="EditProduct" 
        component={EditProductScreen}
        options={{
          headerShown: true,
          title: 'تعديل المنتج',
          headerStyle: {
            backgroundColor: '#3d4785',
          },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen}
        options={{ 
          headerShown: true,
          title: 'تفاصيل المنتج',
          headerStyle: {
            backgroundColor: '#3d4785',
          },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
};

const StoreSettingsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Settings" component={StoreSettingsScreen} />
      <Stack.Screen 
        name="EditStoreProfile" 
        component={EditStoreProfileScreen}
        options={{ 
          headerShown: true,
          title: 'تعديل معلومات المتجر',
          headerStyle: { backgroundColor: '#3d4785' },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen 
        name="SponsoredAds" 
        component={SponsoredAdsScreen}
        options={{ 
          headerShown: true,
          title: 'إعلانات ممولة',
          headerStyle: { backgroundColor: '#3d4785' },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen 
        name="AddApproval" 
        component={BlueBadgeScreen}
        options={{ 
          headerShown: true,
          title: 'إضافة ✅ للموافقة',
          headerStyle: { backgroundColor: '#3d4785' },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen 
        name="ReportIssue" 
        component={ReportIssueScreen}
        options={{ 
          headerShown: true,
          title: 'إبلاغ عن مشكلة',
          headerStyle: { backgroundColor: '#3d4785' },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen 
        name="HelpCenter" 
        component={HelpCenterScreen}
        options={{ 
          headerShown: true,
          title: 'مركز المساعدة',
          headerStyle: { backgroundColor: '#3d4785' },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen 
        name="SalesPolicies" 
        component={SalesPoliciesScreen}
        options={{ 
          headerShown: true,
          title: 'سياسات البيع',
          headerStyle: { backgroundColor: '#3d4785' },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
};

const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StoreProfile" component={StoreSellerProfileScreen} />
      <Stack.Screen 
        name="EditStoreProfile" 
        component={EditStoreProfileScreen}
        options={{ 
          headerShown: true,
          title: 'تعديل الملف الشخصي للمتجر',
          headerStyle: {
            backgroundColor: '#3d4785',
          },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
};

const SellerTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'SellerHome') {
            iconName = 'home-outline';
          } else if (route.name === 'Statistics') {
            iconName = 'stats-chart-outline';
          } else if (route.name === 'Products') {
            iconName = 'pricetags-outline';
          } else if (route.name === 'Profile') {
            iconName = 'person-outline';
          } else if (route.name === 'Settings') {
            iconName = 'settings-outline';
          }
        },
        tabBarActiveTintColor: '#3d4785',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          height: 80,
          paddingHorizontal: 5,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
            },
            android: {
              elevation: 5,
            },
          }),
        },
        tabBarLabelStyle: {
          paddingBottom: 10,
          fontSize: 12,
        },
      })}
    >
      <Tab.Screen name="SellerHome" component={SellerHomeScreen} options={{ title: 'الرئيسية' , headerShown: false }} />
      <Tab.Screen name="Statistics" component={StatisticsScreen} options={{ title: 'الإحصائيات' , headerShown: false }} />
      <Tab.Screen name="Products" component={ProductsStack} options={{ title: 'المنتجات' , headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ title: 'الملف الشخصي' , headerShown: false }} />
      <Tab.Screen name="Settings" component={StoreSettingsStack} options={{ title: 'الإعدادات' , headerShown: false }} />
    </Tab.Navigator>
  );
};

export default SellerTabs;
