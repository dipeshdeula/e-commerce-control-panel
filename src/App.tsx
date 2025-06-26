
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { Products } from "@/pages/Products";
import { Categories } from "@/pages/Categories";
import { SubCategories } from "@/pages/SubCategories";
import { SubSubCategories } from "@/pages/SubSubCategories";
import { Orders } from "@/pages/Orders";
import { Users } from "@/pages/Users";
import { Stores } from "@/pages/Stores";
import { Payments } from "@/pages/Payments";
import { PaymentMethods } from "@/pages/PaymentMethods";
import { PaymentRequests } from "@/pages/PaymentRequests";
import { Settings } from "@/pages/Settings";
import { Notifications } from "@/pages/Notifications";
import { CompanyInfo } from "@/pages/CompanyInfo";
import { Reports } from "@/pages/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
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
            path="/users"
            element={
              <Layout>
                <Users />
              </Layout>
            }
          />
          <Route
            path="/categories"
            element={
              <Layout>
                <Categories />
              </Layout>
            }
          />
          <Route
            path="/subcategories"
            element={
              <Layout>
                <SubCategories />
              </Layout>
            }
          />
          <Route
            path="/subsubcategories"
            element={
              <Layout>
                <SubSubCategories />
              </Layout>
            }
          />
          <Route
            path="/products"
            element={
              <Layout>
                <Products />
              </Layout>
            }
          />
          <Route
            path="/orders"
            element={
              <Layout>
                <Orders />
              </Layout>
            }
          />
          <Route
            path="/stores"
            element={
              <Layout>
                <Stores />
              </Layout>
            }
          />
          <Route
            path="/payments"
            element={
              <Layout>
                <Payments />
              </Layout>
            }
          />
          <Route
            path="/payment-methods"
            element={
              <Layout>
                <PaymentMethods />
              </Layout>
            }
          />
          <Route
            path="/payment-requests"
            element={
              <Layout>
                <PaymentRequests />
              </Layout>
            }
          />
          <Route
            path="/company-info"
            element={
              <Layout>
                <CompanyInfo />
              </Layout>
            }
          />
          <Route
            path="/reports"
            element={
              <Layout>
                <Reports />
              </Layout>
            }
          />
          <Route
            path="/notifications"
            element={
              <Layout>
                <Notifications />
              </Layout>
            }
          />
          <Route
            path="/settings"
            element={
              <Layout>
                <Settings />
              </Layout>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
