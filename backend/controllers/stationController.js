import { Station } from "../models/stationsModel.js";
import { uploadImageToCloudinary, deleteFromCloudinaryByUrl } from "../config/imageUploader.js";
import mongoose from "mongoose";
import { Supervisor } from "../models/supervisorModel.js";


//  admin controller
export const updateYearlyBudget = async (req, res) => {
  try {
    const supervisorId = req.admin._id;
    const { stationId, year } = req.params;

    const {
      totalAllocated,
      totalUtilized,
      totalEstimated,
      remark,
      description,
      allocationType,
    } = req.body;

    
    if (!stationId || !year) {
      return res.status(400).json({
        message: "Station ID and Year are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(stationId)) {
      return res.status(400).json({
        message: "Invalid Station ID",
      });
    }

    const parsedYear = Number(year);
    if (isNaN(parsedYear)) {
      return res.status(400).json({
        message: "Invalid year format",
      });
    }

    
    const station = await Station.findOne({
      _id: stationId,
      createdBy: supervisorId, 
    });

    if (!station) {
      return res.status(404).json({
        message: "Station not found or access denied",
      });
    }

    
    let receiptUrl = null;

    if (req.files?.receipt) {
      const uploadResult = await uploadImageToCloudinary(
        req.files.receipt,
        "station-receipts"
      );
      receiptUrl = uploadResult?.secure_url;
    }

  
    let yearlyRecord = station.yearlyData.find(
      (item) => item.year === parsedYear
    );

  
    if (!yearlyRecord) {
      const newYearRecord = {
        year: parsedYear,
        totalAllocated: totalAllocated ?? 0,
        totalUtilized: totalUtilized ?? 0,
        totalEstimated: totalEstimated ?? 0,
        remark: remark ?? "N/A",
        description: description ?? "",
        allocationType: allocationType ?? "",
        receipts: receiptUrl ? [receiptUrl] : [],
      };

      station.yearlyData.push(newYearRecord);
      await station.save();

      return res.status(201).json({
        success: true,
        message: `Yearly budget created successfully for ${parsedYear}-${parsedYear + 1}`,
        createdYear: newYearRecord,
      });
    }

   
    if (totalAllocated !== undefined)
      yearlyRecord.totalAllocated = Number(totalAllocated);

    if (totalUtilized !== undefined)
      yearlyRecord.totalUtilized = Number(totalUtilized);

    if (totalEstimated !== undefined)
      yearlyRecord.totalEstimated = Number(totalEstimated);

    if (remark !== undefined)
      yearlyRecord.remark = remark;

    if (description !== undefined)
      yearlyRecord.description = description;

    if (allocationType !== undefined)
      yearlyRecord.allocationType = allocationType;

  
    if (receiptUrl) {
      yearlyRecord.receipts ??= [];
      yearlyRecord.receipts.push(receiptUrl);
    }

    await station.save();

    res.status(200).json({
      success: true,
      message: "Yearly budget updated successfully",
      updatedYear: yearlyRecord,
    });
  } catch (error) {
    console.error("Update/Create Yearly Budget Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating yearly budget",
      error: error.message,
    });
  }
};


export const updateSupervisorYearlyBudget = async (req, res) => {
  try {
    

    const { year, totalAllocatedToMe } = req.body;

    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Admin not authenticated",
      });
    }

    const supervisorId = req.admin._id;

  
    if (!year || totalAllocatedToMe === undefined) {
      return res.status(400).json({
        success: false,
        message: "Year and totalAllocatedToMe are required",
      });
    }

    if (Number(totalAllocatedToMe) < 0) {
      return res.status(400).json({
        success: false,
        message: "Budget cannot be negative",
      });
    }

    const supervisor = await Supervisor.findById(supervisorId);

    if (!supervisor) {
      return res.status(404).json({
        success: false,
        message: "Supervisor not found",
      });
    }

    const numericYear = Number(year);
    const numericBudget = Number(totalAllocatedToMe);

    const yearIndex = supervisor.yearlyBudgets.findIndex(
      (b) => b.year === numericYear
    );

    if (yearIndex !== -1) {
      supervisor.yearlyBudgets[yearIndex] = {
        year: numericYear,
        totalAllocatedToMe: numericBudget,
      };
    } else {
      supervisor.yearlyBudgets.push({
        year: numericYear,
        totalAllocatedToMe: numericBudget,
      });
    }


    supervisor.markModified("yearlyBudgets");

    await supervisor.save();

   

    return res.status(200).json({
      success: true,
      message: "Yearly budget updated successfully",
      yearlyBudgets: supervisor.yearlyBudgets,
    });
  } catch (error) {
    console.error("Update Supervisor Budget Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



export const getSupervisorYearlyBudget = async (req, res) => {
  try {
    const supervisorId = req.admin._id; 
    const { year } = req.params;


    if (!year) {
      return res.status(400).json({
        success: false,
        message: "Year is required",
      });
    }

    const supervisor = await Supervisor.findById(supervisorId).select(
      "yearlyBudgets"
    );

    if (!supervisor) {
      return res.status(404).json({
        success: false,
        message: "Supervisor not found",
      });
    }

    const numericYear = Number(year);

    const budgetForYear = supervisor.yearlyBudgets.find(
      (b) => b.year === numericYear
    );

    return res.status(200).json({
      success: true,
      budget: budgetForYear || null,
    });
  } catch (error) {
    console.error("Get Supervisor Budget By Year Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};




export const getAllStations = async (req, res) => {
  try {
    const { year } = req.query;
    const filterYear = year ? Number(year) : null;

    const supervisorId = req.admin._id;

    const pipeline = [];

   
    pipeline.push({
      $match: {
        createdBy: new mongoose.Types.ObjectId(supervisorId),
      },
    });

   
    if (filterYear) {
      pipeline.push({
        $addFields: {
          yearlyDataFiltered: {
            $filter: {
              input: "$yearlyData",
              as: "yd",
              cond: { $eq: ["$$yd.year", filterYear] },
            },
          },
        },
      });
    }

  
    if (!filterYear) {
      pipeline.push({ $unwind: "$yearlyData" });
      pipeline.push({ $sort: { "yearlyData.year": -1 } });
    }

   
    pipeline.push({
      $project: {
        stationName: 1,
        stationCode: 1,
        email: 1,
        createdAt: 1,
        updatedAt: 1,

        financialYear: {
          $cond: [
            { $ifNull: [filterYear, false] },
            filterYear,
            "$yearlyData.year",
          ],
        },

        description: {
          $cond: [
            { $gt: [{ $size: "$yearlyDataFiltered" }, 0] },
            { $arrayElemAt: ["$yearlyDataFiltered.description", 0] },
            "",
          ],
        },

        allocationType: {
          $cond: [
            { $gt: [{ $size: "$yearlyDataFiltered" }, 0] },
            { $arrayElemAt: ["$yearlyDataFiltered.allocationType", 0] },
            "N/A",
          ],
        },

        totalAllocated: {
          $cond: [
            { $gt: [{ $size: "$yearlyDataFiltered" }, 0] },
            { $arrayElemAt: ["$yearlyDataFiltered.totalAllocated", 0] },
            0,
          ],
        },

        totalUtilized: {
          $cond: [
            { $gt: [{ $size: "$yearlyDataFiltered" }, 0] },
            { $arrayElemAt: ["$yearlyDataFiltered.totalUtilized", 0] },
            0,
          ],
        },

        totalEstimated: {
          $cond: [
            { $gt: [{ $size: "$yearlyDataFiltered" }, 0] },
            { $arrayElemAt: ["$yearlyDataFiltered.totalEstimated", 0] },
            0,
          ],
        },

        remark: {
          $cond: [
            { $gt: [{ $size: "$yearlyDataFiltered" }, 0] },
            { $arrayElemAt: ["$yearlyDataFiltered.remark", 0] },
            "N/A",
          ],
        },

        receipts: {
          $cond: [
            { $gt: [{ $size: "$yearlyDataFiltered" }, 0] },
            { $arrayElemAt: ["$yearlyDataFiltered.receipts", 0] },
            [],
          ],
        },
      },
    });

    pipeline.push({ $sort: { stationName: 1 } });

    const stations = await Station.aggregate(pipeline);

   
    if (!stations || stations.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        stations: [],
        message: "You don't have any stations yet. Please create one.",
      });
    }

    res.status(200).json({
      success: true,
      count: stations.length,
      stations,
    });
  } catch (error) {
    console.error("Get All Stations Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching stations",
    });
  }
};





export const deleteStation = async (req, res) => {
  try {
    const { stationId } = req.params;
    const supervisorId = req.admin._id;

    if (!mongoose.Types.ObjectId.isValid(stationId)) {
      return res.status(400).json({ success: false, message: "Invalid station ID" });
    }

    const station = await Station.findOne({
      _id: stationId,
      createdBy: supervisorId,
    });

    if (!station) {
      return res.status(404).json({
        success: false,
        message: "Station not found or not authorized",
      });
    }

    
    for (const year of station.yearlyData) {
      if (Array.isArray(year.receipts)) {
        for (const receiptUrl of year.receipts) {
          await deleteFromCloudinaryByUrl(receiptUrl);
        }
      }
    }

 
    await Station.findByIdAndDelete(stationId);

  
    await Supervisor.findByIdAndUpdate(supervisorId, {
      $pull: { createdStations: stationId },
    });

    res.status(200).json({
      success: true,
      message: "Station and all receipts deleted successfully",
    });
  } catch (error) {
    console.error("Delete Station Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting station",
    });
  }
};



export const deleteFinancialYear = async (req, res) => {
  try {
    const { stationId, year } = req.params;
    const supervisorId = req.admin._id;

    const parsedYear = Number(year);
    if (isNaN(parsedYear)) {
      return res.status(400).json({
        success: false,
        message: "Invalid year format",
      });
    }

    const station = await Station.findOne({
      _id: stationId,
      createdBy: supervisorId,
    });

    if (!station) {
      return res.status(404).json({
        success: false,
        message: "Station not found or not authorized",
      });
    }

    const yearData = station.yearlyData.find(
      (y) => y.year === parsedYear
    );

    if (!yearData) {
      return res.status(404).json({
        success: false,
        message: `Financial year ${parsedYear}-${parsedYear + 1} not found`,
      });
    }

    
    if (Array.isArray(yearData.receipts)) {
      for (const receiptUrl of yearData.receipts) {
        await deleteFromCloudinaryByUrl(receiptUrl);
      }
    }


    station.yearlyData = station.yearlyData.filter(
      (y) => y.year !== parsedYear
    );

    await station.save();

    res.status(200).json({
      success: true,
      message: `Financial year ${parsedYear}-${parsedYear + 1} deleted`,
      station,
    });
  } catch (error) {
    console.error("Delete Financial Year Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting financial year",
    });
  }
};





//  stations controller
export const getStationByFinancialYear = async (req, res) => {
  try {
    const { stationId } = req.params;
    let { year } = req.params;

   
    if (!mongoose.Types.ObjectId.isValid(stationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Station ID",
      });
    }

  
    if (!year) {
      const today = new Date();
      const yr = today.getFullYear();
      const mon = today.getMonth() + 1;
      year = mon >= 4 ? yr : yr - 1;
    }

    const parsedYear = Number(year);
    if (isNaN(parsedYear)) {
      return res.status(400).json({
        success: false,
        message: "Invalid financial year",
      });
    }

    const station = await Station.findOne(
      {
        _id: stationId,
        "yearlyData.year": parsedYear,
      },
      {
        stationName: 1,
        stationCode: 1,
        email: 1,
        "yearlyData.$": 1, 
      }
    );

    if (!station) {
      return res.status(404).json({
        success: false,
        message: `No data found for FY ${parsedYear}-${parsedYear + 1}`,
      });
    }

    return res.status(200).json({
      success: true,
      year: parsedYear,
      station,
    });
  } catch (error) {
    console.error("Financial Year Fetch Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



export const updateRemark = async (req, res) => {
  try {
    const { stationId, year } = req.params;
    const { remark } = req.body;

    if (!remark) {
      return res.status(400).json({
        success: false,
        message: "Remark is required",
      });
    }

   
    if (!mongoose.Types.ObjectId.isValid(stationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Station ID",
      });
    }

    const parsedYear = Number(year);
    if (isNaN(parsedYear)) {
      return res.status(400).json({
        success: false,
        message: "Invalid year format",
      });
    }

    const station = await Station.findOneAndUpdate(
      {
        _id: stationId,
        "yearlyData.year": parsedYear,
      },
      {
        $set: {
          "yearlyData.$.remark": remark,
        },
      },
      { new: true }
    );

    if (!station) {
      return res.status(404).json({
        success: false,
        message: "Station or financial year not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Remark updated successfully",
      station,
    });
  } catch (error) {
    console.error("Remark Update Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
