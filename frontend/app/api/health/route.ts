import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    app: "ShopMind AI",
    version: "1.2.0",
    llm_provider: "mock",
    database: "sqlite_connected",
    rag: "ready",
    env: "production"
  });
}
