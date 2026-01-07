import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import EmptyFlashcardTile from '../components/EmptyFlashcardTile';
import FlashcardTile from '../components/FlashcardTile';
import { iconsGui } from '../utils/textures';

export default function FurnitureScreen() {
  const [flashcards, setFlashcards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [revealedFlashcardIndexes, setRevealedFlashcardIndexes] = useState([]);

  // TODO: real flashcards fetch when backend implements it
  const refetchFlashcards = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const data = [
      {
        id: 2,
        front: 'Which bacteria is primarily used in soybean inoculants?',
        back: 'Bradyrhizobium japonicum.',
        interval: 1,
        ease_factor: 2.5,
        repetition: 0,
        next_review: new Date('2025-12-12T15:14:51.987000Z'),
        created_at: new Date('2025-12-12T15:14:51.989000Z'),
        updated_at: new Date('2025-12-12T15:14:51.989000Z'),
        furniture_slot_index: 0,
      },
      {
        id: 3,
        front: 'What is the main purpose of soybean inoculation?',
        back: 'To enhance nitrogen fixation and improve plant growth.',
        interval: 1,
        ease_factor: 2.5,
        repetition: 0,
        next_review: new Date('2025-12-12T15:14:51.991000Z'),
        created_at: new Date('2025-12-12T15:14:51.992000Z'),
        updated_at: new Date('2025-12-12T15:14:51.992000Z'),
        furniture_slot_index: 1,
      },
      {
        id: 4,
        front:
          'Do soybeans naturally contain nitrogen-fixing bacteria in all soils?',
        back: 'No, many soils lack effective Bradyrhizobium strains.',
        interval: 1,
        ease_factor: 2.5,
        repetition: 0,
        next_review: new Date('2025-12-12T15:14:51.994000Z'),
        created_at: new Date('2025-12-12T15:14:51.996000Z'),
        updated_at: new Date('2025-12-12T15:14:51.996000Z'),
        furniture_slot_index: 6,
      },
      {
        id: 5,
        front: 'When should soybeans be inoculated?',
        back: 'Shortly before sowing.',
        interval: 1,
        ease_factor: 2.5,
        repetition: 0,
        next_review: new Date('2025-12-12T15:14:52.129000Z'),
        created_at: new Date('2025-12-12T15:14:52.130000Z'),
        updated_at: new Date('2025-12-12T15:14:52.130000Z'),
        furniture_slot_index: 3,
      },
      {
        id: 6,
        front:
          'What environmental factor negatively affects inoculant bacteria?',
        back: 'High temperatures and direct sunlight.',
        interval: 1,
        ease_factor: 2.5,
        repetition: 0,
        next_review: new Date('2025-12-12T15:14:52.133000Z'),
        created_at: new Date('2025-12-12T15:14:52.134000Z'),
        updated_at: new Date('2025-12-12T15:14:52.134000Z'),
        furniture_slot_index: 8,
      },
    ];

    setFlashcards(data);
    setIsLoading(false);
    setError('');
  }, []);

  useEffect(() => {
    refetchFlashcards();
  }, [refetchFlashcards]);

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
            <Pressable style={styles.retryBtn} onPress={refetchFlashcards}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        )}

        {!isLoading && !error && flashcards.length > 0 && (
          <View style={styles.gridContainer}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(index => {
              const flashcard = getFlashcardWithIndex(index);
              if (flashcard) {
                return (
                  <FlashcardTile
                    key={index}
                    flashcard={flashcard}
                    hidden={!isFlashcardRevealed(index)}
                    onToggle={() => handleToggleFlashcard(index)}
                  />
                );
              } else {
                return <EmptyFlashcardTile key={index} />;
              }
            })}
          </View>
        )}
      </View>
    </View>
  );
}

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
