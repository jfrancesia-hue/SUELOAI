import { NextResponse } from 'next/server';
import { isDemoMode } from '@/lib/demo';

export const dynamic = 'force-dynamic';

type Severity = 'required' | 'warning' | 'optional';

type BlockchainCheck = {
  key: string;
  name: string;
  ok: boolean;
  severity: Severity;
  detail: string;
};

function hasRealValue(value?: string, invalid: string[] = []) {
  if (!value || value.trim().length < 8) return false;
  const normalized = value.toLowerCase();
  return !invalid.some((token) => normalized.includes(token.toLowerCase()));
}

function checkEnv(
  key: string,
  name: string,
  severity: Severity,
  detailOk: string,
  detailMissing: string,
  invalid: string[] = ['placeholder', 'your-', '0x...', 'xpub...', 'random-secure-string']
): BlockchainCheck {
  const ok = hasRealValue(process.env[key], invalid);
  return {
    key,
    name,
    ok,
    severity,
    detail: ok ? detailOk : detailMissing,
  };
}

export async function GET() {
  const demoMode = isDemoMode();
  const checks: BlockchainCheck[] = [
    checkEnv(
      'POLYGON_RPC_URL',
      'RPC Polygon',
      'required',
      'Endpoint configurado para leer/escribir anchors.',
      'Falta POLYGON_RPC_URL para anclar hashes documentales.'
    ),
    checkEnv(
      'ANCHOR_CONTRACT_ADDRESS',
      'Contrato Anchor',
      'required',
      'Contrato configurado para registrar hashes.',
      'Falta ANCHOR_CONTRACT_ADDRESS del contrato desplegado.'
    ),
    checkEnv(
      'CRYPTO_WEBHOOK_SECRET',
      'Webhook secret crypto',
      'required',
      'Webhook protegido contra eventos falsos.',
      'Falta CRYPTO_WEBHOOK_SECRET para validar notificaciones.'
    ),
    checkEnv(
      'ANCHOR_PRIVATE_KEY',
      'Signer de anchoring',
      'warning',
      'Signer configurado en backend/vault.',
      'Necesario solo para escribir anchors reales. Nunca exponer en frontend.'
    ),
    checkEnv(
      'POLYGONSCAN_API_KEY',
      'PolygonScan API',
      'warning',
      'Verificación y links de explorador listos.',
      'Recomendado para verificar transacciones y estados on-chain.'
    ),
    checkEnv(
      'TRONGRID_API_KEY',
      'TronGrid API',
      'warning',
      'Lectura de depósitos TRC20 preparada.',
      'Recomendado si se aceptará USDT por Tron.'
    ),
    checkEnv(
      'CRYPTO_MASTER_XPUB_EVM',
      'XPUB EVM',
      'warning',
      'Derivación pública EVM configurada.',
      'Necesario para generar direcciones Polygon/Ethereum sin custodio.'
    ),
    checkEnv(
      'CRYPTO_MASTER_XPUB_TRON',
      'XPUB Tron',
      'warning',
      'Derivación pública Tron configurada.',
      'Necesario si no se usa Bitso/Circle/Fireblocks como custodio.'
    ),
    checkEnv(
      'CIRCLE_API_KEY',
      'Circle API',
      'optional',
      'Proveedor custodial USDC conectado.',
      'Opcional: útil para wallets programables y USDC.'
    ),
    checkEnv(
      'BITSO_API_KEY',
      'Bitso Business API',
      'optional',
      'Proveedor LATAM conectado.',
      'Opcional: útil para operación regional y rieles crypto/fiat.'
    ),
  ];

  const requiredOk = checks
    .filter((check) => check.severity === 'required')
    .every((check) => check.ok);

  return NextResponse.json(
    {
      ok: demoMode || requiredOk,
      mode: demoMode ? 'demo' : requiredOk ? 'production-ready-candidate' : 'setup-required',
      timestamp: new Date().toISOString(),
      checks,
      safeRules: [
        'Nunca publicar claves privadas, seed phrases ni service role keys en el frontend.',
        'Empezar por hash documental en Polygon antes de tokenizar activos.',
        'Retiros crypto deben requerir KYC, doble confirmación y aprobación admin por umbrales.',
      ],
    },
    {
      status: demoMode || requiredOk ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
