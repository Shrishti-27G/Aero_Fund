import React, { useState, useMemo } from "react";

const DeleteStationControl = ({
  stations = [],
  selectedFY,
  onDeleteStation,
  onDeleteYear,
}) => {
  const [stationId, setStationId] = useState("");
  const [mode, setMode] = useState("");
  const [year, setYear] = useState(selectedFY);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedStation = useMemo(
    () => stations.find((s) => s._id === stationId),
    [stations, stationId]
  );

  const requiredConfirmText =
    mode === "station"
      ? selectedStation?.stationCode || ""
      : `${year}`;

  const canDelete =
    stationId &&
    mode &&
    confirmText === requiredConfirmText &&
    !loading;

  const handleDelete = async () => {
    if (!canDelete) return;

    setLoading(true);
    try {
      mode === "station"
        ? await onDeleteStation(stationId)
        : await onDeleteYear(stationId, year);
    } finally {
      setLoading(false);
      setConfirmText("");
      setMode("");
      setStationId("");
    }
  };

  return (
    <div
      className="
        rounded-3xl
        border border-white/15
        bg-white/5
        backdrop-blur-xl
        p-5
        shadow-lg shadow-black/30
      "
    >
      {/* HEADER */}
      <h3 className="text-sm font-semibold text-slate-100 mb-4">
        Delete Control
      </h3>

      {/* STATION SELECT */}
      <select
        value={stationId}
        onChange={(e) => {
          setStationId(e.target.value);
          setMode("");
          setConfirmText("");
        }}
        className="
          w-full mb-3
          px-4 py-2 rounded-xl
          bg-slate-900/70
          border border-white/15
          text-slate-100 text-sm
          focus:outline-none focus:ring-2 focus:ring-sky-400/40
        "
      >
        <option value="">Select Station</option>
        {stations.map((s) => (
          <option key={s._id} value={s._id}>
            {s.stationName} ({s.stationCode})
          </option>
        ))}
      </select>

      {/* MODE */}
      <select
        value={mode}
        onChange={(e) => {
          setMode(e.target.value);
          setConfirmText("");
        }}
        disabled={!stationId}
        className="
          w-full mb-3
          px-4 py-2 rounded-xl
          bg-slate-900/70
          border border-white/15
          text-slate-100 text-sm
          focus:outline-none focus:ring-2 focus:ring-sky-400/40
          disabled:opacity-40
        "
      >
        <option value="">Select Delete Type</option>
        <option value="station">Delete Entire Station</option>
        <option value="year">Delete Financial Year</option>
      </select>

      {/* YEAR */}
      {mode === "year" && selectedStation?.yearlyData?.length > 0 && (
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="
            w-full mb-3
            px-4 py-2 rounded-xl
            bg-slate-900/70
            border border-white/15
            text-slate-100 text-sm
            focus:outline-none focus:ring-2 focus:ring-sky-400/40
          "
        >
          {selectedStation.yearlyData.map((y) => (
            <option key={y.year} value={y.year}>
              FY {y.year}-{y.year + 1}
            </option>
          ))}
        </select>
      )}

      {/* CONFIRM INPUT */}
      {mode && (
        <div className="mb-4">
          <p className="text-[11px] text-slate-400 mb-1">
            Type{" "}
            <span className="font-semibold text-slate-200">
              {requiredConfirmText}
            </span>{" "}
            to confirm
          </p>

          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Confirmation text"
            className="
              w-full px-4 py-2 rounded-xl
              bg-slate-900/70
              border border-white/15
              text-slate-100 text-sm
              focus:outline-none focus:ring-2 focus:ring-sky-400/40
            "
          />
        </div>
      )}

      {/* DELETE BUTTON */}
      <button
        disabled={!canDelete}
        onClick={handleDelete}
        className="
          w-full rounded-2xl
          bg-white/10
          border border-white/20
          py-2.5
          text-sm font-semibold
          text-slate-100
          hover:bg-white/20
          transition
          disabled:opacity-40
          active:scale-[0.98]
        "
      >
        {loading ? "Deleting…" : "Confirm Delete"}
      </button>
    </div>
  );
};

export default DeleteStationControl;
