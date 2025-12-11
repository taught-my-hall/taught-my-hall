import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BackroomScreen from './src/screens/BackroomScreen';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import PalaceCreatorScreen from './src/screens/PalaceCreatorScreen';
import PalaceScreen from './src/screens/PalaceScreen';
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
    Palace: {
      screen: PalaceScreen,
    },
    Room: {
      screen: RoomScreen,
    },
    Review: {
      screen: ReviewScreen,
    },
    PalaceCreator: {
      screen: PalaceCreatorScreen,
    },
  },
});

const Navigation = createStaticNavigation(RootStack);

export default function App() {
  return <Navigation />;
}
