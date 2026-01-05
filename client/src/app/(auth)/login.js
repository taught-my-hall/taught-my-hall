import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { loginUser } from '../../../services/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');

  const [loadingType, setLoadingType] = useState(null);

  const handleLogin = async () => {
    setLoadingType('login');
    await executeLogin(inputEmail, inputPassword);
  };

  const handleDemoLogin = async () => {
    setLoadingType('demo');
    await executeLogin('demo@example.com', 'pass1234');
  };

  const executeLogin = async (login, password) => {
    try {
      const data = await loginUser(login, password);
      const token = data.token;

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('authToken', token);
      }

      router.navigate('/backrooms');
    } catch (error) {
      console.error('Network or Login error:', error);
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.heading}>TaughtMyHall</Text>

        <View>
          <Text style={styles.label}>Login</Text>
          <TextInput
            style={styles.input}
            onChangeText={setInputEmail}
            value={inputEmail}
            autoCapitalize="none" // Good practice for emails
          />
        </View>

        <View>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            onChangeText={setInputPassword}
            value={inputPassword}
            secureTextEntry
          />
        </View>

        <Text style={styles.smallLink}>Forgot password?</Text>

        <Pressable
          style={styles.primaryButton}
          onPress={handleLogin}
          disabled={loadingType !== null}
        >
          {loadingType === 'login' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Login</Text>
          )}
        </Pressable>

        <Pressable
          style={styles.demoButton}
          onPress={handleDemoLogin}
          disabled={loadingType !== null}
        >
          {loadingType === 'demo' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.demoButtonText}>Demo Login</Text>
          )}
        </Pressable>

        <Pressable
          style={styles.smallLink}
          onPress={() => router.navigate('/register')}
        >
          <Text style={styles.createAccount}>Create account</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    padding: 16,
  },
  heading: {
    fontSize: 36,
    fontWeight: '600', // Note: strings are safer for fontWeight in RN
    color: '#fff',
    marginBottom: 16,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 2,
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    fontWeight: '500',
    height: 40,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  smallLink: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    textDecorationLine: 'underline',
    marginBottom: 16,
  },
  createAccount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    textDecorationLine: 'underline',
    marginTop: 16,
    alignSelf: 'center',
  },
  // New style for the main Login button
  primaryButton: {
    backgroundColor: '#2196F3', // Standard Blue
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 4, // Optional: makes it look nicer
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16, // Match standard button size
  },
  demoButton: {
    backgroundColor: '#000',
    borderWidth: 1,
    marginTop: 8,
    borderColor: 'red',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  demoButtonText: {
    color: '#fff',
  },
});
