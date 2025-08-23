#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for TravelwithDENCHE
Tests authentication, trips, bookings, admin dashboard, and payment mock system
"""

import requests
import json
import time
import os
from datetime import datetime, timedelta

# Get base URL from environment - use localhost for testing
BASE_URL = "http://localhost:3000"
API_BASE = f"{BASE_URL}/api"

class TravelwithDENCHEAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_cookies = None
        self.user_cookies = None
        self.test_results = {
            'auth': {'passed': 0, 'failed': 0, 'details': []},
            'trips': {'passed': 0, 'failed': 0, 'details': []},
            'bookings': {'passed': 0, 'failed': 0, 'details': []},
            'admin': {'passed': 0, 'failed': 0, 'details': []},
            'payments': {'passed': 0, 'failed': 0, 'details': []},
            'database': {'passed': 0, 'failed': 0, 'details': []}
        }
        
    def log_result(self, category, test_name, passed, details=""):
        """Log test result"""
        if passed:
            self.test_results[category]['passed'] += 1
            print(f"✅ {test_name}")
        else:
            self.test_results[category]['failed'] += 1
            print(f"❌ {test_name}: {details}")
        
        self.test_results[category]['details'].append({
            'test': test_name,
            'passed': passed,
            'details': details,
            'timestamp': datetime.now().isoformat()
        })

    def test_auth_system(self):
        """Test Core Authentication System"""
        print("\n🔐 Testing Core Authentication System...")
        
        # Test 1: Admin Login
        try:
            response = self.session.post(f"{API_BASE}/auth/login", 
                                       json={"type": "admin"},
                                       timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('user', {}).get('role') == 'admin':
                    self.admin_cookies = response.cookies
                    self.log_result('auth', 'Admin login', True)
                else:
                    self.log_result('auth', 'Admin login', False, f"Invalid response: {data}")
            else:
                self.log_result('auth', 'Admin login', False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result('auth', 'Admin login', False, f"Exception: {str(e)}")

        # Test 2: User Login
        try:
            response = self.session.post(f"{API_BASE}/auth/login", 
                                       json={"type": "user"},
                                       timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('user', {}).get('role') == 'user':
                    self.user_cookies = response.cookies
                    self.log_result('auth', 'User login', True)
                else:
                    self.log_result('auth', 'User login', False, f"Invalid response: {data}")
            else:
                self.log_result('auth', 'User login', False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result('auth', 'User login', False, f"Exception: {str(e)}")

        # Test 3: Auth/me endpoint with admin cookies
        try:
            response = self.session.get(f"{API_BASE}/auth/me", 
                                      cookies=self.admin_cookies,
                                      timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('user', {}).get('role') == 'admin':
                    self.log_result('auth', 'Auth/me admin', True)
                else:
                    self.log_result('auth', 'Auth/me admin', False, f"Invalid user data: {data}")
            else:
                self.log_result('auth', 'Auth/me admin', False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result('auth', 'Auth/me admin', False, f"Exception: {str(e)}")

        # Test 4: Auth/me endpoint with user cookies
        try:
            response = self.session.get(f"{API_BASE}/auth/me", 
                                      cookies=self.user_cookies,
                                      timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('user', {}).get('role') == 'user':
                    self.log_result('auth', 'Auth/me user', True)
                else:
                    self.log_result('auth', 'Auth/me user', False, f"Invalid user data: {data}")
            else:
                self.log_result('auth', 'Auth/me user', False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result('auth', 'Auth/me user', False, f"Exception: {str(e)}")

        # Test 5: Logout functionality
        try:
            response = self.session.post(f"{API_BASE}/auth/logout", 
                                       cookies=self.admin_cookies,
                                       timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_result('auth', 'Logout', True)
                else:
                    self.log_result('auth', 'Logout', False, f"Invalid response: {data}")
            else:
                self.log_result('auth', 'Logout', False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result('auth', 'Logout', False, f"Exception: {str(e)}")

    def test_trips_api(self):
        """Test Trips API"""
        print("\n🏔️ Testing Trips API...")
        
        # Test 1: GET /api/trips (should return seeded Alps trip)
        try:
            response = self.session.get(f"{API_BASE}/trips", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                trips = data.get('trips', [])
                if trips and any(trip.get('slug') == 'alps-hiking-escape' for trip in trips):
                    self.log_result('trips', 'GET /api/trips', True)
                else:
                    self.log_result('trips', 'GET /api/trips', False, f"Alps trip not found in: {[t.get('slug') for t in trips]}")
            else:
                self.log_result('trips', 'GET /api/trips', False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result('trips', 'GET /api/trips', False, f"Exception: {str(e)}")

        # Test 2: GET /api/trips/alps-hiking-escape (trip detail)
        try:
            response = self.session.get(f"{API_BASE}/trips/alps-hiking-escape", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                trip = data.get('trip', {})
                if trip.get('slug') == 'alps-hiking-escape' and trip.get('departures'):
                    self.log_result('trips', 'GET trip detail', True)
                else:
                    self.log_result('trips', 'GET trip detail', False, f"Invalid trip data: {trip.get('slug')}")
            else:
                self.log_result('trips', 'GET trip detail', False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result('trips', 'GET trip detail', False, f"Exception: {str(e)}")

        # Test 3: Admin trip creation (POST /api/admin/trips)
        try:
            trip_data = {
                "title": "Test Mountain Adventure",
                "subtitle": "A test trip for API validation",
                "description_md": "# Test Trip\nThis is a test trip created by the API test suite.",
                "difficulty": "easy",
                "group_size_min": 4,
                "group_size_max": 12,
                "featured": False,
                "active": True
            }
            
            response = self.session.post(f"{API_BASE}/admin/trips", 
                                       json=trip_data,
                                       cookies=self.admin_cookies,
                                       timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                trip = data.get('trip', {})
                if trip.get('title') == "Test Mountain Adventure":
                    self.log_result('trips', 'Admin trip creation', True)
                else:
                    self.log_result('trips', 'Admin trip creation', False, f"Invalid created trip: {trip}")
            else:
                self.log_result('trips', 'Admin trip creation', False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result('trips', 'Admin trip creation', False, f"Exception: {str(e)}")

        # Test 4: Invalid trip slug
        try:
            response = self.session.get(f"{API_BASE}/trips/non-existent-trip", timeout=10)
            
            if response.status_code == 404:
                self.log_result('trips', 'Invalid trip slug handling', True)
            else:
                self.log_result('trips', 'Invalid trip slug handling', False, f"Expected 404, got: {response.status_code}")
        except Exception as e:
            self.log_result('trips', 'Invalid trip slug handling', False, f"Exception: {str(e)}")

    def test_bookings_system(self):
        """Test Bookings System"""
        print("\n📅 Testing Bookings System...")
        
        # First, get available departures
        departure_id_free = None
        departure_id_paid = None
        
        try:
            response = self.session.get(f"{API_BASE}/trips/alps-hiking-escape", timeout=10)
            if response.status_code == 200:
                data = response.json()
                departures = data.get('trip', {}).get('departures', [])
                
                for departure in departures:
                    if departure.get('allow_free_rsvp'):
                        departure_id_free = departure.get('id')
                    else:
                        departure_id_paid = departure.get('id')
        except Exception as e:
            print(f"Error getting departures: {e}")

        # Test 1: Booking creation for free RSVP departure
        if departure_id_free:
            try:
                booking_data = {
                    "departure_id": departure_id_free,
                    "seats": 1
                }
                
                response = self.session.post(f"{API_BASE}/bookings", 
                                           json=booking_data,
                                           cookies=self.user_cookies,
                                           timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    booking = data.get('booking', {})
                    if booking.get('status') == 'reserved_unpaid' and not data.get('payment_required'):
                        self.log_result('bookings', 'Free RSVP booking', True)
                    else:
                        self.log_result('bookings', 'Free RSVP booking', False, f"Invalid booking: {booking}")
                else:
                    self.log_result('bookings', 'Free RSVP booking', False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result('bookings', 'Free RSVP booking', False, f"Exception: {str(e)}")
        else:
            self.log_result('bookings', 'Free RSVP booking', False, "No free RSVP departure found")

        # Test 2: Booking creation for paid departure
        if departure_id_paid:
            try:
                booking_data = {
                    "departure_id": departure_id_paid,
                    "seats": 1
                }
                
                response = self.session.post(f"{API_BASE}/bookings", 
                                           json=booking_data,
                                           cookies=self.user_cookies,
                                           timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    booking = data.get('booking', {})
                    if booking.get('status') == 'pending_deposit' and data.get('payment_required'):
                        self.log_result('bookings', 'Paid departure booking', True)
                    else:
                        self.log_result('bookings', 'Paid departure booking', False, f"Invalid booking: {booking}")
                else:
                    self.log_result('bookings', 'Paid departure booking', False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result('bookings', 'Paid departure booking', False, f"Exception: {str(e)}")
        else:
            self.log_result('bookings', 'Paid departure booking', False, "No paid departure found")

        # Test 3: GET /api/bookings to retrieve user bookings
        try:
            response = self.session.get(f"{API_BASE}/bookings", 
                                      cookies=self.user_cookies,
                                      timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                bookings = data.get('bookings', [])
                if isinstance(bookings, list):
                    self.log_result('bookings', 'GET user bookings', True)
                else:
                    self.log_result('bookings', 'GET user bookings', False, f"Invalid bookings data: {bookings}")
            else:
                self.log_result('bookings', 'GET user bookings', False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result('bookings', 'GET user bookings', False, f"Exception: {str(e)}")

        # Test 4: Unauthorized booking access
        try:
            response = self.session.get(f"{API_BASE}/bookings", timeout=10)
            
            if response.status_code == 401:
                self.log_result('bookings', 'Unauthorized access handling', True)
            else:
                self.log_result('bookings', 'Unauthorized access handling', False, f"Expected 401, got: {response.status_code}")
        except Exception as e:
            self.log_result('bookings', 'Unauthorized access handling', False, f"Exception: {str(e)}")

        # Test 5: Verify spots_left decrements (check departure again)
        if departure_id_free:
            try:
                response = self.session.get(f"{API_BASE}/trips/alps-hiking-escape", timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    departures = data.get('trip', {}).get('departures', [])
                    
                    for departure in departures:
                        if departure.get('id') == departure_id_free:
                            spots_left = departure.get('spots_left')
                            if spots_left < departure.get('capacity', 0):
                                self.log_result('bookings', 'Spots left decrement', True)
                            else:
                                self.log_result('bookings', 'Spots left decrement', False, f"Spots not decremented: {spots_left}")
                            break
                    else:
                        self.log_result('bookings', 'Spots left decrement', False, "Departure not found")
            except Exception as e:
                self.log_result('bookings', 'Spots left decrement', False, f"Exception: {str(e)}")

    def test_admin_dashboard(self):
        """Test Admin Dashboard"""
        print("\n👑 Testing Admin Dashboard...")
        
        # Test 1: GET /api/admin/dashboard for stats and upcoming departures
        try:
            response = self.session.get(f"{API_BASE}/admin/dashboard", 
                                      cookies=self.admin_cookies,
                                      timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                stats = data.get('stats', {})
                upcoming = data.get('upcoming_departures', [])
                
                if 'total_bookings' in stats and isinstance(upcoming, list):
                    self.log_result('admin', 'Admin dashboard stats', True)
                else:
                    self.log_result('admin', 'Admin dashboard stats', False, f"Invalid dashboard data: {data}")
            else:
                self.log_result('admin', 'Admin dashboard stats', False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result('admin', 'Admin dashboard stats', False, f"Exception: {str(e)}")

        # Test 2: GET /api/admin/trips to get all trips with departures
        try:
            response = self.session.get(f"{API_BASE}/admin/trips", 
                                      cookies=self.admin_cookies,
                                      timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                trips = data.get('trips', [])
                if isinstance(trips, list) and len(trips) > 0:
                    self.log_result('admin', 'Admin trips list', True)
                else:
                    self.log_result('admin', 'Admin trips list', False, f"Invalid trips data: {trips}")
            else:
                self.log_result('admin', 'Admin trips list', False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result('admin', 'Admin trips list', False, f"Exception: {str(e)}")

        # Test 3: Unauthorized admin access
        try:
            response = self.session.get(f"{API_BASE}/admin/dashboard", 
                                      cookies=self.user_cookies,
                                      timeout=10)
            
            if response.status_code == 403:
                self.log_result('admin', 'Unauthorized admin access', True)
            else:
                self.log_result('admin', 'Unauthorized admin access', False, f"Expected 403, got: {response.status_code}")
        except Exception as e:
            self.log_result('admin', 'Unauthorized admin access', False, f"Exception: {str(e)}")

    def test_payment_mock_system(self):
        """Test Payment Mock System"""
        print("\n💳 Testing Payment Mock System...")
        
        # Test 1: Mock payment webhook processing
        try:
            webhook_payload = {
                "type": "checkout.session.completed",
                "data": {
                    "object": {
                        "id": "cs_test_mock_session",
                        "payment_intent": "pi_test_mock_intent",
                        "amount_total": 15000,
                        "currency": "eur",
                        "metadata": {
                            "booking_id": "test-booking-id",
                            "type": "deposit"
                        }
                    }
                }
            }
            
            response = self.session.post(f"{API_BASE}/payments/webhook", 
                                       json=webhook_payload,
                                       headers={'stripe-signature': 'test-signature'},
                                       timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('received'):
                    self.log_result('payments', 'Mock webhook processing', True)
                else:
                    self.log_result('payments', 'Mock webhook processing', False, f"Invalid webhook response: {data}")
            else:
                self.log_result('payments', 'Mock webhook processing', False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result('payments', 'Mock webhook processing', False, f"Exception: {str(e)}")

        # Test 2: Invalid webhook signature handling
        try:
            response = self.session.post(f"{API_BASE}/payments/webhook", 
                                       json={"invalid": "payload"},
                                       timeout=10)
            
            if response.status_code == 400:
                self.log_result('payments', 'Invalid webhook handling', True)
            else:
                self.log_result('payments', 'Invalid webhook handling', False, f"Expected 400, got: {response.status_code}")
        except Exception as e:
            self.log_result('payments', 'Invalid webhook handling', False, f"Exception: {str(e)}")

    def test_database_validation(self):
        """Test Database Validation"""
        print("\n🗄️ Testing Database Validation...")
        
        # Test 1: Verify seeded data exists (trips)
        try:
            response = self.session.get(f"{API_BASE}/trips", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                trips = data.get('trips', [])
                alps_trip = next((t for t in trips if t.get('slug') == 'alps-hiking-escape'), None)
                
                if alps_trip and alps_trip.get('departures'):
                    self.log_result('database', 'Seeded trips data', True)
                else:
                    self.log_result('database', 'Seeded trips data', False, "Alps trip or departures not found")
            else:
                self.log_result('database', 'Seeded trips data', False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result('database', 'Seeded trips data', False, f"Exception: {str(e)}")

        # Test 2: Test RLS-style access control (users only see their bookings)
        try:
            # Get bookings as user
            user_response = self.session.get(f"{API_BASE}/bookings", 
                                           cookies=self.user_cookies,
                                           timeout=10)
            
            # Get bookings as admin
            admin_response = self.session.get(f"{API_BASE}/bookings", 
                                            cookies=self.admin_cookies,
                                            timeout=10)
            
            if user_response.status_code == 200 and admin_response.status_code == 200:
                user_bookings = user_response.json().get('bookings', [])
                admin_bookings = admin_response.json().get('bookings', [])
                
                # Admin should see all bookings, user should see only their own
                if len(admin_bookings) >= len(user_bookings):
                    self.log_result('database', 'RLS access control', True)
                else:
                    self.log_result('database', 'RLS access control', False, f"Admin bookings: {len(admin_bookings)}, User bookings: {len(user_bookings)}")
            else:
                self.log_result('database', 'RLS access control', False, f"User status: {user_response.status_code}, Admin status: {admin_response.status_code}")
        except Exception as e:
            self.log_result('database', 'RLS access control', False, f"Exception: {str(e)}")

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting TravelwithDENCHE Backend API Tests...")
        print(f"🌐 Testing against: {API_BASE}")
        
        # Run all test suites
        self.test_auth_system()
        self.test_trips_api()
        self.test_bookings_system()
        self.test_admin_dashboard()
        self.test_payment_mock_system()
        self.test_database_validation()
        
        # Print summary
        print("\n" + "="*60)
        print("📊 TEST RESULTS SUMMARY")
        print("="*60)
        
        total_passed = 0
        total_failed = 0
        
        for category, results in self.test_results.items():
            passed = results['passed']
            failed = results['failed']
            total_passed += passed
            total_failed += failed
            
            status = "✅" if failed == 0 else "❌"
            print(f"{status} {category.upper()}: {passed} passed, {failed} failed")
        
        print("-" * 60)
        print(f"🎯 OVERALL: {total_passed} passed, {total_failed} failed")
        
        if total_failed == 0:
            print("🎉 ALL TESTS PASSED!")
        else:
            print("⚠️  Some tests failed - check details above")
        
        return total_failed == 0

if __name__ == "__main__":
    tester = TravelwithDENCHEAPITester()
    success = tester.run_all_tests()
    exit(0 if success else 1)