import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Player } from "@lottiefiles/react-lottie-player";
import planeAnimation from "../assets/animations/airplane.json";
import { useSelector } from "react-redux";


const bubbles = [
  { size: 250, x: "5%", y: "60%", duration: 15 },
  { size: 300, x: "80%", y: "12%", duration: 18 },
  { size: 200, x: "50%", y: "78%", duration: 16 },
  { size: 270, x: "25%", y: "25%", duration: 20 },
];




const Landing = () => {
  const { user } = useSelector((state) => state.auth);
  return (
    <section className="relative w-full h-screen bg-[#020B16] overflow-hidden flex justify-center items-center">

      {bubbles.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-[#00D5FF15] blur-3xl"
          style={{
            width: b.size,
            height: b.size,
            left: b.x,
            top: b.y,
          }}
          animate={{ y: ["0%", "-12%", "0%"] }}
          transition={{
            duration: b.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        className="absolute pointer-events-none opacity-90"
        initial={{ x: "-35%", y: "45%" }}
        animate={{ x: "120%", y: "-35%" }}
        transition={{ duration: 5, ease: "easeInOut" }}
      >
        <Player
          src={planeAnimation}
          autoplay
          loop
          speed={1}
          className="w-[250px] md:w-[300px]"
        />
      </motion.div>

      {/* HERO CONTENT */}
      <div className="relative z-20 text-center px-6">
        <motion.h1
          initial={{ opacity: 0, x: -200 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="text-7xl md:text-8xl font-extrabold text-white tracking-tight"
        >
          AeroFund
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.7 }}
          className="text-blue-200 text-xl max-w-xl mx-auto mt-5"
        >
          Transforming Airport Finances for Takeoff
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          <Link
            to={user ? "/stations" : "/home"} // ✅ USER LOGGED IN → STATIONS
            className="inline-block mt-10 px-14 py-4 rounded-full font-semibold
  bg-gradient-to-r from-[#007AFF] to-[#00CFFF] text-white text-lg
  hover:scale-[1.10] hover:shadow-[0_0_50px_#00CFFF90] 
  transition-all duration-500"
          >
            Get Started
          </Link>

        </motion.div>
      </div>

     
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,135,255,0.18),transparent_75%)] pointer-events-none"></div>
    </section>
  );
};

export default Landing;




