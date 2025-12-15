import { useQueue } from '@uidotdev/usehooks';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fetchQuestions } from '../../../../services/palaceData';

let questionIdCounter = 1;

// Simulates telling backend whether user knows or
// doesn't know the question
const fakeValidate = async (questionId, knows) => {
  return new Promise(resolve => {
    setTimeout(() => {
      //TODO validate answer
      resolve({ success: true });
    }, 1000);
  });
};

export default function ReviewScreen() {
  const {
    add: pushQuestion,
    remove: popQuestion,
    first: currentQuestion,
    size: questionsLength,
  } = useQueue([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');

  const fetchMoreQuestions = useCallback(async () => {
    // 1. STOP if we already know there are no more questions
    if (!hasMore) return;

    setIsLoading(true);
    setError('');

    try {
      const data = await fetchQuestions();

      if (data.questions && data.questions.length > 0) {
        for (const question of data.questions) {
          pushQuestion(question);
        }
      } else {
        // 2. SERVER EMPTY? Flip the switch so we don't ask again.
        console.log('No new questions received. Stopping fetch.');
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong, please try again');
    } finally {
      setIsLoading(false);
    }
  }, [pushQuestion, hasMore]); // <--- Add hasMore to dependencies

  useEffect(() => {
    // 3. Add !hasMore to the guard clause
    if (isLoading || questionsLength >= 5 || !hasMore) return;

    fetchMoreQuestions();
  }, [questionsLength, fetchMoreQuestions, isLoading, hasMore]);

  const handleAnswer = knows => {
    if (!currentQuestion) return;

    setIsLoading(true);
    setError('');

    fakeValidate(currentQuestion.id, knows)
      .then(res => {
        if (res.success) popQuestion();
        else throw 1;
      })
      .catch(() => {
        setError('Error while updating question data');
      })
      .finally(() => {
        setIsLoading(false);
        setShowAnswer(false);
      });
  };

  const handleRevealAnswer = () => {
    setShowAnswer(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Knowledge Review</Text>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>
            Remaining: {questionsLength} questions
          </Text>
        </View>
      </View>

      {/* Flashcard */}
      {currentQuestion && (
        <View style={styles.centerContent}>
          <View style={styles.flashcard}>
            <Text style={styles.questionLabel}>Question</Text>
            <Text style={styles.questionText}>{currentQuestion.front}</Text>

            {showAnswer && (
              <View style={styles.answerSection}>
                <View style={styles.divider} />
                <Text style={styles.answerLabel}>Answer</Text>
                <Text style={styles.answerText}>{currentQuestion.back}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {!isLoading && !error && questionsLength === 0 && (
        <View style={styles.centerContent}>
          <Text style={styles.completedText}>🎉 All questions completed!</Text>
          <Text style={styles.completedSubtext}>
            Great job reviewing your flashcards.
          </Text>
        </View>
      )}

      {!!error && (
        <View style={styles.centerContent}>
          <Text style={{}}>{error}</Text>
          <Pressable style={{}} onPress={() => fetchMoreQuestions()}>
            <Text style={{}}>Download questions again</Text>
          </Pressable>
        </View>
      )}

      {/* Bottom Buttons */}
      <View style={styles.footer}>
        {!showAnswer ? (
          <Pressable
            style={{ ...styles.button, backgroundColor: '#2563eb' }}
            onPress={handleRevealAnswer}
          >
            <Text style={styles.buttonText}>Reveal Answer</Text>
          </Pressable>
        ) : (
          <View style={styles.buttonRow}>
            <Pressable
              style={{
                ...styles.button,
                ...styles.buttonHalf,
                backgroundColor: '#dc2626',
                display: 'flex',
                flexDirection: 'row',
              }}
              onPress={() => handleAnswer(false)}
            >
              <Text style={styles.buttonText}>Don&apos;t Know</Text>
              {isLoading && (
                <Loader2 size={16} color="#fff" style={{ marginLeft: 10 }} />
              )}
            </Pressable>
            <Pressable
              style={{
                ...styles.button,
                ...styles.buttonHalf,
                backgroundColor: '#16a34a',
                display: 'flex',
                flexDirection: 'row',
              }}
              onPress={() => handleAnswer(true)}
            >
              <Text style={styles.buttonText}>Know</Text>
              {isLoading && (
                <Loader2 size={16} color="#fff" style={{ marginLeft: 10 }} />
              )}
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    height: '100vh',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  loadingContainer: {
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#9ca3af',
    fontSize: 16,
  },
  header: {
    backgroundColor: '#1f2937',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreBadge: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
  },
  scoreText: {
    color: '#60a5fa',
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
    backgroundColor: '#1f2937',
    borderRadius: 24,
    padding: 48,
    width: '100%',
    maxWidth: 600,
    borderWidth: 2,
    borderColor: '#374151',
    minHeight: 300,
  },
  questionLabel: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  questionText: {
    color: '#f3f4f6',
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
    backgroundColor: '#374151',
    marginBottom: 24,
  },
  answerLabel: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  answerText: {
    color: '#60a5fa',
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
    color: '#60a5fa',
    fontSize: 14,
  },
  completedText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  completedSubtext: {
    color: '#9ca3af',
    fontSize: 18,
  },
  footer: {
    backgroundColor: '#1f2937',
    borderTopWidth: 1,
    borderTopColor: '#374151',
    padding: 24,
  },
  button: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  buttonHalf: {
    flex: 1,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
