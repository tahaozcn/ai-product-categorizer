import React from 'react';
import { Box, Card, CardBody, Stack, Heading, Button, useToast, IconButton } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

const Product = ({ product, onDelete, isMobileView }) => {
  const toast = useToast();

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/products/${product.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Product deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onDelete();
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Card
      direction={{ base: 'column', sm: 'row' }}
      overflow='hidden'
      variant='outline'
      p={4}
      mb={4}
      bg="white"
      borderRadius="lg"
      boxShadow="md"
    >
      <Box
        flexShrink={0}
        w={isMobileView ? "100%" : "200px"}
        h={isMobileView ? "200px" : "150px"}
        mb={isMobileView ? 4 : 0}
        mr={isMobileView ? 0 : 4}
        position="relative"
      >
        <img
          src={`http://localhost:8000/uploads/${product.image_path}`}
          alt={product.category}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '8px',
          }}
        />
        <IconButton
          icon={<DeleteIcon />}
          onClick={handleDelete}
          position="absolute"
          top={2}
          right={2}
          size="sm"
          colorScheme="red"
          bg="red.100"
          _hover={{ bg: "red.200" }}
          borderRadius="full"
          p={2}
        />
      </Box>

      <Stack flex="1">
        <CardBody>
          <Heading size={isMobileView ? "md" : "lg"} mb={2}>
            {product.category}
          </Heading>
        </CardBody>
      </Stack>
    </Card>
  );
};

export default Product;