// src/app/api/cron/process-deletions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { processPendingDeletions } from '@/services/accountDeletion';

// This API route should be called by a cron job service (like Vercel Cron, GitHub Actions, or external cron services)
// Example: every day at 2 AM UTC
export async function POST(request: NextRequest) {
  try {
    // Verify the request is from an authorized source
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('CRON_SECRET environment variable not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting scheduled account deletion process...');
    
    // Process pending deletions
    await processPendingDeletions();
    
    console.log('Account deletion process completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Pending deletions processed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in deletion cron job:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to process pending deletions',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'account-deletion-cron',
    timestamp: new Date().toISOString()
  });
}