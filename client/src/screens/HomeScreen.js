import stylesMain from '../styles/stylesMain';
import { Button, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default () => {
  const navigation = useNavigation();

  return (
    <View style={stylesMain.container}>
      <Text style={stylesMain.text}>Home screen</Text>
      <Button title="Login" onPress={() => navigation.navigate('Login')} />
    </View>
  );
};
