import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth'; // Your configured Better Auth instance
// import { doesUserExist } from '@/lib/users/user-queries'; // Decided against pre-check for now

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode.' },
      { status: 403 }
    );
  }

  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    // Using auth.api.createUser as in scripts/create-admin.ts
    // It's expected to return an object like { user: { id: '...', ... } }
    const creationResponse = await auth.api.createUser({
      body: {
        name,
        email,
        password,
        role: 'admin', // Using lowercase 'admin' as in scripts/create-admin.ts
        // emailVerified is not set here, aligning with scripts/create-admin.ts
      }
    });

    // Extract user ID based on the expected structure { user: { id: '...' } }
    const userId = creationResponse.user.id;

    return NextResponse.json(
      { message: 'Admin user created successfully!', userId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating admin user:', error);
    // Check for specific Better Auth errors if needed, e.g., user already exists
    // The error message might differ when using auth.api.createUser
    if (error.message && error.message.toLowerCase().includes('user with this email already exists')) {
        return NextResponse.json({ error: 'User with this email already exists.' }, { status: 409 });
    }
    // Prisma unique constraint violation (P2002) on the email field
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return NextResponse.json({ error: 'User with this email already exists (database constraint).' }, { status: 409 });
    }
    return NextResponse.json(
      { error: 'Failed to create admin user.', details: error.message },
      { status: 500 }
    );
  }
}
