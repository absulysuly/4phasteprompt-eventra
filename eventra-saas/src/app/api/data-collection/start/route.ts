import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  try {
    console.log('Starting collection service...');
    
    // Start the service using npm script
    exec('npm run collect:service:start', {
      detached: true,
      stdio: 'ignore'
    }).unref();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Collection service started' 
    });
  } catch (error: any) {
    console.error('Error starting collection service:', error);
    return NextResponse.json(
      { error: 'Failed to start service', details: error.message },
      { status: 500 }
    );
  }
}
