import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'Invalid code format. Must be 6 digits.' },
        { status: 400 }
      );
    }

    // Load the game state
    const gameStateJson = await kv.get<string>(`save:${code}`);

    if (!gameStateJson) {
      return NextResponse.json(
        { error: 'Save code not found or expired' },
        { status: 404 }
      );
    }

    const gameState = JSON.parse(gameStateJson);

    return NextResponse.json({ gameState });
  } catch (error) {
    console.error('Load error:', error);
    return NextResponse.json(
      { error: 'Failed to load game' },
      { status: 500 }
    );
  }
}
