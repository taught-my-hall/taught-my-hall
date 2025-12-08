import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {Button, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';

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
});

export default function LoginScreen() {
  const navigation = useNavigation();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    navigation.navigate('Backrooms');
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.heading}>TaughtMyHall</Text>

        <View>
          <Text style={styles.label}>Login</Text>
          <TextInput
            style={styles.input}
            onChangeText={setLogin}
            value={login}
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

        {/* TODO: Forgot password page */}
        <Text style={styles.smallLink}>Forgot password?</Text>

        <Button title="Login" onPress={handleLogin} />

      <Pressable style={styles.smallLink} onPress={navigateToRegister}>
        <Text style={styles.createAccount}>Create account</Text>
      </Pressable>
      </View>
    </View>
  );
}
