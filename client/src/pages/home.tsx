import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { School } from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto text-center py-12">
      <div className="flex justify-center mb-6">
        <School className="h-16 w-16 text-primary" />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Student Registration System</h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Welcome to our secure and efficient student management platform. Register for courses, track your application status, and more.
      </p>
      
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Students</h2>
            <p className="text-gray-600 mb-6">
              Complete the registration form to apply for courses. Your application will be reviewed by administrators.
            </p>
            <Link href="/register">
              <Button className="w-full bg-primary hover:bg-primary/90">
                Register Now
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Administrators</h2>
            <p className="text-gray-600 mb-6">
              Review and manage student registrations, approve or reject applications, and monitor statistics.
            </p>
            <Link href="/admin/login">
              <Button className="w-full bg-primary hover:bg-primary/90">
                Admin Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      <div className="max-w-3xl mx-auto bg-gray-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">How It Works</h2>
        <ol className="list-decimal list-inside text-left space-y-4 text-gray-600">
          <li className="pl-2">
            <span className="font-medium text-gray-800">Submit Registration</span>: Complete the student registration form with your details.
          </li>
          <li className="pl-2">
            <span className="font-medium text-gray-800">Application Review</span>: Administrators will review your registration.
          </li>
          <li className="pl-2">
            <span className="font-medium text-gray-800">Get Notified</span>: Receive an email notification about your application status.
          </li>
          <li className="pl-2">
            <span className="font-medium text-gray-800">Access Course</span>: Approved students will receive credentials to access course materials.
          </li>
        </ol>
      </div>
    </div>
  );
}
