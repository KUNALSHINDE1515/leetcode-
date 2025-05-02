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
                role:UserRole.USER,
                // image: null,
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
            message: 'User created successfully',
            user:{
                id:newUser.id,
                email:newUser.email,
                name:newUser.name,  
                role:newUser.role,
                image:newUser.image,
            }
        })
    } catch (error) {
        console.error("error creating user :",error);
        res.status(500).json({
            error:"Error creating user"
        })
    }
}
export const login = async (req, res) => {
    const {email, password}= req.body;

    try {
        const user = await db.user.findUnique({
            where:{
                email:email
            }
        });
        if(!user){
            res.status(401).json({
                message: 'User not found'
            });
        }

        const isMatch =await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        const token = jwt.sign({id:user.id}, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== 'development',
            maxAge: 1000*60*60*24*7
        });

        res.status(200).json({
            message: 'User Logged in successfully',
            user:{
                id:user.id,
                email:user.email,
                name:user.name,  
                role:user.role,
                image:user.image,
            }
        })
    } catch (error) {
        console.error("error logging user :",error);
        res.status(500).json({
            error:"Error logging user"
        })
    }
}
export const logout = async (req, res) => {

    try {
        res.clearCookie('jwt', {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== 'development',
        });
        res.status(204).json({
            message: 'User logged out successfully'
        })  
    } catch (error) {
        console.error("error logging out user :",error);
        res.status(500).json({
            error:"Error logging out user"
        })
    }
}
export const check = async (req, res) => {}