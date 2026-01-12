import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getSupervisorBudgetByYear,
  updateSupervisorYearlyBudget,
} from "../../services/operations/stationsOperations.js";


const formatFY = (year) => `${year}-${year + 1}`;


const formatINR = (num) =>
  Number(num || 0).toLocaleString("en-IN");

const BudgetSummary = ({ stations, selectedFY, onAdminBudgetChange }) => {

  const dispatch = useDispatch();

  
  const [adminBudget, setAdminBudget] = useState(0);
  const [originalBudget, setOriginalBudget] = useState(0);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useSelector((state) => state.auth);



  
  useEffect(() => {
    const fetchBudget = async () => {
      const res = await dispatch(getSupervisorBudgetByYear(selectedFY));
 

      const value = res?.totalAllocatedToMe || 0;

      setAdminBudget(value);
      setOriginalBudget(value);
      setEditing(false);

    
      if (onAdminBudgetChange) {
        onAdminBudgetChange(value);
      }
    };

    


    fetchBudget();
  }, [selectedFY, dispatch]);


  
  const totalAllocated = stations.reduce(
    (sum, s) => sum + Number(s.totalAllocated || 0),
    0
  );

  const totalUtilized = stations.reduce(
    (sum, s) => sum + Number(s.totalUtilized || 0),
    0
  );

  const utilizationPercent =
    totalAllocated > 0
      ? ((totalUtilized / totalAllocated) * 100).toFixed(1)
      : 0;

  const remainingBudget = adminBudget - totalAllocated;


  const handleSave = async () => {
    if (Number(adminBudget) === Number(originalBudget)) {
      setEditing(false);
      return;
    }

    const confirm = window.confirm(
      `Confirm updating budget to ₹${formatINR(adminBudget)}?`
    );

    if (!confirm) return;

    setSaving(true);

    await dispatch(
      updateSupervisorYearlyBudget(selectedFY, Number(adminBudget))
    );

   
    if (onAdminBudgetChange) {
      onAdminBudgetChange(Number(adminBudget));
    }

    setOriginalBudget(adminBudget);
    setSaving(false);
    setEditing(false);


  };

  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000); 

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mb-8 rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-xl overflow-hidden">

      {/* ================= HEADER ================= */}
      <div className="px-5 py-4 border-b border-white/10">
        <h2 className="text-sm font-semibold text-slate-100">
          Budget Utilization Summary : {formatFY(selectedFY)}

          <span
            className="
    inline-flex
    items-center
    gap-1

    font-semibold
    text-amber-400
    drop-shadow-sm

    bg-amber-400/10
    rounded-full

    /* RESPONSIVE TEXT */
    text-[10px] sm:text-xs md:text-sm

    /* RESPONSIVE PADDING */
    px-2 py-0.5
    sm:px-2.5 sm:py-0.5
    md:px-3 md:py-1

    /* LETTER SPACING */
    tracking-wide
    whitespace-nowrap
  "
          >
            <span className="opacity-80">Till</span>

            <span>
              {now.toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </span>




        </h2>
      </div>

      
      <table className="w-full text-xs sm:text-sm text-slate-200">
        <tbody>

          {/* ADMIN BUDGET */}
          <tr className="border-b border-white/10">
            {/* LABEL */}
            <td className="px-4 py-3 text-slate-300">
              Total Budget Allocated to You
            </td>

           
            <td
              colSpan={2}
              className="px-4 py-3"
            >
              <div className="flex items-center justify-end gap-3">

                {/* EDIT / SAVE ICON */}
                {editing ? (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="text-emerald-300 hover:text-emerald-400 transition"
                    title="Save"
                  >
                    ✔
                  </button>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className={`transition-transform duration-300 ${Number(adminBudget) !== Number(originalBudget)
                      ? "text-amber-400 translate-x-1"
                      : "text-slate-400 hover:text-sky-300"
                      }`}
                    title="Edit"
                  >
                    ✏️
                  </button>
                )}

                {/* AMOUNT */}
                {editing ? (
                  <input
                    type="number"
                    min="0"
                    value={adminBudget}
                    onChange={(e) => setAdminBudget(e.target.value)}
                    className="w-32 px-2 py-1 rounded-lg bg-slate-900 border border-white/20 text-right text-cyan-300"
                  />
                ) : (
                  <span className="font-semibold text-cyan-300">
                    ₹ {formatINR(adminBudget)}
                  </span>
                )}

              </div>
            </td>
          </tr>

          {/* STATIONS ALLOCATED */}
          <tr className="border-b border-white/10">
            <td className="px-4 py-3 text-slate-300">
              Total Budget Allocated to Stations
            </td>
            <td colSpan={2} className="px-4 py-3 text-right font-semibold text-sky-300">
              ₹ {formatINR(totalAllocated)}
            </td>
          </tr>

          {/* UTILIZED */}
          <tr className="border-b border-white/10">
            <td className="px-4 py-3 text-slate-300">
              Stations have Utilized till date
            </td>
            <td colSpan={2} className="px-4 py-3 text-right font-semibold text-emerald-300">
              ₹ {formatINR(totalUtilized)}
            </td>
          </tr>

          {/* UTILIZATION */}
          <tr>
            <td className="px-4 py-3 text-slate-300">
              Budget Utilization by stations (%)
            </td>
            <td colSpan={2} className="px-4 py-3 text-right font-semibold text-violet-300">
              {utilizationPercent} %
            </td>
          </tr>

          {/* REMAINING */}
          <tr className="border-b border-white/10">
            <td className="px-4 py-3 text-slate-300">
              Your Remaining Budget
            </td>
            <td
              colSpan={2}
              className={`px-4 py-3 text-right font-semibold ${remainingBudget < 0 ? "text-rose-400" : "text-lime-300"
                }`}
            >
              ₹ {formatINR(remainingBudget)}
            </td>
          </tr>



        </tbody>
      </table>
    </div>
  );
};

export default BudgetSummary;
