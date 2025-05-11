import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Container,
  useToast
} from '@chakra-ui/react';
import FileUpload from './FileUpload';

const ProductUpload = ({ isMobileView }) => {
  const toast = useToast();

  return (
    <Box minH="100vh" bg="gray.50" py={isMobileView ? 4 : 8}>
      <Container 
        maxW={isMobileView ? "100%" : "container.xl"} 
        px={isMobileView ? 2 : 4}
        centerContent
      >
        <VStack spacing={isMobileView ? 4 : 8} width="100%">
          <Heading 
            size={isMobileView ? "lg" : "xl"} 
            color="gray.700" 
            textAlign="center"
            mt={isMobileView ? 12 : 0}
          >
            AI Product Categorizer
          </Heading>

          <Box w={isMobileView ? "100%" : "70%"}>
            <FileUpload 
              onUploadSuccess={(data) => {
                if (Array.isArray(data)) {
                  toast({
                    title: 'Success',
                    description: 'Products uploaded successfully',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                  });
                } else if (data.categories && data.categories.length > 0) {
                  toast({
                    title: 'Success',
                    description: 'Product uploaded successfully',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                  });
                }
              }} 
              isMobileView={isMobileView} 
            />
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default ProductUpload; 