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
// Import the service we just created
import { registerUser } from '../../../services/auth';

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    setErrorMessage('');

    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !repeatPassword.trim()
    ) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    if (password !== repeatPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const data = await registerUser(name, email, password);

      if (data.token && typeof localStorage !== 'undefined') {
        localStorage.setItem('authToken', data.token);
      }

      router.navigate('/backrooms');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.heading}>Register</Text>

        <View>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            onChangeText={setName}
            value={name}
            placeholder="John Doe"
            placeholderTextColor={'gray'}
          />
        </View>

        <View>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            onChangeText={setEmail}
            value={email}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="bob@example.com"
            placeholderTextColor={'gray'}
          />
        </View>

        <View>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            onChangeText={setPassword}
            value={password}
            secureTextEntry
          />
        </View>

        <View>
          <Text style={styles.label}>Repeat Password</Text>
          <TextInput
            style={styles.input}
            onChangeText={setRepeatPassword}
            value={repeatPassword}
            secureTextEntry
          />
        </View>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <Pressable
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerButtonText}>Create Account</Text>
          )}
        </Pressable>

        <Text
          style={styles.smallLink}
          onPress={() => router.navigate('/login')}
        >
          Already have an account? Login
        </Text>
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
    marginTop: 16,
    alignSelf: 'center',
  },
  errorText: {
    color: '#ff4d4d',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  registerButton: {
    backgroundColor: '#2196F3',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    borderRadius: 4,
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
