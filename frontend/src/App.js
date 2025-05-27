import React from 'react';
import {
  ChakraProvider,
  Box,
  Flex,
  Button,
  IconButton,
  useColorMode,
  useColorModeValue,
  Container,
  Text,
  VStack,
  HStack,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Badge,
} from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Link as RouterLink, useNavigate, Navigate } from 'react-router-dom';
import { FaMoon, FaSun, FaBars, FaUser, FaShoppingCart } from 'react-icons/fa';
import ProductUpload from './components/ProductUpload';
import ProductList from './components/ProductList';
import ProfilePage from './components/ProfilePage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider, useCart } from './contexts/CartContext';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import CartPage from './components/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import SellerDashboard from './pages/SellerDashboard';
import RoleBasedHome from './pages/RoleBasedHome';
import MyProducts from './pages/MyProducts';

const Navbar = ({ onOpen }) => {
  const { logout, user } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const isSeller = user && user.role === 'seller';
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      px={6}
      py={4}
      bg="rgba(255, 255, 255, 0.95)"
      backdropFilter="blur(10px)"
      boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
      position="sticky"
      top={0}
      zIndex={1000}
      borderBottom="1px solid rgba(255, 255, 255, 0.2)"
    >
      <HStack spacing={4} align="center">
        <Text
          as={RouterLink}
          to="/"
          fontWeight="bold"
          fontSize="xl"
          color="purple.700"
          _hover={{ textDecoration: 'none', opacity: 0.8 }}
        >
          AI Product Categorizer
        </Text>
        <HStack spacing={6} ml={8}>
          <Button as={RouterLink} to="/products" variant="ghost" color="purple.700">🏪 Marketplace</Button>
          {user && !isSeller && (
            <Button as={RouterLink} to="/orders" variant="ghost" color="purple.700">📦 Order History</Button>
          )}
          {isSeller && (
            <>
              <Button as={RouterLink} to="/seller-dashboard" variant="ghost" color="purple.700">➕ Add Product</Button>
              <Button as={RouterLink} to="/my-products" variant="ghost" color="purple.700">📋 My Products</Button>
            </>
          )}
        </HStack>
      </HStack>
      <HStack spacing={4}>
        {/* Shopping Cart Icon - Only for customers */}
        {!isSeller && (
          <Button
            as={RouterLink}
            to="/cart"
            variant="ghost"
            color="purple.700"
            leftIcon={<FaShoppingCart />}
            position="relative"
          >
            Cart
            {itemCount > 0 && (
              <Badge
                colorScheme="red"
                borderRadius="full"
                position="absolute"
                top="-1"
                right="-1"
                fontSize="xs"
                minW="20px"
                h="20px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {itemCount}
              </Badge>
            )}
          </Button>
        )}

        {user ? (
          <Menu>
            <MenuButton as={Button} variant="ghost" leftIcon={<FaUser />}>
              <HStack spacing={2}>
                <Text>{isSeller ? '🏪' : '🛍️'}</Text>
                <Text>{user.email?.split('@')[0] || 'User'}</Text>
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem as={RouterLink} to="/profile">Profile</MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>Sign Out</MenuItem>
            </MenuList>
          </Menu>
        ) : (
          <>
            <Button as={RouterLink} to="/login" variant="ghost" color="purple.700">Sign in</Button>
            <Button as={RouterLink} to="/register" colorScheme="purple">Get Started</Button>
          </>
        )}
      </HStack>
    </Flex>
  );
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated()) return <Navigate to="/login" />;
  return children;
};

function App() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <ChakraProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Box
              minH="100vh"
              bg="linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
              position="relative"
            >
              {/* Background Pattern */}
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                backgroundImage="radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.8) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(226, 232, 240, 0.8) 0%, transparent 50%)"
                pointerEvents="none"
              />
              <Box position="relative" zIndex={1}>
                <Navbar onOpen={onOpen} />
                <Container maxW="container.xl" py={8}>
                  <Routes>
                    <Route path="/" element={<RoleBasedHome />} />
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/register" element={<RegisterForm />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/seller-dashboard" element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
                    <Route path="/my-products" element={<ProtectedRoute><MyProducts /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                    <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                  </Routes>
                </Container>
              </Box>
            </Box>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App; 