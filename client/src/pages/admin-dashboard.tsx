import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import ConfirmationModal from "@/components/confirmation-modal";
import { CheckCircle, X, XCircle, Eye, Search, Hourglass, Users, Loader2 } from "lucide-react";

type Registration = {
  id: number;
  fullName: string;
  email: string;
  studentId: string;
  course: string;
  status: string;
  submittedAt: string;
  comments?: string;
  username?: string;
  password?: string;
};

type Stats = {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalCount: number;
};

type ModalState = {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
};

const getCourseTitle = (courseCode: string) => {
  const courses: Record<string, string> = {
    "cs101": "CS101 - Introduction to Computer Science",
    "math202": "MATH202 - Advanced Calculus",
    "eng303": "ENG303 - Technical Writing",
    "bio404": "BIO404 - Molecular Biology",
  };
  return courses[courseCode] || courseCode;
};

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { isAuthenticated, userType } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  
  // Redirect if not authenticated as admin
  useEffect(() => {
    if (!isAuthenticated || userType !== "admin") {
      navigate("/admin/login");
    }
  }, [isAuthenticated, userType, navigate]);
  
  // Fetch registrations
  const { data: registrations = [], isLoading: isLoadingRegistrations } = useQuery({
    queryKey: ["/api/registrations"],
    enabled: isAuthenticated && userType === "admin",
  });
  
  // Fetch stats
  const { data: stats = { pendingCount: 0, approvedCount: 0, rejectedCount: 0, totalCount: 0 }, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/registrations/stats"],
    enabled: isAuthenticated && userType === "admin",
  });
  
  // Update registration status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/registrations/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registrations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/registrations/stats"] });
      toast({
        title: "Status Updated",
        description: "Registration status has been updated successfully",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update registration status",
        variant: "destructive",
      });
    },
  });
  
  // Handle approve registration
  const handleApprove = (registration: Registration) => {
    setModal({
      isOpen: true,
      title: "Confirm Approval",
      message: `Are you sure you want to approve ${registration.fullName}'s registration? 
      
This will automatically generate a username and password for the student, which they can use to access online classes.`,
      onConfirm: () => {
        updateStatusMutation.mutate(
          { id: registration.id, status: "approved" }, 
          { 
            onSuccess: (data) => {
              // Show toast with credentials
              toast({
                title: "Registration Approved",
                description: (
                  <div className="mt-2 text-sm">
                    <p>Credentials were generated for {registration.fullName}:</p>
                    <p className="mt-1"><span className="font-bold">Username:</span> {data.username}</p>
                    <p><span className="font-bold">Password:</span> {data.password}</p>
                    <p className="mt-2 text-xs text-gray-500">Make sure to save these credentials. The password cannot be recovered later.</p>
                  </div>
                ),
                variant: "default",
                duration: 15000,
              });
            }
          }
        );
      },
    });
  };
  
  // Handle reject registration
  const handleReject = (registration: Registration) => {
    setModal({
      isOpen: true,
      title: "Confirm Rejection",
      message: `Are you sure you want to reject ${registration.fullName}'s registration?`,
      onConfirm: () => {
        updateStatusMutation.mutate({ id: registration.id, status: "rejected" });
      },
    });
  };
  
  // Handle view registration details
  const handleViewDetails = (registration: Registration) => {
    toast({
      title: "Registration Details",
      description: (
        <div className="mt-2 text-sm">
          <p><span className="font-bold">Name:</span> {registration.fullName}</p>
          <p><span className="font-bold">Email:</span> {registration.email}</p>
          <p><span className="font-bold">Student ID:</span> {registration.studentId}</p>
          <p><span className="font-bold">Course:</span> {getCourseTitle(registration.course)}</p>
          <p><span className="font-bold">Comments:</span> {registration.comments || "None"}</p>
          {registration.status === "approved" && (
            <>
              <p><span className="font-bold">Username:</span> {registration.username}</p>
              <p><span className="font-bold">Password:</span> {registration.password}</p>
            </>
          )}
        </div>
      ),
      variant: "default",
      duration: 10000,
    });
  };
  
  // Filter registrations
  const filteredRegistrations = registrations
    .filter((reg: Registration) => {
      // Apply status filter
      if (statusFilter !== "all" && reg.status !== statusFilter) {
        return false;
      }
      
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          reg.fullName.toLowerCase().includes(searchLower) ||
          reg.email.toLowerCase().includes(searchLower) ||
          reg.studentId.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    })
    .sort((a: Registration, b: Registration) => {
      // Sort by status (pending first) and then by submission date (newest first)
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });
  
  if (isLoadingRegistrations || isLoadingStats) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <Card className="mb-8 shadow-md">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Registration Management</h2>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                  className="pl-10"
                  placeholder="Search registrations..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRegistrations.length > 0 ? (
                  filteredRegistrations.map((registration: Registration) => (
                    <tr key={registration.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{registration.fullName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{registration.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{registration.studentId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{getCourseTitle(registration.course)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          registration.status === "pending" 
                            ? "bg-yellow-100 text-yellow-800" 
                            : registration.status === "approved" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                        }`}>
                          {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleApprove(registration)}
                            disabled={registration.status === "approved"}
                            className={registration.status === "approved" ? "text-gray-400 cursor-not-allowed" : "text-green-600 hover:text-green-800"}
                            title={registration.status === "approved" ? "Already Approved" : "Approve"}
                          >
                            <CheckCircle className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleReject(registration)}
                            disabled={registration.status === "rejected"}
                            className={registration.status === "rejected" ? "text-gray-400 cursor-not-allowed" : "text-red-600 hover:text-red-800"}
                            title={registration.status === "rejected" ? "Already Rejected" : "Reject"}
                          >
                            <XCircle className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(registration)}
                            className="text-gray-600 hover:text-gray-800"
                            title="View Details"
                          >
                            <Eye className="h-5 w-5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No registrations found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {filteredRegistrations.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredRegistrations.length}</span> of{" "}
                <span className="font-medium">{stats.totalCount}</span> registrations
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Registration Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-md border-l-4 border-yellow-500">
          <CardContent className="py-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Pending Registrations</p>
                <h3 className="text-2xl font-bold">{stats.pendingCount}</h3>
              </div>
              <Hourglass className="text-yellow-500 h-8 w-8" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-l-4 border-green-500">
          <CardContent className="py-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Approved Students</p>
                <h3 className="text-2xl font-bold">{stats.approvedCount}</h3>
              </div>
              <CheckCircle className="text-green-500 h-8 w-8" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-l-4 border-red-500">
          <CardContent className="py-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Rejected Applications</p>
                <h3 className="text-2xl font-bold">{stats.rejectedCount}</h3>
              </div>
              <XCircle className="text-red-500 h-8 w-8" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-l-4 border-primary">
          <CardContent className="py-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Total Registrations</p>
                <h3 className="text-2xl font-bold">{stats.totalCount}</h3>
              </div>
              <Users className="text-primary h-8 w-8" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <ConfirmationModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onConfirm={() => {
          modal.onConfirm();
          setModal(prev => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
