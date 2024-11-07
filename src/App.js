import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import ClientsPage from './pages/ClientsPage';
import ServiceOrdersPage from './pages/ServiceOrdersPage';
import StockManagement from './components/Stock';
import SupplierManagement from './components/Supplier';
import Login from './components/Login';
import ReportsPage from './pages/ReportsPage';
import Integrations from './components/Integrations';
import AccountsPayable from './pages/AccountsPayablePage';
import GenerateRegisterLink from './components/GenerateRegisterLink';
import Register from './components/Register';
import UserList from './pages/UserList';
import CertificateUpload from './pages/CertificateUpload';
import ServicesPage from './pages/ServicesPage';
import Profile from './components/Profile';
import ServiceTypesPage from './pages/ServiceTypesPage';
import { ConfigProvider } from './contexts/ConfigContext';
import ConfigPanel from './components/ConfigPanel';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6a8caf', // Um azul suave
    },
    background: {
      default: '#f5f7fa', // Um cinza muito claro
      paper: '#ffffff',
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    background: {
      default: '#303030',
      paper: '#424242',
    },
    text: {
      primary: '#ffffff', // Isso definirá a cor do texto principal como branco
      secondary: '#e0e0e0', // Isso definirá a cor do texto secundário como um cinza claro
    },
  },
});

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ConfigProvider>
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns} locale={ptBR}>
          <AuthProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
                  </ProtectedRoute>
                }>
                  <Route index element={<Home />} />
                  <Route path="service-orders" element={<ServiceOrdersPage />} />
                  <Route path="clients" element={<ClientsPage />} />
                  <Route path="stock" element={<StockManagement />} />
                  <Route path="suppliers" element={<SupplierManagement />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="config" element={<ConfigPanel />} />
                  <Route path="integrations" element={<Integrations />} />
                  <Route path="accounts-payable" element={<AccountsPayable />} />
                  <Route path="services" element={<ServicesPage />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="service-types" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ServiceTypesPage />
                    </ProtectedRoute>
                  } />
                  <Route path="admin/generate-register-link" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <GenerateRegisterLink />
                    </ProtectedRoute>
                  } />
                  <Route path="users" element={<UserList />} />
                  <Route path="certificate" element={<CertificateUpload />} />
                </Route>
              </Routes>
            </Router>
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </ConfigProvider>
  );
}

export default App;
