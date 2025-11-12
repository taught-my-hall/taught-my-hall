import stylesMain from '../styles/stylesMain';
import { Text, View } from 'react-native';

export default ({ route }) => {
  return (
    <View style={stylesMain.container}>
      <Text style={stylesMain.text}>Login screen</Text>
    </View>
  );
};
