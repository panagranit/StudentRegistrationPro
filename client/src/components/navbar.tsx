import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { School, User, LogOut } from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();
  const { isAuthenticated, userType, logout } = useAuth();
  
  return (
    <nav className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer">
            <School className="h-6 w-6" />
            <h1 className="text-xl font-semibold">CT America</h1>
          </div>
        </Link>
        
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              {userType === "admin" && (
                <Link href="/admin/dashboard">
                  <Button variant="link" className="text-white p-0">
                    Dashboard
                  </Button>
                </Link>
              )}
              
              {userType === "student" && (
                <Link href="/student/access">
                  <Button variant="link" className="text-white p-0">
                    My Course
                  </Button>
                </Link>
              )}
              
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>{userType === "admin" ? "Admin" : "Student"}</span>
              </div>
              
              <Button 
                variant="secondary" 
                size="sm"
                className="flex items-center gap-1"
                onClick={() => {
                  logout();
                  window.location.href = "/";
                }}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              {location !== "/register" && (
                <Link href="/register">
                  <Button variant="link" className="text-white p-0">
                    Register
                  </Button>
                </Link>
              )}
              
              {location !== "/admin/login" && location !== "/student/login" && (
                <div className="flex gap-2">
                  <Link href="/student/login">
                    <Button variant="secondary" size="sm">
                      Student Login
                    </Button>
                  </Link>
                  <Link href="/admin/login">
                    <Button variant="outline" size="sm" className="bg-white text-primary hover:bg-gray-100">
                      Admin
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
