
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="mb-6 text-gray-400 dark:text-gray-500">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-9xl font-bold"
          >
            404
          </motion.div>
        </div>
        
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Page not found</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <Button 
          onClick={() => navigate("/")} 
          className="px-6"
        >
          <Home className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
