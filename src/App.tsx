import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import PrivateRoute from "./components/PrivateRoute";
import SolanaWalletProvider from "./components/WalletProvider";
import NotFound from "./pages/NotFound";

import "@solana/wallet-adapter-react-ui/styles.css";

// --- In-file Loading Spinner Component ---
// This component and its styles are defined directly here to avoid creating new files.
const spinnerStyles = `
.spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

const LoadingSpinner = () => (
  <>
    <style>{spinnerStyles}</style>
    <div className="spinner-container">
      <div className="loading-spinner"></div>
    </div>
  </>
);
// --- End of In-file Component ---

// Lazy-load page components for code-splitting and faster initial load
const Homepage = lazy(() => import("./components/Homepage"));
const Login = lazy(() => import("./components/Login"));
const NGODashboard = lazy(() => import("./components/NGODashboard"));
const VerifierDashboard = lazy(() => import("./components/VerifierDashboard"));
const ProjectVerificationWorkspace = lazy(() => import("./components/ProjectVerificationWorkspace"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));

// Instantiate the client outside the component to prevent re-creation
const queryClient = new QueryClient();

// Group providers for better readability and maintenance
const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SolanaWalletProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          {children}
        </BrowserRouter>
      </SolanaWalletProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

const AppRoutes = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path="/" element={<Navigate to="/homepage" replace />} />
      <Route path="/homepage" element={<Homepage />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route
        path="/ngo-dashboard"
        element={<PrivateRoute allowedRoles={["NGO"]}><NGODashboard /></PrivateRoute>}
      />
      <Route
        path="/verifier-dashboard"
        element={<PrivateRoute allowedRoles={["Verifier"]}><VerifierDashboard /></PrivateRoute>}
      />
      <Route
        path="/project/:projectId"
        element={<PrivateRoute allowedRoles={["Verifier"]}><ProjectVerificationWorkspace /></PrivateRoute>}
      />
      <Route
        path="/admin-dashboard"
        element={<PrivateRoute allowedRoles={["Admin"]}><AdminDashboard /></PrivateRoute>}
      />

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

const App = () => (
  <AppProviders>
    <AppRoutes />
  </AppProviders>
);

export default App;