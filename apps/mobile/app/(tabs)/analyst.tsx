import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState } from 'react';
import { Send } from 'lucide-react-native';
import { apiPost } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Analyst() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy tu analista IA de Suelo. ¿En qué te puedo ayudar hoy?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiPost<{
        reply: string;
        conversation_id: string;
      }>('/api/ai/chat', {
        message: text,
        conversation_id: conversationId,
      });
      if (res.conversation_id) setConversationId(res.conversation_id);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `⚠️ ${err.message || 'Error al consultar el analyst'}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        style={styles.chat}
        contentContainerStyle={{ padding: 16, gap: 10 }}
      >
        {messages.map((m, i) => (
          <View
            key={i}
            style={[
              styles.bubble,
              m.role === 'user' ? styles.bubbleUser : styles.bubbleBot,
            ]}
          >
            <Text style={styles.bubbleText}>{m.content}</Text>
          </View>
        ))}
        {loading && <ActivityIndicator color="#00C853" style={{ marginTop: 8 }} />}
      </ScrollView>

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Preguntá al analyst..."
          placeholderTextColor="#475569"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={styles.send}
          onPress={send}
          disabled={loading || !input.trim()}
        >
          <Send color="#fff" size={18} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E0A' },
  chat: { flex: 1 },
  bubble: { padding: 12, borderRadius: 12, maxWidth: '85%' },
  bubbleUser: {
    backgroundColor: '#00C853',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: '#1E293B',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  bubbleText: { color: '#fff', fontSize: 14, lineHeight: 20 },
  composer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#1E293B',
    color: '#fff',
    padding: 12,
    borderRadius: 12,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#334155',
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00C853',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
