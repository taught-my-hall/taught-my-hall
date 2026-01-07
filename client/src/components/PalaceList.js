import { useRouter } from 'expo-router';
import { Brain, Pencil, Plus, Sparkles } from 'lucide-react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { setTempPalaceMatrix } from '../utils/tempData';

const PalaceCard = ({ title, icon: Icon, iconColor, borderColor, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={[styles.card, { borderColor: borderColor }]}
  >
    <View style={styles.cardContent}>
      <View style={styles.iconWrapper}>
        <Icon size={24} color={iconColor} />
      </View>
      <Text style={styles.cardText}>{title}</Text>
    </View>
    <View style={styles.plusIcon}>
      <Plus size={24} color="white" strokeWidth={1.5} />
    </View>
  </TouchableOpacity>
);

PalaceCard.propTypes = {
  onPress: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  iconColor: PropTypes.string,
  borderColor: PropTypes.string,
};

export default function PalaceList() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Add new Palace</Text>

      <PalaceCard
        onPress={() => {
          setTempPalaceMatrix(null);
          router.navigate('/palace/create');
        }}
        title="Create new palace"
        icon={Pencil}
        iconColor="#FFF"
        borderColor="#FFF"
      />
      <Text style={styles.sectionHeader}>Official Premade palaces</Text>

      <View style={styles.listContainer}>
        <PalaceCard
          onPress={() => router.navigate('/palace/create')}
          title="Machine learning Palace"
          icon={Brain}
          iconColor="#9333EA" // Purple-600
          borderColor="#7E22CE" // Purple-700
        />

        <PalaceCard
          onPress={() => router.navigate('/palace/create')}
          title="Machine learning Palace"
          icon={Sparkles}
          iconColor="#22D3EE" // Cyan-400
          borderColor="#0891B2" // Cyan-600
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    alignItems: 'center',
    width: '100%',
    maxWidth: 672,
    alignSelf: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 48,
    letterSpacing: -0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: '#000000',
    marginBottom: 40,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  sectionHeader: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    alignSelf: 'flex-start',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  listContainer: {
    width: '100%',
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 16,
    backgroundColor: '#000000',
    borderWidth: 1,
    marginBottom: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconWrapper: {
    opacity: 0.8,
  },
  cardText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginLeft: 16,
  },
  plusIcon: {
    opacity: 1,
  },
});
