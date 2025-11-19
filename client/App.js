import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BackroomScreen from './src/screens/BackroomScreen';
import FurnitureScreen from './src/screens/FurnitureScreen';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RoomScreen from './src/screens/RoomScreen';

const RootStack = createNativeStackNavigator({
  screens: {
    Home: {
      screen: HomeScreen,
      options: { title: 'TaughtMyHall' },
    },
    Login: {
      screen: LoginScreen,
    },
    Backrooms: {
      screen: BackroomScreen,
    },
    Room: {
      screen: RoomScreen,
    },
    Furniture: {
      screen: FurnitureScreen,
    },
  },
});

const Navigation = createStaticNavigation(RootStack);

export default function App() {
  return <Navigation />;
}
