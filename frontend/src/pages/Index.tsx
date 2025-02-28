
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Smart Toggle Hub
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Monitor and control your IoT devices from anywhere. Get real-time updates, 
          power consumption analytics, and remote switch control.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8">
              Get Started
            </Button>
          </Link>
          
          <a href="https://github.com/your-username/smart-toggle-hub" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg" className="text-lg px-8">
              View on GitHub
            </Button>
          </a>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl"
      >
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Real-time Monitoring</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Get real-time updates on your devices' status, power consumption, and more.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Remote Control</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Control your devices remotely from anywhere with an internet connection.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Power Analytics</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Analyze power consumption trends and optimize your energy usage.
          </p>
        </div>
      </motion.div>
      
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-20 text-center text-gray-500 dark:text-gray-400"
      >
        <p>© 2023 Smart Toggle Hub. All rights reserved.</p>
      </motion.footer>
    </div>
  );
};

export default Index;
