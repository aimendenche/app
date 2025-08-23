'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Users, CreditCard, Clock } from 'lucide-react';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
      return;
    }
    
    if (user) {
      fetchBookings();
    }
  }, [user, authLoading]);

  async function fetchBookings() {
    try {
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatPrice = (cents, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'EUR'
    }).format(cents / 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'reserved_unpaid': return 'bg-blue-100 text-blue-800';
      case 'reserved_deposit_paid': return 'bg-yellow-100 text-yellow-800';
      case 'paid_in_full': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'reserved_unpaid': return 'Reserved (Free)';
      case 'reserved_deposit_paid': return 'Deposit Paid';
      case 'paid_in_full': return 'Fully Paid';
      case 'cancelled': return 'Cancelled';
      case 'refunded': return 'Refunded';
      default: return status;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name || 'Traveler'}!</h1>
          <p className="text-gray-600">Manage your trips and bookings</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bookings.filter(b => !['cancelled', 'refunded'].includes(b.status)).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Upcoming Trips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bookings.filter(b => 
                  b.departure?.[0]?.start_date && 
                  new Date(b.departure[0].start_date) > new Date() &&
                  !['cancelled', 'refunded'].includes(b.status)
                ).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPrice(
                  bookings
                    .filter(b => ['reserved_deposit_paid', 'paid_in_full'].includes(b.status))
                    .reduce((sum, b) => sum + (b.deposit_paid_cents || 0), 0),
                  'EUR'
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Bookings */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">My Bookings</h2>
            <Button asChild>
              <Link href="/trips">Browse More Trips</Link>
            </Button>
          </div>

          {bookings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-500 mb-4">Start your adventure by booking your first trip!</p>
                <Button asChild>
                  <Link href="/trips">Explore Trips</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">
                            {booking.trip?.[0]?.title || 'Trip'}
                          </h3>
                          <Badge className={getStatusColor(booking.status)}>
                            {getStatusText(booking.status)}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          {booking.departure?.[0] && (
                            <>
                              <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4" />
                                <span>
                                  {new Date(booking.departure[0].start_date).toLocaleDateString()} - {' '}
                                  {new Date(booking.departure[0].end_date).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{booking.trip?.[0]?.meeting_point}</span>
                              </div>
                            </>
                          )}
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{booking.seats} seat{booking.seats > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-semibold mb-2">
                          {formatPrice(booking.total_price_cents, booking.departure?.[0]?.currency)}
                        </div>
                        
                        {booking.status === 'reserved_deposit_paid' && booking.balance_due_cents > 0 && (
                          <div className="space-y-2">
                            <div className="text-sm text-orange-600">
                              Balance due: {formatPrice(booking.balance_due_cents, booking.departure?.[0]?.currency)}
                            </div>
                            <Button size="sm" variant="outline">
                              <CreditCard className="h-4 w-4 mr-2" />
                              Pay Balance
                            </Button>
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-500 mt-2">
                          Booked {new Date(booking.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your account and explore more</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <Link href="/profile">Update Profile</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/trips">Browse Trips</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}