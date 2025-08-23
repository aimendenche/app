'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Instagram, 
  Youtube, 
  Linkedin, 
  Twitter,
  MapPin,
  Calendar,
  Users,
  Award,
  Heart,
  Camera
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const socialLinks = [
    { icon: Instagram, label: 'Instagram', href: '#', handle: '@aimendenche' },
    { icon: Youtube, label: 'YouTube', href: '#', handle: 'Aimen Denche' },
    { icon: Linkedin, label: 'LinkedIn', href: '#', handle: 'Aimen Denche' },
    { icon: Twitter, label: 'Twitter', href: '#', handle: '@aimendenche' }
  ];

  const achievements = [
    { icon: MapPin, title: '50+ Destinations', description: 'Explored across 6 continents' },
    { icon: Users, title: '500+ Travelers', description: 'Happy adventurers joined' },
    { icon: Calendar, title: '3+ Years', description: 'Organizing group travel' },
    { icon: Award, title: '4.9/5 Rating', description: 'Average trip satisfaction' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-32 h-32 bg-white/20 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Camera className="h-16 w-16" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Hi, I'm Aimen Denche
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8">
              Travel organizer, content creator, and your guide to extraordinary adventures
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {socialLinks.map((social) => (
                <Button key={social.label} variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                  <a href={social.href} target="_blank" rel="noopener noreferrer">
                    <social.icon className="h-4 w-4 mr-2" />
                    {social.handle}
                  </a>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* My Story */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl text-center mb-4">Who I Am</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-lg leading-relaxed">
              <p>
                Hey there! I'm Aimen, and I believe that the world is meant to be explored with others. 
                What started as a personal passion for discovering hidden gems around the globe has 
                evolved into something much bigger – a community of like-minded adventurers who aren't 
                afraid to step outside their comfort zones.
              </p>
              
              <p>
                Through TravelwithDENCHE, I bring together small groups of travelers who want more than 
                just a typical vacation. We seek authentic experiences, meaningful connections, and those 
                "pinch me, is this real?" moments that make travel truly transformative.
              </p>
              
              <p>
                Every trip I organize is carefully crafted based on my own explorations and relationships 
                with locals around the world. From hidden hiking trails in the Alps to secret food spots 
                in bustling markets, I share the places and experiences that have moved me most.
              </p>
              
              <p>
                When I'm not leading trips, you'll find me creating content, scouting new destinations, 
                or planning the next adventure that will leave our group with stories to tell for years to come.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {achievements.map((achievement) => (
            <Card key={achievement.title} className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <achievement.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{achievement.title}</h3>
                <p className="text-gray-600">{achievement.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* What Makes My Trips Special */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl text-center mb-4">What Makes My Trips Special</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Heart className="h-6 w-6 text-red-500" />
                    <h4 className="text-xl font-semibold">Small Groups, Big Bonds</h4>
                  </div>
                  <p className="text-gray-600 mb-6">
                    With groups of 8-16 people max, everyone gets personal attention and we 
                    form genuine friendships that last long after the trip ends.
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <MapPin className="h-6 w-6 text-green-500" />
                    <h4 className="text-xl font-semibold">Local Insider Access</h4>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Through years of travel and local relationships, I provide access to 
                    experiences you simply can't find in guidebooks.
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="h-6 w-6 text-blue-500" />
                    <h4 className="text-xl font-semibold">Solo-Friendly</h4>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Over 60% of my travelers are solo adventurers. My trips are designed 
                    to help you feel comfortable and included from day one.
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Award className="h-6 w-6 text-purple-500" />
                    <h4 className="text-xl font-semibold">Stress-Free Planning</h4>
                  </div>
                  <p className="text-gray-600 mb-6">
                    I handle all the logistics, research, and planning so you can focus 
                    on what matters most – enjoying the experience.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Travel Philosophy */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">My Travel Philosophy</h3>
              <blockquote className="text-lg italic text-gray-700 mb-6">
                "Travel isn't just about seeing new places – it's about discovering new parts of yourself 
                and building connections that transcend borders, languages, and cultures."
              </blockquote>
              <p className="text-gray-600">
                Every trip is an opportunity to challenge assumptions, embrace discomfort, 
                and return home with a broader perspective on the world and our place in it.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Certifications & Partnerships */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl text-center mb-4">Certifications & Partnerships</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <Badge className="mb-2">Certified</Badge>
                  <h4 className="font-semibold">Wilderness First Aid</h4>
                  <p className="text-sm text-gray-600">Safety certified for outdoor adventures</p>
                </div>
                <div>
                  <Badge className="mb-2">Partner</Badge>
                  <h4 className="font-semibold">Local Guide Network</h4>
                  <p className="text-sm text-gray-600">Vetted partners in 25+ countries</p>
                </div>
                <div>
                  <Badge className="mb-2">Member</Badge>
                  <h4 className="font-semibold">Sustainable Tourism</h4>
                  <p className="text-sm text-gray-600">Committed to responsible travel</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8">
              <h3 className="text-3xl font-bold mb-4">Ready for Your Next Adventure?</h3>
              <p className="text-xl mb-6 text-gray-200">
                Join our community of adventurous souls and discover what awaits beyond your comfort zone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
                  <Link href="/trips">Browse Adventures</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                  <Link href="/contact">Get In Touch</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}