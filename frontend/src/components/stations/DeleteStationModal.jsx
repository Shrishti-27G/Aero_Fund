import React from "react";
import DeleteStationControl from "./DeleteStationControl";

const DeleteStationModal = ({
  open,
  onClose,
  stations,
  selectedFY,
  onDeleteStation,
  onDeleteYear,
}) => {
  if (!open) return null;

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/60
        backdrop-blur-md
      "
    >
      <div
        className="
          relative
          w-[92%] max-w-lg
          rounded-3xl
          border border-white/15
          bg-white/5
          backdrop-blur-2xl
          p-6
          shadow-[0_30px_90px_rgba(15,23,42,0.85)]
        "
      >
      
        <div
          className="
            pointer-events-none
            absolute inset-x-10 -top-20 h-32
            bg-gradient-to-b
            from-white/20
            via-transparent
            to-transparent
            blur-3xl
            opacity-60
          "
        />

        {/* HEADER */}
        <div className="relative flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-100">
            Manage Deletions
          </h2>

          <button
            onClick={onClose}
            className="
              rounded-full
              bg-white/10
              px-3 py-1
              text-xs
              text-slate-200
              border border-white/15
              hover:bg-white/20
              transition
            "
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <DeleteStationControl
          stations={stations}
          selectedFY={selectedFY}
          onDeleteStation={onDeleteStation}
          onDeleteYear={onDeleteYear}
        />

        {/* FOOTER */}
        <p className="mt-5 text-[11px] text-slate-400 text-center leading-relaxed">
          Deleted stations or financial year records cannot be recovered.
        </p>
      </div>
    </div>
  );
};

export default DeleteStationModal;
