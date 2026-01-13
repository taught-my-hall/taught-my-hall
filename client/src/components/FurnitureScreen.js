import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { apiClient } from '../../services/apiClient';
import { iconsGui } from '../utils/textures';
import FlashcardTile from './FlashcardTile';

const FurnitureScreen = ({ furnitureId }) => {
  const [flashcards, setFlashcards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [revealedFlashcardIndexes, setRevealedFlashcardIndexes] = useState([]);

  const refetchFurnitureFlashcards = useCallback(async id => {
    setIsLoading(true);
    setError('');

    try {
      // Very bad to filter on the client but there was a time rush for the demo
      const flashcardsList = await apiClient(`/api/flashcards/`, {
        method: 'GET',
      });

      const filtered = flashcardsList.filter(f => f.furniture === id);

      setFlashcards(filtered);
      setIsLoading(false);
      setError('');
    } catch {
      setError('Something went wrong, please try again');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetchFurnitureFlashcards(furnitureId);
  }, [refetchFurnitureFlashcards, furnitureId]);

  const getFlashcardWithIndex = index => {
    return flashcards.find(f => f.furniture_slot_index === index);
  };

  const handleGlobalToggle = () => {
    if (areAllFlashcardsRevealed()) {
      setRevealedFlashcardIndexes([]);
    } else {
      setRevealedFlashcardIndexes(flashcards.map(f => f.furniture_slot_index));
    }
  };

  const areAllFlashcardsRevealed = () => {
    const flashcardIndexes = flashcards.map(f => f.furniture_slot_index).sort();
    const revealedIndexes = [...revealedFlashcardIndexes].sort();
    if (flashcardIndexes.length !== revealedIndexes.length) return false;
    for (let i = 0; i < flashcardIndexes.length; i++) {
      if (flashcardIndexes[i] !== revealedIndexes[i]) return false;
    }
    return revealedFlashcardIndexes.length === flashcards.length;
  };

  const handleToggleFlashcard = index => {
    if (isFlashcardRevealed(index)) {
      setRevealedFlashcardIndexes(prev => prev.filter(i => i !== index));
    } else {
      setRevealedFlashcardIndexes(prev => [...prev, index]);
    }
  };

  const isFlashcardRevealed = index => {
    return revealedFlashcardIndexes.includes(index);
  };

  const handleSetFlashcard = fc => {
    const existingFlashcard = flashcards.find(f => f.id === fc.id);
    if (existingFlashcard) {
      setFlashcards(prev => prev.map(f => (f.id === fc.id ? fc : f)));
    } else {
      setFlashcards(prev => [...prev, fc]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <View style={styles.header}>
          <Text style={styles.heading}>Flashcards Framing</Text>
          <Pressable onPress={handleGlobalToggle} style={styles.eyeButton}>
            <Image
              source={{
                uri: areAllFlashcardsRevealed()
                  ? iconsGui['eye-slash']
                  : iconsGui.eye,
              }}
              style={styles.eyeIcon}
              resizeMode="contain"
            />
          </Pressable>
        </View>

        {isLoading && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.infoText}>Loading flashcards...</Text>
          </View>
        )}

        {!!error && (
          <View style={styles.centerBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable
              style={styles.retryBtn}
              onPress={() => refetchFurnitureFlashcards(furnitureId)}
            >
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        )}

        {!isLoading && !error && (
          <View style={styles.gridContainer}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(index => {
              const flashcard = getFlashcardWithIndex(index);
              return (
                <FlashcardTile
                  key={index}
                  flashcard={flashcard}
                  hidden={!isFlashcardRevealed(index)}
                  onToggle={() => handleToggleFlashcard(index)}
                  slotIndex={index}
                  furnitureId={furnitureId}
                  setFlashcard={handleSetFlashcard}
                />
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
};

FurnitureScreen.propTypes = {
  furnitureId: PropTypes.string.isRequired,
};

export default FurnitureScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5D4037',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 16,
    position: 'relative',
  },
  main: {
    width: '100%',
    maxWidth: 900,
    backgroundColor: 'rgba(0,0,0,0.3)',
    flex: '1',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#795548',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#1E1E1E',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  eyeButton: {
    padding: 4,
  },
  eyeIcon: {
    width: 32,
    height: 32,
    tintColor: '#fff',
  },

  centerBox: {
    alignItems: 'center',
    padding: 40,
  },

  infoText: {
    color: '#ddd',
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 18,
    marginBottom: 10,
  },
  retryBtn: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { color: '#fff' },

  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gridTemplateRows: '1fr 1fr 1fr',
    gap: 16,
    alignItems: 'stretch',
    justifyItems: 'stretch',
    flex: '1',
  },
});
