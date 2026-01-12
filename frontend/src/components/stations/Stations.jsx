import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  createStation,
  getAllStations,
  updateYearlyBudget,
} from "../../services/operations/stationsOperations.js";
import { toast } from "sonner";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import BudgetSummary from "./BudgetSummary.jsx";
import DeleteStationModal from "./DeleteStationModal.jsx";
import { deleteStation, deleteFinancialYear } from "../../services/operations/stationsOperations.js";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";



const getCurrentFinancialYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  return month >= 4 ? year : year - 1;
};


const formatFY = (year) => `${year}-${year + 1}`;


const START_FY = 2023;
const CURRENT_FY = getCurrentFinancialYear();

const financialYears = Array.from(
  { length: CURRENT_FY - START_FY + 1 },
  (_, i) => START_FY + i
).reverse();


const Stations = () => {
  const dispatch = useDispatch();

  const [stations, setStations] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editStation, setEditStation] = useState(null);
  const [viewReceipt, setViewReceipt] = useState(null);
  const [receiptList, setReceiptList] = useState([]);
  const [viewReceiptIndex, setViewReceiptIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewMode, setViewMode] = useState("table");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [expandedDesc, setExpandedDesc] = useState(null);
  const [showPassword, setShowPassword] = useState(false);






  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1100) {
        setViewMode("card");
      }
    };

    handleResize();


    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  const handleDeleteStation = async (stationId) => {
    const success = await dispatch(deleteStation(stationId));


    if (success) {
      await fetchStations();
      setOpenDeleteModal(false);

    }
  };


  const handleDeleteYear = async (stationId, year) => {
    const success = await dispatch(deleteFinancialYear(stationId, year));


    if (success) {
      await fetchStations();
      setOpenDeleteModal(false);

    }
  };






  const [selectedFY, setSelectedFY] = useState(getCurrentFinancialYear());

  const [formData, setFormData] = useState({
    stationName: "",
    stationCode: "",
    email: "",
    password: "",
    financialYear: getCurrentFinancialYear(),
  });

  const [editForm, setEditForm] = useState({
    totalAllocated: "",
    totalUtilized: "",
    totalEstimated: "",
    remark: "",
    receipt: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [adminYearlyBudget, setAdminYearlyBudget] = useState(0);
  const [utilizedError, setUtilizedError] = useState("");






  useEffect(() => {
    fetchStations();
  }, [selectedFY]);



  const downloadBudgetReport = () => {
    const doc = new jsPDF("p", "mm", "a4");

    const yearLabel = `${selectedFY}-${selectedFY + 1}`;


    const totalAllocated = stations.reduce(
      (sum, s) => sum + Number(s.totalAllocated || 0),
      0
    );

    const totalUtilized = stations.reduce(
      (sum, s) => sum + Number(s.totalUtilized || 0),
      0
    );

    const totalEstimated = stations.reduce(
      (sum, s) => sum + Number(s.totalEstimated || 0),
      0
    );

    const totalRemaining = adminYearlyBudget - totalAllocated

    const utilizationPercent =
      totalAllocated > 0
        ? ((totalUtilized / totalAllocated) * 100).toFixed(1)
        : 0;

    doc.setFontSize(11);
    doc.text(
      `Budget Utilization Summary Report : ${yearLabel}`,
      14,
      12
    );

    const now = new Date();

    doc.setFontSize(9);
    doc.setTextColor(180, 83, 9);
    doc.setFont("helvetica", "bold");

    doc.text(
      `Till ${now.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}`,
      14,
      16
    );


    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");


    autoTable(doc, {
      startY: 20,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 110 },
        1: { cellWidth: 40 },
      },
      body: [
        ["Total Budget Allocated to You", adminYearlyBudget],
        ["Total Budget Allocated to Stations", totalAllocated],
        ["Total Budget Utilized by Stations", totalUtilized],
        ["Budget Utilization by stations (%)", `${utilizationPercent}%`],
        ["Your Remaining Budget", totalRemaining],
      ],
    });


    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 6,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2 },
      head: [[
        "Station",
        "Allocation Type",
        "Total Allocated",
        "Total Utilized",
        "Total Estimated",
        "% Utilized",
      ]],

      body: [
        ...stations.map((st) => {
          const percent =
            st.totalAllocated > 0
              ? ((st.totalUtilized / st.totalAllocated) * 100).toFixed(1)
              : "0";

          return [
            st.stationName,
            st.allocationType || "N/A",
            st.totalAllocated,
            st.totalUtilized,
            st.totalEstimated,
            `${percent}%`,
          ];
        }),
        [
          "TOTAL",
          "-",
          totalAllocated,
          totalUtilized,
          totalEstimated,
          `${utilizationPercent}%`,
        ],
      ],

    });


    doc.save(`Budget-Report-${yearLabel}.pdf`);
  };







  const fetchStations = async () => {
    const res = await dispatch(getAllStations(selectedFY));

    if (Array.isArray(res)) {
      setStations(res);
    } else if (res?.stations && Array.isArray(res.stations)) {
      setStations(res.stations);
    } else {
      setStations([]);
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.stationName.trim()) {
      toast.error("Station name is required");
      setLoading(false);
      return;
    }

    if (!formData.stationCode.trim()) {
      toast.error("Station code is required");
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      setLoading(false);
      return;
    }


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      setLoading(false);
      return;
    }


    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }


    if (!formData.financialYear) {
      toast.error("Please select a financial year");
      setLoading(false);
      return;
    }


    const result = await dispatch(
      createStation(
        formData.stationName.trim(),
        formData.stationCode.trim(),
        formData.password,
        formData.email.trim(),
        Number(formData.financialYear)
      )
    );

    if (result) {
      setOpenModal(false);
      setFormData({
        stationName: "",
        stationCode: "",
        email: "",
        password: "",
        financialYear: getCurrentFinancialYear(),
      });
      fetchStations();
    }

    setLoading(false);
  };




  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editStation) return;

    if (utilizedError) return;



    const payload = new FormData();

    payload.append("totalAllocated", editForm.totalAllocated);
    payload.append("totalUtilized", editForm.totalUtilized);
    payload.append("totalEstimated", editForm.totalEstimated);
    payload.append("description", editForm.description);
    payload.append("allocationType", editForm.allocationType);
    payload.append("remark", editForm.remark);


    if (editForm.receipt instanceof File) {
      payload.append("receipt", editForm.receipt);
    }

    const result = await dispatch(
      updateYearlyBudget(editStation._id, selectedFY, payload)
    );

    if (result) {
      setOpenEditModal(false);
      fetchStations();
    }
  };



  const baseInputClass =
    "w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/70 focus:border-blue-400/70 transition";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1e293b_0,_#020617_45%,_#000_100%)] text-slate-50">

      <div className="pointer-events-none fixed inset-x-0 top-0 h-40 bg-gradient-to-b from-blue-500/30 via-transparent to-transparent blur-3xl opacity-60" />

      <div className="relative  max-w-[95%] mx-auto px-4 py-8 sm:py-10 lg:py-12">
        {/* HEADER + FY FILTER BAR */}
        <div
          className="
    mb-10
    flex flex-col
    gap-6
    md:flex-row
    md:items-center
    md:justify-between
  "
        >
          <div className="max-w-4xl">
            {/* BADGE */}
            <div
              className="
      inline-flex items-center gap-2
      rounded-full
      bg-white/5
      px-3 py-1
      border border-white/10
      shadow-sm shadow-black/40
      backdrop-blur-xl
    "
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span
                className="
        text-[10px] sm:text-xs
        uppercase
        tracking-[0.18em] sm:tracking-[0.2em]
        text-slate-300/80
        whitespace-nowrap
      "
              >
                AeroFund · Control Panel
              </span>
            </div>

            {/* TITLE */}
            <h1
              className="
      mt-4
      text-2xl
      sm:text-3xl
      md:text-4xl
      lg:text-5xl
      xl:text-[3.2rem]
      font-semibold
      tracking-tight
      leading-tight
      text-slate-50
    "
            >
              Stations Overview
            </h1>

            {/* DESCRIPTION */}
            <p
              className="
      mt-2
      max-w-prose
      text-xs
      sm:text-sm
      md:text-base
      text-slate-300/80
      leading-relaxed
    "
            >
              Manage yearly budgets for all stations with a clean, liquid-glass interface.
            </p>
          </div>




          <div
            className="
      flex flex-wrap
      items-start sm:items-center
      gap-3
      sm:gap-4
      md:justify-end
    "
          >
            {/* DOWNLOAD */}
            <button
              onClick={() => downloadBudgetReport(stations, selectedFY)}
              className="
        inline-flex items-center justify-center
        rounded-xl sm:rounded-2xl
        bg-white/10
        px-3.5 py-2 sm:py-2.5
        text-[11px] sm:text-xs
        font-semibold
        text-slate-50
        border border-white/20
        hover:bg-white/20
        hover:border-sky-300/60
        transition
        whitespace-nowrap
      "
            >
              Download Report (PDF)
            </button>

            {/* FY SELECT */}
            <div
              className="
        inline-flex items-center gap-2
        rounded-xl sm:rounded-2xl
        bg-white/5
        border border-white/15
        px-3 py-2
        backdrop-blur-xl
        shadow-sm shadow-black/40
      "
            >
              <span className="text-[10px] sm:text-xs text-slate-300/80 whitespace-nowrap">
                Financial Year
              </span>

              <select
                value={selectedFY}
                onChange={(e) => setSelectedFY(Number(e.target.value))}
                className="
          bg-transparent
          text-[11px] sm:text-sm
          px-1.5
          text-slate-50
          border-none
          focus:outline-none
          cursor-pointer
          min-w-[100px] sm:min-w-[130px]
        "
              >
                {financialYears.map((year) => (
                  <option key={year} value={year} className="bg-slate-900">
                    {formatFY(year)} {year === CURRENT_FY ? "(Current)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* CREATE */}
            <button
              onClick={() => setOpenModal(true)}
              className="
        inline-flex items-center justify-center
        rounded-xl sm:rounded-2xl
        bg-gradient-to-r from-blue-500 to-sky-400
        px-4 sm:px-5
        py-2 sm:py-2.5
        text-xs sm:text-sm
        font-semibold
        text-white
        shadow-lg shadow-blue-500/40
        hover:shadow-blue-400/60
        hover:scale-[1.03]
        active:scale-[0.98]
        transition
        whitespace-nowrap
      "
            >
              <span className="mr-1.5 text-base leading-none">＋</span>
              New Station
            </button>
          </div>


        </div>



        <BudgetSummary
          stations={stations}
          selectedFY={selectedFY}
          onAdminBudgetChange={setAdminYearlyBudget}
        />








        {/*  VIEW MODE TOGGLE  */}
        <div className="flex justify-end mb-5 gap-x-3">

          <button
            onClick={() => setOpenDeleteModal(true)}
            className="
    group relative inline-flex items-center justify-center
    gap-1.5

    /* SIZE MATCH */
    px-3 sm:px-4
   h-[3rem]
    text-[10px] sm:text-xs
    font-semibold

    /* COLOR */
    text-slate-300

    /* GLASS BASE (MATCH TOGGLE) */
    bg-white/10
    backdrop-blur-xl
    border border-white/20
    rounded-2xl

    /* SHADOW (MATCH TOGGLE) */
    shadow-lg shadow-black/20

    /* INTERACTION */
    hover:bg-white/20
    hover:text-slate-100
    transition-all duration-300
    active:scale-[0.97]
  "
          >
            {/* ICON */}
            <svg
              className="sm:w-4 sm:h-4 text-slate-300 group-hover:text-slate-100 transition"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0H7m2-3h6a1 1 0 011 1v2H8V5a1 1 0 011-1z"
              />
            </svg>

            <span className="tracking-wide">
              Delete
            </span>
          </button>






          {/* VIEW MODE TOGGLE */}
          <div className="flex justify-end mb-6 max-[1100px]:hidden">
            <div
              className="
      flex items-center gap-2 sm:gap-3
      bg-white/10 border border-white/20
      px-3 sm:px-4 py-2
      rounded-2xl
      backdrop-blur-xl
      shadow-lg shadow-black/20
    "
            >
              <span className="text-[10px] sm:text-xs text-slate-300 tracking-wide">
                View Mode
              </span>

              {/* CARD BUTTON */}
              <button
                onClick={() => setViewMode("card")}
                className={`
        flex items-center gap-1.5
        px-3 sm:px-4 py-1.5
        text-[10px] sm:text-xs font-semibold rounded-xl
        transition-all duration-300
        ${viewMode === "card"
                    ? "bg-sky-500 text-white shadow-md shadow-sky-400/40 scale-105"
                    : "bg-white/10 text-slate-300 hover:bg-white/20"
                  }
      `}
              >
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 7h7V3H3v4zm0 14h7v-6H3v6zm11 0h7v-10h-7v10zm0-14h7V3h-7v4z" />
                </svg>
                Card
              </button>

              {/* TABLE BUTTON */}
              <button
                onClick={() => setViewMode("table")}
                className={`
        flex items-center gap-1.5
        px-3 sm:px-4 py-1.5
        text-[10px] sm:text-xs font-semibold rounded-xl
        transition-all duration-300
        ${viewMode === "table"
                    ? "bg-sky-500 text-white shadow-md shadow-sky-400/40 scale-105"
                    : "bg-white/10 text-slate-300 hover:bg-white/20"
                  }
      `}
              >
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 10h18M3 3h18M3 17h18" />
                </svg>
                Table
              </button>
            </div>
          </div>





        </div>


        {/*  CARD VIEW   */}


        {viewMode === "card" && (
          <>
            {stations.length === 0 ? (
              <div className="mt-12 flex justify-center">
                <div className="rounded-3xl border border-dashed border-slate-600/60 bg-slate-900/40 px-6 py-10 text-center backdrop-blur-xl max-w-md">
                  <p className="text-sm text-slate-300/80">
                    No stations found yet. Create your first station to start managing budgets.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {stations.map((station) => {
                  const hasBudget = Number(station.financialYear) === Number(selectedFY);

                  return (
                    <div
                      key={station._id}
                      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-5 py-5 
              shadow-[0_18px_45px_rgba(15,23,42,0.7)] backdrop-blur-2xl 
              transition-transform duration-300 hover:-translate-y-1 
              hover:shadow-[0_25px_60px_rgba(56,189,248,0.45)]
              flex flex-col h-full"
                    >
                      {/* Soft highlight */}
                      <div className="pointer-events-none absolute inset-x-0 -top-16 h-32 bg-gradient-to-b from-sky-400/40 via-transparent to-transparent opacity-70 blur-3xl" />

                      {/* Header */}
                      <div className="relative flex flex-col items-start gap-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400/80">
                            {station.stationCode}
                          </p>
                          <h3 className="mt-1 text-base font-semibold text-slate-50">
                            {station.stationName}
                          </h3>
                          <p className="mt-1 text-[11px] text-slate-400">
                            {station.email}
                          </p>
                        </div>

                        <div className="rounded-full bg-slate-900/50 px-2.5 py-1 text-[12px] text-slate-300 border border-white/10">
                          FY {formatFY(selectedFY)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="mt-4 rounded-2xl bg-slate-950/40 border border-white/5 px-3 py-3 text-xs text-slate-200 space-y-1.5">
                        {hasBudget ? (
                          <>
                            <p className="pt-1 text-[11px] text-cyan-200">
                              Allocation Type:{" "}
                              <span className="font-medium text-slate-100">
                                {station.allocationType || "N/A"}
                              </span>
                            </p>

                            <div className="flex justify-between">
                              <span className="text-slate-400">Allocated</span>
                              <span className="font-medium text-sky-300">
                                ₹{station.totalAllocated}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-slate-400">Utilized</span>
                              <span className="font-medium text-emerald-300">
                                ₹{station.totalUtilized}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-slate-400">Estimated</span>
                              <span className="font-medium text-violet-300">
                                ₹{station.totalEstimated}
                              </span>
                            </div>

                            <p className="pt-1 text-[11px] text-sky-200">
                              Remark:{" "}
                              <span className="font-medium text-slate-100">
                                {station.remark}
                              </span>
                            </p>

                            {/* Receipts */}
                            <p className="text-[11px] text-indigo-200/90 flex items-start justify-between gap-2">
                              <span>
                                Receipts:{" "}
                                <span className="font-medium text-slate-100">
                                  {station.receipts?.length > 0
                                    ? `Available (${station.receipts.length})`
                                    : "Not Uploaded"}
                                </span>
                              </span>

                              {station.receipts?.length > 0 && (
                                <button
                                  onClick={() => {
                                    setReceiptList(station.receipts);
                                    setViewReceiptIndex(0);
                                  }}
                                  className="rounded-full bg-indigo-500/20 px-3 py-1 text-[10px] font-semibold text-indigo-200 border border-indigo-400/30 hover:bg-indigo-500/30 transition"
                                >
                                  View
                                </button>
                              )}
                            </p>

                            <p className="pt-1 text-[11px] text-amber-200 leading-relaxed">
                              Description:{" "}
                              <span className="font-medium text-slate-100">
                                {station.description || "N/A"}
                              </span>
                            </p>
                          </>
                        ) : (
                          <p className="py-3 text-center text-[11px] text-rose-300">
                            ❌ Budget not present for {formatFY(selectedFY)}
                          </p>
                        )}
                      </div>

                      {/* Edit Button */}
                      <button
                        onClick={() => {
                          setEditStation(station);
                          setEditForm({
                            totalAllocated: hasBudget ? station.totalAllocated : "",
                            totalUtilized: hasBudget ? station.totalUtilized : "",
                            totalEstimated: hasBudget ? station.totalEstimated : "",
                            remark: station.remark || "N/A",
                            description: station.description || "",
                            receipt: station.receipt || "",
                            allocationType: station.allocationType || ""
                          });
                          setOpenEditModal(true);
                        }}
                        className="relative mt-auto inline-flex w-full items-center justify-center rounded-2xl 
                bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-slate-50 
                border border-white/20 hover:bg-white/20 hover:border-sky-300/60 transition"
                      >
                        {hasBudget ? "Edit Budget" : "Add Budget"}
                      </button>

                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}



        {/*  TABLE VIEW  */}


        {viewMode === "table" && (
          <div
            className="
      overflow-x-auto 
      rounded-2xl 
      border border-white/10 
      bg-slate-900/40 
      backdrop-blur-xl 
      shadow-[0_8px_30px_rgba(0,0,0,0.45)]
      mt-4
    "
          >



            <table
              className="
        w-full 
        min-w-[850px] 
        text-slate-200 
        text-xs sm:text-sm
        border-collapse
      "
            >
              {/*  HEADER  */}
              <thead
                className="
          bg-white/10 
          text-[10px] sm:text-xs 
          uppercase 
          tracking-wide 
          text-slate-300
        "
              >
                <tr>
                  <th className="px-3 sm:px-5 py-3 text-left">Station</th>
                  <th className="px-3 sm:px-5 py-3 text-left">Allocated</th>
                  <th className="px-3 sm:px-5 py-3 text-left">Utilized</th>
                  <th className="px-3 sm:px-5 py-3 text-left">Estimated</th>

                  {/* ALLOCATION TYPE */}
                  <th className="px-3 sm:px-5 py-3 text-left">Allocation Type</th>

                  {/* DESCRIPTION */}
                  <th className="px-3 sm:px-5 py-3 text-left">Description</th>

                  <th className="px-3 sm:px-5 py-3 text-left">Remark</th>

                  <th className="px-3 sm:px-5 py-3 text-left">Receipts</th>
                  <th className="px-3 sm:px-5 py-3 text-left">Action</th>
                </tr>
              </thead>

              {/*  BODY  */}
              <tbody>
                {stations.map((s) => (
                  <tr
                    key={s._id}
                    className="
              border-t border-white/10 
              hover:bg-white/10 
              transition 
              duration-200
            "
                  >
                    {/* STATION INFO */}
                    <td className="px-3 sm:px-5 py-3">
                      <p className="font-semibold text-[11px] sm:text-sm text-white leading-tight">
                        {s.stationName}
                      </p>
                      <p className="text-[10px] text-slate-400">{s.stationCode}</p>
                      <p className="hidden sm:block text-[11px] text-slate-500">
                        {s.email}
                      </p>
                    </td>

                    {/* ALLOCATED */}
                    <td className="px-3 sm:px-5 py-3 text-sky-300 font-medium whitespace-nowrap">
                      ₹{s.totalAllocated?.toLocaleString("en-IN") || 0}
                    </td>

                    {/* UTILIZED */}
                    <td className="px-3 sm:px-5 py-3 text-emerald-300 font-medium whitespace-nowrap">
                      ₹{s.totalUtilized?.toLocaleString("en-IN") || 0}
                    </td>

                    {/* ESTIMATED */}
                    <td className="px-3 sm:px-5 py-3 text-violet-300 font-medium whitespace-nowrap">
                      ₹{s.totalEstimated?.toLocaleString("en-IN") || 0}
                    </td>

                    {/*  → ALLOCATION TYPE */}
                    <td className="px-3 sm:px-5 py-3 text-amber-300 font-medium whitespace-nowrap">
                      {s.allocationType || "N/A"}
                    </td>


                    {/* DESCRIPTION */}
                    <td className="px-3 sm:px-5 py-3 text-slate-300 text-[10px] sm:text-xs max-w-[220px]">
                      <p
                        className={`break-words ${expandedDesc === s._id ? "" : "line-clamp-2"
                          }`}
                      >
                        {s.description || "N/A"}
                      </p>

                      {s.description && s.description.length > 80 && (
                        <button
                          onClick={() =>
                            setExpandedDesc(
                              expandedDesc === s._id ? null : s._id
                            )
                          }
                          className="mt-1 text-[10px] text-sky-400 hover:text-sky-300 "
                        >
                          {expandedDesc === s._id ? "Show less" : "Show more"}
                        </button>
                      )}
                    </td>




                    {/*  → REMARK COLUMN */}
                    <td className="px-3 sm:px-5 py-3 text-slate-300 text-[10px] sm:text-xs max-w-[180px] truncate">
                      {s.remark || "N/A"}
                    </td>


                    {/* RECEIPTS */}
                    <td className="px-3 sm:px-5 py-3 whitespace-nowrap">
                      {s.receipts?.length > 0 ? (
                        <button
                          onClick={() => {
                            setReceiptList(s.receipts);
                            setViewReceiptIndex(0);
                          }}
                          className="
                    text-sky-300 
                    underline 
                    text-[10px] sm:text-xs
                    hover:text-sky-400
                  "
                        >
                          View ({s.receipts.length})
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[10px]">None</span>
                      )}
                    </td>

                    {/* EDIT BUTTON */}
                    <td className="px-3 sm:px-5 py-3">
                      <button
                        onClick={() => {
                          setEditStation(s);
                          setEditForm({
                            totalAllocated: s.totalAllocated || "",
                            totalUtilized: s.totalUtilized || "",
                            totalEstimated: s.totalEstimated || "",
                            remark: s.remark || "",
                            description: s.description || "",
                            receipt: s.receipt || "",
                            allocationType: s.allocationType || "",
                          });
                          setOpenEditModal(true);
                        }}
                        className="
                  text-[10px] sm:text-xs 
                  px-3 py-1.5 
                  rounded-lg 
                  bg-white/10 
                  border border-white/20
                  hover:bg-white/20 
                  hover:border-sky-300/50
                  transition-all
                  whitespace-nowrap
                "
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}







        {/*  CREATE STATION MODAL */}
        {openModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-3xl border border-white/15 bg-slate-950/60 px-7 py-7 shadow-[0_22px_70px_rgba(15,23,42,0.9)] backdrop-blur-2xl">
              <div className="pointer-events-none absolute inset-x-10 -top-16 h-32 bg-gradient-to-b from-sky-400/40 via-transparent to-transparent blur-3xl" />

              <div className="relative flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-50">
                    Create Station
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Add a new station with its starting financial year.
                  </p>
                </div>
                <button
                  onClick={() => setOpenModal(false)}
                  className="rounded-full bg-white/5 p-1.5 text-slate-300 hover:bg-white/10"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="relative space-y-4">
                <div>
                  <label className="mb-1 block text-xs text-slate-300">
                    Station Name
                  </label>
                  <input
                    type="text"
                    value={formData.stationName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stationName: e.target.value,
                      })
                    }
                    className={baseInputClass}
                    placeholder="Eg. Mumbai International Airport"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-300">
                    Station Code
                  </label>
                  <input
                    type="text"
                    value={formData.stationCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stationCode: e.target.value.toUpperCase(),
                      })
                    }
                    className={baseInputClass}
                    placeholder="Eg. BOMB"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-300">
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                    className={baseInputClass}
                    placeholder="station@airport.com"
                  />
                </div>

                <div className="relative">
                  <label className="mb-1 block text-xs text-slate-300">
                    Password
                  </label>

                  <input
                    type={showPassword ? "text" : "password"}   // ✅ toggle type
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        password: e.target.value,
                      })
                    }
                    className={`${baseInputClass} pr-10`}        // ✅ space for icon
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                  />

                  {/* 👁️ Eye Icon */}
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="
      absolute
      right-4
      top-8      
      cursor-pointer
      text-slate-400
      hover:text-slate-200
      text-xl
      transition
    "
                  >
                    {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </span>
                </div>


                <div>
                  <label className="mb-1 block text-xs text-slate-300">
                    Financial Year
                  </label>
                  <select
                    value={formData.financialYear}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        financialYear: Number(e.target.value),
                      })
                    }
                    className={`${baseInputClass} bg-slate-900/60`}
                  >
                    <option
                      value={getCurrentFinancialYear()}
                      className="bg-slate-900"
                    >
                      {formatFY(getCurrentFinancialYear())} (Current)
                    </option>
                    <option value={2024} className="bg-slate-900">
                      2024-2025
                    </option>
                    <option value={2023} className="bg-slate-900">
                      2023-2024
                    </option>
                  </select>
                </div>

                <div className="mt-3 flex gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-2xl bg-gradient-to-r from-blue-500 to-sky-400 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/40 hover:shadow-blue-400/70 hover:scale-[1.01] active:scale-[0.99] transition"
                  >
                    {loading ? "Creating…" : "Create Station"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenModal(false)}
                    className="flex-1 rounded-2xl border border-white/15 bg-white/5 py-2.5 text-sm font-medium text-slate-100 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}


        {/*  EDIT MODAL */}
        {openEditModal && (
          <div className="fixed  inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-[90%] md:w-[70%]  rounded-3xl border border-white/15 bg-slate-950/60 px-7 py-7 shadow-[0_22px_70px_rgba(15,23,42,0.9)] backdrop-blur-2xl">
              <div className="pointer-events-none absolute inset-x-10 -top-16 h-32 bg-gradient-to-b from-emerald-400/40 via-transparent to-transparent blur-3xl" />

              <div className="relative flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-50">
                    Budget · {editStation?.stationCode}
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    {editStation?.stationName} · {formatFY(selectedFY)}
                  </p>
                </div>
                <button
                  onClick={() => setOpenEditModal(false)}
                  className="rounded-full bg-white/5 p-1.5 text-slate-300 hover:bg-white/10"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="relative flex flex-col gap-y-8">

                {/*  AMOUNT FIELDS → RESPONSIVE GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                  {/* ALLOCATED */}
                  <div>
                    <label className="mb-1 block text-xs text-slate-300">
                      Total Allocated (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e") e.preventDefault();
                      }}
                      value={editForm.totalAllocated}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          totalAllocated: e.target.value,
                        })
                      }
                      className={baseInputClass}
                      placeholder="0"
                    />
                  </div>

                  {/* UTILIZED */}
                  <div>
                    <label className="mb-1 block text-xs text-slate-300">
                      Total Utilized (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.totalUtilized}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        const allocated = Number(editForm.totalAllocated);

                        setEditForm({ ...editForm, totalUtilized: value });

                        if (value > allocated) {
                          setUtilizedError("Total Utilized cannot exceed Total Allocated");
                        } else {
                          setUtilizedError("");
                        }
                      }}
                      className={`${baseInputClass} ${utilizedError ? "border-red-500 focus:ring-red-400/40" : ""
                        }`}
                    />
                    {utilizedError && (
                      <p className="mt-1 text-xs text-red-400">
                        {utilizedError}
                      </p>
                    )}
                  </div>

                  {/* ESTIMATED */}
                  <div>
                    <label className="mb-1 block text-xs text-slate-300">
                      Total Estimated (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e") e.preventDefault();
                      }}
                      value={editForm.totalEstimated}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          totalEstimated: e.target.value,
                        })
                      }
                      className={baseInputClass}
                      placeholder="0"
                    />
                  </div>

                  {/* REMARK */}
                  {/* REMARK */}
                  <div>
                    <label className="mb-1 block text-xs text-slate-300">
                      Remark
                    </label>

                    <input
                      value={editForm.remark}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          remark: e.target.value,
                        })
                      }
                      className="
      w-full px-4 py-3
      rounded-2xl
      bg-slate-900/80
      border border-white/20
      text-sm text-slate-200
      focus:border-sky-400/60
      focus:ring-2 focus:ring-sky-400/30
      transition
    "
                      placeholder="Add remark..."
                    />
                  </div>


                  {/*  ALLOCATION TYPE */}
                  <div className="relative">
                    <label className="mb-1 block text-xs text-slate-300">
                      Allocation Type
                    </label>

                    {/*  SELECT */}
                    <select
                      value={editForm.allocationType}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          allocationType: e.target.value,
                        })
                      }
                      className={`${baseInputClass}
      bg-slate-900/60 backdrop-blur-xl cursor-pointer rounded-xl
      pr-10
      appearance-none       /*  REMOVES DEFAULT ARROW */
      hover:border-sky-400/60 hover:bg-slate-900/80
      focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40
      transition`}
                    >
                      <option value="" className="bg-slate-900 text-slate-400">
                        Select Allocation Type
                      </option>
                      <option value="Token" className="bg-slate-900">
                        Token
                      </option>
                      <option value="Partial" className="bg-slate-900">
                        Partial
                      </option>
                      <option value="Full" className="bg-slate-900">
                        Full
                      </option>
                    </select>

                    {/*  CUSTOM DOWN ARROW */}
                    <div className="pointer-events-none absolute right-3 top-11 -translate-y-1/2 text-slate-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>


                </div>

                {/*  DESCRIPTION */}
                <div>
                  <label className="mb-1 block text-xs text-slate-300">
                    Description
                  </label>

                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/15 
    text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none 
    focus:ring-2 focus:ring-blue-400/70 resize-none"
                    placeholder="Optional description about this budget..."
                  />
                </div>

                {/*  UPLOAD (FULL WIDTH) */}
                <div className="relative w-full">

                  <label className="relative flex flex-col items-center justify-center w-full h-32 sm:h-36 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer bg-white/5 hover:bg-white/10 transition group overflow-hidden">

                    {editForm.receipt ? (
                      <>
                        <img
                          src={URL.createObjectURL(editForm.receipt)}
                          alt="Preview"
                          className="absolute inset-0 h-full w-full object-cover rounded-2xl"
                        />
                        <div className="absolute inset-0 bg-black/40"></div>
                        <p className="relative z-10 text-xs text-slate-200 font-semibold">
                          Click to change image
                        </p>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-7 h-7 mb-1 text-slate-300 group-hover:text-sky-300 transition"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 16v-8m0 0l-3 3m3-3l3 3M4 16.5a4.5 4.5 0 010-9h.75a5.25 5.25 0 0110.5 0H20a4 4 0 010 8h-8"
                          />
                        </svg>

                        <p className="text-xs text-slate-300 text-center">
                          <span className="font-semibold text-slate-100">Click to upload</span> or drag & drop
                          <br />
                          PNG, JPG (max 10MB)
                        </p>
                      </>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        setEditForm({
                          ...editForm,
                          receipt: e.target.files[0],
                        });
                        setUploadProgress(0);
                      }}
                    />
                  </label>

                  {/*  FILE NAME + REMOVE */}
                  {editForm.receipt && (
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="text-[11px] text-emerald-300 truncate max-w-[70%]">
                        {editForm.receipt.name}
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setEditForm({ ...editForm, receipt: null });
                          setUploadProgress(0);
                        }}
                        className="rounded-full bg-rose-500/20 px-3 py-1 text-[10px] font-semibold text-rose-300 border border-rose-400/30 hover:bg-rose-500/30 transition"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/*  PROGRESS BAR */}
                  {uploadProgress > 0 && (
                    <>
                      <div className="mt-2 w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>

                      <p className="mt-1 text-[10px] text-slate-300 text-center">
                        Uploading… {uploadProgress}%
                      </p>
                    </>
                  )}
                </div>

                {/*  SAVE BUTTON */}
                <button className="mt-4 w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-sky-400 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-400/40 hover:shadow-emerald-300/60 hover:scale-[1.01] active:scale-[0.99] transition">
                  Save Budget
                </button>

              </form>


            </div>
          </div>
        )
        }


        {/*  RECEIPT VIEW MODAL */}
        {
          receiptList.length > 0 && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="relative w-[95%] max-w-2xl rounded-3xl border border-white/15 bg-slate-950/80 p-5 shadow-[0_22px_70px_rgba(15,23,42,0.9)]">

                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-100">
                    Receipt {viewReceiptIndex + 1} of {receiptList.length}
                  </h3>

                  <button
                    onClick={() => {
                      setReceiptList([]);
                      setViewReceiptIndex(0);
                    }}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200 hover:bg-white/20"
                  >
                    ✕
                  </button>
                </div>

                {/*  IMAGE PREVIEW */}
                <div className="flex justify-center mb-4">
                  <img
                    src={receiptList[viewReceiptIndex]}
                    alt="Receipt"
                    className="max-h-[70vh] rounded-xl object-contain border border-white/10"
                  />
                </div>

                {/*   NEXT + OPEN + DOWNLOAD */}
                <div className="flex flex-wrap items-center justify-center gap-3">

                  {/* PREVIOUS */}
                  <button
                    disabled={viewReceiptIndex === 0}
                    onClick={() => setViewReceiptIndex((prev) => prev - 1)}
                    className="rounded-full bg-white/10 px-4 py-1.5 text-xs text-slate-200 disabled:opacity-40"
                  >
                    ◀ Prev
                  </button>

                  {/* NEXT */}
                  <button
                    disabled={viewReceiptIndex === receiptList.length - 1}
                    onClick={() => setViewReceiptIndex((prev) => prev + 1)}
                    className="rounded-full bg-white/10 px-4 py-1.5 text-xs text-slate-200 disabled:opacity-40"
                  >
                    Next ▶
                  </button>

                  {/* OPEN */}
                  <a
                    href={receiptList[viewReceiptIndex]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-sky-500/20 px-4 py-1.5 text-xs font-semibold text-sky-300 border border-sky-400/30 hover:bg-sky-500/30 transition"
                  >
                    Open in New Tab
                  </a>

                  {/* DOWNLOAD INFO */}

                  {/*  DESKTOP ONLY */}
                  <p className="hidden sm:block text-xs text-slate-300 mt-2 text-center leading-relaxed">
                    Right click on the image and select{" "}
                    <span className="font-semibold text-slate-100">"Save Image As"</span>
                  </p>

                  {/*  MOBILE ONLY */}
                  <p className="block sm:hidden text-xs text-slate-300 mt-2 text-center leading-relaxed">

                    <span className="font-semibold text-slate-100">
                      Touch & hold the image
                    </span>{" "}
                    to get the download option.
                  </p>


                </div>
              </div>
            </div>
          )
        }


        <DeleteStationModal
          open={openDeleteModal}
          onClose={() => setOpenDeleteModal(false)}
          stations={stations}
          selectedFY={selectedFY}
          onDeleteStation={handleDeleteStation}
          onDeleteYear={handleDeleteYear}
        />






      </div >
    </div >
  );
};

export default Stations;










