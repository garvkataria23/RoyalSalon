import { Injectable } from '@angular/core';

const STAFF_KEY = 'offlineStaff';
const CLIENTS_KEY = 'offlineClients';
const APPOINTMENTS_KEY = 'offlineAppointments';
const SERVICES_KEY = 'offlineServices';
const DISCOUNTS_KEY = 'offlineDiscounts';

@Injectable({
  providedIn: 'root'
})
export class DemoDataService {

  seedIfEmpty() {
    if (!localStorage.getItem(STAFF_KEY)) {
      this.seedStaff();
    }
    if (!localStorage.getItem(CLIENTS_KEY)) {
      this.seedClients();
    }
    if (!localStorage.getItem(APPOINTMENTS_KEY)) {
      this.seedAppointments();
    }
    if (!localStorage.getItem(SERVICES_KEY)) {
      this.seedServices();
    }
    if (!localStorage.getItem(DISCOUNTS_KEY) || JSON.parse(localStorage.getItem(DISCOUNTS_KEY) || '[]').length === 0) {
      this.seedDiscounts();
    }
  }

  private seedStaff() {
    const staff = [
      { _id: 'staff_1', name: 'Sarah Connor', specialization: 'Hair Stylist' },
      { _id: 'staff_2', name: 'Mike Johnson', specialization: 'Barber' },
      { _id: 'staff_3', name: 'Lisa Wang', specialization: 'Nail Artist' },
      { _id: 'staff_4', name: 'David Kim', specialization: 'Color Specialist' },
      { _id: 'staff_5', name: 'Emma Wilson', specialization: 'Makeup Artist' },
      { _id: 'staff_6', name: 'James Brown', specialization: 'Massage Therapist' },
      { _id: 'staff_7', name: 'Priya Sharma', specialization: 'Esthetician' },
      { _id: 'staff_8', name: 'Carlos Garcia', specialization: 'Barber' },
      { _id: 'staff_9', name: 'Anna Taylor', specialization: 'Hair Stylist' },
      { _id: 'staff_10', name: 'Tom Chen', specialization: 'Nail Artist' }
    ];
    localStorage.setItem(STAFF_KEY, JSON.stringify(staff));
  }

  private seedClients() {
    const clients = [
      { _id: 'client_1', name: 'John Doe', phone: '+15550101', visits: 12 },
      { _id: 'client_2', name: 'Jane Smith', phone: '+15550102', visits: 8 },
      { _id: 'client_3', name: 'Robert Johnson', phone: '+15550103', visits: 5 },
      { _id: 'client_4', name: 'Maria Garcia', phone: '+15550104', visits: 3 },
      { _id: 'client_5', name: 'William Brown', phone: '+15550105', visits: 15 },
      { _id: 'client_6', name: 'Linda Davis', phone: '+15550106', visits: 1 },
      { _id: 'client_7', name: 'Michael Wilson', phone: '+15550107', visits: 7 },
      { _id: 'client_8', name: 'Patricia Martinez', phone: '+15550108', visits: 2 },
      { _id: 'client_9', name: 'Richard Anderson', phone: '+15550109', visits: 20 },
      { _id: 'client_10', name: 'Jennifer Taylor', phone: '+15550110', visits: 4 }
    ];
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
  }

  private seedAppointments() {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const dayAfter = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];

    const appointments = [
      { _id: 'appt_1', clientName: 'John Doe', clientPhone: '+15550101', staffId: 'staff_1', staffName: 'Sarah Connor', date: today, timeSlot: '09:00 AM', service: 'Haircut', price: 1500, discount: 0, notes: '', status: 'Booked' },
      { _id: 'appt_2', clientName: 'Jane Smith', clientPhone: '+15550102', staffId: 'staff_2', staffName: 'Mike Johnson', date: today, timeSlot: '10:00 AM', service: 'Beard Trim', price: 800, discount: 0, notes: '', status: 'Booked' },
      { _id: 'appt_3', clientName: 'Maria Garcia', clientPhone: '+15550104', staffId: 'staff_3', staffName: 'Lisa Wang', date: today, timeSlot: '11:00 AM', service: 'Nail Art', price: 2000, discount: 200, notes: 'French tips', status: 'Booked' },
      { _id: 'appt_4', clientName: 'William Brown', clientPhone: '+15550105', staffId: 'staff_4', staffName: 'David Kim', date: yesterday, timeSlot: '02:00 PM', service: 'Hair Color', price: 3500, discount: 0, notes: 'Full color', status: 'Completed' },
      { _id: 'appt_5', clientName: 'Linda Davis', clientPhone: '+15550106', staffId: 'staff_5', staffName: 'Emma Wilson', date: yesterday, timeSlot: '03:00 PM', service: 'Bridal Makeup', price: 5000, discount: 500, notes: 'Bridal trial', status: 'Completed' },
      { _id: 'appt_6', clientName: 'Richard Anderson', clientPhone: '+15550109', staffId: 'staff_6', staffName: 'James Brown', date: yesterday, timeSlot: '04:00 PM', service: 'Swedish Massage', price: 2500, discount: 0, notes: '60 min', status: 'Cancelled' },
      { _id: 'appt_7', clientName: 'Jennifer Taylor', clientPhone: '+15550110', staffId: 'staff_7', staffName: 'Priya Sharma', date: tomorrow, timeSlot: '09:00 AM', service: 'Facial', price: 1800, discount: 0, notes: '', status: 'Booked' },
      { _id: 'appt_8', clientName: 'Robert Johnson', clientPhone: '+15550103', staffId: 'staff_8', staffName: 'Carlos Garcia', date: tomorrow, timeSlot: '10:00 AM', service: 'Haircut', price: 1500, discount: 100, notes: 'Classic cut', status: 'Booked' },
      { _id: 'appt_9', clientName: 'Michael Wilson', clientPhone: '+15550107', staffId: 'staff_9', staffName: 'Anna Taylor', date: dayAfter, timeSlot: '11:00 AM', service: 'Hair Styling', price: 2200, discount: 0, notes: '', status: 'Booked' },
      { _id: 'appt_10', clientName: 'Patricia Martinez', clientPhone: '+15550108', staffId: 'staff_10', staffName: 'Tom Chen', date: dayAfter, timeSlot: '02:00 PM', service: 'Manicure', price: 1200, discount: 0, notes: 'Gel polish', status: 'Booked' }
    ];
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
  }

  private seedServices() {
    const services = [
      { _id: 'svc_1', name: 'Classic Haircut', price: 1500, duration: '45 mins', category: 'Hair' },
      { _id: 'svc_2', name: 'Beard Trim & Shape', price: 800, duration: '30 mins', category: 'Hair' },
      { _id: 'svc_3', name: 'Hair Color (Full)', price: 3500, duration: '120 mins', category: 'Hair' },
      { _id: 'svc_4', name: 'Bridal Makeup', price: 5000, duration: '90 mins', category: 'Skin' },
      { _id: 'svc_5', name: 'Classic Facial', price: 1800, duration: '60 mins', category: 'Skin' },
      { _id: 'svc_6', name: 'Swedish Massage', price: 2500, duration: '60 mins', category: 'Massage' },
      { _id: 'svc_7', name: 'Nail Art (Set)', price: 2000, duration: '60 mins', category: 'Nails' },
      { _id: 'svc_8', name: 'Manicure & Pedicure', price: 1200, duration: '45 mins', category: 'Nails' },
      { _id: 'svc_9', name: 'Hair Styling (Blow Dry)', price: 2200, duration: '45 mins', category: 'Hair' },
      { _id: 'svc_10', name: 'Deep Tissue Massage', price: 3000, duration: '75 mins', category: 'Massage' }
    ];
    localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
  }

  private seedDiscounts() {
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 3);
    const expiryStr = expiry.toISOString().split('T')[0];
    const past = new Date();
    past.setMonth(past.getMonth() - 1);
    const pastStr = past.toISOString().split('T')[0];

    const discounts = [
      { _id: 'disc_1', name: 'Summer Splash', code: 'SUMMER20', type: 'percentage', value: 20, applicableTo: 'all', expiryDate: expiryStr, minPurchase: 0, description: '20% off on all services this summer', active: true },
      { _id: 'disc_2', name: 'New Client Welcome', code: 'WELCOME10', type: 'percentage', value: 10, applicableTo: 'all', expiryDate: expiryStr, minPurchase: 0, description: '10% off for first-time clients', active: true },
      { _id: 'disc_3', name: 'Hair Color Special', code: 'COLOR500', type: 'flat', value: 500, applicableTo: 'service', serviceName: 'Hair Color (Full)', expiryDate: expiryStr, minPurchase: 2000, description: '₹500 off on full hair color service', active: true },
      { _id: 'disc_4', name: 'Loyalty Reward', code: 'LOYAL15', type: 'percentage', value: 15, applicableTo: 'all', expiryDate: expiryStr, minPurchase: 1000, description: '15% off for purchases above ₹1,000', active: true },
      { _id: 'disc_5', name: 'Midweek Pamper', code: 'MIDWEEK25', type: 'percentage', value: 25, applicableTo: 'all', expiryDate: pastStr, minPurchase: 0, description: '25% off on Tuesday & Wednesday bookings', active: false },
      { _id: 'disc_6', name: 'Bridal Package', code: 'BRIDAL10', type: 'percentage', value: 10, applicableTo: 'service', serviceName: 'Bridal Makeup', expiryDate: expiryStr, minPurchase: 3000, description: '10% off on bridal makeup packages', active: true },
      { _id: 'disc_7', name: 'Massage Therapy', code: 'MASSAGE300', type: 'flat', value: 300, applicableTo: 'service', serviceName: 'Swedish Massage', expiryDate: expiryStr, minPurchase: 1500, description: '₹300 off on Swedish Massage', active: true },
      { _id: 'disc_8', name: 'Refer a Friend', code: 'REFER50', type: 'flat', value: 50, applicableTo: 'all', expiryDate: pastStr, minPurchase: 0, description: '₹50 off when you refer a friend', active: false },
      { _id: 'disc_9', name: 'Festival Glow', code: 'FESTIVE30', type: 'percentage', value: 30, applicableTo: 'all', expiryDate: pastStr, minPurchase: 2000, description: '30% off on festival season bookings', active: false },
      { _id: 'disc_10', name: 'Nail Art Combo', code: 'NAILS200', type: 'flat', value: 200, applicableTo: 'all', expiryDate: expiryStr, minPurchase: 800, description: '₹200 off on any nail service', active: true }
    ];
    localStorage.setItem(DISCOUNTS_KEY, JSON.stringify(discounts));
  }
}
