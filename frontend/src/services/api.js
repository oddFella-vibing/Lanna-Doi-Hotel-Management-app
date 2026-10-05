import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Guests
export const getGuests = () => api.get('/guests');
export const getGuest = (id) => api.get(`/guests/${id}`);
export const createGuest = (data) => api.post('/guests', data);
export const updateGuest = (id, data) => api.put(`/guests/${id}`, data);
export const deleteGuest = (id) => api.delete(`/guests/${id}`);

// Rooms
export const getRooms = () => api.get('/rooms');
export const getRoom = (id) => api.get(`/rooms/${id}`);
export const createRoom = (data) => api.post('/rooms', data);
export const updateRoom = (id, data) => api.put(`/rooms/${id}`, data);

// Bookings
export const getBookings = () => api.get('/bookings');
export const createBooking = (data) => api.post('/bookings', data);
export const updateBooking = (id, data) => api.put(`/bookings/${id}`, data);
export const cancelBooking = (id) => api.delete(`/bookings/${id}`);

// Payments
export const getPayments = () => api.get('/payments');

// Reports
export const getOccupancyReport = () => api.get('/bookings/occupancy');
export const getRevenueReport = () => api.get('/payments/revenue');

export default api;