import React, { useState, useEffect } from 'react';
import {
  ChakraProvider,
  Box,
  VStack,
  Heading,
  Text,
  Image,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Container,
  SimpleGrid,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  ColorModeProvider,
  IconButton,
  Flex,
  Spacer,
} from '@chakra-ui/react';
import { FaMobile, FaDesktop } from 'react-icons/fa';
import FileUpload from './components/FileUpload';
import ProductList from './components/ProductList';

function App() {
  const [products, setProducts] = useState([]);
  const [isMobileView, setIsMobileView] = useState(false);
  const toast = useToast();

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch products',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleViewToggle = () => {
    setIsMobileView(!isMobileView);
  };

  return (
    <ChakraProvider>
      <ColorModeProvider>
        <Box minH="100vh" bg="gray.50" p={4}>
          <VStack spacing={8} align="stretch">
            <Flex align="center">
              <Heading size="lg">AI Product Categorizer</Heading>
              <Spacer />
              <Button
                onClick={handleViewToggle}
                leftIcon={isMobileView ? <FaDesktop /> : <FaMobile />}
                colorScheme="blue"
                size="lg"
                width={isMobileView ? "60px" : "72px"}
                height={isMobileView ? "60px" : "72px"}
                fontSize={isMobileView ? "30px" : "36px"}
              />
            </Flex>
            <FileUpload onUploadSuccess={fetchProducts} />
            <ProductList products={products} onDelete={fetchProducts} isMobileView={isMobileView} />
          </VStack>
        </Box>
      </ColorModeProvider>
    </ChakraProvider>
  );
}

export default App; 