import PropTypes from 'prop-types';
import { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { iconsFishcards } from '../utils/textures';

export default function FlashcardTile({ flashcard, onToggle, hidden }) {
  const [isEditing, setIsEditing] = useState(false);
  const [front, setFront] = useState(flashcard.front);
  const [back, setBack] = useState(flashcard.back);

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // TODO: send request to the backend when backend is ready
    console.log(front);
    console.log(back);
    setIsEditing(false);
  };

  // TODO: flashcards should have their own icons saved in the database
  const iconSource = { uri: iconsFishcards.user };

  return (
    <View style={styles.tile}>
      {isEditing ? (
        <View style={styles.editForm}>
          <TextInput />
          <TextInput
            style={styles.input}
            value={front}
            onChangeText={setFront}
            placeholder="Question"
            placeholderTextColor="#666"
            multiline
          />
          <TextInput
            style={styles.input}
            value={back}
            onChangeText={setBack}
            placeholder="Answer"
            placeholderTextColor="#666"
            multiline
          />
          <Pressable style={styles.actionButton} onPress={handleSave}>
            Save
          </Pressable>
        </View>
      ) : (
        <>
          <View
            style={[
              styles.content,
              hidden ? styles.hiddenContent : styles.revealedContent,
            ]}
          >
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

          <View style={styles.actionButtons}>
            <Pressable style={styles.actionButton} onPress={onToggle}>
              {hidden ? 'Show' : 'Hide'}
            </Pressable>

            <Pressable style={styles.actionButton} onPress={handleStartEdit}>
              Edit
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

FlashcardTile.propTypes = {
  flashcard: PropTypes.object,
  onToggle: PropTypes.func,
  hidden: PropTypes.bool,
};

const styles = StyleSheet.create({
  tile: {
    aspectRatio: 'squre',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    padding: 12,
  },
  hiddenIcon: {
    width: 80,
    height: 80,
    tintColor: '#000',
    opacity: 0.6,
  },
  hiddenContent: {
    opacity: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    transition: 'opacity 0.3s ease-in-out',
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

  actionButtons: {
    width: '100%',
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    color: 'white',
    padding: 4,
    textAlign: 'center',
    backgroundColor: 'black',
    borderRadius: 4,
    flex: 1,
  },

  editForm: {
    gap: 8,
  },

  input: {
    backgroundColor: 'white',
    borderRadius: 4,
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 4,
    paddingBottom: 4,
    resizeMode: 'none',
  },
});
