import React from "react";

const formatFY = (year) => `${year}-${year + 1}`;


const formatINR = (num) => {
  if (num === null || num === undefined) return "0";

  
  if (num > 1e15) return num.toExponential(2);

  return Number(num).toLocaleString("en-IN");
};

const FinancialYearDetail = ({ yearData, selectedFY }) => {
  if (!yearData) {
    return (
      <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-6 text-center text-rose-300">
        ❌ No data available for {formatFY(selectedFY)}
      </div>
    );
  }

  const utilizationPercent =
    yearData.totalAllocated > 0
      ? ((yearData.totalUtilized / yearData.totalAllocated) * 100).toFixed(1)
      : 0;

  return (
    <div
      className="
        w-full
        rounded-2xl sm:rounded-3xl
        border border-white/10
        bg-slate-950/70
        shadow-[0_15px_40px_rgba(15,23,42,0.6)]
        backdrop-blur-2xl
        overflow-hidden
        mb-10
      "
    >
      {/* TITLE */}
      <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-white/10">
        <h2
          className="
            text-xs sm:text-sm md:text-base
            font-semibold
            text-slate-50
            tracking-wide
          "
        >
          Financial Year Detail : {formatFY(selectedFY)}
        </h2>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table
          className="
            w-full border-collapse
            text-[11px] sm:text-xs md:text-sm
            text-slate-200
          "
        >
          <tbody>
            <tr className="border-b border-white/10">
              <td className="px-4 py-3 font-medium text-slate-300">
                Total Allocated
              </td>
              <td className="px-4 py-3 font-semibold text-sky-300 text-right">
                ₹{formatINR(yearData.totalAllocated)}
              </td>
            </tr>

            <tr className="border-b border-white/10">
              <td className="px-4 py-3 font-medium text-slate-300">
                Total Utilized
              </td>
              <td className="px-4 py-3 font-semibold text-emerald-300 text-right">
                ₹{formatINR(yearData.totalUtilized)}
              </td>
            </tr>

            <tr className="border-b border-white/10">
              <td className="px-4 py-3 font-medium text-slate-300">
                Total Estimated
              </td>
              <td className="px-4 py-3 font-semibold text-amber-300 text-right">
                ₹{formatINR(yearData.totalEstimated)}
              </td>
            </tr>

            <tr className="border-b border-white/10">
              <td className="px-4 py-3 font-medium text-slate-300">
                Utilization %
              </td>
              <td className="px-4 py-3 font-semibold text-violet-300 text-right">
                {utilizationPercent} %
              </td>
            </tr>

            <tr className="border-b border-white/10">
              <td className="px-4 py-3 font-medium text-slate-300">
                Remark
              </td>
              <td className="px-4 py-3 text-right">{yearData.remark}</td>
            </tr>
            
            {/* NEW ROW — ALLOCATION TYPE */}
            <tr className="border-b border-white/10">
              <td className="px-4 py-3 font-medium text-slate-300">
                Allocation Type
              </td>
              <td className="px-4 py-3 font-semibold text-yellow-300 text-right">
                {yearData.allocationType || "N/A"}
              </td>
            </tr>

            <tr>
              <td className="px-4 py-3 font-medium text-slate-300">
                Description
              </td>
              <td className="px-4 py-3 text-right">
                {yearData.description || "N/A"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinancialYearDetail;
