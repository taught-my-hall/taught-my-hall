import { useQueue } from '@uidotdev/usehooks';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { apiClient } from '../../../../services/apiClient';

export default function ReviewScreen() {
  const { id: currentPalaceId } = useLocalSearchParams();
  const {
    add: pushFlashcard,
    remove: popFlashcard,
    first: currentFlashcard,
    size: flashcardsLength,
    clear: clearFlashcardsQueue,
  } = useQueue([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Which answer button to show spinner on when submitting
  const [spinnerButtonIndex, setSpinnerButtonIndex] = useState(null);

  const refetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setSpinnerButtonIndex('refetch');
    setError('');

    try {
      const flashcards = await apiClient(
        `/api/palaces/${currentPalaceId}/flashcards?onlyInReview=true`,
        {
          method: 'GET',
        }
      );

      clearFlashcardsQueue();
      for (const question of flashcards) {
        pushFlashcard(question);
      }
    } catch (err) {
      setError(
        'Something went wrong when downloading flashcards. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [pushFlashcard, clearFlashcardsQueue, currentPalaceId]);

  const handleAnswer = async grade => {
    if (!currentFlashcard) return;

    setIsLoading(true);
    setSpinnerButtonIndex(grade);
    setError('');

    try {
      await apiClient(`/api/flashcards/${currentFlashcard.id}/review/`, {
        method: 'POST',
        body: { grade },
      });
      setShowAnswer(false);
      popFlashcard();
    } catch {
      setError(
        'Something went wrong when updating flashcard. Please try again.'
      );
    } finally {
      setIsLoading(false);
      setSpinnerButtonIndex(null);
    }
  };

  const hasInitiallyFetch = useRef(false);
  useEffect(() => {
    if (!hasInitiallyFetch.current) {
      hasInitiallyFetch.current = true;
      refetchQuestions();
    }
  }, [refetchQuestions]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.flexRow}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.navigate(`/palace/${currentPalaceId}`)}
          >
            <ChevronLeft />
            <Text style={styles.backButtonText}>Go back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Knowledge Review</Text>
        </View>
        <Text style={styles.headerTitle}>{showAnswer}</Text>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>
            Remaining: {flashcardsLength} flashcards
          </Text>

          <Pressable style={styles.refetchButton} onPress={refetchQuestions}>
            <Text style={styles.refetchButtonText}>Reresh flashcards</Text>

            {isLoading && spinnerButtonIndex === 'refetch' && (
              <ActivityIndicator color="white" size={12} />
            )}
          </Pressable>
        </View>
      </View>

      {/* Flashcard */}
      {currentFlashcard && (
        <View style={styles.centerContent}>
          <View style={styles.flashcard}>
            <Text style={styles.questionLabel}>Question</Text>
            <Text style={styles.questionText}>{currentFlashcard.front}</Text>

            {showAnswer && (
              <View style={styles.answerSection}>
                <View style={styles.divider} />
                <Text style={styles.answerLabel}>Answer</Text>
                <Text style={styles.answerText}>{currentFlashcard.back}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {!isLoading && !error && flashcardsLength === 0 && (
        <View style={styles.centerContent}>
          <Text style={styles.completedText}>🎉 All questions completed!</Text>
          <Text style={styles.completedSubtext}>
            Great job reviewing your flashcards.
          </Text>
        </View>
      )}

      {!!error && (
        <View style={styles.centerContent}>
          <Text>{error}</Text>
        </View>
      )}

      {/* Bottom Buttons */}
      <View style={styles.footer}>
        {showAnswer ? (
          <>
            <Pressable
              style={{ ...styles.button, ...styles.buttonGrade0 }}
              onPress={() => handleAnswer(0)}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Terrible</Text>
              {isLoading && spinnerButtonIndex === 0 && (
                <Loader2 size={16} color="#fff" />
              )}
            </Pressable>
            <Pressable
              style={{ ...styles.button, ...styles.buttonGrade1 }}
              onPress={() => handleAnswer(1)}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Worse</Text>
              {isLoading && spinnerButtonIndex === 1 && (
                <ActivityIndicator color="white" size={12} />
              )}
            </Pressable>
            <Pressable
              style={{ ...styles.button, ...styles.buttonGrade2 }}
              onPress={() => handleAnswer(2)}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Bad</Text>
              {isLoading && spinnerButtonIndex === 2 && (
                <ActivityIndicator color="white" size={12} />
              )}
            </Pressable>
            <Pressable
              style={{ ...styles.button, ...styles.buttonGrade3 }}
              onPress={() => handleAnswer(3)}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Almost</Text>
              {isLoading && spinnerButtonIndex === 3 && (
                <ActivityIndicator color="white" size={12} />
              )}
            </Pressable>
            <Pressable
              style={{ ...styles.button, ...styles.buttonGrade4 }}
              onPress={() => handleAnswer(4)}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Good</Text>
              {isLoading && spinnerButtonIndex === 4 && (
                <ActivityIndicator color="white" size={12} />
              )}
            </Pressable>
            <Pressable
              style={{ ...styles.button, ...styles.buttonGrade5 }}
              onPress={() => handleAnswer(5)}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Expert</Text>
              {isLoading && spinnerButtonIndex === 5 && (
                <ActivityIndicator color="white" size={12} />
              )}
            </Pressable>
          </>
        ) : (
          <Pressable style={styles.button} onPress={() => setShowAnswer(true)}>
            <Text style={styles.buttonText}>Reveal Answer</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1510',
    height: '100vh',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },

  backButton: {
    color: '#fff',
    alignItems: 'center',
    gap: 4,
    flexDirection: 'row',
    backgroundColor: '#ffffff22',
    borderRadius: 4,
    height: 48,
    paddingHorizontal: 16,
  },
  backButtonText: {
    color: '#fff',
  },

  loadingContainer: {
    backgroundColor: '#1a1510',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#a89168',
    fontSize: 16,
  },
  header: {
    backgroundColor: '#2d2317',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#4a3d28',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#f5e6c8',
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreBadge: {
    backgroundColor: '#4a3d28',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refetchButton: {
    borderRadius: 16,
    backgroundColor: '#ffffff22',
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
  },
  refetchButtonText: {
    color: 'white',
  },
  scoreText: {
    color: '#f5d462',
    fontWeight: '600',
    fontSize: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  flashcard: {
    backgroundColor: '#2d2317',
    borderRadius: 24,
    padding: 48,
    width: '100%',
    maxWidth: 600,
    borderWidth: 2,
    borderColor: '#4a3d28',
    minHeight: 300,
  },
  questionLabel: {
    color: '#a89168',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  questionText: {
    color: '#f5e6c8',
    fontSize: 28,
    fontWeight: '500',
    lineHeight: 36,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  answerSection: {
    marginTop: 32,
  },
  divider: {
    height: 1,
    backgroundColor: '#4a3d28',
    marginBottom: 24,
  },
  answerLabel: {
    color: '#a89168',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  answerText: {
    color: '#f5d462',
    fontSize: 24,
    fontWeight: '500',
    lineHeight: 32,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  fetchingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  fetchingText: {
    color: '#f5d462',
    fontSize: 14,
  },
  completedText: {
    color: '#f5e6c8',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  completedSubtext: {
    color: '#a89168',
    fontSize: 18,
  },

  footer: {
    backgroundColor: '#2d2317',
    borderTopWidth: 1,
    borderTopColor: '#4a3d28',
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 'auto',
  },

  answerButtonsRow: {
    flexDirection: 'row',
    gap: 16,
  },

  button: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    fontSize: 18,
    fontWeight: 'medium',
    height: 48,
    paddingHorizontal: 24,
    backgroundColor: '#935948',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 4,
  },
  buttonText: {
    color: '#fff',
  },

  buttonGrade0: {
    backgroundColor: '#7f1d1d',
  },
  buttonGrade1: {
    backgroundColor: '#7c2d12',
  },
  buttonGrade2: {
    backgroundColor: '#78350f',
  },
  buttonGrade3: {
    backgroundColor: '#713f12',
  },
  buttonGrade4: {
    backgroundColor: '#3f6212',
  },
  buttonGrade5: {
    backgroundColor: '#14532d',
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
});
