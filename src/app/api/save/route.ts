import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { gameState } = await request.json();

    if (!gameState) {
      return NextResponse.json(
        { error: 'Game state is required' },
        { status: 400 }
      );
    }

    // Generate a unique 6-digit code
    let code = generateCode();
    let attempts = 0;

    // Keep trying until we find a unique code
    while (await kv.exists(`save:${code}`) && attempts < 100) {
      code = generateCode();
      attempts++;
    }

    if (attempts >= 100) {
      return NextResponse.json(
        { error: 'Failed to generate unique save code' },
        { status: 500 }
      );
    }

    // Save the game state with 30-day expiration
    await kv.set(`save:${code}`, JSON.stringify(gameState), {
      ex: 60 * 60 * 24 * 30, // 30 days in seconds
    });

    return NextResponse.json({ code });
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json(
      { error: 'Failed to save game' },
      { status: 500 }
    );
  }
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
