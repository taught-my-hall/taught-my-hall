import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BackroomScreen from './src/screens/BackroomScreen';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ReviewScreen from './src/screens/ReviewScreen';
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
    Register: {
      screen: RegisterScreen,
    },
    Backrooms: {
      screen: BackroomScreen,
    },
    Room: {
      screen: RoomScreen,
    },
    Review: {
      screen: ReviewScreen,
    },
  },
});

const Navigation = createStaticNavigation(RootStack);

export default function App() {
  return <Navigation />;
}
