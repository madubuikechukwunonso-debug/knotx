import { NextResponse } from 'next/server';
export async function POST() { return NextResponse.json({ ok: false, message: 'Stripe checkout wiring placeholder in rebuild package.' }, { status: 501 }); }
