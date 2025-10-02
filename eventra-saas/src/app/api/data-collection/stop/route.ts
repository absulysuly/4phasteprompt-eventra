import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  try {
    console.log('Stopping collection service...');
    
    // Stop the service using npm script
    await execAsync('npm run collect:service:stop');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Collection service stopped' 
    });
  } catch (error: any) {
    console.error('Error stopping collection service:', error);
    return NextResponse.json(
      { error: 'Failed to stop service', details: error.message },
      { status: 500 }
    );
  }
}
