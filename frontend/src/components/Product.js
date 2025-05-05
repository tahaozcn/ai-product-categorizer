import React, { useState, useCallback } from 'react';
import {
  Box,
  Image,
  Text,
  IconButton,
  useToast,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  VStack,
  SimpleGrid,
  Tag,
  TagLabel,
  TagRightIcon,
  Tooltip,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from '@chakra-ui/react';
import { CloseIcon, InfoIcon } from '@chakra-ui/icons';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const Product = ({ product, onDelete, isMobileView }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();
  const cancelRef = React.useRef();

  const handleDelete = useCallback(async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      await axios.delete(`${API_URL}/products/${product.id}`);
      
      // First update UI
      onDelete(product.id);
      setIsDeleteModalOpen(false);
      
      // Then show success message
      toast({
        title: "Success",
        description: "Product successfully deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the product",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  }, [product.id, isDeleting, onDelete, toast]);

  const handleDeleteClick = useCallback(() => {
    if (!isDeleting) {
      setIsDeleteModalOpen(true);
    }
  }, [isDeleting]);

  const handleCloseModal = useCallback(() => {
    if (!isDeleting) {
      setIsDeleteModalOpen(false);
    }
  }, [isDeleting]);

  let categoryContent;
  if (!product.categories || product.categories.length === 0) {
    categoryContent = (
      <Box p={2} bg="red.50" borderRadius="md" color="red.500" textAlign="center">
        No category found for this product.
      </Box>
    );
  } else {
    const highestConfidenceCategory = product.categories.reduce((prev, current) => 
      (prev.confidence > current.confidence) ? prev : current
    );
    const categoryParts = highestConfidenceCategory.name.split(' - ');
    const specificCategory = categoryParts[categoryParts.length - 1];
    const confidence = highestConfidenceCategory.confidence;
    categoryContent = (
      <Tooltip 
        label={`Full category: ${highestConfidenceCategory.name}`}
        placement="top"
        hasArrow
      >
        <Tag
          size={isMobileView ? "sm" : "md"}
          variant="subtle"
          colorScheme={
            confidence > 0.7 ? "green" :
            confidence > 0.5 ? "yellow" : "red"
          }
          width="100%"
          justifyContent="center"
          py={1.5}
          px={3}
          borderRadius="md"
          boxShadow="sm"
        >
          <TagLabel 
            fontSize={isMobileView ? "xs" : "sm"}
            fontWeight="medium"
            textAlign="center"
          >
            {specificCategory}
          </TagLabel>
        </Tag>
      </Tooltip>
    );
  }

  return (
    <>
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        bg="white"
        position="relative"
        transition="transform 0.2s"
        _hover={{ transform: 'translateY(-4px)' }}
        boxShadow="sm"
        height="100%"
        display="flex"
        flexDirection="column"
        opacity={isDeleting ? 0.5 : 1}
        pointerEvents={isDeleting ? "none" : "auto"}
      >
        <IconButton
          icon={<CloseIcon />}
          position="absolute"
          right="2"
          top="2"
          zIndex="1"
          colorScheme="red"
          size="sm"
          onClick={handleDeleteClick}
          aria-label="Delete product"
          isDisabled={isDeleting}
        />
        
        <Box 
          position="relative" 
          width="100%" 
          height="200px"
          overflow="hidden"
        >
          <Image
            src={`http://localhost:8000${product.image_url}`}
            alt="Product"
            objectFit="contain"
            width="100%"
            height="100%"
            backgroundColor="gray.100"
          />
        </Box>
        
        <VStack 
          p={4} 
          align="stretch" 
          spacing={2}
          flex="1"
          backgroundColor="white"
        >
          {categoryContent}
        </VStack>
      </Box>

      <AlertDialog
        isOpen={isDeleteModalOpen}
        leastDestructiveRef={cancelRef}
        onClose={handleCloseModal}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Product
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this product?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button 
                ref={cancelRef} 
                onClick={handleCloseModal}
                isDisabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={handleDelete} 
                ml={3}
                isLoading={isDeleting}
                loadingText="Deleting..."
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default React.memo(Product);