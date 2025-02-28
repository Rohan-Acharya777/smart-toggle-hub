
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12 md:py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="inline-block mb-4 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-300 font-medium">
            Smart IoT Control Hub
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white"
          >
            Intelligent control for your connected devices
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-300 mb-10"
          >
            Monitor power usage, control switches, and manage your IoT ecosystem with precision and ease
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button 
              onClick={() => navigate("/dashboard")} 
              className="group px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-lg text-lg transition-all duration-300"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="ml-2 h-5 w-5 inline-block group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20"
        >
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              title="Real-time Monitoring" 
              description="Track current, voltage, and power consumption with beautiful visualizations and detailed metrics."
            />
            <FeatureCard 
              title="Remote Control" 
              description="Toggle switches and control your devices from anywhere with secure, reliable connectivity."
            />
            <FeatureCard 
              title="Device Management" 
              description="Easily add, configure, and manage all your connected IoT devices in one intuitive interface."
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const FeatureCard = ({ title, description }: { title: string; description: string }) => (
  <motion.div 
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
  >
    <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300">{description}</p>
  </motion.div>
);

export default Index;
