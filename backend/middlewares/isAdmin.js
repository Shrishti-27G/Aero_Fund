import jwt from "jsonwebtoken";
import { Supervisor } from "../models/supervisorModel.js";

export const isAdmin = async (req, res, next) => {
  try {
    
    const token = req.cookies?.accessToken;


    

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token missing in cookies",
      });
    }

  
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

   
    const admin = await Supervisor.findById(decoded._id).select(
      "-password -refreshToken"
    );

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

   
    if (admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

 
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Admin account is deactivated",
      });
    }


    req.admin = admin;

    next(); 
  } catch (error) {
    console.error("Admin Cookie Auth Error:", error);

    return res.status(401).json({
      success: false,
      message: "Unauthorized or token expired",
    });
  }
};
