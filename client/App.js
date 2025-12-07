import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BackroomScreen from './src/screens/BackroomScreen';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import PalaceCreatorScreen from './src/screens/PalaceCreatorScreen';
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
    Backrooms: {
      screen: BackroomScreen,
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
