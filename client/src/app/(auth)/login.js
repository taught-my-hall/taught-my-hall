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

  const [errorMessage, setErrorMessage] = useState('');
  const [loadingType, setLoadingType] = useState(null);

  const handleLogin = async () => {
    setErrorMessage('');

    if (!inputEmail.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!inputPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoadingType('login');
    await executeLogin(inputEmail, inputPassword);
  };

  const handleDemoLogin = async () => {
    setErrorMessage('');
    setLoadingType('demo');
    setInputEmail('demo@example.com')
    setInputPassword('pass1234')
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
      setErrorMessage('Login failed. Please check your credentials.');
    } finally {
      setLoadingType(null);
    }
  };

  return (
      <View style={styles.container}>
        <View style={styles.form}>
          <Text style={styles.heading}>TaughtMyHall</Text>

          {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
          ) : null}

          <View>
            <Text style={styles.label}>Email</Text>
            <TextInput
                style={styles.input}
                onChangeText={(text) => {
                  setInputEmail(text);
                  setErrorMessage('');
                }}
                value={inputEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder={"bob@example.com"}
                placeholderTextColor={'gray'}
            />
          </View>

          <View>
            <Text style={styles.label}>Password</Text>
            <TextInput
                style={styles.input}
                onChangeText={(text) => {
                  setInputPassword(text);
                  setErrorMessage('');
                }}
                value={inputPassword}
                secureTextEntry
                placeholder={"*******"}
                placeholderTextColor={'gray'}
            />
          </View>

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
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  // New styles for errors
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)', // Semi-transparent red
    padding: 10,
    borderRadius: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'red',
  },
  errorText: {
    color: '#ffcccc',
    fontWeight: '500',
    textAlign: 'center',
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
  primaryButton: {
    backgroundColor: '#2196F3',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
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