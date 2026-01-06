import { useRouter } from 'expo-router';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function AppMenu({ buttons = [] }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const openHideMenu = () => {
    setIsMenuOpen(prev => !prev);
  };
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.navigate('/login');
  };

  console.log(buttons);

  return (
    <>
      <Pressable onPress={openHideMenu} style={styles.menuButton}>
        <Image
          style={styles.menuButtonImage}
          source={require('../../public/more.png')}
        />
      </Pressable>

      {isMenuOpen && (
        <View style={styles.menu}>
          <Pressable onPress={handleLogout} style={styles.menuOption}>
            <Text style={styles.text}>Logout</Text>
          </Pressable>
          {buttons.map((b, index) => (
            <Pressable key={index} onPress={b[1]} style={styles.menuOption}>
              <Text style={styles.text}>{b[0]}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    position: 'absolute',
    bottom: 50,
    left: 50,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
    borderColor: '#FFF',
    borderWidth: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 200,
  },
  menuButtonImage: {
    width: 40,
    height: 40,
  },
  menu: {
    position: 'absolute',
    bottom: 130,
    left: 50,
    width: 170,
    gap: 10,
    flexDirection: 'column-reverse',
  },
  menuOption: {
    backgroundColor: '#000',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    borderColor: '#FFF',
    borderWidth: 2,
  },
  text: {
    fontSize: 24,
    color: '#FFF',
  },
});

AppMenu.propTypes = {
  buttons: PropTypes.array,
};
