import React from 'react';
import { Link } from 'react-router-dom';
import './Help.css';

export default function Help() {
  return (
    <div className="help-page page page-enter">
      <h1 className="page-title">Help Section</h1>
      <p className="page-intro">Guidelines for using the Ocean View Resort reservation system.</p>

      <div className="help-content card card-enter">
        <section>
          <h2>1. User Authentication (Login)</h2>
          <p>Only registered staff can access the system. Use your assigned email (username) and password to sign in. If you do not have credentials, contact your manager. Never share your password.</p>
        </section>

        <section>
          <h2>2. Add New Reservation</h2>
          <p>From the menu, go to <strong>Add Reservation</strong>. The system generates a unique reservation number (e.g. OVR-2503-1234). You can generate a new number if needed. Fill in:</p>
          <ul>
            <li><strong>Guest name</strong> — Full name of the guest</li>
            <li><strong>Address</strong> — Full address</li>
            <li><strong>Contact number</strong> — Phone number for the guest</li>
            <li><strong>Room type</strong> — Standard, Deluxe, Suite, or Family</li>
            <li><strong>Check-in and check-out dates</strong> — Check-out must be after check-in</li>
          </ul>
          <p>Click <strong>Save Reservation</strong> to confirm. The guest will be registered and the booking stored.</p>
          <p><Link to="/add-reservation">Go to Add Reservation →</Link></p>
        </section>

        <section>
          <h2>3. Dashboard and Reservations List</h2>
          <p>From the <strong>Dashboard</strong> you can see summary stats (total, confirmed, upcoming, cancelled), quick links to all features, and a list of reservations. Use the <strong>search box</strong> to find by reservation number, guest name, or phone. Use the <strong>status filter</strong> to show All, Confirmed, or Cancelled. Click <strong>Edit</strong> on a row to change or cancel that reservation.</p>
          <p><Link to="/">Go to Dashboard →</Link></p>
        </section>

        <section>
          <h2>4. Edit or Cancel a Reservation</h2>
          <p>From the Dashboard, click <strong>Edit</strong> next to a reservation. You can update guest details, room type, and dates, then click <strong>Save Changes</strong>. To cancel the booking, click <strong>Cancel Reservation</strong> and confirm; the status will be set to Cancelled and it will no longer be active.</p>
        </section>

        <section>
          <h2>5. Display Reservation Details</h2>
          <p>Go to <strong>View Reservation</strong>. Enter the reservation number (e.g. from a guest’s confirmation) and click <strong>Search</strong>. The full booking details will be shown: guest name, address, contact, room type, and dates.</p>
          <p><Link to="/view-reservation">Go to View Reservation →</Link></p>
        </section>

        <section>
          <h2>6. Calculate and Print Bill</h2>
          <p>Go to <strong>Calculate Bill</strong>. Enter the reservation number and click <strong>Get Bill</strong>. The system computes the total based on the number of nights and the room rate (plus 10% tax). Use <strong>Print Bill</strong> to open a print-friendly bill for the guest.</p>
          <p><Link to="/bill">Go to Calculate Bill →</Link></p>
        </section>

        <section>
          <h2>7. Room Rates (LKR per night)</h2>
          <ul>
            <li>Standard: LKR 8,500</li>
            <li>Deluxe: LKR 12,000</li>
            <li>Suite: LKR 18,000</li>
            <li>Family: LKR 15,000</li>
          </ul>
        </section>

        <section>
          <h2>8. Exit System</h2>
          <p>Click <strong>Exit System</strong> in the menu (or top navigation on mobile) to sign out safely. Always exit when leaving your workstation.</p>
        </section>

        <section>
          <h2>9. Need more help?</h2>
          <p>Contact your supervisor or the front office manager. For technical issues, report to the system administrator.</p>
        </section>
      </div>
    </div>
  );
}
