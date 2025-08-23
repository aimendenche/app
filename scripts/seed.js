// Seed script for TravelwithDENCHE
import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

const uri = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'travelwithdenche';

async function seedDatabase() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    
    console.log('🌱 Seeding TravelwithDENCHE database...');
    
    // Clear existing data
    const collections = ['site_settings', 'refund_policies', 'trips', 'departures', 'testimonials', 'users'];
    for (const collection of collections) {
      await db.collection(collection).deleteMany({});
      console.log(`  Cleared ${collection}`);
    }
    
    // 1. Site Settings
    await db.collection('site_settings').insertOne({
      id: 'global',
      brand_name: 'TravelwithDENCHE',
      admin_email: 'aimen.denche18@gmail.com',
      currency: 'EUR',
      locales: ['en', 'fr', 'ar'],
      smtp_enabled: false,
      maintenance_mode: false,
      created_at: new Date()
    });
    console.log('  ✅ Created site settings');
    
    // 2. Refund Policy
    const refundPolicyId = uuidv4();
    await db.collection('refund_policies').insertOne({
      id: refundPolicyId,
      name: 'Standard',
      rules: [
        { days_before: 30, refund_pct: 80 },
        { days_before: 7, refund_pct: 50 },
        { days_before: 0, refund_pct: 0 }
      ]
    });
    console.log('  ✅ Created refund policy');
    
    // 3. Sample Trip
    const tripId = uuidv4();
    await db.collection('trips').insertOne({
      id: tripId,
      slug: 'alps-hiking-escape',
      title: 'Alps Hiking Escape',
      subtitle: 'Weekend adventure in the spectacular French Alps',
      hero_image_url: 'https://images.unsplash.com/photo-1464822759844-d150ad6c0330?w=800&h=600&fit=crop',
      description_md: `# Experience the Alps Like Never Before

Join us for an unforgettable weekend adventure in the heart of the French Alps. This carefully crafted hiking experience combines breathtaking mountain scenery, authentic alpine culture, and the thrill of conquering some of Europe's most stunning peaks.

## What Makes This Trip Special

- **Small group experience**: Maximum 16 people for personalized attention
- **Expert local guides**: Native mountain guides with decades of experience  
- **Authentic accommodation**: Stay in traditional mountain huts with incredible views
- **All fitness levels welcome**: Routes adapted to group capabilities
- **Photography opportunities**: Capture Instagram-worthy moments at every turn

Whether you're a seasoned hiker or taking your first steps into mountain adventure, this trip is designed to challenge and inspire you while keeping safety as our top priority.`,
      
      itinerary_md: `# Day-by-Day Itinerary

## Day 1: Arrival & Chamonix Valley
- **Morning**: Meet at Chamonix town center (10:00 AM)
- **Afternoon**: Gentle acclimatization hike to Lac Blanc
- **Evening**: Welcome dinner at traditional Savoyard restaurant
- **Accommodation**: Mountain hut with valley views

## Day 2: Mont Blanc Massif Adventure
- **Early Morning**: Cable car to Aiguille du Midi (weather permitting)
- **Midday**: High-altitude hiking with glacier views
- **Afternoon**: Descent through alpine meadows
- **Evening**: Group reflection and planning for tomorrow

## Day 3: Hidden Gems & Farewell
- **Morning**: Secret local trail known only to guides
- **Afternoon**: Final summit push and celebration
- **Evening**: Farewell dinner and departure preparation`,

      highlights: [
        'Panoramic Mont Blanc views',
        'Glacier lake discoveries', 
        'Traditional Alpine cuisine',
        'Professional photography',
        'Small group intimacy',
        'Local insider access'
      ],
      difficulty: 'moderate',
      included: [
        'Professional mountain guide',
        'Mountain hut accommodation',
        'All breakfasts included',
        'Safety equipment provided',
        'Cable car tickets',
        'Group photos & memories'
      ],
      not_included: [
        'International flights',
        'Lunch and dinner (except mentioned)',
        'Personal hiking equipment',
        'Travel insurance',
        'Alcoholic beverages',
        'Personal expenses'
      ],
      group_size_min: 8,
      group_size_max: 16,
      languages: ['en', 'fr'],
      accommodation: 'Traditional mountain huts with shared facilities',
      meeting_point: 'Chamonix Train Station, Place de la Gare',
      meeting_map_url: 'https://www.google.com/maps/place/Chamonix-Mont-Blanc,+France',
      visa_notes_md: `# Visa Requirements

- **EU Citizens**: No visa required, valid ID/passport needed
- **US/Canada/Australia**: No visa for stays under 90 days
- **Other nationalities**: Check with French consulate
- **Travel insurance**: Highly recommended for mountain activities`,

      packing_list_md: `# Essential Packing List

## Hiking Gear
- Sturdy hiking boots (broken in)
- Moisture-wicking hiking socks
- Comfortable hiking pants
- Layers for changing weather
- Waterproof jacket and pants
- Warm hat and sun hat
- Sunglasses and sunscreen (SPF 30+)

## Personal Items
- Personal water bottle (1L minimum)
- Small daypack for daily hikes
- Camera for memories
- Personal medications
- Quick-dry towel
- Headlamp with extra batteries

*Full detailed packing list sent upon booking confirmation*`,

      faq: [
        {
          question: "What fitness level is required?",
          answer: "Moderate fitness level required. You should be comfortable walking 4-6 hours with breaks. We adapt routes to group capabilities."
        },
        {
          question: "What if weather is bad?",
          answer: "We have alternative indoor activities and lower-altitude hikes. Safety is our priority, and we'll adjust plans as needed."
        },
        {
          question: "Are solo travelers welcome?",
          answer: "Absolutely! About 40% of our travelers are solo adventurers. Our small groups create instant friendships."
        },
        {
          question: "What about dietary restrictions?",
          answer: "We accommodate most dietary needs including vegetarian, vegan, and gluten-free. Please inform us during booking."
        },
        {
          question: "Can I extend my stay?",
          answer: "Yes! We can help arrange additional nights in Chamonix or connections to other destinations."
        }
      ],
      featured: true,
      active: true,
      created_at: new Date()
    });
    console.log('  ✅ Created sample trip: Alps Hiking Escape');
    
    // 4. Sample Departures
    const departure1Id = uuidv4();
    const departure2Id = uuidv4();
    
    // Departure 1 - Free RSVP enabled (30 days from now)
    await db.collection('departures').insertOne({
      id: departure1Id,
      trip_id: tripId,
      start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      end_date: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000), // 33 days from now
      capacity: 12,
      spots_left: 12,
      base_price_cents: 49900, // €499
      currency: 'EUR',
      deposit_cents: 15000, // €150
      allow_free_rsvp: true,
      booking_deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
      refund_policy_id: refundPolicyId,
      balance_due_days_before_start: 14
    });
    
    // Departure 2 - Deposit required (60 days from now)
    await db.collection('departures').insertOne({
      id: departure2Id,
      trip_id: tripId,
      start_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      end_date: new Date(Date.now() + 63 * 24 * 60 * 60 * 1000), // 63 days from now
      capacity: 16,
      spots_left: 16,
      base_price_cents: 49900, // €499
      currency: 'EUR',
      deposit_cents: 15000, // €150
      allow_free_rsvp: false,
      booking_deadline: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000), // 55 days from now
      refund_policy_id: refundPolicyId,
      balance_due_days_before_start: 14
    });
    console.log('  ✅ Created 2 sample departures');
    
    // 5. Sample Testimonials
    await db.collection('testimonials').insertMany([
      {
        id: uuidv4(),
        author_name: 'Sarah Mitchell',
        author_handle: '@sarahexplores',
        text_md: 'Absolutely incredible experience! Aimen created the perfect balance of adventure and comfort. The views were breathtaking and the group dynamic was fantastic. Already planning my next trip with TravelwithDENCHE!',
        rating: 5,
        show: true
      },
      {
        id: uuidv4(),
        author_name: 'Marcus Chen',
        author_handle: '@marcuswanders',
        text_md: 'Best organized trip I\'ve ever been on. Attention to detail was exceptional, from the mountain huts to the local cuisine recommendations. Aimen really knows how to create magical moments!',
        rating: 5,
        show: true
      },
      {
        id: uuidv4(),
        author_name: 'Emma Thompson',
        author_handle: '@emmaadventures',
        text_md: 'Solo female traveler here - felt completely safe and welcomed throughout the entire journey. The small group size made it feel like traveling with friends. 10/10 would recommend!',
        rating: 5,
        show: true
      }
    ]);
    console.log('  ✅ Created sample testimonials');
    
    // 6. Create admin user
    await db.collection('users').insertOne({
      id: uuidv4(),
      auth_uid: 'admin-seed',
      email: 'aimen.denche18@gmail.com',
      role: 'admin',
      name: 'Aimen Denche',
      avatar_url: null,
      phone: null,
      nationality: null,
      created_at: new Date()
    });
    console.log('  ✅ Created admin user');
    
    console.log('🎉 Database seeded successfully!');
    console.log('\n📝 Summary:');
    console.log('  - Site configured for TravelwithDENCHE');
    console.log('  - Sample trip "Alps Hiking Escape" created');
    console.log('  - 2 departures: 1 with free RSVP, 1 with deposit');
    console.log('  - 3 testimonials added');
    console.log('  - Admin user created for aimen.denche18@gmail.com');
    console.log('  - Standard refund policy created');
    console.log('\n🚀 Ready to launch! Visit /auth to sign in as admin.');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedDatabase();