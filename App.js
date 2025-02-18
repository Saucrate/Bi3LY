import 'react-native-gesture-handler';
import 'react-native-reanimated';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './components/SplashScreen';
import AuthTabs from './components/AuthTabs';
import ClientTabs from './components/ClientTabs';
import SellerTabs from './components/SellerTabs';
import AdminTabs from './components/AdminTabs';
import CategoriesScreen from './components/CategoriesScreen';
import CategoryProductsScreen from './components/CategoryProductsScreen';
import HomeScreen from './components/HomeScreen';
import ProductsScreen from './components/ProductsScreen';
import ProductDetailScreen from './components/ProductDetailScreen';
import ProfileScreen from './components/ProfileScreen';
import LoginScreen from './components/LoginScreen';
import SellersControlScreen from './components/SellersControlScreen'; // Import the SellersControlScreen
import ChangeProfileScreen from './components/ChangeProfileScreen'; // Import the ChangeProfileScreen
import AdminProfileScreen from './components/AdminProfileScreen'; // Import the AdminProfileScreen
import StoreScreen from './components/StoreScreen';
import SearchScreen from './components/SearchScreen';
import CheckoutScreen from './components/CheckoutScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Auth" component={AuthTabs} />
        <Stack.Screen name="ClientMain" component={ClientTabs} />
        <Stack.Screen name="SellerMain" component={SellerTabs} />
        <Stack.Screen name="AdminMain" component={AdminTabs} />
        <Stack.Screen name="Categories" component={CategoriesScreen} />
        <Stack.Screen name="CategoryProducts" component={CategoryProductsScreen} options={{ title: 'منتجات الفئة' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'الرئيسية' }} />
        <Stack.Screen name="ProductsScreen" component={ProductsScreen} options={{
          presentation: 'modal',
        }} />
        <Stack.Screen name="ProductDetailScreen" component={ProductDetailScreen} options={{ title: 'تفاصيل المنتج' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SellersControl" component={SellersControlScreen} options={{ title: 'التحكم في البائعين' }} /> 
        <Stack.Screen name="ChangeProfileScreen" component={ChangeProfileScreen} options={{ title: 'تغيير الملف الشخصي' }} /> 
        <Stack.Screen name="AdminProfileScreen" component={AdminProfileScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen 
          name="Store" 
          component={StoreScreen} 
          options={{ 
            title: 'المتجر',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#3d4785',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }} 
        />
        <Stack.Screen 
          name="Search" 
          component={SearchScreen} 
          options={{ 
            title: 'البحث',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#3d4785',
            },
            headerTintColor: '#fff',
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
