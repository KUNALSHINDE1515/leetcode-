import jwt from 'jsonwebtoken';
import db from '../libs/db.js';
export const authmiddleware = async (req,res,next) => {
    try {
        const token =req.cookies.jwt;
        if(!token){
            return res.status(401).josn({
                message: "Unauthorized - NO token provided" 
            })
        }
        console.log("token : ",token);

        let decoded;


        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({
                message: "Unauthorized - Invalid token"
            })
        }
        
        const user = await db.user.findUnique({
            where:{
                id: decoded.id
            },
            select:{
                id:true,
                name:true,
                email:true,
                image:true,
                role:true
            }
        })

        if(!user){
            res.status(401).json({
                message: "User not found"
            })
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error in auth middleware:", error);
        res.status(500).json({
            message:"middleware error"
        })
    }
}