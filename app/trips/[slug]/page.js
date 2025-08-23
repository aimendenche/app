'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  Share2,
  Star,
  CreditCard,
  Gift
} from 'lucide-react';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';

export default function TripDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDeparture, setSelectedDeparture] = useState(null);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (params.slug) {
      fetchTrip();
    }
  }, [params.slug]);

  async function fetchTrip() {
    try {
      const response = await fetch(`/api/trips/${params.slug}`);
      if (response.ok) {
        const data = await response.json();
        setTrip(data.trip);
        if (data.trip.departures?.length > 0) {
          setSelectedDeparture(data.trip.departures[0]);
        }
      } else {
        toast.error('Trip not found');
      }
    } catch (error) {
      console.error('Error fetching trip:', error);
      toast.error('Error loading trip details');
    } finally {
      setLoading(false);
    }
  }

  async function handleBooking() {
    if (!user) {
      toast.error('Please sign in to book this trip');
      return;
    }

    if (!selectedDeparture) {
      toast.error('Please select a departure date');
      return;
    }

    setBooking(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departure_id: selectedDeparture.id,
          seats: 1
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.payment_required && data.checkout_url) {
          // Redirect to payment
          if (data.checkout_url.startsWith('/mock-checkout')) {
            // Mock payment - simulate success
            toast.success('Booking confirmed! (Mock payment successful)');
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 2000);
          } else {
            window.location.href = data.checkout_url;
          }
        } else {
          // Free RSVP successful
          toast.success('Free RSVP confirmed! Check your dashboard for details.');
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
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

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Trip not found</h1>
          <Button asChild>
            <Link href="/trips">Back to Trips</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/trips">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Trips
              </Link>
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero section */}
            <div>
              <div className="h-96 rounded-2xl overflow-hidden mb-6">
                {trip.hero_image_url ? (
                  <img 
                    src={trip.hero_image_url} 
                    alt={trip.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">{trip.title}</span>
                  </div>
                )}
              </div>

              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{trip.title}</h1>
                  <p className="text-xl text-gray-600 mb-4">{trip.subtitle}</p>
                  <div className="flex items-center gap-4">
                    <Badge className={getDifficultyColor(trip.difficulty)}>
                      {trip.difficulty}
                    </Badge>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{trip.meeting_point}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{trip.group_size_min}-{trip.group_size_max} people</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Highlights */}
              {trip.highlights && trip.highlights.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Trip Highlights</h3>
                  <div className="flex flex-wrap gap-2">
                    {trip.highlights.map((highlight, index) => (
                      <Badge key={index} variant="secondary">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                <TabsTrigger value="included">What's Included</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Trip</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: trip.description_md?.replace(/\n/g, '<br>') || 'No description available.' 
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="itinerary" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Day-by-Day Itinerary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: trip.itinerary_md?.replace(/\n/g, '<br>') || 'Itinerary coming soon.' 
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="included" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-5 w-5" />
                        What's Included
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {trip.included?.map((item, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>{item}</span>
                          </li>
                        )) || <li>No inclusions listed</li>}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-700">
                        <XCircle className="h-5 w-5" />
                        Not Included
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {trip.not_included?.map((item, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span>{item}</span>
                          </li>
                        )) || <li>No exclusions listed</li>}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="faq" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {trip.faq && trip.faq.length > 0 ? (
                      <div className="space-y-6">
                        {trip.faq.map((item, index) => (
                          <div key={index}>
                            <h4 className="font-semibold mb-2">{item.question}</h4>
                            <p className="text-gray-600">{item.answer}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No FAQ available yet.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Booking sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Book This Trip</CardTitle>
                <CardDescription>Select your preferred departure date</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {trip.departures && trip.departures.length > 0 ? (
                  <>
                    {/* Departure selection */}
                    <div className="space-y-3">
                      {trip.departures.map((departure) => (
                        <div 
                          key={departure.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedDeparture?.id === departure.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedDeparture(departure)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold">
                              {new Date(departure.start_date).toLocaleDateString()} - {' '}
                              {new Date(departure.end_date).toLocaleDateString()}
                            </div>
                            <Badge variant={departure.spots_left > 0 ? 'default' : 'secondary'}>
                              {departure.spots_left > 0 ? `${departure.spots_left} spots left` : 'Full'}
                            </Badge>
                          </div>
                          <div className="text-2xl font-bold mb-1">
                            {formatPrice(departure.base_price_cents, departure.currency)}
                          </div>
                          {departure.allow_free_rsvp && (
                            <div className="flex items-center gap-1 text-green-600 text-sm">
                              <Gift className="h-4 w-4" />
                              <span>Free RSVP available</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {selectedDeparture && (
                      <>
                        {/* Booking details */}
                        <div className="border-t pt-4">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Trip price:</span>
                              <span>{formatPrice(selectedDeparture.base_price_cents, selectedDeparture.currency)}</span>
                            </div>
                            {!selectedDeparture.allow_free_rsvp && (
                              <div className="flex justify-between">
                                <span>Deposit required:</span>
                                <span>{formatPrice(selectedDeparture.deposit_cents, selectedDeparture.currency)}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-semibold">
                              <span>Total due now:</span>
                              <span>
                                {selectedDeparture.allow_free_rsvp 
                                  ? 'Free RSVP' 
                                  : formatPrice(selectedDeparture.deposit_cents, selectedDeparture.currency)
                                }
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Book button */}
                        <Button 
                          className="w-full" 
                          size="lg"
                          onClick={handleBooking}
                          disabled={booking || selectedDeparture.spots_left === 0}
                        >
                          {booking ? (
                            'Processing...'
                          ) : selectedDeparture.spots_left === 0 ? (
                            'Fully Booked'
                          ) : selectedDeparture.allow_free_rsvp ? (
                            <>
                              <Gift className="h-4 w-4 mr-2" />
                              Free RSVP
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Reserve with Deposit
                            </>
                          )}
                        </Button>

                        {!user && (
                          <p className="text-sm text-gray-600 text-center">
                            <Link href="/auth" className="text-blue-600 hover:underline">
                              Sign in
                            </Link>
                            {' '}to book this trip
                          </p>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No departures scheduled yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Questions?</CardTitle>
                <CardDescription>Need help choosing or have special requests?</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/contact">Contact Aimen</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}