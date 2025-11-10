import { React } from 'react';
import { Text, View } from 'react-native';

import stylesMain from './src/styles/stylesMain';

export default function App() {
  return (
    <View style={stylesMain.container}>
      <Text style={stylesMain.text}>Hello</Text>
    </View>
  );
}
