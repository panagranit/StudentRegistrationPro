import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Home, Eye } from "lucide-react";

const getCourseTitle = (courseCode: string) => {
  const courses: Record<string, string> = {
    "cs101": "CS101 - Introduction to Computer Science",
    "math202": "MATH202 - Advanced Calculus",
    "eng303": "ENG303 - Technical Writing",
    "bio404": "BIO404 - Molecular Biology",
  };
  return courses[courseCode] || courseCode;
};

export default function RegistrationConfirmation() {
  const { id } = useParams();
  const registrationId = parseInt(id || "0");
  
  // In a real application, we would fetch the specific registration
  // For demo purposes, we'll use this dummy data
  const { data: registration, isLoading } = useQuery({
    queryKey: [`/api/registrations/${registrationId}`],
    enabled: !!registrationId,
    // Since this is a public page, we'll handle 401 errors gracefully
    queryFn: async ({ queryKey }) => {
      try {
        const response = await fetch(queryKey[0] as string, {
          credentials: "include",
        });
        
        if (response.status === 401) {
          // We're not logged in as admin, so we can't fetch the specific registration
          // Return a placeholder based on the ID
          return {
            id: registrationId,
            fullName: "Your registration",
            email: "your.email@example.com",
            studentId: "Your student ID",
            course: "your selected course",
            status: "pending",
          };
        }
        
        if (!response.ok) {
          throw new Error("Failed to fetch registration details");
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error fetching registration:", error);
        // Return a fallback object
        return {
          id: registrationId,
          fullName: "Your registration",
          email: "your.email@example.com",
          studentId: "Your student ID",
          course: "your selected course",
          status: "pending",
        };
      }
    },
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!registration) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Registration Not Found</h2>
            <p className="text-gray-600 mb-6">
              Sorry, we couldn't find the registration details you're looking for.
            </p>
            <Link href="/">
              <Button>
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-md">
        <CardContent className="pt-6 text-center">
          <div className="flex flex-col items-center justify-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-bold text-gray-800 mt-4">Registration Submitted Successfully!</h2>
          </div>
          
          <p className="text-gray-600 mb-6">
            Thank you for your registration. Your information has been submitted and is pending approval.
            You will receive an email notification once your registration has been reviewed.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Registration Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-sm text-gray-500">Full Name:</p>
                <p className="font-medium">{registration.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email:</p>
                <p className="font-medium">{registration.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Student ID:</p>
                <p className="font-medium">{registration.studentId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Course:</p>
                <p className="font-medium">{getCourseTitle(registration.course)}</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <Link href="/">
              <Button variant="outline">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Link href="/admin/login">
              <Button>
                <Eye className="mr-2 h-4 w-4" />
                Track Status
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
