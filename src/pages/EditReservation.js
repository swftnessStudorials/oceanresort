import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getReservationById,
  updateReservation,
  updateReservationStatus,
  getRoomRates,
} from '../firebase/reservationService';
import { useToast } from '../context/ToastContext';
import './AddReservation.css';

const ROOM_TYPES = ['standard', 'deluxe', 'suite', 'family'];

export default function EditReservation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [reservation, setReservation] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const rates = getRoomRates();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getReservationById(id);
        if (!cancelled && data) {
          setReservation(data);
          setForm({
            guestName: data.guestName || '',
            address: data.address || '',
            contactNumber: data.contactNumber || '',
            roomType: data.roomType || 'standard',
            checkIn: data.checkIn || '',
            checkOut: data.checkOut || '',
          });
        } else if (!cancelled) {
          setMessage({ type: 'error', text: 'Reservation not found.' });
        }
      } catch (e) {
        if (!cancelled) setMessage({ type: 'error', text: 'Failed to load reservation.' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setMessage({ type: '', text: '' });
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
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await updateReservation(id, {
        guestName: form.guestName.trim(),
        address: form.address.trim(),
        contactNumber: form.contactNumber.trim(),
        roomType: form.roomType,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
      });
      showToast('Reservation updated successfully.', 'success');
      navigate('/');
    } catch (e) {
      setMessage({
        type: 'error',
        text: e?.message || 'Failed to update. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!window.confirm('Cancel this reservation? The status will be set to Cancelled.')) return;
    setSaving(true);
    try {
      await updateReservationStatus(id, 'cancelled');
      showToast('Reservation cancelled.', 'info');
      navigate('/');
    } catch (e) {
      showToast(e?.message || 'Failed to cancel reservation.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page page-enter">
        <div className="app-loading" style={{ minHeight: '40vh' }}>
          <div className="spinner" aria-hidden="true" />
          <p>Loading reservation...</p>
        </div>
      </div>
    );
  }

  if (!reservation || !form) {
    return (
      <div className="page page-enter">
        <p className="form-message error">{message.text || 'Reservation not found.'}</p>
        <Link to="/">Back to Dashboard</Link>
      </div>
    );
  }

  if (reservation.status === 'cancelled') {
    return (
      <div className="page page-enter">
        <p className="form-message error">This reservation is cancelled and cannot be edited.</p>
        <Link to="/">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="add-reservation page page-enter">
      <h1 className="page-title">Edit Reservation</h1>
      <p className="page-intro">
        Update booking details for <strong>{reservation.reservationNumber}</strong>.
      </p>

      <form onSubmit={handleSubmit} className="reservation-form card-enter">
        <div className="form-row reservation-number-row">
          <label>Reservation Number</label>
          <input type="text" value={reservation.reservationNumber} readOnly className="readonly" />
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
            disabled={saving}
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
            disabled={saving}
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
            disabled={saving}
          />
        </div>

        <div className="form-row">
          <label htmlFor="roomType">Room Type *</label>
          <select
            id="roomType"
            name="roomType"
            value={form.roomType}
            onChange={handleChange}
            disabled={saving}
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
              disabled={saving}
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
              disabled={saving}
            />
          </div>
        </div>

        {message.text && (
          <p className={`form-message ${message.type}`} role="alert">
            {message.text}
          </p>
        )}

        <div className="form-actions form-actions-multi">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={handleCancelReservation}
            disabled={saving}
          >
            Cancel Reservation
          </button>
          <Link to="/" className="btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </form>
    </div>
  );
}
