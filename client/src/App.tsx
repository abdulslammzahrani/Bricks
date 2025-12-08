import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import BuyerFormPage from "@/pages/buyer-form";
import SellerFormPage from "@/pages/seller-form";
import AdminDashboard from "@/pages/admin";
import ProfilePage from "@/pages/profile";
import InvestorPage from "@/pages/investor";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/buyer-form" component={BuyerFormPage} />
      <Route path="/seller-form" component={SellerFormPage} />
      <Route path="/investor" component={InvestorPage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/profile" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
