import { StyleSheet, Text, View } from 'react-native';

export default function EmptyFlashcardTile() {
  return (
    <View style={styles.tile}>
      <Text style={styles.text}>No flashcard</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 'square',
    borderRadius: 16,
  },
  text: {
    color: 'white',
  },
});
