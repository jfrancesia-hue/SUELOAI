import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Project {
  id: string;
  title: string;
  location: string;
  expected_return: number;
  token_price: number;
}

export default function Marketplace() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('projects')
        .select('id, title, location, expected_return, token_price')
        .in('status', ['funding', 'funded'])
        .limit(20);
      setProjects((data || []) as Project[]);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={projects}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.location}>📍 {item.location}</Text>
            <View style={styles.metrics}>
              <Text style={styles.metric}>
                Token USD {Number(item.token_price).toFixed(0)}
              </Text>
              <Text style={[styles.metric, styles.positive]}>
                {Number(item.expected_return)}% retorno
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ padding: 32, alignItems: 'center' }}>
            <Text style={{ color: '#64748B' }}>Sin proyectos disponibles</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E0A' },
  card: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 6,
  },
  title: { color: '#fff', fontSize: 16, fontWeight: '600' },
  location: { color: '#94A3B8', fontSize: 13 },
  metrics: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  metric: { color: '#CBD5E1', fontSize: 13 },
  positive: { color: '#00C853', fontWeight: '600' },
});
