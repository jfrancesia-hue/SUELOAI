import { View, Text, StyleSheet } from 'react-native';

export default function Wallet() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Billetera</Text>
      <Text style={styles.sub}>Próximamente en mobile — mientras tanto usá la web.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E0A',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  sub: { color: '#94A3B8', fontSize: 14, textAlign: 'center' },
});
