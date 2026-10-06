import { Alert, Pressable } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import type { IconName } from '../components/ui';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';
import TasksScreen from '../screens/TasksScreen';
import TaskFormScreen from '../screens/TaskFormScreen';
import type { AuthStackParamList, RootStackParamList } from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.cream,
    card: colors.cream,
    text: colors.ink,
    primary: colors.brand600,
    border: 'transparent',
  },
};

const headerOptions = {
  headerStyle: { backgroundColor: colors.cream },
  headerShadowVisible: false,
  headerTitleStyle: { fontWeight: '800' as const, color: colors.ink },
  headerTintColor: colors.brand600,
};

function LogoutButton() {
  const { logout } = useAuth();
  return (
    <Pressable
      hitSlop={10}
      accessibilityLabel="Log out"
      style={{ marginRight: 4 }}
      onPress={() =>
        Alert.alert('Log out?', 'You will need to log in again.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Log out', style: 'destructive', onPress: () => { logout(); } },
        ])
      }
    >
      <Ionicons name="log-out-outline" size={24} color={colors.ink} />
    </Pressable>
  );
}

const tabIcons: Record<string, IconName> = {
  Dashboard: 'speedometer-outline',
  Projects: 'folder-open-outline',
  Tasks: 'checkbox-outline',
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...headerOptions,
        headerRight: () => <LogoutButton />,
        tabBarActiveTintColor: colors.brand600,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
        tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.border },
        tabBarIcon: ({ color, size }) => <Ionicons name={tabIcons[route.name]} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Projects" component={ProjectsScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer theme={theme}>
      {user ? (
        <RootStack.Navigator screenOptions={headerOptions}>
          <RootStack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          <RootStack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={{ title: 'Project' }} />
          <RootStack.Screen
            name="TaskForm"
            component={TaskFormScreen}
            options={({ route }) => ({ title: route.params.task ? 'Edit task' : 'New task', presentation: 'modal' })}
          />
        </RootStack.Navigator>
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}
