import { Supervisor } from "../models/supervisorModel.js";
import jwt from "jsonwebtoken";







export const signupAdmin = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existing = await Supervisor.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already registered" });

    const supervisor = await Supervisor.create({
      name,
      email,
      password,
      phone,
    });

    res.status(201).json({
      message: "Supervisor registered successfully",
      supervisor: {
        _id: supervisor._id,
        name: supervisor.name,
        email: supervisor.email,
        role: supervisor.role,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};





export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const supervisor = await Supervisor.findOne({ email });
    if (!supervisor) {
      return res.status(404).json({ message: "Supervisor not found" });
    }

    const isValid = await supervisor.isPasswordCorrect(password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    
    const accessToken = supervisor.generateAccessToken();   // 10s
    const refreshToken = supervisor.generateRefreshToken(); // 2d

    
    supervisor.accessToken = accessToken;
    supervisor.refreshToken = refreshToken;
    await supervisor.save();

    
    res.cookie("accessToken", accessToken, {
  httpOnly: true,
  secure: true,              
  sameSite: "none",          
  maxAge: 1 * 24 * 60 * 60 * 1000,
});

res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 5 * 24 * 60 * 60 * 1000,
});


    
    res.status(200).json({
      message: "Login successful",
      supervisor: {
        _id: supervisor._id,
        name: supervisor.name,
        email: supervisor.email,
        role: supervisor.role,

       
        yearlyBudgets: supervisor.yearlyBudgets || [],
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};





export const logoutAdmin = async (req, res) => {
  try {
    const supervisorId = req.admin?._id; 

    console.log("logout -> ", req.a);


    if (!supervisorId) {
      return res.status(400).json({ message: "Invalid request" });
    }

    await Supervisor.findByIdAndUpdate(
      supervisorId,
      { $set: { accessToken: null, refreshToken: null } },
      { new: true }
    );

    res
      .clearCookie("accessToken", {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      })
      .clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      })
      .status(200)
      .json({ success: true, message: "Logged out successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};



export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const admin = await Supervisor.findById(decoded._id);

    if (!admin || admin.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    
    const newAccessToken = admin.generateAccessToken();
    admin.accessToken = newAccessToken;
    await admin.save();

   
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 10 * 1000, 
    });

    return res.status(200).json({
      success: true,
      message: "Access token refreshed",
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Refresh token expired",
    });
  }
};
