import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  getStationYearData,
  updateRemark
} from "../../services/operations/stationsOperations.js";
import FinancialYearDetail from "./FinancialYearDetail";

// 🔹 FY Format
const formatFY = (year) => `${year}-${year + 1}`;

// 🔹 Current FY
const getCurrentFY = () => {
  const t = new Date();
  return t.getMonth() + 1 >= 4 ? t.getFullYear() : t.getFullYear() - 1;
};

// 🔹 INR formatter
const formatNumber = (num) => {
  if (!num || isNaN(num)) return "0";
  const abs = Math.abs(num);
  if (abs >= 1e7) return (num / 1e7).toFixed(2) + " Cr";
  if (abs >= 1e5) return (num / 1e5).toFixed(2) + " Lakh";
  if (abs >= 1e3) return (num / 1e3).toFixed(1) + "K";
  return num.toLocaleString("en-IN");
};

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const station = user;

  const [selectedFY, setSelectedFY] = useState(getCurrentFY());
  const [yearData, setYearData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 📝 EDIT REMARK MODAL
  const [openRemarkModal, setOpenRemarkModal] = useState(false);
  const [newRemark, setNewRemark] = useState("");

  // 📸 RECEIPT VIEW
  const [receiptList, setReceiptList] = useState([]);
  const [viewReceiptIndex, setViewReceiptIndex] = useState(0);

  // ==================================================
  //                   FETCH FY DATA
  // ==================================================
  useEffect(() => {
    if (!station) return;

    const fetchData = async () => {
      setLoading(true);

      try {
        const res = await getStationYearData(station._id, selectedFY);
        if (res?.station?.yearlyData?.length > 0) {
          setYearData(res.station.yearlyData[0]);
        } else setYearData(null);
      } catch {
        setYearData(null);
      }

      setLoading(false);
    };

    fetchData();
  }, [station, selectedFY]);

  if (!station) return <div className="p-5 text-red-500">No station found</div>;

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">

      {/* HEADER */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome, <span className="text-sky-400">{station.stationName}</span>
          </h1>
          <p className="text-slate-400">Station Dashboard Overview</p>
        </div>

        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/15 px-3 py-2 rounded-2xl">
          <span className="text-xs text-slate-300/80">Financial Year</span>
          <select
            value={selectedFY}
            onChange={(e) => setSelectedFY(Number(e.target.value))}
            className="bg-transparent text-sm px-2 text-slate-50 border-none"
          >
            {[getCurrentFY(), 2024, 2023].map((fy) => (
              <option key={fy} value={fy} className="bg-slate-900">
                {formatFY(fy)} {fy === getCurrentFY() ? "(Current)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/*  STATION INFO  */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">

        <div className="rounded-3xl p-6 bg-white/10 border border-white/20">
          <h2 className="text-xl font-semibold mb-4">Station Information</h2>
          <p><span className="font-semibold">Name:</span> {station.stationName}</p>
          <p><span className="font-semibold">Code:</span> {station.stationCode}</p>
          <p><span className="font-semibold">Email:</span> {station.email}</p>
        </div>

        {/* FY SUMMARY */}
        <div className="rounded-3xl p-6 bg-white/10 border border-white/20">
          <h2 className="text-xl font-semibold mb-4">Financial Year Summary</h2>

          {loading ? (
            <p className="text-blue-300">Loading…</p>
          ) : yearData ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              <div className="p-4 text-center rounded-xl bg-white/5 border border-white/10">
                <p className="text-lg font-bold text-sky-400">
                  ₹{formatNumber(yearData.totalAllocated)}
                </p>
                <p className="text-xs">Allocated</p>
              </div>

              <div className="p-4 text-center rounded-xl bg-white/5 border border-white/10">
                <p className="text-lg font-bold text-emerald-400">
                  ₹{formatNumber(yearData.totalUtilized)}
                </p>
                <p className="text-xs">Utilized</p>
              </div>

              <div className="p-4 text-center rounded-xl bg-white/5 border border-white/10">
                <p className="text-lg font-bold text-violet-400">
                  ₹{formatNumber(yearData.totalEstimated)}
                </p>
                <p className="text-xs">Estimated</p>
              </div>

            </div>
          ) : (
            <p className="text-red-300">No data</p>
          )}
        </div>
      </div>

      {/*  DETAILS  */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">

        {/* LEFT TITLE */}
        <h2 className="text-2xl font-bold text-center sm:text-left">
          Financial Year Details
        </h2>

        {/* RIGHT BUTTON GROUP */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">

          {/* EDIT REMARK */}
          {yearData && (
            <button
              onClick={() => {
                setNewRemark(yearData.remark || "");
                setOpenRemarkModal(true);
              }}
              className="
          px-4 py-2 
          rounded-xl 
          bg-sky-500/20 
          border border-sky-400/20 
          text-sky-300 
          text-sm font-medium
          hover:bg-sky-500/30 
          transition
        "
            >
              Edit Remark
            </button>
          )}

          {/* VIEW RECEIPTS */}
          {yearData?.receipts?.length > 0 && (
            <button
              onClick={() => {
                setReceiptList(yearData.receipts);
                setViewReceiptIndex(0);
              }}
              className="
          px-4 py-2 
          rounded-xl 
          bg-indigo-500/20 
          border border-indigo-400/20 
          text-indigo-300 
          text-sm font-medium
          hover:bg-indigo-500/30
          transition
        "
            >
              View Receipts ({yearData.receipts.length})
            </button>
          )}

        </div>
      </div>


      {loading ? (
        <p className="text-blue-300">Loading…</p>
      ) : yearData ? (
        <FinancialYearDetail yearData={yearData} selectedFY={selectedFY} />
      ) : (
        <p className="text-red-300">No details</p>
      )}

      {/*                     EDIT REMARK MODAL                 */}

      {openRemarkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="w-[90%] max-w-md bg-slate-900/80 p-6 rounded-2xl border border-white/10">

            <h3 className="text-lg font-semibold mb-2 text-slate-100">
              Edit Remark – FY {formatFY(selectedFY)}
            </h3>

            <textarea
              rows={3}
              value={newRemark}
              onChange={(e) => setNewRemark(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-slate-100"
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setOpenRemarkModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 border border-white/20"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  const res = await updateRemark(
                    station._id,
                    selectedFY,
                    newRemark
                  );

                  if (res?.success) {
                    setYearData((d) => ({ ...d, remark: newRemark }));
                    setOpenRemarkModal(false);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-sky-500 text-white"
              >
                Save
              </button>

            </div>

          </div>
        </div>
      )}

      {/*                     RECEIPT VIEWER                   */}

      {receiptList.length > 0 && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="w-[90%] max-w-2xl bg-slate-950/80 p-6 rounded-3xl border border-white/10">

            <div className="flex justify-between mb-4">
              <p className="text-sm text-slate-200">
                Receipt {viewReceiptIndex + 1} / {receiptList.length}
              </p>
              <button
                onClick={() => setReceiptList([])}
                className="px-3 py-1 bg-white/10 rounded-xl text-xs"
              >
                ✕
              </button>
            </div>

            <img
              src={receiptList[viewReceiptIndex]}
              className="max-h-[70vh] mx-auto rounded-xl border border-white/10 object-contain"
            />

            <div className="flex justify-center gap-3 mt-4 flex-wrap">
              <button
                disabled={viewReceiptIndex === 0}
                onClick={() => setViewReceiptIndex((v) => v - 1)}
                className="px-4 py-1.5 text-xs bg-white/10 rounded-xl disabled:opacity-40"
              >
                ◀ Prev
              </button>

              <button
                disabled={viewReceiptIndex === receiptList.length - 1}
                onClick={() => setViewReceiptIndex((v) => v + 1)}
                className="px-4 py-1.5 text-xs bg-white/10 rounded-xl disabled:opacity-40"
              >
                Next ▶
              </button>

              <a
                href={receiptList[viewReceiptIndex]}
                target="_blank"
                className="px-4 py-1.5 text-xs bg-sky-500/20 border border-sky-400/30 rounded-xl"
              >
                Open in New Tab
              </a>
            </div>

            <p className="text-xs text-slate-300 text-center mt-3">
              Mobile: long-press to download | Desktop: right-click → Save Image As
            </p>

          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
