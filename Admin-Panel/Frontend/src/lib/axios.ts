// src/lib/axios.js or axios.ts
import axios from 'axios';
import { config } from './config';

const instance = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;
