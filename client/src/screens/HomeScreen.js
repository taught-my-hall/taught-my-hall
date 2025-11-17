import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Button, Text, View } from 'react-native';
import stylesMain from '../styles/stylesMain';

export default function HomeScreen() {
  const navigation = useNavigation();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/rooms/')
      .then(response => response.json())
      .then(data => {
        setRooms(data);
        setLoading(false);
      })
      .catch(error => {
        console.log('Error fetching rooms:', error);
        setLoading(false);
      });
  }, []);

  return (
    <View style={stylesMain.container}>
      <Text style={stylesMain.text}>Home screen</Text>
	  
      {loading && <Text style={stylesMain.text}>Loading...</Text>}

      {!loading &&
        rooms.map(room => (
          <Text key={room.id} style={stylesMain.text}>
            {room.name}
          </Text>
        ))}
	  
      <Button title="Login" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}
