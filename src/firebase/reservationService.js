import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from './config';

const RESERVATIONS = 'reservations';
const ROOM_RATES = {
  standard: 8500,
  deluxe: 12000,
  suite: 18000,
  family: 15000,
};

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
  const ref = await addDoc(collection(db, RESERVATIONS), {
    ...data,
    createdAt: serverTimestamp(),
    status: 'confirmed',
  });
  return ref.id;
}

export async function getReservationById(id) {
  const ref = doc(db, RESERVATIONS, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getReservationByNumber(reservationNumber) {
  const q = query(
    collection(db, RESERVATIONS),
    where('reservationNumber', '==', reservationNumber)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const first = snap.docs[0];
  return { id: first.id, ...first.data() };
}

export async function getAllReservations() {
  try {
    const q = query(
      collection(db, RESERVATIONS),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    if (err?.code === 'permission-denied') throw err;
    const snap = await getDocs(collection(db, RESERVATIONS));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() ?? a.createdAt ?? 0;
      const tb = b.createdAt?.toMillis?.() ?? b.createdAt ?? 0;
      return tb - ta;
    });
    return list;
  }
}

export async function updateReservation(id, data) {
  const ref = doc(db, RESERVATIONS, id);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function updateReservationStatus(id, status) {
  const ref = doc(db, RESERVATIONS, id);
  await updateDoc(ref, { status, updatedAt: serverTimestamp() });
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
