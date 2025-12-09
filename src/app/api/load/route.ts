import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'Invalid code format. Must be 6 digits.' },
        { status: 400 }
      );
    }

    // Load the game state and check expiration
    const result = await sql`
      SELECT game_state, expires_at
      FROM game_saves
      WHERE code = ${code}
      AND expires_at > NOW()
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Save code not found or expired' },
        { status: 404 }
      );
    }

    const gameState = result[0].game_state;

    return NextResponse.json({ gameState });
  } catch (error) {
    console.error('Load error:', error);
    return NextResponse.json(
      { error: 'Failed to load game' },
      { status: 500 }
    );
  }
}
