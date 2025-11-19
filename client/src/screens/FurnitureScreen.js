import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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

export default function FurnitureScreen() {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const refetchQuestions = useCallback(() => {
    setIsLoading(true);
    setError('');

    fakeFetch()
      .then(res => {
        setQuestions(res.questions.map(q => ({ ...q, hidden: true })));
      })
      .catch(_err => {
        setError('Something went wrong, please try again');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    refetchQuestions();
  }, [refetchQuestions]);

  const handleTryAgain = () => {
    refetchQuestions();
  };

  const handleToggleQuestion = questionId => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id === questionId) {
          return { ...q, hidden: !q.hidden };
        }
        return q;
      })
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.heading}>Questions are waiting to be learned!</Text>

        {isLoading && (
          <Text style={styles.loadingText}>
            Please hold on while we are loading your questions...
          </Text>
        )}

        {!!error && (
          <View style={styles.error.container}>
            <Text style={styles.error.text}>{error}</Text>
            <Pressable style={styles.error.button} onPress={handleTryAgain}>
              <Text style={styles.error.buttonText}>
                Download questions again
              </Text>
            </Pressable>
          </View>
        )}

        {questions.length > 0 && !isLoading && !error && (
          <View style={styles.questions.container}>
            {questions.map(question => (
              <View style={styles.questions.question} key={question.id}>
                <View style={styles.questions.frontBack}>
                  <Text style={styles.questions.front}>{question.front}</Text>
                  {!question.hidden && (
                    <Text style={styles.questions.back}>{question.back}</Text>
                  )}
                </View>
                <Pressable
                  style={styles.questions.button}
                  onPress={() => handleToggleQuestion(question.id)}
                >
                  <Text style={styles.questions.buttonText}>
                    {question.hidden ? 'Show' : 'Hide'}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
    flex: 1,
    width: '100%',
  },
  main: {
    maxWidth: 1000,
    padding: 32,
    backgroundColor: '#222',
    borderRadius: 32,
    border: '2px solid #333',
  },
  heading: {
    fontSize: 28,
    fontWeight: 600,
    color: '#fff',
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 20,
    color: '#bbb',
    marginBottom: 16,
  },
  error: {
    text: {
      fontSize: 20,
      color: '#f66',
      marginBottom: 16,
    },
    button: {
      background: '#2196F3',
      height: 40,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      alignSelf: 'center',
      paddingLeft: 32,
      paddingRight: 32,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
    },
  },
  questions: {
    container: {
      display: 'flex',
      gap: 8,
      maxHeight: 600,
      overflowY: 'auto',
    },
    question: {
      display: 'flex',
      padding: 16,
      borderRadius: 8,
      border: '1px solid #444',
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 32,
    },
    frontBack: {
      display: 'flex',
      gap: 4,
    },
    front: {
      color: '#fff',
      fontSize: 16,
    },
    back: {
      color: '#aaa',
      fontSize: 16,
    },
    button: {
      height: 32,
      paddingLeft: 8,
      paddingRight: 8,
      borderRadius: 4,
      backgroundColor: '#444',
      border: '1px solid #444',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      fontSize: 14,
      color: '#fff',
    },
  },
});
