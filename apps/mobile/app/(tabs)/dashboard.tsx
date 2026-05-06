import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('full_name, total_invested, total_returns')
        .eq('id', user.id)
        .single();
      setProfile(data);
    })();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>
        Hola, {profile?.full_name?.split(' ')[0] || 'Inversor'} 👋
      </Text>
      <Text style={styles.sub}>Resumen de tu portafolio</Text>

      <View style={styles.statsGrid}>
        <StatCard label="Total invertido" value={`USD ${profile?.total_invested || 0}`} />
        <StatCard label="Retornos" value={`USD ${profile?.total_returns || 0}`} />
      </View>

      <View style={styles.soon}>
        <Text style={styles.soonText}>Más features mobile próximamente 🚀</Text>
      </View>
    </ScrollView>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E0A' },
  content: { padding: 20, gap: 16 },
  greeting: { color: '#fff', fontSize: 24, fontWeight: '700' },
  sub: { color: '#94A3B8', fontSize: 14 },
  statsGrid: { flexDirection: 'row', gap: 12, marginTop: 8 },
  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statLabel: { color: '#94A3B8', fontSize: 12 },
  statValue: { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: 4 },
  soon: {
    backgroundColor: '#00C85315',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  soonText: { color: '#00C853', fontSize: 14, fontWeight: '500' },
});
