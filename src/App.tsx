import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { InstallPrompt } from "./components/InstallPrompt";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import PaymentRequired from "./pages/PaymentRequired";
import Agenda from "./pages/Agenda";
import Clientes from "./pages/Clientes";
import Profissionais from "./pages/Profissionais";
import Servicos from "./pages/Servicos";
import Financeiro from "./pages/Financeiro";
import Perfil from "./pages/Perfil";
import Layout from "./components/Layout";
import { SubscriptionGuard } from "./components/SubscriptionGuard";
import { ProfileProvider } from "./contexts/ProfileContext";
import PublicBooking from "./pages/PublicBooking";

const App = () => (
  <>
    <Toaster />
    <BrowserRouter>
      <InstallPrompt />
      <ProfileProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/payment-required" element={<PaymentRequired />} />
          <Route path="/agendar/:uid" element={<PublicBooking />} />

          <Route element={
            <SubscriptionGuard>
              <Layout />
            </SubscriptionGuard>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/servicos" element={<Servicos />} />
            <Route path="/profissionais" element={<Profissionais />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/admin" element={<Admin />} />
          </Route>

        </Routes>
      </ProfileProvider>
    </BrowserRouter>
  </>
);

export default App;
