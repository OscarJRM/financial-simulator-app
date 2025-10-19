// app/api/deepstack/face/match/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('PROXY /match: Solicitud recibida');
  
  try {
    const formData = await request.formData();
    console.log('PROXY /match: Enviando a DeepStack...');
    
    const deepstackResponse = await fetch('http://localhost:5000/v1/vision/face/match', {
      method: 'POST',
      body: formData,
    });

    console.log('PROXY /match: DeepStack respondió -', deepstackResponse.status);
    
    if (!deepstackResponse.ok) {
      const errorText = await deepstackResponse.text();
      console.error('PROXY /match: Error DeepStack -', errorText);
      throw new Error(`DeepStack error: ${deepstackResponse.status}`);
    }

    const data = await deepstackResponse.json();
    console.log('PROXY /match: Éxito -', JSON.stringify(data));
    
    return NextResponse.json(data);
  } catch (error) {
    console.error(' PROXY /match: Error completo -', error);
    return NextResponse.json(
      { error: 'DeepStack match no está disponible' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';