import bcrypt from 'bcryptjs';
import db from '../libs/db.js';
import { UserRole } from '../generated/prisma/index.js';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    const{email, password, name} = req.body;


    try {
        const exstingUser = await db.user.findUnique({
            where: {
                email: email
            }
        });

        if (exstingUser) {
            return res.status(400).json({message: 'User already exists'});
        }

        const hashedPassword = await bcrypt.hash(password,12)

        const newUser = await db.user.create({
            data:{
                email: email,
                password: hashedPassword,
                name: name,
                role:UserRole.USER
            }
        })

        const token = jwt.sign({id:newUser.id}, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== 'development',
            maxAge: 1000*60*60*24*7
        });

        res.status(201).json({
            user:{
                id:newUser.id,
                email:newUser.email,
                name:newUser.name,  
                role:newUser.role,
                // image:null,
            }
        })
    } catch (error) {
        console.error("error creating user :",error);
        res.status(500).json({
            error:"Error creating user"
        })
    }
}
export const login = async (req, res) => {}
export const logout = async (req, res) => {}
export const check = async (req, res) => {}