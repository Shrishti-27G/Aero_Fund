import jwt from "jsonwebtoken";
import { Station } from "../models/stationsModel.js";

export const isStation = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;

       


        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const station = await Station.findById(decoded._id);

        if (!station) {
            return res.status(401).json({ message: "Station not found" });
        }

        req.station = station; 
        next();

    } catch (err) {
        console.error("Station Auth Error:", err);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
