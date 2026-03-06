import React, { useState } from 'react';
import { addReservation, generateReservationNumber, getRoomRates } from '../firebase/reservationService';
import { useToast } from '../context/ToastContext';
import './AddReservation.css';

const ROOM_TYPES = ['standard', 'deluxe', 'suite', 'family'];

const initialForm = {
  reservationNumber: '',
  guestName: '',
  address: '',
  contactNumber: '',
  roomType: 'standard',
  checkIn: '',
  checkOut: '',
};

export default function AddReservation() {
  const [form, setForm] = useState(() => ({
    ...initialForm,
    reservationNumber: generateReservationNumber(),
  }));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { showToast } = useToast();
  const rates = getRoomRates();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setMessage({ type: '', text: '' });
  };

  const generateNewNumber = () => {
    setForm((prev) => ({ ...prev, reservationNumber: generateReservationNumber() }));
  };

  const validate = () => {
    if (!form.guestName.trim()) return 'Please enter guest name.';
    if (!form.address.trim()) return 'Please enter address.';
    if (!form.contactNumber.trim()) return 'Please enter contact number.';
    if (!form.checkIn) return 'Please select check-in date.';
    if (!form.checkOut) return 'Please select check-out date.';
    const checkIn = new Date(form.checkIn);
    const checkOut = new Date(form.checkOut);
    if (checkOut <= checkIn) return 'Check-out date must be after check-in date.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setMessage({ type: 'error', text: err });
      return;
    }
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await addReservation({
        reservationNumber: form.reservationNumber.trim(),
        guestName: form.guestName.trim(),
        address: form.address.trim(),
        contactNumber: form.contactNumber.trim(),
        roomType: form.roomType,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
      });
      showToast(`Reservation ${form.reservationNumber} created successfully.`, 'success');
      setForm({
        ...initialForm,
        reservationNumber: generateReservationNumber(),
      });
    } catch (e) {
      const isPermissionError = e?.code === 'permission-denied' || e?.message?.toLowerCase().includes('permission');
      setMessage({
        type: 'error',
        text: isPermissionError
          ? 'Permission denied. Publish Firestore rules (see README) and ensure you are signed in. If the problem continues, click Exit System and sign in again.'
          : (e.message || 'Failed to save reservation. Please try again.'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-reservation page page-enter">
      <h1 className="page-title">Add New Reservation</h1>
      <p className="page-intro">Register a new guest and create a booking. All fields are required.</p>

      <form onSubmit={handleSubmit} className="reservation-form card-enter">
        <div className="form-row reservation-number-row">
          <label htmlFor="reservationNumber">Reservation Number</label>
          <div className="input-with-action">
            <input
              id="reservationNumber"
              name="reservationNumber"
              type="text"
              value={form.reservationNumber}
              onChange={handleChange}
              readOnly
              className="readonly"
            />
            <button type="button" onClick={generateNewNumber} className="btn-secondary">
              Generate New
            </button>
          </div>
        </div>

        <div className="form-row">
          <label htmlFor="guestName">Guest Name *</label>
          <input
            id="guestName"
            name="guestName"
            type="text"
            value={form.guestName}
            onChange={handleChange}
            placeholder="Full name"
            required
            disabled={loading}
          />
        </div>

        <div className="form-row">
          <label htmlFor="address">Address *</label>
          <textarea
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Street, city, country"
            rows={2}
            required
            disabled={loading}
          />
        </div>

        <div className="form-row">
          <label htmlFor="contactNumber">Contact Number *</label>
          <input
            id="contactNumber"
            name="contactNumber"
            type="tel"
            value={form.contactNumber}
            onChange={handleChange}
            placeholder="e.g. +94 77 123 4567"
            required
            disabled={loading}
          />
        </div>

        <div className="form-row">
          <label htmlFor="roomType">Room Type *</label>
          <select
            id="roomType"
            name="roomType"
            value={form.roomType}
            onChange={handleChange}
            disabled={loading}
          >
            {ROOM_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)} — LKR {rates[type].toLocaleString()}/night
              </option>
            ))}
          </select>
        </div>

        <div className="form-row double">
          <div>
            <label htmlFor="checkIn">Check-in Date *</label>
            <input
              id="checkIn"
              name="checkIn"
              type="date"
              value={form.checkIn}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="checkOut">Check-out Date *</label>
            <input
              id="checkOut"
              name="checkOut"
              type="date"
              value={form.checkOut}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
        </div>

        {message.text && (
          <p className={`form-message ${message.type}`} role="alert">
            {message.text}
          </p>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Reservation'}
          </button>
        </div>
      </form>
    </div>
  );
}
