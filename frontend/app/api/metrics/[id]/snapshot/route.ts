import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '../../../config';

/**
 * Proxy a request to retrieve a metric snapshot for the specified ID from the backend.
 *
 * @param request - Incoming Next.js request; the `Authorization` header will be forwarded to the backend if present
 * @param params - A promise resolving to an object with the `id` of the metric to fetch
 * @returns The backend's JSON response wrapped in a NextResponse with the same HTTP status; on failure returns a 500 NextResponse with `{ detail: 'Failed to connect to backend' }`
 */
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