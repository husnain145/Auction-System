import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Fetch auctions with optional filters using axios 'params'
export const fetchAuctions = (filters = {}) => {
  return API.get('/auctions', {
    params: filters, // Axios will serialize the query string
  });
};
