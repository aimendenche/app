'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, MapPin, Users, Search, Filter, Euro } from 'lucide-react';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    filterTrips();
  }, [trips, searchTerm, difficultyFilter]);

  async function fetchTrips() {
    try {
      const response = await fetch('/api/trips');
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

  function filterTrips() {
    let filtered = trips;

    if (searchTerm) {
      filtered = filtered.filter(trip =>
        trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.meeting_point?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(trip => trip.difficulty === difficultyFilter);
    }

    setFilteredTrips(filtered);
  }

  const formatPrice = (cents, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'EUR'
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-4">All Adventures</h1>
          <p className="text-gray-600 text-lg">Discover your next unforgettable journey</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search trips, destinations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredTrips.length} trip{filteredTrips.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Trips Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTrips.map((trip) => (
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
                  <Badge className={getDifficultyColor(trip.difficulty)}>
                    {trip.difficulty}
                  </Badge>
                </div>
                {trip.featured && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-yellow-500 text-white">
                      Featured
                    </Badge>
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-xl">{trip.title}</CardTitle>
                <CardDescription className="text-base">
                  {trip.subtitle}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
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
                        Next: {new Date(trip.departures[0].start_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Highlights */}
                {trip.highlights && trip.highlights.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {trip.highlights.slice(0, 3).map((highlight, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {highlight}
                        </Badge>
                      ))}
                      {trip.highlights.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{trip.highlights.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div>
                    {trip.departures && trip.departures.length > 0 && (
                      <div className="text-2xl font-bold">
                        {formatPrice(trip.departures[0].base_price_cents, trip.departures[0].currency)}
                      </div>
                    )}
                    <div className="text-sm text-gray-500">
                      {trip.departures?.some(d => d.allow_free_rsvp) && (
                        <span className="text-green-600 font-medium">Free RSVP available</span>
                      )}
                    </div>
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

        {filteredTrips.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search criteria or check back later for new adventures.
              </p>
              <Button onClick={() => {setSearchTerm(''); setDifficultyFilter('all');}}>
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}