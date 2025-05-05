import React, { useState, useEffect, useCallback } from 'react';
import {
  ChakraProvider,
  Box,
  VStack,
  Heading,
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
  Button,
} from '@chakra-ui/react';
import { FaMobile, FaDesktop } from 'react-icons/fa';
import FileUpload from './components/FileUpload';
import ProductList from './components/ProductList';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

function App() {
  const [products, setProducts] = useState([]);
  const [deleteAlert, setDeleteAlert] = useState({ isOpen: false, productId: null });
  const [isMobileView, setIsMobileView] = useState(false);
  const cancelRef = React.useRef();
  const toast = useToast();

  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
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
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = useCallback((productId) => {
    setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
  }, []);

  return (
    <ChakraProvider>
      <ColorModeProvider>
        <Box minH="100vh" bg="gray.50" py={isMobileView ? 4 : 8}>
          <Container 
            maxW={isMobileView ? "100%" : "container.xl"} 
            px={isMobileView ? 2 : 4}
            centerContent
          >
            <VStack spacing={isMobileView ? 4 : 8} width="100%">
              <Box position="fixed" top={4} right={4} zIndex="overlay">
                <IconButton
                  icon={isMobileView ? <FaDesktop /> : <FaMobile />}
                  onClick={() => setIsMobileView(!isMobileView)}
                  aria-label="Toggle view mode"
                  variant="solid"
                  colorScheme="blue"
                  size={isMobileView ? "md" : "lg"}
                  w={isMobileView ? "60px" : "72px"}
                  h={isMobileView ? "60px" : "72px"}
                  fontSize={isMobileView ? "30px" : "36px"}
                />
              </Box>

              <Heading 
                size={isMobileView ? "lg" : "xl"} 
                color="gray.700" 
                textAlign="center"
                mt={isMobileView ? 12 : 0}
              >
                AI Product Categorizer
              </Heading>

              <Box w={isMobileView ? "100%" : "70%"}>
                <FileUpload onUploadSuccess={(data) => {
                  if (Array.isArray(data)) {
                    setProducts(data.filter(product => product.categories && product.categories.length > 0));
                  } else if (data.categories && data.categories.length > 0) {
                    setProducts(prev => [...prev, data]);
                  }
                }} isMobileView={isMobileView} />
              </Box>

              <Box w={isMobileView ? "100%" : "80%"} mt={isMobileView ? 4 : 8}>
                <Heading 
                  as="h2" 
                  size={isMobileView ? "md" : "lg"} 
                  mb={4} 
                  textAlign="center"
                >
                  Product List
                </Heading>
                <SimpleGrid 
                  columns={isMobileView ? 1 : 3} 
                  spacing={isMobileView ? 4 : 6}
                  width="100%"
                >
                  <ProductList 
                    products={products} 
                    onDelete={handleDelete}
                    isMobileView={isMobileView}
                  />
                </SimpleGrid>
              </Box>
            </VStack>
          </Container>

          <AlertDialog
            isOpen={deleteAlert.isOpen}
            leastDestructiveRef={cancelRef}
            onClose={() => setDeleteAlert({ isOpen: false, productId: null })}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Delete Product
                </AlertDialogHeader>

                <AlertDialogBody>
                  Are you sure you want to delete this product? This action cannot be undone.
                </AlertDialogBody>

                <AlertDialogFooter>
                  <Button ref={cancelRef} onClick={() => setDeleteAlert({ isOpen: false, productId: null })}>
                    Cancel
                  </Button>
                  <Button colorScheme="red" onClick={() => handleDelete(deleteAlert.productId)} ml={3}>
                    Delete
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
        </Box>
      </ColorModeProvider>
    </ChakraProvider>
  );
}

export default App; 