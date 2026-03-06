import React, { useState, useRef } from 'react';
import {
  getReservationByNumber,
  calculateBill,
  getRoomRates,
} from '../firebase/reservationService';
import './Bill.css';

export default function Bill() {
  const [reservationNumber, setReservationNumber] = useState('');
  const [reservation, setReservation] = useState(null);
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const printRef = useRef(null);

  const rates = getRoomRates();

  const handleSearch = async (e) => {
    e.preventDefault();
    const num = reservationNumber.trim();
    if (!num) {
      setError('Please enter a reservation number.');
      setReservation(null);
      setBill(null);
      return;
    }
    setLoading(true);
    setError('');
    setReservation(null);
    setBill(null);
    try {
      const data = await getReservationByNumber(num);
      if (data) {
        setReservation(data);
        setBill(calculateBill(data));
      } else {
        setError('No reservation found with that number.');
      }
    } catch (e) {
      setError('Failed to retrieve reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head><title>Bill - ${reservation?.reservationNumber}</title>
        <style>
          body { font-family: sans-serif; padding: 24px; max-width: 400px; margin: 0 auto; }
          h1 { color: #0a4d68; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th, td { text-align: left; padding: 8px 0; border-bottom: 1px solid #eee; }
          .total { font-weight: bold; font-size: 1.1em; }
        </style>
        </head>
        <body>
          <h1>Ocean View Resort</h1>
          <p>Galle — Guest Bill</p>
          <p><strong>Reservation:</strong> ${reservation?.reservationNumber}</p>
          <p><strong>Guest:</strong> ${reservation?.guestName}</p>
          <p><strong>Room:</strong> ${reservation?.roomType} | ${bill?.checkIn} to ${bill?.checkOut}</p>
          <table>
            <tr><td>Nights</td><td>${bill?.nights}</td></tr>
            <tr><td>Rate per night (LKR)</td><td>${bill?.ratePerNight?.toLocaleString()}</td></tr>
            <tr><td>Subtotal (LKR)</td><td>${bill?.subtotal?.toLocaleString()}</td></tr>
            <tr><td>Tax 10% (LKR)</td><td>${bill?.tax?.toLocaleString()}</td></tr>
            <tr class="total"><td>Total (LKR)</td><td>${bill?.total?.toLocaleString()}</td></tr>
          </table>
          <p><small>Thank you for staying with us.</small></p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="bill-page page page-enter">
      <h1 className="page-title">Calculate and Print Bill</h1>
      <p className="page-intro">Enter the reservation number to compute the total stay cost and print the bill.</p>

      <form onSubmit={handleSearch} className="search-form">
        <label htmlFor="billReservationNumber" className="sr-only">Reservation Number</label>
        <input
          id="billReservationNumber"
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
          {loading ? 'Loading...' : 'Get Bill'}
        </button>
      </form>

      {error && <p className="error-msg" role="alert">{error}</p>}

      {bill && reservation && (
        <div className="bill-card card card-enter" ref={printRef}>
          <h2>Bill Summary</h2>
          <p className="bill-guest">
            <strong>{reservation.guestName}</strong> — {reservation.reservationNumber}
          </p>
          <p className="bill-dates">
            {bill.checkIn} to {bill.checkOut} ({bill.nights} night{bill.nights !== 1 ? 's' : ''})
          </p>
          <table className="bill-table">
            <tbody>
              <tr>
                <td>Room type</td>
                <td>{bill.roomType}</td>
              </tr>
              <tr>
                <td>Rate per night (LKR)</td>
                <td>{bill.ratePerNight.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Subtotal (LKR)</td>
                <td>{bill.subtotal.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Tax 10% (LKR)</td>
                <td>{bill.tax.toLocaleString()}</td>
              </tr>
              <tr className="total-row">
                <td>Total (LKR)</td>
                <td>{bill.total.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          <div className="bill-actions">
            <button type="button" className="btn-primary" onClick={handlePrint}>
              Print Bill
            </button>
          </div>
        </div>
      )}

      <div className="room-rates-info">
        <h3>Room Rates (LKR per night)</h3>
        <ul>
          {Object.entries(rates).map(([type, rate]) => (
            <li key={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}: {rate.toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
