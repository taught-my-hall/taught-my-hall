import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { Button, Text, View } from 'react-native';
import stylesMain from '../styles/stylesMain';

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={stylesMain.container}>
      <Text style={stylesMain.text}>Home screen</Text>
      <Button title="Login" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}
