import PropTypes from 'prop-types';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { apiClient } from '../../services/apiClient';
import { iconsFishcards } from '../utils/textures';

export default function FlashcardTile({ flashcard, onToggle, hidden }) {
  const [isEditing, setIsEditing] = useState(false);
  const [front, setFront] = useState(flashcard.front);
  const [back, setBack] = useState(flashcard.back);
  const [isLoading, setIsLoading] = useState(false);
  const [renderedFlashcard, setRenderedFlashcard] = useState(flashcard);

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const res = await apiClient(`/api/flashcards/${flashcard.id}`, {
        method: 'PUT',
        body: {
          front,
          back,
          furniture_slot_index: flashcard.furniture_slot_index,
        },
      });
      setFront(res.front);
      setBack(res.back);
      setRenderedFlashcard(res);
      setIsEditing(false);
    } catch {
      // Assume there won't be any errors (no time)
      console.error(
        'Something went wrong when updating flashcard, please try again'
      );
    } finally {
      setIsLoading(false);
    }
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

          <View style={styles.actionButtons}>
            <Pressable
              style={styles.actionButton}
              onPress={() => setIsEditing(false)}
            >
              <Text style={styles.actionButtonText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={handleSave}>
              <Text style={styles.actionButtonText}>Save</Text>
              {isLoading && <ActivityIndicator color="white" size={12} />}
            </Pressable>
          </View>
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
            <Text style={styles.questionText}>{renderedFlashcard.front}</Text>

            <View style={styles.separator} />

            <Text style={styles.label}>Answer:</Text>
            <Text style={styles.answerText}>{renderedFlashcard.back}</Text>

            <Image
              source={iconSource}
              style={styles.watermark}
              resizeMode="contain"
            />
          </View>

          <View style={styles.actionButtons}>
            <Pressable style={styles.actionButton} onPress={onToggle}>
              <Text style={styles.actionButtonText}>
                {hidden ? 'Show' : 'Hide'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.actionButtonText}>Edit</Text>
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
    marginTop: 'auto',
  },
  actionButton: {
    padding: 4,
    backgroundColor: 'black',
    borderRadius: 4,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  actionButtonText: {
    color: 'white',
  },

  editForm: {
    flex: 1,
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
