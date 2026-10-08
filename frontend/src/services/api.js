import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

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
export const deleteRoom = (id) => api.delete(`/rooms/${id}`);

// Bookings
export const getBookings = () => api.get('/bookings');
export const getBooking = (id) => api.get(`/bookings/${id}`);
export const createBooking = (data) => api.post('/bookings', data);
export const updateBooking = (id, data) => api.put(`/bookings/${id}`, data);
export const cancelBooking = (id) => api.delete(`/bookings/${id}`);
export const addRoomToBooking = (id, roomId) =>
  api.post(`/bookings/${id}/rooms`, { room_id: roomId });
export const removeRoomFromBooking = (id, roomId) =>
  api.delete(`/bookings/${id}/rooms/${roomId}`);

// Services
export const getServices = (params) => api.get('/services', { params });
export const getService = (id) => api.get(`/services/${id}`);
export const createService = (data) => api.post('/services', data);
export const updateService = (id, data) => api.put(`/services/${id}`, data);
export const deleteService = (id) => api.delete(`/services/${id}`);

// Payments
export const getPayments = (params) => api.get('/payments', { params });
export const getPayment = (id) => api.get(`/payments/${id}`);
export const createPayment = (data) => api.post('/payments', data);

// Employees
export const getEmployees = () => api.get('/employees');
export const getEmployee = (id) => api.get(`/employees/${id}`);
export const createEmployee = (data) => api.post('/employees', data);
export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);

// Housekeeping logs
export const getHousekeepingLogs = (params) =>
  api.get('/housekeepinglogs', { params });
export const getHousekeepingLog = (id) => api.get(`/housekeepinglogs/${id}`);
export const createHousekeepingLog = (data) =>
  api.post('/housekeepinglogs', data);
export const updateHousekeepingLog = (id, data) =>
  api.put(`/housekeepinglogs/${id}`, data);
export const deleteHousekeepingLog = (id) =>
  api.delete(`/housekeepinglogs/${id}`);

// Billings
export const getBillings = (params) => api.get('/billings', { params });
export const getBilling = (id) => api.get(`/billings/${id}`);
export const createBilling = (data) => api.post('/billings', data);

// Health
export const getHealth = () => api.get('/health');

export default api;