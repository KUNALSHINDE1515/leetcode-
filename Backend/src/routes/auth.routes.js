import express from 'express';
import { check, login, logout, register } from '../controllers/auth.controller.js';

const authRouters = express.Router();

authRouters.post('/register', register);
authRouters.post('/login',login);
authRouters.post('/logout',logout);
authRouters.post('/check',check);

export default authRouters;