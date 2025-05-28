import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Heading,
  VStack,
  InputGroup,
  InputRightElement,
  IconButton,
  useToast,
  Link,
  Text,
  useColorModeValue,
  Container,
  Flex,
  Image,
  HStack,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FaBoxOpen } from 'react-icons/fa';

const MotionBox = motion(Box);

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'white');

  const validate = () => {
    const errs = {};
    if (!email) errs.email = 'Email is required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errs.email = 'Invalid email format';
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/login', {
        email,
        password
      });

      login(response.data.token, response.data.user);

      toast({
        title: 'Login successful',
        description: 'Welcome back!',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });

      if (response.data.user.role === 'seller') {
        navigate('/seller-dashboard');
      } else {
        navigate('/products'); // Customers go to marketplace
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast({
        title: 'Error',
        description: message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = () => {
    navigate('/stores');
  };

  return (
    <Flex minH="100vh" direction={{ base: 'column', md: 'row' }}>
      {/* Sol Panel */}
      <Box flex={1} bg="purple.600" color="white" display="flex" flexDirection="column" justifyContent="space-between" alignItems="flex-start" px={{ base: 8, md: 16 }} py={12} minH="100vh">
        <Box>
          <HStack spacing={3} mb={12}>
            <Box bg="white" borderRadius="md" p={2} display="flex" alignItems="center" justifyContent="center">
              <FaBoxOpen color="#6B46C1" size={32} />
            </Box>
            <Heading size="lg" fontWeight="bold">AI Product Categorizer</Heading>
          </HStack>
          <Box mt={24} mb={8}>
            <Heading size="2xl" fontWeight="extrabold" mb={4}>Welcome Back</Heading>
            <Text fontSize="lg" opacity={0.9} maxW="400px">Sign in to continue to your account and start exploring or selling unique products with AI-powered categorization.</Text>
          </Box>
        </Box>
        <Text fontSize="sm" opacity={0.7}>&copy; 2025 AI Product Categorizer. All rights reserved.</Text>
      </Box>
      {/* Sağ Panel */}
      <Flex flex={1} align="center" justify="center" bg="gray.50" minH="100vh">
        <Box
          p={10}
          borderRadius="xl"
          boxShadow="xl"
          bg="white"
          minW={{ base: '90vw', md: '400px' }}
          maxW="400px"
        >
          <VStack spacing={6} align="stretch">
            <Heading size="lg" color="gray.800" fontWeight="bold" textAlign="center">Sign in</Heading>
            <Text color="gray.500" textAlign="center">Sign in to continue to your account</Text>
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <VStack spacing={4} align="stretch">
                <FormControl isInvalid={!!errors.email}>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    size="lg"
                  />
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!errors.password}>
                  <FormLabel>Password</FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <InputRightElement>
                      <IconButton
                        variant="ghost"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowPassword(v => !v)}
                        tabIndex={-1}
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>
                <Button
                  colorScheme="purple"
                  type="submit"
                  size="lg"
                  w="full"
                  isLoading={isLoading}
                  loadingText="Signing in..."
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                  transition="all 0.2s"
                >
                  Sign In
                </Button>
                <Text color="gray.500" fontSize="sm" textAlign="center">
                  Don&apos;t have an account?{' '}
                  <Link
                    as={RouterLink}
                    to="/register"
                    color="purple.600"
                    fontWeight="medium"
                    _hover={{ textDecoration: 'underline' }}
                  >
                    Get Started
                  </Link>
                </Text>
              </VStack>
            </form>
          </VStack>
        </Box>
      </Flex>
    </Flex>
  );
};

export default LoginForm; 