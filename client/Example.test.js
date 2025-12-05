import { render, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';

const sum = (a, b) => {
  return a + b;
};

describe('sum()', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
  });
});

const SomeComponent = () => {
  return (
    <View>
      <Text>I love testing software</Text>
    </View>
  );
};

describe('Rendering component', () => {
  test('it works', () => {
    render(<SomeComponent />);
    expect(screen.getByText('I love testing software')).toBeOnTheScreen();
  });
});
