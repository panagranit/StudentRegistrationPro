import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Play, CalendarDays, FileText, Code, LogOut } from "lucide-react";

const getCourseInfo = (courseCode: string) => {
  const courses: Record<string, { name: string, code: string, description: string, icon: any }> = {
    "cs101": {
      name: "Introduction to Computer Science", 
      code: "CS101",
      description: "Learn the fundamentals of computer science, including programming basics, algorithms, and data structures.",
      icon: Code
    },
    "math202": {
      name: "Advanced Calculus", 
      code: "MATH202",
      description: "Study of limits, continuity, differentiation, integration, and infinite series with applications.",
      icon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sigma-square">
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M16 8.9V7H8l4 5-4 5h8v-1.9" />
        </svg>
      )
    },
    "eng303": {
      name: "Technical Writing", 
      code: "ENG303",
      description: "Learn effective communication skills for technical documentation, reports, and presentations.",
      icon: FileText
    },
    "bio404": {
      name: "Molecular Biology", 
      code: "BIO404",
      description: "Advanced study of cell structure, DNA, RNA, and protein synthesis with laboratory experiments.",
      icon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dna">
          <path d="M2 15c6.667-6 13.333 0 20-6" />
          <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993" />
          <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993" />
          <path d="m17 6-2.5-2.5" />
          <path d="m14 8-1-1" />
          <path d="m7 18 2.5 2.5" />
          <path d="m3.5 14.5.5.5" />
          <path d="m20 9 .5.5" />
          <path d="m6.5 12.5 1 1" />
          <path d="m16.5 10.5 1 1" />
          <path d="m10 16 1.5 1.5" />
        </svg>
      )
    }
  };
  return courses[courseCode] || {
    name: "Course Name", 
    code: courseCode.toUpperCase(),
    description: "Course description not available.",
    icon: Code
  };
};

export default function StudentAccess() {
  const [, navigate] = useLocation();
  const { isAuthenticated, userType, logout } = useAuth();
  
  // Redirect if not authenticated as student
  useEffect(() => {
    if (!isAuthenticated || userType !== "student") {
      navigate("/");
    }
  }, [isAuthenticated, userType, navigate]);
  
  // Fetch student registration details
  const { data: student, isLoading } = useQuery({
    queryKey: ["/api/student/registration"],
    enabled: isAuthenticated && userType === "student",
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-gray-600">Loading your course information...</p>
        </div>
      </div>
    );
  }
  
  if (!student) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Error</h2>
            <p className="text-gray-600 mb-6">
              Unable to load your student information. Please try logging in again.
            </p>
            <Button onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const courseInfo = getCourseInfo(student.course);
  const CourseIcon = courseInfo.icon;
  
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-md">
        <CardContent className="py-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="text-primary text-3xl mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-graduation-cap h-8 w-8">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Welcome, {student.fullName.split(' ')[0]}!</h2>
                <p className="text-gray-600">Access your course materials below</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">Approved Student</span>
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Your Course</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start">
                <div className="bg-primary w-16 h-16 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                  <CourseIcon className="w-8 h-8" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-800">{courseInfo.name}</h4>
                  <p className="text-gray-600">{courseInfo.code}</p>
                  <p className="text-gray-600 mt-2">{courseInfo.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button className="text-sm">
                      <Play className="mr-2 h-4 w-4" />
                      Start Learning
                    </Button>
                    <Button variant="outline" className="text-sm">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      View Schedule
                    </Button>
                    <Button variant="outline" className="text-sm">
                      <FileText className="mr-2 h-4 w-4" />
                      Resources
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user text-primary mr-2 h-5 w-5">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <h4 className="text-md font-medium text-gray-700">Personal Details</h4>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <p><span className="text-gray-500">Name:</span> <span className="font-medium">{student.fullName}</span></p>
                  <p><span className="text-gray-500">Email:</span> <span className="font-medium">{student.email}</span></p>
                  <p><span className="text-gray-500">Student ID:</span> <span className="font-medium">{student.studentId}</span></p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check text-primary mr-2 h-5 w-5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <h4 className="text-md font-medium text-gray-700">Account Access</h4>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <p><span className="text-gray-500">Username:</span> <span className="font-medium">{student.username}</span></p>
                  <p>
                    <span className="text-gray-500">Password:</span> 
                    <span className="font-medium">••••••••</span>
                    <button className="text-primary hover:underline text-xs ml-2">Change</button>
                  </p>
                  <p>
                    <span className="text-gray-500">Last Login:</span> 
                    <span className="font-medium">{new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              className="bg-red-50 hover:bg-red-100 text-red-600"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
