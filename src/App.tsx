import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AddTeacher from "./pages/erp/AddTeacher";
import AddStudent from "./pages/erp/AddStudent";
import ManageUsers from "./pages/erp/ManageUsers";
import MarkAttendance from "./pages/erp/MarkAttendance";
import ViewAttendance from "./pages/erp/ViewAttendance";
import UploadMarks from "./pages/erp/UploadMarks";
import ViewMarks from "./pages/erp/ViewMarks";
import StudentFees from "./pages/erp/StudentFees";
import AdminFees from "./pages/erp/AdminFees";
import ApproveODRequests from "./pages/erp/ApproveODRequests";
import ManageDepartments from "./pages/erp/ManageDepartments";
import ManageCourses from "./pages/erp/ManageCourses";
import ViewAllAttendance from "./pages/erp/ViewAllAttendance";
import ViewAllMarks from "./pages/erp/ViewAllMarks";
import ViewMyClasses from "./pages/erp/ViewMyClasses";
import ViewStudentProfiles from "./pages/erp/ViewStudentProfiles";
import TeacherChat from "./pages/erp/TeacherChat";
import StudentChat from "./pages/erp/StudentChat";
import RequestOD from "./pages/erp/RequestOD";
import AuthPage from "./components/auth/AuthPage";
import DashboardPage from "./components/layout/DashboardPage";
import ProfilePage from "./pages/erp/ProfilePage";
import EditUser from "./pages/erp/EditUser";
import FeesRecords from "./pages/erp/FeesRecords"; // Import the new component
import { useSession } from "./components/auth/SessionContextProvider";
import { useEffect } from "react";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

const queryClient = new QueryClient();

const App = () => {
  const { user, userRole, loading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && userRole) {
      const expectedDashboardPath = `/dashboard/${userRole.toLowerCase().replace('_', '-')}`;
      if (location.pathname === '/' || location.pathname.startsWith('/auth/')) {
        navigate(expectedDashboardPath, { replace: true });
      } else if (!location.pathname.startsWith('/dashboard/') && !location.pathname.startsWith('/profile/') && !location.pathname.startsWith('/erp/')) {
        navigate(expectedDashboardPath, { replace: true });
      }
    } else if (!loading && !user) {
      // If not logged in, and trying to access a protected route, ProtectedRoute will handle redirection to '/'
    }
  }, [user, userRole, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        Loading application...
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth/super-admin" element={<AuthPage role="SUPER_ADMIN" />} />
          <Route path="/auth/admin" element={<AuthPage role="ADMIN" />} />
          <Route path="/auth/teacher" element={<AuthPage role="TEACHER" />} />
          <Route path="/auth/student" element={<AuthPage role="STUDENT" />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
            <Route path="/dashboard/super-admin" element={<DashboardPage userRole="SUPER_ADMIN" />} />
            <Route path="/profile/super-admin" element={<ProfilePage userRole="SUPER_ADMIN" />} />
            <Route path="/erp/add-teacher" element={<AddTeacher />} />
            <Route path="/erp/add-student" element={<AddStudent />} />
            <Route path="/erp/manage-users" element={<ManageUsers />} />
            <Route path="/erp/edit-user/:userId" element={<EditUser />} />
            <Route path="/erp/manage-departments" element={<ManageDepartments />} />
            <Route path="/erp/manage-courses" element={<ManageCourses />} />
            <Route path="/erp/fees/admin" element={<AdminFees />} /> {/* Existing AdminFees route */}
            <Route path="/erp/fees-records" element={<FeesRecords />} /> {/* New FeesRecords route */}
            <Route path="/erp/od/approve" element={<ApproveODRequests />} />
            <Route path="/erp/attendance/all" element={<ViewAllAttendance />} />
            <Route path="/erp/marks/all" element={<ViewAllMarks />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']} />}>
            <Route path="/dashboard/admin" element={<DashboardPage userRole="ADMIN" />} />
            <Route path="/profile/admin" element={<ProfilePage userRole="ADMIN" />} />
            <Route path="/erp/attendance/mark" element={<MarkAttendance />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['TEACHER', 'ADMIN', 'SUPER_ADMIN']} />}>
            <Route path="/dashboard/teacher" element={<DashboardPage userRole="TEACHER" />} />
            <Route path="/profile/teacher" element={<ProfilePage userRole="TEACHER" />} />
            <Route path="/erp/marks/upload" element={<UploadMarks />} />
            <Route path="/erp/teacher/classes" element={<ViewMyClasses />} />
            <Route path="/erp/teacher/student-profiles" element={<ViewStudentProfiles />} />
            <Route path="/erp/chat/teacher" element={<TeacherChat />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['STUDENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN']} />}>
            <Route path="/dashboard/student" element={<DashboardPage userRole="STUDENT" />} />
            <Route path="/profile/student" element={<ProfilePage userRole="STUDENT" />} />
            <Route path="/erp/attendance/student" element={<ViewAttendance />} />
            <Route path="/erp/marks/student" element={<ViewMarks />} />
            <Route path="/erp/fees/student" element={<StudentFees />} />
            <Route path="/erp/od/request" element={<RequestOD />} />
            <Route path="/erp/chat/student" element={<StudentChat />} />
          </Route>

          {/* Catch-all for 404 - MUST be the last route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Analytics />
        <SpeedInsights />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;