import { Toaster } from "./components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from './lib/query-client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import AppLayout from './components/layout/AppLayout';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import FindRide from './pages/FindRide';
import OfferRide from './pages/OfferRide';
import RideDetails from './pages/RideDetails';
import Dashboard from './pages/Dashboard';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Chat from './pages/Chat';

const AuthenticatedApp = () => {
  const { isLoadingAuth, authError, navigateToLogin } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Removed layout-breaking authError navigate loop
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/find-ride" element={<FindRide />} />
      <Route path="/offer-ride" element={<OfferRide />} />
      <Route path="/ride/:id" element={<RideDetails />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/chat/:conversationKey" element={<Chat />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
