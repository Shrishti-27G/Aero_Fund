import express from "express";
import {
  createStation,
  loginStation,
  logoutStation,
  refreshStationAccessToken
} from "../controllers/stationAuthController.js";

import { getAllStations, updateYearlyBudget, getStationByFinancialYear, updateRemark, deleteStation, deleteFinancialYear, updateSupervisorYearlyBudget, getSupervisorYearlyBudget } from "../controllers/stationController.js";

import { isAdmin } from "../middlewares/isAdmin.js";
import { isStation } from "../middlewares/isStation.js";


const router = express.Router();


//  routes for stations
router.post("/login", loginStation);
router.post("/logout", isStation, logoutStation);
router.get(
  "/get-station-detail-by-financial-year/:stationId/:year",
  isStation,
  getStationByFinancialYear
);
router.post("/refresh-token", refreshStationAccessToken);
router.put("/update-remark/:stationId/:year", isStation, updateRemark);



//  routes for admin
router.post("/create-station", isAdmin, createStation);
router.get("/get-all-stations", isAdmin, getAllStations);
router.put("/update-budget/:stationId/:year", isAdmin, updateYearlyBudget);
router.delete(
  "/delete-station/:stationId",
  isAdmin,
  deleteStation
);
router.delete(
  "/delete-financial-year/:stationId/year/:year",
  isAdmin,
  deleteFinancialYear
);
router.get(
  "/get-admin-yearly-budget/:year",
  isAdmin,
  getSupervisorYearlyBudget
);

router.put(
  "/update-admin-yearly-budget",
  isAdmin,
  updateSupervisorYearlyBudget
);
export default router;
