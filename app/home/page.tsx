"use client";

import { motion } from "motion/react";

export default function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white"
    >
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold mb-6 font-heading"
          >
            Welcome to Engenia 2K25
          </motion.h1>
          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg md:text-xl text-gray-300 mb-12"
          >
            The ultimate cultural festival experience awaits
          </motion.p>
          
          {/* Feature Cards */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12"
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="p-6 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20"
            >
              <div className="text-4xl mb-4">🎭</div>
              <h3 className="text-xl font-semibold mb-3">Events</h3>
              <p className="text-gray-300">Discover amazing performances and competitions</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="p-6 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20"
            >
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-3">Schedule</h3>
              <p className="text-gray-300">Plan your festival experience</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="p-6 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20"
            >
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-semibold mb-3">Register</h3>
              <p className="text-gray-300">Join the festivities today</p>
            </motion.div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Explore Events
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 border border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              View Schedule
            </motion.button>
          </motion.div>

          {/* Back to splash link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mt-16"
          >
            <a
              href="/"
              className="text-white/60 hover:text-white/80 transition-colors text-sm"
            >
              ← Back to Splash
            </a>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}