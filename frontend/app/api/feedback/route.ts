import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({ status: "success", feedback: body });
  } catch (err: any) {
    return NextResponse.json({ status: "error" }, { status: 400 });
  }
}
