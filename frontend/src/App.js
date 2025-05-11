import React from 'react';
import {
  ChakraProvider,
  CSSReset,
  Box,
  Flex,
  Spacer,
  Button,
  Link as ChakraLink
} from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import ProductUpload from './components/ProductUpload';
import ProductList from './components/ProductList';
import ProfilePage from './components/ProfilePage';
import AdminPanel from './components/AdminPanel';
import { FaMobile, FaDesktop } from 'react-icons/fa';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated()) return <Navigate to="/login" />;
  return children;
};

// Admin Route component
const AdminRoute = ({ children }) => {
  const { isAdmin, loading, isAuthenticated } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated() || !isAdmin()) return <Navigate to="/" />;
  return children;
};

// Role-based Navigation Bar
const NavBar = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const location = useLocation();
  if (!isAuthenticated()) return null;
  const isActive = (path) => location.pathname === path;
  return (
    <Flex as="nav" bg="gray.100" p={4} mb={8} align="center">
      {/* User navigation */}
      {!isAdmin() && (
        <>
          <ChakraLink as={RouterLink} to="/" fontWeight="bold" fontSize="lg" mr={4} _hover={{ textDecoration: 'none', color: 'green.600' }}
            borderBottom={isActive('/') ? '3px solid #38A169' : 'none'} color={isActive('/') ? 'green.700' : undefined}>
            Upload Product
          </ChakraLink>
          <ChakraLink as={RouterLink} to="/products" mr={4} _hover={{ textDecoration: 'none', color: 'green.600' }}
            borderBottom={isActive('/products') ? '3px solid #38A169' : 'none'} color={isActive('/products') ? 'green.700' : undefined}>
            My Products
          </ChakraLink>
        </>
      )}
      {/* Admin navigation */}
      {isAdmin() && (
        <>
          <ChakraLink as={RouterLink} to="/admin" fontWeight="bold" fontSize="lg" mr={4} _hover={{ textDecoration: 'none', color: 'green.600' }}
            borderBottom={isActive('/admin') ? '3px solid #38A169' : 'none'} color={isActive('/admin') ? 'green.700' : undefined}>
            User Management
          </ChakraLink>
        </>
      )}
      <ChakraLink as={RouterLink} to="/profile" mr={4} _hover={{ textDecoration: 'none', color: 'green.600' }}
        borderBottom={isActive('/profile') ? '3px solid #38A169' : 'none'} color={isActive('/profile') ? 'green.700' : undefined}>
        My Profile
      </ChakraLink>
      <Spacer />
      <Box fontSize="sm" color="gray.600" mr={4}>{user?.email}</Box>
      <Button colorScheme="green" size="sm" onClick={logout}>Logout</Button>
    </Flex>
  );
};

// Role-based Home Redirect
const HomeRedirect = ({ isMobileView }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated()) return <Navigate to="/login" />;
  if (isAdmin()) return <Navigate to="/admin" />; // Adminler admin paneline
  return <ProductUpload isMobileView={isMobileView} />; // Userlar ürün yükleme sayfasına
};

function App() {
  const [isMobileView, setIsMobileView] = React.useState(false);
  return (
    <ChakraProvider>
      <CSSReset />
      <AuthProvider>
        <Router>
          <NavBar />
          {/* Mobil/desktop geçiş ikonu sağ alt köşede sabit */}
          <Box position="fixed" bottom={6} right={6} zIndex={1000}>
            <Button
              colorScheme="blue"
              borderRadius="full"
              boxShadow="lg"
              size="lg"
              onClick={() => setIsMobileView(v => !v)}
              leftIcon={isMobileView ? <FaDesktop /> : <FaMobile />}
              aria-label="Toggle mobile/desktop view"
            >
              {isMobileView ? 'Desktop' : 'Mobile'}
            </Button>
              </Box>
          <Routes>
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/login" element={<LoginForm />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <HomeRedirect isMobileView={isMobileView} />
                </ProtectedRoute>
              } 
            />
            {/* User routes */}
            <Route 
              path="/products" 
              element={
                <ProtectedRoute>
                  <ProductList isMobileView={isMobileView} />
                </ProtectedRoute>
              } 
            />
            {/* Admin panel route */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminPanel isMobileView={isMobileView} />
                </AdminRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage isMobileView={isMobileView} />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App; 