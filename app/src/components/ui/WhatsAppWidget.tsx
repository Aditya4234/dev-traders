"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";

const WHATSAPP_NUMBER = "919205778531";
const DEFAULT_MESSAGE = "Hi Riya Touch! I have a query about your products.";

export default function WhatsAppWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);

  const handleSend = () => {
    const encoded = encodeURIComponent(message || DEFAULT_MESSAGE);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, "_blank");
    setOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[999]">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-[300px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-[#075E54] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-white">
                  <div className="flex h-full w-full items-center justify-center text-lg font-bold text-[#075E54]">
                    RT
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Riya Touch</p>
                  <p className="text-[11px] text-white/70">Usually replies instantly</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="bg-[#ECE5DD] px-4 py-4">
              <div className="rounded-lg bg-white px-4 py-3 shadow-sm">
                <p className="text-sm text-gray-800">
                  Hi! How can we help you today? 😊
                </p>
                <p className="mt-1 text-[10px] text-gray-400">Online</p>
              </div>
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 border-t border-gray-100 bg-white px-3 py-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="flex-1 rounded-full bg-gray-100 px-4 py-2.5 text-sm outline-none"
              />
              <button
                onClick={handleSend}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white transition-colors hover:bg-[#128C7E]"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-shadow hover:shadow-xl hover:shadow-[#25D366]/40"
        aria-label="Chat on WhatsApp"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
