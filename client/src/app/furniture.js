import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { iconsFishcards, iconsGui } from '../utils/textures';

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
              front: 'What is the smallest country?',
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
              front: 'Most spoken language?',
              back: 'Mandarin Chinese',
            },
          ],
        }),
      1500
    );
  });
};

const iconList = Object.keys(iconsFishcards);

export default function FurnitureScreen() {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [areAllVisible, setAreAllVisible] = useState(false);

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

  const handleGlobalToggle = () => {
    const newState = !areAllVisible;
    setAreAllVisible(newState);
    setQuestions(prev => prev.map(q => ({ ...q, hidden: !newState })));
  };

  const getIconForIndex = index => {
    const iconName = iconsFishcards[iconList[index % iconList.length]];
    return { uri: iconName };
  };

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        {/* HEADER: Tytuł + Oko sterujące */}
        <View style={styles.header}>
          <Text style={styles.heading}>Flashcards Framing</Text>
          <Pressable onPress={handleGlobalToggle} style={styles.eyeButton}>
            {/* Ikona oka zmienia się w zależności od stanu globalnego */}
            <Image
              source={{
                uri: areAllVisible ? iconsGui['eye'] : iconsGui['eye-slash'],
              }}
              style={styles.eyeIcon}
              resizeMode="contain"
            />
          </Pressable>
        </View>

        {/* LOADING */}
        {isLoading && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.infoText}>Loading questions...</Text>
          </View>
        )}

        {/* ERROR */}
        {!!error && (
          <View style={styles.centerBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryBtn} onPress={refetchQuestions}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        )}

        {/* GRID Z KAFELKAMI */}
        {!isLoading && !error && questions.length > 0 && (
          <View style={styles.gridContainer}>
            {questions.map((q, index) => {
              const iconSource = getIconForIndex(index);

              return (
                <Pressable
                  key={q.id}
                  onPress={() => handleToggleQuestion(q.id)}
                  style={[
                    styles.tile,
                    q.hidden ? styles.tileHidden : styles.tileRevealed,
                  ]}
                >
                  {q.hidden ? (
                    <Image
                      source={iconSource}
                      style={styles.hiddenIcon}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.revealedContent}>
                      <Text style={styles.label}>Question:</Text>
                      <Text style={styles.questionText}>{q.front}</Text>

                      <View style={styles.separator} />

                      <Text style={styles.label}>Answer:</Text>
                      <Text style={styles.answerText}>{q.back}</Text>

                      {/* Opcjonalnie: ikona jako znak wodny w tle */}
                      <Image
                        source={iconSource}
                        style={styles.watermark}
                        resizeMode="contain"
                      />
                    </View>
                  )}
                </Pressable>
              );
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
  },
  main: {
    width: '100%',
    maxWidth: 900,
    backgroundColor: 'rgba(0,0,0,0.3)',
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },

  tile: {
    width: 160,
    height: 160,
    borderRadius: 8,
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
