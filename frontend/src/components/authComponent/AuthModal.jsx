import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import { useState } from "react";

const AuthModal = ({ showModal, setShowModal }) => {
    const [isRegister, setIsRegister] = useState(false);

    const switchToLogin = () => setIsRegister(false);
    const switchToRegister = () => setIsRegister(true);
    const closeModal = () => setShowModal(false);

    return (
        <AnimatePresence>
            {showModal && (
                <motion.div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex justify-center items-center px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-[#0A1A2F]/60 border border-[#00C6FF66] p-8 rounded-xl max-w-md w-full relative"
                        initial={{ scale: 0.7, opacity: 0, y: 35 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.7, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <h2 className="text-2xl font-bold text-center mb-6">
                            {isRegister ? "Create Account" : "Login"}
                        </h2>

                        {isRegister ? (
                            <SignupForm switchToLogin={switchToLogin} closeModal={closeModal} />
                        ) : (
                            <LoginForm switchToRegister={switchToRegister} closeModal={closeModal} />
                        )}

                        <button
                            className="absolute top-3 right-4 text-xl text-blue-200"
                            onClick={closeModal}
                        >
                            ×
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AuthModal;
