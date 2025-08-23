'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Mail, 
  MessageCircle, 
  Phone, 
  MapPin,
  Clock,
  Send,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In a real app, this would send to /api/contact
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitted(true);
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      content: 'aimen.denche18@gmail.com',
      description: 'Best for detailed inquiries'
    },
    {
      icon: MessageCircle,
      title: 'Response Time',
      content: '24-48 hours',
      description: 'Typical response during business days'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      content: 'Mon-Fri 9AM-6PM CET',
      description: 'Available for calls and consultations'
    },
    {
      icon: MapPin,
      title: 'Based in',
      content: 'France',
      description: 'Central European Time (CET)'
    }
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
            <p className="text-gray-600 mb-6">
              Thanks for reaching out! I'll get back to you within 24-48 hours.
            </p>
            <Button onClick={() => setSubmitted(false)}>Send Another Message</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Get In Touch</h1>
            <p className="text-xl text-gray-600">
              Have questions about a trip, need custom planning, or just want to chat about travel? 
              I'd love to hear from you!
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send Me a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and I'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        required
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Select onValueChange={(value) => handleChange('subject', value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="What can I help you with?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trip-inquiry">Trip Inquiry</SelectItem>
                        <SelectItem value="custom-planning">Custom Trip Planning</SelectItem>
                        <SelectItem value="existing-booking">Existing Booking</SelectItem>
                        <SelectItem value="group-booking">Group Booking (5+ people)</SelectItem>
                        <SelectItem value="media-collaboration">Media/Collaboration</SelectItem>
                        <SelectItem value="general">General Question</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      required
                      rows={6}
                      placeholder="Tell me more about what you're looking for..."
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      'Sending...'
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info & FAQ */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactInfo.map((info) => (
                  <div key={info.title} className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <info.icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{info.title}</h4>
                      <p className="text-sm font-medium text-gray-900">{info.content}</p>
                      <p className="text-xs text-gray-600">{info.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick FAQ */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Answers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">How far in advance should I book?</h4>
                  <p className="text-sm text-gray-600">
                    I recommend booking 2-3 months in advance for popular destinations, 
                    though some trips can be booked closer to departure.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-1">Do you organize private trips?</h4>
                  <p className="text-sm text-gray-600">
                    Yes! I offer custom private trips for groups of 6 or more. 
                    Contact me for pricing and availability.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-1">What's your cancellation policy?</h4>
                  <p className="text-sm text-gray-600">
                    Cancellation policies vary by trip. Most offer partial refunds 
                    if cancelled 30+ days in advance.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-1">Are solo travelers welcome?</h4>
                  <p className="text-sm text-gray-600">
                    Absolutely! About 60% of my travelers are solo adventurers. 
                    My trips are designed to be solo-friendly.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card>
              <CardHeader>
                <CardTitle>Follow the Journey</CardTitle>
                <CardDescription>
                  Get travel inspiration and behind-the-scenes content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" size="sm" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      Instagram
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      YouTube
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      TikTok
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}