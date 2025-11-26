import { Check, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const StyleSheet = { create: styles => styles };

const View = ({ style, children, ...props }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      position: 'relative',
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const Text = ({ style, children, ...props }) => (
  <span
    style={{ display: 'block', boxSizing: 'border-box', ...style }}
    {...props}
  >
    {children}
  </span>
);

const TextInput = ({ style, value, onChangeText, placeholder, ...props }) => (
  <input
    style={{
      outline: 'none',
      border: 'none',
      background: 'transparent',
      boxSizing: 'border-box',
      ...style,
    }}
    value={value}
    onChange={e => onChangeText(e.target.value)}
    placeholder={placeholder}
    {...props}
  />
);

const TouchableOpacity = ({ style, onPress, children, disabled }) => (
  <button
    onClick={onPress}
    disabled={disabled}
    style={{
      border: 'none',
      background: 'transparent',
      padding: 0,
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      opacity: disabled ? 0.6 : 1,
      ...style,
    }}
  >
    {children}
  </button>
);

const ScrollView = ({ style, contentContainerStyle, children }) => (
  <div
    style={{
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      ...style,
    }}
  >
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        ...contentContainerStyle,
      }}
    >
      {children}
    </div>
  </div>
);

// --- DATA SOURCE ---
const fakeFetch = async () => {
  return new Promise(resolve => {
    setTimeout(
      () =>
        resolve({
          questions: [
            { id: 1, front: 'What is the capital of France?', back: 'Paris' },
            { id: 2, front: 'What is 2 + 2?', back: '4' },
            { id: 3, front: 'What is the largest planet?', back: 'Jupiter' },
            {
              id: 4,
              front: 'Who wrote Romeo and Juliet?',
              back: 'William Shakespeare',
            },
            {
              id: 5,
              front: 'What is the chemical symbol for gold?',
              back: 'Au',
            },
            { id: 6, front: 'What year did the Titanic sink?', back: '1912' },
            {
              id: 7,
              front: 'What is the smallest country in the world?',
              back: 'Vatican City',
            },
            { id: 8, front: 'How many continents are there?', back: '7' },
            {
              id: 9,
              front: 'What is the speed of light?',
              back: '299,792,458 m/s',
            },
            {
              id: 10,
              front: 'What is the most spoken language by native speakers?',
              back: 'Mandarin Chinese',
            },
          ],
        }),
      1500
    );
  });
};

export default function ReviewScreen() {
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [results, setResults] = useState(null); // Global submission state
  const [checkedItems, setCheckedItems] = useState({}); // Individual check state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fakeFetch();
      setQuestions(data.questions);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleInputChange = (id, text) => {
    if (results || checkedItems[id]) return; // Prevent editing if submitted or checked
    setUserAnswers(prev => ({
      ...prev,
      [id]: text,
    }));
  };

  const handleCheckSingle = id => {
    const question = questions.find(q => q.id === id);
    const userAnswer = userAnswers[id] || '';
    const isCorrect =
      userAnswer.trim().toLowerCase() === question.back.trim().toLowerCase();

    setCheckedItems(prev => ({
      ...prev,
      [id]: isCorrect,
    }));
  };

  const checkAnswers = () => {
    const newResults = {};
    let score = 0;

    questions.forEach(q => {
      const userAnswer = userAnswers[q.id] || '';
      const isCorrect =
        userAnswer.trim().toLowerCase() === q.back.trim().toLowerCase();
      newResults[q.id] = isCorrect;
      if (isCorrect) score++;
    });

    setResults({ score, details: newResults });
  };

  const resetQuiz = () => {
    setResults(null);
    setCheckedItems({});
    setUserAnswers({});
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loader2
          size={40}
          color="#3b82f6"
          style={{ animation: 'spin 1s linear infinite' }}
        />
        <Text style={styles.loadingText}>Loading Questions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Knowledge Review</Text>
        {results && (
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>
              Score: {results.score} / {questions.length}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {questions.map((q, index) => {
          const isGlobalSubmitted = results !== null;
          const isIndividuallyChecked = checkedItems.hasOwnProperty(q.id);
          const isSubmitted = isGlobalSubmitted || isIndividuallyChecked;

          let isCorrect = null;
          if (isGlobalSubmitted) {
            isCorrect = results.details[q.id];
          } else if (isIndividuallyChecked) {
            isCorrect = checkedItems[q.id];
          }

          let cardBorderColor = '#374151'; // Default gray border
          if (isSubmitted) {
            cardBorderColor = isCorrect ? '#065f46' : '#7f1d1d';
          }

          return (
            <View
              key={q.id}
              style={{
                ...styles.card,
                borderColor: cardBorderColor,
                backgroundColor: '#1f2937',
              }}
            >
              <Text style={styles.questionLabel}>Question {index + 1}</Text>
              <Text style={styles.questionText}>{q.front}</Text>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={{
                    ...styles.input,
                    borderColor: isSubmitted
                      ? isCorrect
                        ? '#10b981'
                        : '#ef4444'
                      : '#4b5563',
                    color: isSubmitted
                      ? isCorrect
                        ? '#d1fae5'
                        : '#fee2e2'
                      : '#ffffff',
                  }}
                  placeholder="Type your answer..."
                  placeholderTextColor="#9ca3af"
                  value={userAnswers[q.id] || ''}
                  onChangeText={text => handleInputChange(q.id, text)}
                  editable={!isSubmitted}
                />

                {/* Individual Check Button or Status Icon */}
                {isSubmitted ? (
                  <View style={styles.statusIconContainer}>
                    <Text
                      style={{
                        ...styles.statusIcon,
                        color: isCorrect ? '#10b981' : '#ef4444',
                      }}
                    >
                      {isCorrect ? '✓' : '✗'}
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.checkButton}
                    onPress={() => handleCheckSingle(q.id)}
                    disabled={!userAnswers[q.id]}
                  >
                    <Check
                      size={24}
                      color={userAnswers[q.id] ? '#ffffff' : '#6b7280'}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {isSubmitted && !isCorrect && (
                <View style={styles.correctionBox}>
                  <Text style={styles.correctionLabel}>Correct Answer:</Text>
                  <Text style={styles.correctionText}>{q.back}</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom Button Area */}
      <View style={styles.footer}>
        {!results ? (
          <TouchableOpacity
            style={{
              ...styles.button,
              backgroundColor:
                Object.keys(userAnswers).length === 0 ? '#4b5563' : '#2563eb',
            }}
            onPress={checkAnswers}
            disabled={Object.keys(userAnswers).length === 0}
          >
            <Text style={styles.buttonText}>Check All Answers</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{ ...styles.button, backgroundColor: '#4b5563' }}
            onPress={resetQuiz}
          >
            <Text style={styles.buttonText}>Start Over</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827', // Gray 900
    height: '100vh', // Ensure full height in web preview
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  loadingText: {
    marginTop: 16,
    color: '#9ca3af',
    fontSize: 16,
  },
  header: {
    backgroundColor: '#1f2937', // Gray 800
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
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
    color: '#60a5fa', // Blue 400
    fontWeight: '600',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120, // Increased space for footer
  },
  card: {
    borderRadius: 16,
    padding: 32,
    marginBottom: 24,
    borderWidth: 1,
  },
  questionLabel: {
    color: '#9ca3af', // Gray 400
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  questionText: {
    color: '#f3f4f6', // Gray 100
    fontSize: 22,
    fontWeight: '500',
    marginBottom: 24,
    lineHeight: 1.4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    fontSize: 20,
    borderWidth: 2,
  },
  checkButton: {
    backgroundColor: '#374151',
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIconContainer: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIcon: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  correctionBox: {
    marginTop: 20,
    backgroundColor: 'rgba(127, 29, 29, 0.2)', // Red 900 with opacity
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.4)',
    padding: 16,
    borderRadius: 12,
  },
  correctionLabel: {
    color: '#fca5a5', // Red 300
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  correctionText: {
    color: '#fca5a5',
    fontSize: 16,
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
