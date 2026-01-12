import { Station } from "../models/stationsModel.js";
import { Supervisor } from "../models/supervisorModel.js";


const accessCookieOptions = {
  httpOnly: true,
  secure: true,         
  sameSite: "none",     
  maxAge: 1 * 24 * 60 * 60 * 1000
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 5 * 24 * 60 * 60 * 1000
};




// admin controller
export const createStation = async (req, res) => {
  try {


    const supervisorId = req.admin._id;

    const { stationName, stationCode, password, email, financialYear } =
      req.body;

   
    if (!stationName || !stationCode || !password || !email || !financialYear) {
      return res.status(400).json({
        message:
          "Station Name, Station Code, Email, Password and Financial Year are required",
      });
    }

    let year;
    if (typeof financialYear === "string") {
      year = parseInt(financialYear.split("-")[0], 10);
    } else if (typeof financialYear === "number") {
      year = financialYear;
    } else {
      return res.status(400).json({ message: "Invalid Financial Year format" });
    }

    if (isNaN(year)) {
      return res.status(400).json({
        message: "Invalid Financial Year format. Expected: 2025-2026 or 2025",
      });
    }

 
    let station = await Station.findOne({ stationCode });

   
    if (station) {
     
      if (
        station.createdBy &&
        station.createdBy.toString() === supervisorId.toString()
      ) {

        const yearExists = station.yearlyData.some(
          (item) => item.year === year
        );

        if (yearExists) {
          return res.status(409).json({
            message: `Station already exists for Financial Year ${year}-${year + 1}`,
          });
        }

        station.yearlyData.push({
          year,
          totalAllocated: 0,
          totalUtilized: 0,
          totalEstimated: 0,
          remark: "N/A",
          receipts: [],
        });

        await station.save();

        return res.status(201).json({
          success: true,
          message: "New Financial Year added successfully",
          station,
        });
      }

 
      return res.status(409).json({
        success: false,
        message: "Station Code already exists. Station codes must be unique.",
      });
    }

   
    const newStation = await Station.create({
      stationName,
      stationCode,
      email,
      password,
      createdBy: supervisorId,
      yearlyData: [
        {
          year,
          totalAllocated: 0,
          totalUtilized: 0,
          totalEstimated: 0,
          remark: "N/A",
          receipts: [],
        },
      ],
    });

    await Supervisor.findByIdAndUpdate(supervisorId, {
      $push: { createdStations: newStation._id },
    });

    res.status(201).json({
      success: true,
      message: "Station created successfully",
      station: newStation,
    });
  } catch (error) {
    console.error("Create Station Error:", error);


    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Station Code already exists. Must be unique.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating station",
      error: error.message,
    });
  }
};




export const loginStation = async (req, res) => {
  try {
    const { stationCode, email, password } = req.body;

    
    if (!stationCode || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Station code, email and password are required",
      });
    }

   
    const station = await Station.findOne({
      stationCode,
      email,
    });

    if (!station) {
      return res.status(404).json({
        success: false,
        message: "Station not found with given details",
      });
    }

   
    const isValid = await station.isPasswordCorrect(password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    
    const accessToken = station.generateAccessToken();
    const refreshToken = station.generateRefreshToken();

   
    station.accessToken = accessToken;
    station.refreshToken = refreshToken;
    await station.save({ validateBeforeSave: false });

   
    res
      .cookie("accessToken", accessToken, accessCookieOptions)
      .cookie("refreshToken", refreshToken, refreshCookieOptions);

 
    const stationData = station.toObject();
    delete stationData.password;
    delete stationData.accessToken;
    delete stationData.refreshToken;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      station: stationData,
    });
  } catch (error) {
    console.error("Login Station Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};




export const logoutStation = async (req, res) => {
  try {
    const stationId = req.station?._id; 

    if (!stationId) {
      return res.status(400).json({ message: "Invalid request" });
    }

    
    await Station.findByIdAndUpdate(
      stationId,
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
    console.error("Logout Station Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const refreshStationAccessToken = async (req, res) => {
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

    const station = await Station.findById(decoded._id);

    if (!station || station.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

   
    const newAccessToken = station.generateAccessToken();
    station.accessToken = newAccessToken;
    await station.save({ validateBeforeSave: false });

   
    res.cookie("accessToken", newAccessToken, accessCookieOptions);

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
