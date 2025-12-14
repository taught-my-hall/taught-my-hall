import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Button,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {loginUser} from "../../../services/auth";

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
    fontWeight: 600,
    color: '#fff',
    marginBottom: 16,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 500,
    marginLeft: 2,
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    fontWeight: 500,
    height: 40,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  smallLink: {
    fontSize: 14,
    fontWeight: 500,
    color: '#fff',
    textDecorationLine: 'underline',
    marginBottom: 16,
  },
  createAccount: {
    fontSize: 14,
    fontWeight: 500,
    color: '#fff',
    textDecorationLine: 'underline',
    marginTop: 16,
    alignSelf: 'center',
  },
  demoButton: {
    backgroundColor: '#000',
    borderWidth: 1,
    marginTop: 16,
    borderColor: 'red',
    height: 40,
    justifyContent:"center",
    alignItems:"center",
  },
  demoButtonText: {
    color: '#fff',
  }
});

export default function LoginScreen() {
  const router = useRouter();
  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');


  const handleLogin = async () => {
    await executeLogin(inputEmail, inputPassword);
  };

  const handleDemoLogin = async () => {
    await executeLogin("demo@example.com", "pass1234")
  }

  const executeLogin = async (login, password) => {
    try {
      const data = await loginUser(login, password);

      const token = data.token;

      localStorage.setItem('authToken', token);

      router.navigate('/backrooms');

    } catch (error) {
      console.error("Network or Login error:", error);
    }
  }

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

        {/* TODO: Forgot password page */}
        <Text style={styles.smallLink}>Forgot password?</Text>

        <Button title="Login" onPress={handleLogin} />
        <Pressable style={styles.demoButton} onPress={handleDemoLogin}>
          <Text style={styles.demoButtonText}>Demo Login</Text>
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
