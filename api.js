import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getSystemStatus = () => API.get('/status');
export const getAllStations = () => API.get('/allstations');
export const getRoute = (source, destination) => API.get('/route', { params: { source, destination } });
export const getTickets = () => API.get('/tickets');
export const bookTicket = (source, destination, fare, expiresInMinutes = 60) => 
  API.post('/tickets', { 
    source, 
    destination, 
    fare, 
    expires_in_minutes: expiresInMinutes 
  });

export default API;
