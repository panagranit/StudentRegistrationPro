import { forwardRef, useState, useEffect } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const notificationVariants = cva(
  "fixed z-50 p-4 rounded-lg shadow-lg flex items-start border-l-4 max-w-md",
  {
    variants: {
      variant: {
        default: "bg-white border-primary",
        success: "bg-white border-green-500",
        error: "bg-white border-red-500",
        warning: "bg-white border-yellow-500",
      },
      position: {
        "top-right": "top-4 right-4",
        "top-left": "top-4 left-4",
        "bottom-right": "bottom-4 right-4",
        "bottom-left": "bottom-4 left-4",
      },
    },
    defaultVariants: {
      variant: "default",
      position: "bottom-right",
    },
  }
);

interface NotificationProps extends VariantProps<typeof notificationVariants> {
  title: string;
  message: string;
  duration?: number;
  onClose?: () => void;
}

const Notification = forwardRef<HTMLDivElement, NotificationProps>(
  ({ title, message, variant, position, duration = 5000, onClose }, ref) => {
    const [isVisible, setIsVisible] = useState(true);
    
    useEffect(() => {
      if (duration) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            onClose && onClose();
          }, 300);
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }, [duration, onClose]);
    
    const handleClose = () => {
      setIsVisible(false);
      setTimeout(() => {
        onClose && onClose();
      }, 300);
    };
    
    const getIcon = () => {
      switch (variant) {
        case "success":
          return <CheckCircle className="text-green-500 mr-3 h-5 w-5" />;
        case "error":
          return <AlertCircle className="text-red-500 mr-3 h-5 w-5" />;
        case "warning":
          return (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500 mr-3">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          );
        default:
          return <Info className="text-primary mr-3 h-5 w-5" />;
      }
    };
    
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={ref}
            className={cn(notificationVariants({ variant, position }))}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
          >
            {getIcon()}
            <div className="flex-1">
              <h3 className="font-medium text-gray-800">{title}</h3>
              <p className="text-gray-600 text-sm">{message}</p>
            </div>
            <button 
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 ml-2"
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

Notification.displayName = "Notification";

export { Notification };
