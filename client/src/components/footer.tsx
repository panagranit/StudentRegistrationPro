import { School } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <School className="mr-2 h-5 w-5" />
              <h3 className="text-lg font-semibold">CT America</h3>
            </div>
            <p className="text-gray-400 text-sm mt-1">Secure and efficient student management</p>
          </div>
          <div className="flex flex-wrap gap-4 md:gap-6">
            <a href="#" className="text-gray-300 hover:text-white transition">Help</a>
            <a href="#" className="text-gray-300 hover:text-white transition">Privacy Policy</a>
            <a href="#" className="text-gray-300 hover:text-white transition">Terms of Service</a>
            <a href="#" className="text-gray-300 hover:text-white transition">Contact</a>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-700 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} CT America. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
