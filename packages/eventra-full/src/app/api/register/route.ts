import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { applyRateLimit, registerRateLimit, getClientIP } from "../../../lib/ratelimit";
import prisma from "../../../lib/prisma";

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password strength validation
function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/(?=.*\d)/.test(password)) {
    return "Password must contain at least one number";
  }
  return null;
}

// POST /api/register
export async function POST(req: Request) {
  try {
    // Apply rate limiting with fallback
    const clientIP = getClientIP(req);
    let rateLimitResult;
    
    try {
      rateLimitResult = await applyRateLimit(registerRateLimit, clientIP);
    } catch (rateLimitError) {
      console.warn('Rate limiting failed, continuing without limits:', rateLimitError);
      // Fallback: allow request if rate limiting fails
      rateLimitResult = { success: true, limit: 999, remaining: 999, reset: Date.now() + 300000 };
    }
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
            'Retry-After': Math.round((rateLimitResult.reset - Date.now()) / 1000).toString(),
          }
        }
      );
    }
    
    const { email, password, name } = await req.json();
    
    // Input validation
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    
    // Email format validation
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }
    
    // Password strength validation
    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }
    
    // Check if user already exists
    let existing;
    try {
      existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    } catch (dbError) {
      console.error('Database error when checking existing user:', dbError);
      return NextResponse.json({ 
        error: "Database connection error. Please try again.",
        details: process.env.NODE_ENV === 'development' ? String(dbError) : undefined 
      }, { status: 500 });
    }
    
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }
    
    // Use environment variable for bcrypt rounds, fallback to 12
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    let hashed;
    try {
      hashed = await bcrypt.hash(password, saltRounds);
    } catch (hashError) {
      console.error('Password hashing error:', hashError);
      return NextResponse.json({ error: "Password processing error" }, { status: 500 });
    }
    
    let user;
    try {
      user = await prisma.user.create({
        data: { 
          email: email.toLowerCase(), 
          password: hashed, 
          name: name?.trim() || null 
        },
        select: { id: true, email: true, name: true }
      });
    } catch (createError) {
      console.error('Database error when creating user:', createError);
      return NextResponse.json({ 
        error: "Failed to create account. Please try again.",
        details: process.env.NODE_ENV === 'development' ? String(createError) : undefined 
      }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV
    });
    
    // More specific error responses
    if (error instanceof Error) {
      if (error.message.includes('SQLITE') || error.message.includes('database')) {
        return NextResponse.json({
          error: "Database temporarily unavailable. Please try again in a few moments.",
          code: "DB_ERROR"
        }, { status: 503 });
      }
      
      if (error.message.includes('rate limit') || error.message.includes('timeout')) {
        return NextResponse.json({
          error: "Service temporarily overloaded. Please try again.",
          code: "RATE_LIMIT_ERROR"
        }, { status: 429 });
      }
    }
    
    return NextResponse.json({ 
      error: "Registration failed. Please try again.",
      code: "INTERNAL_ERROR"
    }, { status: 500 });
  } finally {
    // Ensure database connection cleanup
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.warn('Failed to disconnect Prisma client:', disconnectError);
    }
  }
}
