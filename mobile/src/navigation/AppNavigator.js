import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import ApplicationsScreen from '../screens/ApplicationsScreen';
import AddApplicationScreen from '../screens/AddApplicationScreen';
import SearchScreen from '../screens/SearchScreen';
import { Colors, Gradients, Radius, Shadows } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity } from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom tab bar icon with yellow active indicator dot
function TabIcon({ name, focused, color }) {
  return (
    <View style={tabStyles.iconWrap}>
      <Ionicons
        name={focused ? name : `${name}-outline`}
        size={24}
        color={color}
      />
      {focused && <View style={tabStyles.dot} />}
    </View>
  );
}

function AppsTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: Colors.yellowDark,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 2,
        },
        tabBarStyle: {
          backgroundColor: Colors.bgCard,
          borderTopWidth: 0,
          height: 80,
          paddingTop: 8,
          paddingBottom: 16,
          ...Shadows.card,
        },
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            Applications: 'briefcase',
            Search: 'search',
          };
          return <TabIcon name={icons[route.name]} focused={focused} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Applications" component={ApplicationsScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.yellow} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={AppsTabs} />
            <Stack.Screen
              name="AddApplication"
              component={AddApplicationScreen}
              options={{
                headerShown: true,
                title: 'New Application',
                presentation: 'modal',
                headerStyle: {
                  backgroundColor: Colors.bgWarm,
                },
                headerTitleStyle: {
                  fontSize: 17,
                  fontWeight: '700',
                  color: Colors.textPrimary,
                },
                headerTintColor: Colors.yellowDark,
                headerShadowVisible: false,
                headerBackTitle: 'Back',
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bgWarm,
  },
});

const tabStyles = StyleSheet.create({
  iconWrap: { alignItems: 'center', gap: 3 },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.yellow,
  },
});
