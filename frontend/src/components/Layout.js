import React from 'react';
import { Box, Flex, HStack, Spacer, Button, Text, Link, Icon, Container, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaRobot, FaCubes } from 'react-icons/fa';

const Navbar = () => (
    <Box as="header" bg="white" boxShadow="sm" py={2} px={0}>
        <Container maxW="container.xl">
            <Flex align="center">
                <HStack spacing={2}>
                    <Box position="relative">
                        <Icon as={FaCubes} color="purple.600" boxSize={6} />
                        <Icon as={FaRobot} color="indigo.500" boxSize={3} position="absolute" top="-1" right="-1" />
                    </Box>
                    <Text fontWeight="bold" fontSize="xl" color="purple.700">AI Product Categorizer</Text>
                </HStack>
                <HStack spacing={8} ml={10} as="nav" fontWeight="medium">
                    <Link as={RouterLink} to="/" color="gray.700" _hover={{ color: 'purple.600' }}>Home</Link>
                    <Link as={RouterLink} to="/products" color="gray.700" _hover={{ color: 'purple.600' }}>Products</Link>
                </HStack>
                <Spacer />
                <HStack spacing={4}>
                    <Button as={RouterLink} to="/login" variant="ghost" colorScheme="purple">Sign in</Button>
                    <Button as={RouterLink} to="/register" colorScheme="purple">Get Started</Button>
                </HStack>
            </Flex>
        </Container>
    </Box>
);

const Footer = () => (
    <Box as="footer" bg="gray.900" color="white" py={10} mt={16}>
        <Container maxW="container.xl">
            <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="flex-start" gap={8}>
                <Box mb={{ base: 8, md: 0 }}>
                    <HStack spacing={2} mb={2}>
                        <Box position="relative">
                            <Icon as={FaCubes} color="white" boxSize={6} />
                            <Icon as={FaRobot} color="purple.300" boxSize={3} position="absolute" top="-1" right="-1" />
                        </Box>
                        <Text fontWeight="bold" fontSize="lg">AI Product Categorizer</Text>
                    </HStack>
                    <Text maxW="300px" color="gray.300">Revolutionizing e-commerce with AI-powered product categorization for sellers and intuitive shopping experience for customers.</Text>
                </Box>
                <HStack spacing={16} align="flex-start">
                    <Box>
                        <Text fontWeight="bold" mb={2}>Quick Links</Text>
                        <VStack align="start" spacing={1} color="gray.300">
                            <Link as={RouterLink} to="/">Home</Link>
                            <Link as={RouterLink} to="/products">Products</Link>
                            <Link as={RouterLink} to="/login">Sign In</Link>
                            <Link as={RouterLink} to="/register">Register</Link>
                        </VStack>
                    </Box>
                    <Box>
                        <Text fontWeight="bold" mb={2}>Categories</Text>
                        <VStack align="start" spacing={1} color="gray.300">
                            <Text>Electronics</Text>
                            <Text>Clothing</Text>
                            <Text>Home & Kitchen</Text>
                            <Text>Beauty & Personal Care</Text>
                            <Text>Books</Text>
                        </VStack>
                    </Box>
                    <Box>
                        <Text fontWeight="bold" mb={2}>Contact Us</Text>
                        <VStack align="start" spacing={1} color="gray.300">
                            <Text>123 E-Commerce St, San Francisco, CA 94103, USA</Text>
                            <Text>+1 (234) 567-890</Text>
                            <Text>info@aiproductcategorizer.com</Text>
                        </VStack>
                    </Box>
                </HStack>
            </Flex>
            <Text mt={10} textAlign="center" color="gray.500" fontSize="sm">© 2025 AI Product Categorizer. All rights reserved.</Text>
        </Container>
    </Box>
);

const Layout = ({ children }) => (
    <Box minH="100vh" bg="gray.50">
        <Navbar />
        <Box as="main" minH="70vh">{children}</Box>
        <Footer />
    </Box>
);

export default Layout; 