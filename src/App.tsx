
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { Unauthorized } from "@/pages/Unauthorized";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              }
            />
            <Route
              path="/products"
              element={
                <Layout>
                  <div className="text-center py-12">
                    <h1 className="text-2xl font-bold">Products</h1>
                    <p className="text-gray-600">Coming soon...</p>
                  </div>
                </Layout>
              }
            />
            <Route
              path="/categories"
              element={
                <Layout>
                  <div className="text-center py-12">
                    <h1 className="text-2xl font-bold">Categories</h1>
                    <p className="text-gray-600">Coming soon...</p>
                  </div>
                </Layout>
              }
            />
            <Route
              path="/orders"
              element={
                <Layout>
                  <div className="text-center py-12">
                    <h1 className="text-2xl font-bold">Orders</h1>
                    <p className="text-gray-600">Coming soon...</p>
                  </div>
                </Layout>
              }
            />
            <Route
              path="/users"
              element={
                <Layout>
                  <div className="text-center py-12">
                    <h1 className="text-2xl font-bold">Users</h1>
                    <p className="text-gray-600">Coming soon...</p>
                  </div>
                </Layout>
              }
            />
            <Route
              path="/stores"
              element={
                <Layout>
                  <div className="text-center py-12">
                    <h1 className="text-2xl font-bold">Stores</h1>
                    <p className="text-gray-600">Coming soon...</p>
                  </div>
                </Layout>
              }
            />
            <Route
              path="/payments"
              element={
                <Layout>
                  <div className="text-center py-12">
                    <h1 className="text-2xl font-bold">Payments</h1>
                    <p className="text-gray-600">Coming soon...</p>
                  </div>
                </Layout>
              }
            />
            <Route
              path="/notifications"
              element={
                <Layout>
                  <div className="text-center py-12">
                    <h1 className="text-2xl font-bold">Notifications</h1>
                    <p className="text-gray-600">Coming soon...</p>
                  </div>
                </Layout>
              }
            />
            <Route
              path="/settings"
              element={
                <Layout>
                  <div className="text-center py-12">
                    <h1 className="text-2xl font-bold">Settings</h1>
                    <p className="text-gray-600">Coming soon...</p>
                  </div>
                </Layout>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
