'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Calendar, 
  Euro, 
  Users, 
  TrendingUp,
  Plus,
  Settings,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [upcomingDepartures, setUpcomingDepartures] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/auth');
      return;
    }
    
    if (user && isAdmin) {
      fetchDashboardData();
    }
  }, [user, authLoading, isAdmin]);

  async function fetchDashboardData() {
    try {
      const response = await fetch('/api/admin/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setUpcomingDepartures(data.upcoming_departures);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatPrice = (cents, currency = 'EUR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(cents / 100);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your travel business</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Button className="h-auto p-4 justify-start" asChild>
            <Link href="/admin/trips/new">
              <Plus className="h-5 w-5 mr-2" />
              <div>
                <div className="font-semibold">New Trip</div>
                <div className="text-xs opacity-80">Create a trip</div>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto p-4 justify-start" asChild>
            <Link href="/admin/trips">
              <Calendar className="h-5 w-5 mr-2" />
              <div>
                <div className="font-semibold">Manage Trips</div>
                <div className="text-xs opacity-60">View all trips</div>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto p-4 justify-start" asChild>
            <Link href="/admin/bookings">
              <Users className="h-5 w-5 mr-2" />
              <div>
                <div className="font-semibold">Bookings</div>
                <div className="text-xs opacity-60">Manage bookings</div>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto p-4 justify-start" asChild>
            <Link href="/admin/settings">
              <Settings className="h-5 w-5 mr-2" />
              <div>
                <div className="font-semibold">Settings</div>
                <div className="text-xs opacity-60">Site configuration</div>
              </div>
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_bookings || 0}</div>
              <p className="text-xs text-muted-foreground">All time bookings</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPrice(stats?.total_revenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">All time revenue</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Departures</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.upcoming_departures || 0}</div>
              <p className="text-xs text-muted-foreground">Next 30 days</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Booking</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.total_bookings > 0 
                  ? formatPrice(Math.round((stats?.total_revenue || 0) / stats.total_bookings))
                  : formatPrice(0)
                }
              </div>
              <p className="text-xs text-muted-foreground">Per booking</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Departures */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upcoming Departures</CardTitle>
            <CardDescription>Next trips departing soon</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingDepartures.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming departures</h3>
                <p className="text-gray-500 mb-4">Create your first trip to get started!</p>
                <Button asChild>
                  <Link href="/admin/trips/new">Create Trip</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingDepartures.map((departure) => (
                  <div key={departure.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{departure.trip?.[0]?.title}</h4>
                      <div className="text-sm text-gray-600 mt-1">
                        <span>Departing: {new Date(departure.start_date).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span>{departure.spots_left} spots left</span>
                        <span className="mx-2">•</span>
                        <span>{formatPrice(departure.base_price_cents, departure.currency)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={departure.spots_left > 0 ? 'default' : 'secondary'}>
                        {departure.spots_left > 0 ? 'Available' : 'Full'}
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/trips/${departure.trip?.[0]?.slug || departure.trip_id}`}>
                          Manage
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>Manage your site content and settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/content">
                  <FileText className="h-4 w-4 mr-2" />
                  Manage Content
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/testimonials">
                  <Users className="h-4 w-4 mr-2" />
                  Testimonials
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/contact">
                  <FileText className="h-4 w-4 mr-2" />
                  Contact Messages
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current system configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Demo Mode</span>
                <Badge variant="secondary">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Payment Provider</span>
                <Badge variant="secondary">Mock</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Email Service</span>
                <Badge variant="secondary">Database Only</Badge>
              </div>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/admin/settings">Configure Services</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}