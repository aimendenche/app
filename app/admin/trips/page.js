'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  Edit,
  Eye,
  MoreHorizontal,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useRouter } from 'next/navigation';

export default function AdminTripsPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/auth');
      return;
    }
    
    if (user && isAdmin) {
      fetchTrips();
    }
  }, [user, authLoading, isAdmin]);

  async function fetchTrips() {
    try {
      const response = await fetch('/api/admin/trips');
      if (response.ok) {
        const data = await response.json();
        setTrips(data.trips);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Trips</h1>
            <p className="text-gray-600">Create and manage your travel experiences</p>
          </div>
          <Button asChild>
            <Link href="/admin/trips/new">
              <Plus className="h-4 w-4 mr-2" />
              New Trip
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Trips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trips.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Trips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trips.filter(t => t.active).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Featured Trips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trips.filter(t => t.featured).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Departures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trips.reduce((sum, t) => sum + (t.departures?.length || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trips List */}
        {trips.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No trips yet</h3>
              <p className="text-gray-500 mb-4">Create your first trip to get started!</p>
              <Button asChild>
                <Link href="/admin/trips/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Trip
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {trips.map((trip) => (
              <Card key={trip.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{trip.title}</h3>
                        <div className="flex gap-2">
                          {trip.featured && (
                            <Badge className="bg-yellow-500 text-white">Featured</Badge>
                          )}
                          <Badge className={getDifficultyColor(trip.difficulty)}>
                            {trip.difficulty}
                          </Badge>
                          <Badge variant={trip.active ? 'default' : 'secondary'}>
                            {trip.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{trip.subtitle}</p>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{trip.meeting_point}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{trip.group_size_min}-{trip.group_size_max} people</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{trip.departures?.length || 0} departure{trip.departures?.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      {trip.departures && trip.departures.length > 0 && (
                        <div className="mt-3 text-sm">
                          <div className="text-gray-600">
                            Next departure: {new Date(trip.departures[0].start_date).toLocaleDateString()}
                          </div>
                          <div className="font-semibold">
                            {formatPrice(trip.departures[0].base_price_cents, trip.departures[0].currency)}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/trips/${trip.slug}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Link>
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/trips/${trip.slug}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Trip
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/trips/${trip.slug}/departures`}>
                              <Calendar className="h-4 w-4 mr-2" />
                              Manage Departures
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/trips/${trip.slug}/settings`}>
                              <Settings className="h-4 w-4 mr-2" />
                              Trip Settings
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}