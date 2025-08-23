'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Users, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function HomePage() {
  const [featuredTrips, setFeaturedTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchFeaturedTrips();
  }, []);

  async function fetchFeaturedTrips() {
    try {
      const response = await fetch('/api/trips');
      if (response.ok) {
        const data = await response.json();
        setFeaturedTrips(data.trips.filter(trip => trip.featured).slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Travel with
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                DENCHE
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl">
              Join Aimen on unforgettable group adventures around the world. 
              Discover breathtaking destinations, meet amazing people, and create memories that last a lifetime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100" asChild>
                <Link href="/trips">
                  Explore Trips <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              {!user && (
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                  <Link href="/auth">Join the Adventure</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Trips */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Adventures</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Handpicked experiences designed to push your boundaries and expand your horizons
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTrips.map((trip) => (
              <Card key={trip.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 relative">
                  {trip.hero_image_url && (
                    <img 
                      src={trip.hero_image_url} 
                      alt={trip.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 text-gray-900">
                      {trip.difficulty}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{trip.title}</CardTitle>
                  <CardDescription className="text-base">
                    {trip.subtitle}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{trip.meeting_point}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{trip.group_size_min}-{trip.group_size_max} people</span>
                    </div>
                    {trip.departures && trip.departures.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CalendarDays className="h-4 w-4" />
                        <span>
                          {new Date(trip.departures[0].start_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <div>
                      {trip.departures && trip.departures.length > 0 && (
                        <div className="text-2xl font-bold">
                          {formatPrice(trip.departures[0].base_price_cents, trip.departures[0].currency)}
                        </div>
                      )}
                    </div>
                    <Button asChild>
                      <Link href={`/trips/${trip.slug}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {featuredTrips.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No featured trips available yet.</p>
              {user?.role === 'admin' && (
                <Button asChild>
                  <Link href="/admin/trips">Add Your First Trip</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Who I Am</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Hey! I'm Aimen Denche, a passionate travel organizer and content creator. 
              Through TravelwithDENCHE, I bring together adventurous souls from around the world 
              to explore incredible destinations, push our comfort zones, and create unforgettable memories together.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Every trip is carefully crafted to balance adventure, culture, and relaxation. 
              Whether we're hiking through mountain ranges, exploring ancient cities, or discovering hidden gems, 
              you'll be part of a supportive community that celebrates every step of the journey.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Small Groups</h3>
                <p className="text-gray-600">Intimate experiences with 8-16 like-minded travelers</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Star className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Unique Experiences</h3>
                <p className="text-gray-600">Off-the-beaten-path adventures you won't find elsewhere</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <MapPin className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Expert Guidance</h3>
                <p className="text-gray-600">Local insights and seamless logistics handled for you</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready for Your Next Adventure?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join our community of adventurers and discover what awaits beyond your comfort zone.
          </p>
          <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" asChild>
            <Link href="/trips">
              Browse All Trips <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}