import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { iconsFishcards } from '../utils/textures';

export default function FlashcardTile(flashcard) {
  const [hidden, setHidden] = useState(true);

  const handleToggleQuestion = questionId => {
    setHidden(prev => !prev);
  };

  // TODO: flashcards should have their own icons saved in the database
  const iconSource = { uri: iconsFishcards.user };

  return (
    <Pressable
      onPress={() => handleToggleQuestion(flashcard.id)}
      style={[styles.tile, hidden ? styles.tileHidden : styles.tileRevealed]}
    >
      {hidden ? (
        <Image
          source={iconSource}
          style={styles.hiddenIcon}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.revealedContent}>
          <Text style={styles.label}>Question:</Text>
          <Text style={styles.questionText}>{flashcard.front}</Text>

          <View style={styles.separator} />

          <Text style={styles.label}>Answer:</Text>
          <Text style={styles.answerText}>{flashcard.back}</Text>

          <Image
            source={iconSource}
            style={styles.watermark}
            resizeMode="contain"
          />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    aspectRatio: 'squre',
    borderRadius: 16,
    overflow: 'hidden',
  },
  tileHidden: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  },
  hiddenIcon: {
    width: 80,
    height: 80,
    tintColor: '#000',
    opacity: 0.6,
  },
  tileRevealed: {
    backgroundColor: '#121212',
    borderWidth: 2,
    borderColor: '#fff',
    padding: 12,
  },
  revealedContent: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    color: '#aaa',
    fontSize: 10,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  questionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  answerText: {
    color: '#ddd',
    fontSize: 13,
  },
  separator: {
    height: 1,
    backgroundColor: '#444',
    marginVertical: 6,
  },
  watermark: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: 60,
    height: 60,
    opacity: 0.1,
    tintColor: '#fff',
  },
});
