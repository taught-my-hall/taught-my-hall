import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

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
});

export default function RegisterScreen() {
  const navigation = useNavigation();

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
      const response = await fetch('http://127.0.0.1:8000/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
        }),
      });

      let data;

      try {
        data = await response.json();
      } catch (parseError) {
        // fallback if response isn't JSON
        data = { message: await response.text() };
      }

      if (response.ok) {
        //TODO save token before going into backrooms
        navigation.navigate('Backrooms');
      } else {
        const backendError =
          data.message || JSON.stringify(data) || 'Registration failed';
        setErrorMessage(backendError);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(`Network request failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
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

        <Button
          title={isLoading ? 'Creating...' : 'Create Account'}
          onPress={handleRegister}
          disabled={isLoading}
        />

        <Text style={styles.smallLink} onPress={navigateToLogin}>
          Already have an account? Login
        </Text>
      </View>
    </View>
  );
}
