import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

// Form validation schema
const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function StudentLogin() {
  const [, navigate] = useLocation();
  const { login, isAuthenticated, userType } = useAuth();
  const { toast } = useToast();
  
  // Redirect if already authenticated as student
  if (isAuthenticated && userType === "student") {
    navigate("/student/access");
    return null;
  }
  
  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await apiRequest("POST", "/api/student/login", values);
      return await res.json();
    },
    onSuccess: () => {
      login("student");
      navigate("/student/access");
      toast({
        title: "Login Successful",
        description: "Welcome back to CT America!",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });
  
  // Form submit handler
  function onSubmit(values: FormValues) {
    loginMutation.mutate(values);
  }
  
  return (
    <div className="grid md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
      <div>
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Student Login</h1>
              <p className="text-gray-600 mt-2">Access your CT America course materials</p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Log In"
                  )}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                Don't have an account yet?{" "}
                <Button variant="link" className="p-0" onClick={() => navigate("/register")}>
                  Register now
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="hidden md:block">
        <div className="p-6 rounded-lg bg-gradient-to-br from-primary/90 to-primary text-white">
          <h2 className="text-2xl font-bold mb-4">Welcome to CT America</h2>
          <p className="mb-4">Access your approved course materials and begin your learning journey.</p>
          
          <div className="space-y-4 mt-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-white bg-opacity-20 p-2 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="m2 12 5.45 5.45" />
                  <path d="M12 9v6" />
                  <path d="m8 12 4 3 4-3" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Online Courses</h3>
                <p className="text-white/80 text-sm">Access video lectures, exercises, and hands-on projects.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-white bg-opacity-20 p-2 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                  <path d="m9 16 2 2 4-4" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Track Progress</h3>
                <p className="text-white/80 text-sm">Monitor your learning journey with detailed progress tracking.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-white bg-opacity-20 p-2 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M7 13m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0" />
                  <path d="M17 13m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0" />
                  <path d="M12 9m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0" />
                  <path d="M7 13c0 2 .895 3.5 2 4.5" />
                  <path d="M17 13c0 2-.895 3.5-2 4.5" />
                  <path d="M12 9c0 3-.895 5.5-2 6.5" />
                  <path d="M12 9c0 3 .895 5.5 2 6.5" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Community Support</h3>
                <p className="text-white/80 text-sm">Connect with other students and instructors for help and collaboration.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}