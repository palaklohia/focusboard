import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { ErrorState, Loading, OfflineBanner } from './src/components/ui';

function Root() {
  const { loading, bootError, retryBoot } = useAuth();
  if (loading) return <Loading label="Starting FocusBoard…" />;
  if (bootError) return <ErrorState message={bootError} onRetry={retryBoot} />;
  return <AppNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Root />
        <OfflineBanner />
        <StatusBar style="dark" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
