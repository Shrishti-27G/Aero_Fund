import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";

import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import stationRoutes from "./routes/stationRoutes.js"

const app = express();



app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173", "https://aero-fund-stations.onrender.com", "https://aero-fund-frontend.onrender.com"], 
    credentials: true,               /
  })
);



app.use(cookieParser());


app.use(express.json({ limit: "5mb" }));


app.use(express.urlencoded({ extended: true }));


app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 10 * 1024 * 1024 },
  })
);



app.use("/uploads", express.static("uploads"));

 
app.use("/admin-auth", adminAuthRoutes);
app.use("/stations", stationRoutes)

export default app;
