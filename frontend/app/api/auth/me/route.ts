import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '../../config';

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization');

        const response = await fetch(`${BACKEND_URL}/auth/me`, {
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
