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
  Link
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

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

  const validate = () => {
    const errs = {};
    if (!email) errs.email = 'Email is required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errs.email = 'Invalid email format';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
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
        password
      });

      toast({
        title: 'Registration successful',
        description: 'You can now login with your credentials',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Redirect to login page
      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast({
        title: 'Error',
        description: message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="sm" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="lg" boxShadow="lg" bg="white">
      <Heading mb={6} size="lg" textAlign="center">Register</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isInvalid={!!errors.email}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.password}>
            <FormLabel>Password</FormLabel>
            <InputGroup>
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
            <InputGroup>
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
          <Button 
            colorScheme="green" 
            type="submit" 
            w="full"
            isLoading={isLoading}
            loadingText="Registering..."
          >
            Register
          </Button>
          <Text fontSize="sm">
            Already have an account?{' '}
            <Link as={RouterLink} to="/login" color="green.500">
              Login
            </Link>
          </Text>
        </VStack>
      </form>
    </Box>
  );
};

export default RegisterForm; 