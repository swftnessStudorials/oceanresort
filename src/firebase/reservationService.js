import { getAuthToken } from './authService';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
const ROOM_RATES = {
  standard: 8500,
  deluxe: 12000,
  suite: 18000,
  family: 15000,
};

async function apiRequest(path, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...(options.headers || {}),
    Authorization: token ? `Bearer ${token}` : '',
  };
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const err = new Error(body.message || 'Request failed');
    if (response.status === 401 || response.status === 403) {
      err.code = 'permission-denied';
    }
    throw err;
  }
  return response.status === 204 ? null : response.json();
}

export function getRoomRates() {
  return ROOM_RATES;
}

export function getRateForRoomType(roomType) {
  return ROOM_RATES[roomType] ?? 0;
}

function nightsBetween(checkIn, checkOut) {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  const diff = (b - a) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(diff));
}

export async function addReservation(data) {
  const result = await apiRequest('/reservations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      status: 'confirmed',
    }),
  });
  return result.id;
}

export async function getReservationById(id) {
  try {
    return await apiRequest(`/reservations/${id}`);
  } catch (err) {
    if (err.message?.toLowerCase().includes('not found')) return null;
    throw err;
  }
}

export async function getReservationByNumber(reservationNumber) {
  try {
    return await apiRequest(`/reservations/by-number/${encodeURIComponent(reservationNumber)}`);
  } catch (err) {
    if (err.message?.toLowerCase().includes('not found')) return null;
    throw err;
  }
}

export async function getAllReservations() {
  return apiRequest('/reservations');
}

export async function updateReservation(id, data) {
  await apiRequest(`/reservations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function updateReservationStatus(id, status) {
  await apiRequest(`/reservations/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

export function calculateBill(reservation) {
  const rate = getRateForRoomType(reservation.roomType);
  const nights = nightsBetween(reservation.checkIn, reservation.checkOut);
  const subtotal = rate * nights;
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;
  return {
    nights,
    ratePerNight: rate,
    subtotal,
    tax,
    total,
    roomType: reservation.roomType,
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
  };
}

export function generateReservationNumber() {
  const prefix = 'OVR';
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${y}${m}${d}-${random}`;
}
