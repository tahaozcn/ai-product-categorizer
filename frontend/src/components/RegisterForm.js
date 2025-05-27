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
  Text,
  Link,
  useColorModeValue,
  Container,
  Flex,
  Image,
  HStack,
  Radio,
  RadioGroup,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBoxOpen } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const MotionBox = motion(Box);

const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const [role, setRole] = useState('customer');
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
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!role) errs.role = 'Please select account type';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/register', {
        email,
        password,
        role
      });

      // Automatically log in the user
      login(response.data.user, response.data.token);

      toast({
        title: 'Registration successful!',
        description: 'Welcome to AI Product Categorizer!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Redirect based on role
      if (role === 'seller') {
        navigate('/seller-dashboard');
      } else {
        navigate('/products'); // Customers go to marketplace
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
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

  return (
    <Flex minH="100vh" direction={{ base: 'column', md: 'row' }}>
      {/* Sol Panel */}
      <Box flex={1} bg="purple.600" color="white" display="flex" flexDirection="column" justifyContent="space-between" alignItems="flex-start" px={{ base: 8, md: 16 }} py={12} minH="100vh">
        <Box>
          <HStack spacing={3} mb={12}>
            <Box bg="white" borderRadius="md" p={2} display="flex" alignItems="center" justifyContent="center">
              <FaBoxOpen color="#6B46C1" size={32} />
            </Box>
            <Heading size="lg" fontWeight="bold">AI Commerce</Heading>
          </HStack>
          <Box mt={24} mb={8}>
            <Heading size="2xl" fontWeight="extrabold" mb={4}>Join our marketplace</Heading>
            <Text fontSize="lg" opacity={0.9} maxW="400px">Create an account to start selling products with automatic AI categorization or shop from our selection of unique items.</Text>
          </Box>
        </Box>
        <Text fontSize="sm" opacity={0.7}>&copy; 2025 AI Commerce. All rights reserved.</Text>
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
            <Heading size="lg" color="gray.800" fontWeight="bold" textAlign="center">Create an account</Heading>
            <Text color="gray.500" textAlign="center">Join us and start categorizing your products</Text>
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
                      autoComplete="new-password"
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
                <FormControl isInvalid={!!errors.confirmPassword}>
                  <FormLabel>Confirm Password</FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <InputRightElement>
                      <IconButton
                        variant="ghost"
                        aria-label={showConfirm ? 'Hide password' : 'Show password'}
                        icon={showConfirm ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowConfirm(v => !v)}
                        tabIndex={-1}
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!errors.role}>
                  <FormLabel>Account Type</FormLabel>
                  <RadioGroup value={role} onChange={setRole}>
                    <HStack spacing={6}>
                      <Radio value="customer">Customer</Radio>
                      <Radio value="seller">Seller</Radio>
                    </HStack>
                  </RadioGroup>
                  <FormErrorMessage>{errors.role}</FormErrorMessage>
                </FormControl>
                <Button
                  colorScheme="purple"
                  type="submit"
                  size="lg"
                  w="full"
                  isLoading={isLoading}
                  loadingText="Creating account..."
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                  transition="all 0.2s"
                >
                  Create Account
                </Button>
                <Text color="gray.500" fontSize="sm" textAlign="center">
                  Already have an account?{' '}
                  <Link
                    as={RouterLink}
                    to="/login"
                    color="purple.600"
                    fontWeight="medium"
                    _hover={{ textDecoration: 'underline' }}
                  >
                    Sign in
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

export default RegisterForm; 