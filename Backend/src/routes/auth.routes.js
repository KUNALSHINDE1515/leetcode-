import express from 'express';
import { check, login, logout, register } from '../controllers/auth.controller.js';
import { authmiddleware } from '../middleware/auth.middleware.js';
const authRouters = express.Router();

authRouters.post('/register', register);
authRouters.post('/login',login);
authRouters.post('/logout',authmiddleware,logout);
authRouters.get('/check',authmiddleware,check);

export default authRouters;