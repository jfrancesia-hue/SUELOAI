import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete('suelo_demo_role');
  response.cookies.delete('suelo_demo_wallet_balance');
  return response;
}
