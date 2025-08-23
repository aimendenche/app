import { cookies } from 'next/headers';
import { getDatabase } from './db';
import { v4 as uuidv4 } from 'uuid';

export class DemoAuth {
  static async loginAsAdmin() {
    const user = {
      id: uuidv4(),
      email: process.env.ADMIN_EMAIL || 'aimen.denche18@gmail.com',
      name: 'Aimen Denche',
      role: 'admin',
      avatar_url: null,
      auth_uid: 'admin-demo',
      created_at: new Date()
    };

    const db = await getDatabase();
    await db.collection('users').updateOne(
      { email: user.email },
      { $set: user },
      { upsert: true }
    );

    return user;
  }

  static async loginAsDemoUser() {
    const user = {
      id: uuidv4(),
      email: 'demo@user.dev',
      name: 'Demo User',
      role: 'user',
      avatar_url: null,
      auth_uid: 'demo-user',
      created_at: new Date()
    };

    const db = await getDatabase();
    await db.collection('users').updateOne(
      { email: user.email },
      { $set: user },
      { upsert: true }
    );

    return user;
  }

  static async getCurrentUser() {
    try {
      const cookieStore = cookies();
      const sessionCookie = cookieStore.get('demo-session');
      
      if (!sessionCookie) {
        return null;
      }

      const session = JSON.parse(sessionCookie.value);
      const db = await getDatabase();
      const user = await db.collection('users').findOne({ 
        email: session.email 
      });

      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static async isAdmin(user) {
    if (!user) return false;
    return user.role === 'admin' || user.email === process.env.ADMIN_EMAIL;
  }
}

export async function getCurrentUser() {
  const useDemoMode = process.env.USE_DEMO_MODE === 'true';
  
  if (useDemoMode) {
    return await DemoAuth.getCurrentUser();
  }
  
  // TODO: Implement Supabase auth when keys are available
  return null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (!DemoAuth.isAdmin(user)) {
    throw new Error('Admin access required');
  }
  return user;
}