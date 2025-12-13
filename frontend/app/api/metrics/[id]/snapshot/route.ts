import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '../../../config';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.headers.get('authorization');
        const { id } = await params;

        const response = await fetch(`${BACKEND_URL}/metrics/${id}/snapshot`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': token } : {}),
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { detail: 'Failed to connect to backend' },
            { status: 500 }
        );
    }
}
