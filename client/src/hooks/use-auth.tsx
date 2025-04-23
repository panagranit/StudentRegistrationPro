import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

type UserType = "admin" | "student" | null;

interface AuthContextType {
  isAuthenticated: boolean;
  userType: UserType;
  login: (type: UserType) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userType: null,
  login: () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);
  const queryClient = useQueryClient();
  
  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ["/api/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
  
  // Set authentication state based on current user
  useEffect(() => {
    if (currentUser) {
      setIsAuthenticated(true);
      // Determine user type based on the response
      if ("isAdmin" in currentUser && currentUser.isAdmin) {
        setUserType("admin");
      } else {
        setUserType("student");
      }
    } else {
      setIsAuthenticated(false);
      setUserType(null);
    }
  }, [currentUser]);
  
  // Login function
  const login = (type: UserType) => {
    setIsAuthenticated(true);
    setUserType(type);
  };
  
  // Logout function
  const logout = async () => {
    try {
      await apiRequest("POST", "/api/logout");
      queryClient.clear();
      setIsAuthenticated(false);
      setUserType(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, userType, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

type UnauthorizedBehavior = "returnNull" | "throw";

function getQueryFn<T>({ on401 }: { on401: UnauthorizedBehavior }) {
  return async ({ queryKey }: { queryKey: string[] }): Promise<T | null> => {
    try {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });
      
      if (on401 === "returnNull" && res.status === 401) {
        return null;
      }
      
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      
      return await res.json();
    } catch (error) {
      console.error("Query error:", error);
      if (on401 === "returnNull") {
        return null;
      }
      throw error;
    }
  };
}
