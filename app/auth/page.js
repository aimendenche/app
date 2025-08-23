'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle, Shield, Plane } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleLogin(type) {
    setLoading(true);
    try {
      const user = await login(type);
      if (user) {
        toast.success(`Welcome${user.name ? `, ${user.name}` : ''}!`);
        router.push(user.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        toast.error('Login failed. Please try again.');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Plane className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to continue your adventure</p>
        </div>

        <div className="space-y-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleLogin('user')}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <UserCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Continue as Demo User</CardTitle>
                  <CardDescription>
                    Browse trips and make bookings
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                disabled={loading}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogin('user');
                }}
              >
                {loading ? 'Signing in...' : 'Sign in as User'}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleLogin('admin')}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Continue as Admin</CardTitle>
                  <CardDescription>
                    Manage trips, bookings, and content
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                variant="outline"
                disabled={loading}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogin('admin');
                }}
              >
                {loading ? 'Signing in...' : 'Sign in as Admin'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Demo mode enabled. In production, you'll sign in with Google.
          </p>
        </div>
      </div>
    </div>
  );
}