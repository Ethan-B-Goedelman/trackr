import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ApplicationsScreen from '../screens/ApplicationsScreen';
import AddApplicationScreen from '../screens/AddApplicationScreen';
import EditApplicationScreen from '../screens/EditApplicationScreen';
import InterviewsScreen from '../screens/InterviewsScreen';
import AddInterviewScreen from '../screens/AddInterviewScreen';
import EditInterviewScreen from '../screens/EditInterviewScreen';
import ContactsScreen from '../screens/ContactsScreen';
import AddContactScreen from '../screens/AddContactScreen';
import EditContactScreen from '../screens/EditContactScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Colors, Radius, Shadows } from '../theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, string> = {
  Home: 'home',
  Applications: 'briefcase',
  Interviews: 'calendar',
  Contacts: 'people',
  Profile: 'person',
};

function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  return (
    <View style={tabStyles.iconWrap}>
      <Ionicons
        name={(focused ? name : `${name}-outline`) as any}
        size={22}
        color={color}
      />
      {focused && <View style={tabStyles.dot} />}
    </View>
  );
}

function AppsTabs() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 56 + insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: Colors.yellowDark,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginBottom: insets.bottom > 0 ? 0 : 4,
        },
        tabBarStyle: {
          backgroundColor: Colors.bgCard,
          borderTopWidth: 0,
          height: tabBarHeight,
          paddingTop: 6,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          ...Shadows.card,
        },
        tabBarIcon: ({ focused, color }) => (
          <TabIcon
            name={TAB_ICONS[route.name] ?? 'ellipse'}
            focused={focused}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Applications" component={ApplicationsScreen} />
      <Tab.Screen name="Interviews" component={InterviewsScreen} />
      <Tab.Screen name="Contacts" component={ContactsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const MODAL_HEADER_OPTS = {
  headerShown: true,
  presentation: 'modal' as const,
  headerStyle: { backgroundColor: Colors.bgWarm },
  headerTitleStyle: { fontSize: 17, fontWeight: '700' as const, color: Colors.textPrimary },
  headerTintColor: Colors.yellowDark,
  headerShadowVisible: false,
  headerBackTitle: 'Back',
};

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
            {/* Main tab view */}
            <Stack.Screen name="Main" component={AppsTabs} />

            {/* Application modals */}
            <Stack.Screen
              name="AddApplication"
              component={AddApplicationScreen}
              options={{ ...MODAL_HEADER_OPTS, title: 'New Application' }}
            />
            <Stack.Screen
              name="EditApplication"
              component={EditApplicationScreen}
              options={{ ...MODAL_HEADER_OPTS, title: 'Edit Application' }}
            />

            {/* Interview modals */}
            <Stack.Screen
              name="AddInterview"
              component={AddInterviewScreen}
              options={{ ...MODAL_HEADER_OPTS, title: 'Schedule Interview' }}
            />
            <Stack.Screen
              name="EditInterview"
              component={EditInterviewScreen}
              options={{ ...MODAL_HEADER_OPTS, title: 'Edit Interview' }}
            />

            {/* Contact modals */}
            <Stack.Screen
              name="AddContact"
              component={AddContactScreen}
              options={{ ...MODAL_HEADER_OPTS, title: 'Add Contact' }}
            />
            <Stack.Screen
              name="EditContact"
              component={EditContactScreen}
              options={{ ...MODAL_HEADER_OPTS, title: 'Edit Contact' }}
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
  iconWrap: { alignItems: 'center', gap: 2 },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.yellow,
  },
});
