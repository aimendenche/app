import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { getCurrentUser, requireAuth, requireAdmin, DemoAuth } from '@/lib/auth';
import { getPaymentProvider } from '@/lib/payments';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

// Helper function to get path segments
function getPathSegments(request) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.replace('/api/', '').split('/').filter(Boolean);
  return pathSegments;
}

// AUTH ENDPOINTS
async function handleAuth(request, segments) {
  const method = request.method;
  
  if (segments[0] === 'login' && method === 'POST') {
    const { type } = await request.json();
    
    let user;
    if (type === 'admin') {
      user = await DemoAuth.loginAsAdmin();
    } else {
      user = await DemoAuth.loginAsDemoUser();
    }
    
    const response = NextResponse.json({ user, success: true });
    response.cookies.set('demo-session', JSON.stringify({ 
      email: user.email, 
      role: user.role 
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });
    
    return response;
  }
  
  if (segments[0] === 'logout' && method === 'POST') {
    const response = NextResponse.json({ success: true });
    response.cookies.delete('demo-session');
    return response;
  }
  
  if (segments[0] === 'me' && method === 'GET') {
    const user = await getCurrentUser();
    return NextResponse.json({ user });
  }
  
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

// TRIPS ENDPOINTS
async function handleTrips(request, segments) {
  const db = await getDatabase();
  const method = request.method;
  
  if (method === 'GET' && segments.length === 0) {
    // Get all active trips with departures
    const trips = await db.collection('trips').aggregate([
      { $match: { active: true } },
      {
        $lookup: {
          from: 'departures',
          localField: 'id',
          foreignField: 'trip_id',
          as: 'departures'
        }
      },
      {
        $lookup: {
          from: 'trip_images',
          localField: 'id',
          foreignField: 'trip_id',
          as: 'images'
        }
      },
      { $sort: { featured: -1, created_at: -1 } }
    ]).toArray();
    
    return NextResponse.json({ trips });
  }
  
  if (method === 'GET' && segments[0]) {
    // Get single trip by slug
    const slug = segments[0];
    const trip = await db.collection('trips').findOne({ slug, active: true });
    
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }
    
    const departures = await db.collection('departures').find({ trip_id: trip.id }).toArray();
    const images = await db.collection('trip_images').find({ trip_id: trip.id }).sort({ sort_order: 1 }).toArray();
    
    return NextResponse.json({ trip: { ...trip, departures, images } });
  }
  
  if (method === 'POST') {
    await requireAdmin();
    const tripData = await request.json();
    
    const trip = {
      id: uuidv4(),
      slug: tripData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      ...tripData,
      created_at: new Date()
    };
    
    await db.collection('trips').insertOne(trip);
    return NextResponse.json({ trip });
  }
  
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

// BOOKINGS ENDPOINTS
async function handleBookings(request, segments) {
  const db = await getDatabase();
  const method = request.method;
  const user = await requireAuth();
  
  if (method === 'GET') {
    const query = user.role === 'admin' ? {} : { user_id: user.id };
    const bookings = await db.collection('bookings').aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'trips',
          localField: 'trip_id',
          foreignField: 'id',
          as: 'trip'
        }
      },
      {
        $lookup: {
          from: 'departures',
          localField: 'departure_id',
          foreignField: 'id',
          as: 'departure'
        }
      },
      { $sort: { created_at: -1 } }
    ]).toArray();
    
    return NextResponse.json({ bookings });
  }
  
  if (method === 'POST') {
    const { departure_id, seats = 1 } = await request.json();
    
    // Get departure details
    const departure = await db.collection('departures').findOne({ id: departure_id });
    if (!departure) {
      return NextResponse.json({ error: 'Departure not found' }, { status: 404 });
    }
    
    // Check availability
    if (departure.spots_left < seats) {
      return NextResponse.json({ error: 'Not enough spots available' }, { status: 400 });
    }
    
    const totalPrice = departure.base_price_cents * seats;
    const depositAmount = departure.allow_free_rsvp ? 0 : departure.deposit_cents * seats;
    
    const booking = {
      id: uuidv4(),
      user_id: user.id,
      trip_id: departure.trip_id,
      departure_id: departure.id,
      seats,
      status: departure.allow_free_rsvp ? 'reserved_unpaid' : 'pending_deposit',
      total_price_cents: totalPrice,
      deposit_paid_cents: 0,
      balance_due_cents: totalPrice - depositAmount,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    await db.collection('bookings').insertOne(booking);
    
    // Update departure spots
    await db.collection('departures').updateOne(
      { id: departure_id },
      { $inc: { spots_left: -seats } }
    );
    
    if (departure.allow_free_rsvp) {
      // Free RSVP - booking complete
      await db.collection('bookings').updateOne(
        { id: booking.id },
        { $set: { status: 'reserved_unpaid' } }
      );
      
      return NextResponse.json({ booking, payment_required: false });
    } else {
      // Create payment session
      const paymentProvider = getPaymentProvider();
      const session = await paymentProvider.createCheckoutSession({
        amount: depositAmount,
        currency: departure.currency,
        metadata: {
          booking_id: booking.id,
          type: 'deposit'
        }
      });
      
      await db.collection('bookings').updateOne(
        { id: booking.id },
        { 
          $set: { 
            stripe_checkout_session_id: session.id,
            status: 'pending_deposit'
          } 
        }
      );
      
      return NextResponse.json({ 
        booking, 
        payment_required: true, 
        checkout_url: session.url 
      });
    }
  }
  
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

// ADMIN ENDPOINTS
async function handleAdmin(request, segments) {
  await requireAdmin();
  const db = await getDatabase();
  const method = request.method;
  
  if (segments[0] === 'dashboard' && method === 'GET') {
    // Get dashboard stats
    const totalBookings = await db.collection('bookings').countDocuments();
    const totalRevenue = await db.collection('payments').aggregate([
      { $match: { status: 'succeeded', type: { $ne: 'refund' } } },
      { $group: { _id: null, total: { $sum: '$amount_cents' } } }
    ]).toArray();
    
    const upcomingDepartures = await db.collection('departures').aggregate([
      { $match: { start_date: { $gte: new Date() } } },
      {
        $lookup: {
          from: 'trips',
          localField: 'trip_id',
          foreignField: 'id',
          as: 'trip'
        }
      },
      { $limit: 5 },
      { $sort: { start_date: 1 } }
    ]).toArray();
    
    return NextResponse.json({
      stats: {
        total_bookings: totalBookings,
        total_revenue: totalRevenue[0]?.total || 0,
        upcoming_departures: upcomingDepartures.length
      },
      upcoming_departures: upcomingDepartures
    });
  }
  
  if (segments[0] === 'trips') {
    if (method === 'GET') {
      const trips = await db.collection('trips').aggregate([
        {
          $lookup: {
            from: 'departures',
            localField: 'id',
            foreignField: 'trip_id',
            as: 'departures'
          }
        },
        { $sort: { created_at: -1 } }
      ]).toArray();
      
      return NextResponse.json({ trips });
    }
    
    if (method === 'POST') {
      const tripData = await request.json();
      
      const trip = {
        id: uuidv4(),
        slug: tripData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        ...tripData,
        created_at: new Date()
      };
      
      await db.collection('trips').insertOne(trip);
      return NextResponse.json({ trip });
    }
  }
  
  if (segments[0] === 'departures' && method === 'POST') {
    const departureData = await request.json();
    
    const departure = {
      id: uuidv4(),
      ...departureData,
      start_date: new Date(departureData.start_date),
      end_date: new Date(departureData.end_date),
      booking_deadline: departureData.booking_deadline ? new Date(departureData.booking_deadline) : null,
      spots_left: departureData.capacity
    };
    
    await db.collection('departures').insertOne(departure);
    return NextResponse.json({ departure });
  }
  
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

// PAYMENTS ENDPOINTS
async function handlePayments(request, segments) {
  const method = request.method;
  
  if (segments[0] === 'webhook' && method === 'POST') {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    
    try {
      const paymentProvider = getPaymentProvider();
      await paymentProvider.processWebhook(body, signature);
      
      return NextResponse.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
    }
  }
  
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

// MAIN ROUTER
export async function GET(request) {
  return handleRequest(request);
}

export async function POST(request) {
  return handleRequest(request);
}

export async function PUT(request) {
  return handleRequest(request);
}

export async function DELETE(request) {
  return handleRequest(request);
}

async function handleRequest(request) {
  try {
    const segments = getPathSegments(request);
    
    if (segments.length === 0) {
      return NextResponse.json({ message: 'TravelwithDENCHE API' });
    }
    
    const route = segments[0];
    const subSegments = segments.slice(1);
    
    switch (route) {
      case 'auth':
        return await handleAuth(request, subSegments);
      case 'trips':
        return await handleTrips(request, subSegments);
      case 'bookings':
        return await handleBookings(request, subSegments);
      case 'admin':
        return await handleAdmin(request, subSegments);
      case 'payments':
        return await handlePayments(request, subSegments);
      default:
        return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('API Error:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    if (error.message === 'Admin access required') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}