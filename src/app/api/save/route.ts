import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    // Extract code from request if it exists
    const { gameState, code: existingCode } = await request.json();

    if (!gameState) {
      return NextResponse.json(
        { error: 'Game state is required' },
        { status: 400 }
      );
    }

    // Generate or reuse code
    let code = existingCode || generateCode();
    let attempts = 0;

    // Only check for uniqueness if generating a new code
    if (!existingCode) {
      // Keep trying until we find a unique code
      while (attempts < 100) {
        const existing = await sql`
          SELECT code FROM game_saves WHERE code = ${code}
        `;

        if (existing.length === 0) {
          break; // Code is unique
        }

        code = generateCode();
        attempts++;
      }

      if (attempts >= 100) {
        return NextResponse.json(
          { error: 'Failed to generate unique save code' },
          { status: 500 }
        );
      }
    }

    // Save the game state
    await sql`
      INSERT INTO game_saves (code, game_state, expires_at)
      VALUES (
        ${code},
        ${JSON.stringify(gameState)},
        NOW() + INTERVAL '30 days'
      )
      ON CONFLICT (code)
      DO UPDATE SET
        game_state = ${JSON.stringify(gameState)},
        expires_at = NOW() + INTERVAL '30 days'
    `;

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
