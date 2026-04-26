// Filename: src/socket.js
import { io } from 'socket.io-client';

const URL = "https://restaurant-backend-6lre.onrender.com";

export const socket = io(URL, {
  autoConnect: false
});