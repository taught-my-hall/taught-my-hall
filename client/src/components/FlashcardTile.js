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

export default function FlashcardTile({
  flashcard,
  setFlashcard,
  onToggle,
  hidden,
  slotIndex,
  furnitureId,
}) {
  const [showForm, setShowForm] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);

    try {
      let res;
      if (flashcard) {
        res = await apiClient(`/api/flashcards/${flashcard.id}`, {
          method: 'PUT',
          body: {
            front,
            back,
            furniture_slot_index: flashcard.furniture_slot_index,
          },
        });
      } else {
        res = await apiClient(`/api/furniture/${furnitureId}/flashcards/`, {
          method: 'POST',
          body: { front, back, furniture_slot_index: slotIndex },
        });
      }
      setFlashcard(res);
      setShowForm(false);
    } catch {
      // Assume there won't be any errors (time pressure)
      console.error(
        'Something went wrong when updating flashcard, please try again'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartCreate = () => {
    if (flashcard) {
      console.error('Should not call handleStartCreate() if flashcard exists');
      return;
    }
    setShowForm(true);
    setFront('');
    setBack('');
  };

  const handleStartEdit = () => {
    if (!flashcard) {
      console.error(
        'Should not call handleStartEdit() if flashcard does not exist'
      );
      return;
    }
    setShowForm(true);
    setFront(flashcard.front);
    setBack(flashcard.back);
  };

  const handleCancel = () => {
    setShowForm(false);
    setFront(flashcard?.front || '');
    setBack(flashcard?.back || '');
  };

  // TODO: flashcards should have their own icons saved in the database
  const iconSource = { uri: iconsFishcards.user };

  // Same form for creating and updating flashcard
  if (showForm) {
    return (
      <View style={styles.tile}>
        <View style={styles.editForm}>
          <TextInput
            style={styles.input}
            value={front}
            onChangeText={setFront}
            placeholder="Question"
            placeholderTextColor="#666"
            multiline
            numberOfLines={3}
          />
          <TextInput
            style={styles.input}
            value={back}
            onChangeText={setBack}
            placeholder="Answer"
            placeholderTextColor="#666"
            multiline
            numberOfLines={3}
          />

          <View style={styles.actionButtons}>
            <Pressable style={styles.actionButton} onPress={handleCancel}>
              <Text style={styles.actionButtonText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={handleSave}>
              <Text style={styles.actionButtonText}>
                {flashcard ? 'Update' : 'Create'}
              </Text>
              {isLoading && <ActivityIndicator color="white" size={12} />}
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  if (!flashcard)
    return (
      <Pressable style={styles.tile} onPress={handleStartCreate}>
        <Text style={styles.middleText}>
          No flashcard. Click here to create one
        </Text>
      </Pressable>
    );

  return (
    <View style={styles.tile}>
      <View style={styles.content}>
        <Text style={styles.label}>Question:</Text>
        <Text style={styles.questionText}>{flashcard.front}</Text>

        <View style={styles.separator} />

        <View
          style={[
            styles.answerSection,
            hidden ? styles.hiddenContent : styles.revealedContent,
          ]}
        >
          <Text style={styles.label}>Answer:</Text>
          <Text style={styles.answerText}>{flashcard.back}</Text>
        </View>

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

        <Pressable style={styles.actionButton} onPress={handleStartEdit}>
          <Text style={styles.actionButtonText}>Edit</Text>
        </Pressable>
      </View>
    </View>
  );
}

FlashcardTile.propTypes = {
  flashcard: PropTypes.object,
  setFlashcard: PropTypes.func,
  onToggle: PropTypes.func,
  hidden: PropTypes.bool,
  slotIndex: PropTypes.number,
  furnitureId: PropTypes.number,
};

const styles = StyleSheet.create({
  tile: {
    aspectRatio: 'squre',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    padding: 12,
    justifyContent: 'center',
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
  answerSection: {
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

  middleText: {
    textAlign: 'center',
    color: 'white',
  },
});
