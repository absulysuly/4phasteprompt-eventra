import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

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
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }
    
    // Use environment variable for bcrypt rounds, fallback to 12
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const hashed = await bcrypt.hash(password, saltRounds);
    
    const user = await prisma.user.create({
      data: { 
        email: email.toLowerCase(), 
        password: hashed, 
        name: name?.trim() || null 
      },
      select: { id: true, email: true, name: true }
    });
    
    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
