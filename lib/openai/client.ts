/**
 * DEPRECATED — migrado a lib/anthropic/client.ts (Claude).
 *
 * Este módulo se mantiene como shim de compatibilidad para imports legacy.
 * Nuevo código: importar directamente de '@/lib/anthropic/client'.
 */

export {
  anthropic,
  CLAUDE_MODELS,
  calculateClaudeCost,
  extractText,
  parseJsonResponse,
  generateProjectScoring,
  extractInvoiceData,
  askFiscalAssistant,
  generateInvestorReport,
  generateProjectDescription,
} from '@/lib/anthropic/client';
