import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';
import stylesMain from '../styles/stylesMain';

export default function HomeScreen() {
  const router = useRouter();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO
    // fetch('http://127.0.0.1:8000/api/rooms/')
    //   .then(response => response.json())
    //   .then(data => {
    //     console.log(data);
    //     setRooms(data);
    //     setLoading(false);
    //   })
    //   .catch(error => {
    //     console.error('Error fetching rooms:', error);
    //     setLoading(false);
    //   });
    setLoading(false);
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

      <Button title="Login" onPress={() => router.navigate('/login')} />
    </View>
  );
}
