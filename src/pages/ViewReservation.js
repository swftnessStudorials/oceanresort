import React, { useState } from 'react';
import { getReservationByNumber } from '../firebase/reservationService';
import './ViewReservation.css';

export default function ViewReservation() {
  const [reservationNumber, setReservationNumber] = useState('');
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    const num = reservationNumber.trim();
    if (!num) {
      setError('Please enter a reservation number.');
      setReservation(null);
      return;
    }
    setLoading(true);
    setError('');
    setReservation(null);
    try {
      const data = await getReservationByNumber(num);
      if (data) {
        setReservation(data);
      } else {
        setError('No reservation found with that number.');
      }
    } catch (e) {
      setError('Failed to retrieve reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view-reservation page page-enter">
      <h1 className="page-title">Display Reservation Details</h1>
      <p className="page-intro">Enter the reservation number to view full booking information.</p>

      <form onSubmit={handleSearch} className="search-form">
        <label htmlFor="reservationNumber" className="sr-only">Reservation Number</label>
        <input
          id="reservationNumber"
          type="text"
          value={reservationNumber}
          onChange={(e) => {
            setReservationNumber(e.target.value);
            setError('');
          }}
          placeholder="e.g. OVR-2503-1234"
          className="search-input"
          disabled={loading}
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <p className="error-msg" role="alert">{error}</p>}

      {reservation && (
        <div className="reservation-detail card card-enter">
          <h2>Reservation Details</h2>
          <dl className="detail-list">
            <div>
              <dt>Reservation Number</dt>
              <dd><strong>{reservation.reservationNumber}</strong></dd>
            </div>
            <div>
              <dt>Guest Name</dt>
              <dd>{reservation.guestName}</dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>{reservation.address}</dd>
            </div>
            <div>
              <dt>Contact Number</dt>
              <dd>{reservation.contactNumber}</dd>
            </div>
            <div>
              <dt>Room Type</dt>
              <dd>{reservation.roomType}</dd>
            </div>
            <div>
              <dt>Check-in Date</dt>
              <dd>{reservation.checkIn}</dd>
            </div>
            <div>
              <dt>Check-out Date</dt>
              <dd>{reservation.checkOut}</dd>
            </div>
            {reservation.status && (
              <div>
                <dt>Status</dt>
                <dd>{reservation.status}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
