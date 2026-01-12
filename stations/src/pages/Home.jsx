import { useState } from "react";
import { motion } from "framer-motion";
import AuthModal from "../components/authComponent/AuthModal";

const Home = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <section className="relative w-full min-h-screen bg-[#050A13] text-white flex items-center justify-center overflow-hidden">

   
      <motion.div
        className="z-10 text-center px-6 max-w-xl will-change-transform"
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
        }}
      >
       
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          className="text-5xl md:text-6xl font-bold"
        >
          AeroFund Portal
        </motion.h1>

       
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
          className="flex gap-6 justify-center mt-10"
        >
          <button
            onClick={() => setShowModal(true)}
            className="px-8 py-3 rounded-full font-semibold border border-[#0090FF]
            transition-all duration-300 hover:scale-105 hover:bg-[#0090FF]/10"
          >
            Login 
          </button>
        </motion.div>
      </motion.div>

      
      <AuthModal showModal={showModal} setShowModal={setShowModal} />

    </section>
  );
};

export default Home;
