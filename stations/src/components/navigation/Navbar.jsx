import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logoutStation } from "../../services/operations/stationsOperations.js";


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);



  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutStation(navigate));
    setIsOpen(false);
  };

  return (
    <nav className="shadow-md fixed w-full top-0 z-50 bg-[#050A13] text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">

          
          <Link to="/" className="text-4xl font-bold text-blue-600">
            Aero Fund
          </Link>

          {/*  Desktop Menu */}
          {user && (
            <div className="hidden md:flex items-center space-x-8 font-medium">
              <Link
                to="/dashboard"
                className="hover:text-blue-600 transition"
              >
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          )}

          {/*  Mobile Hamburger */}
          {user && (
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-white focus:outline-none"
              >
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  {isOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/*  Mobile Menu */}
      {user && isOpen && (
        <div className="md:hidden bg-[#050A13] shadow-lg">
          <div className="flex flex-col space-y-4 px-6 py-4 font-medium">
            <Link to="/stations" onClick={() => setIsOpen(false)}>
              Stations
            </Link>

            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
