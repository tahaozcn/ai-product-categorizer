import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  VStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Image,
  HStack,
  IconButton,
  useColorMode,
  Icon,
  Radio,
  RadioGroup,
  Stack,
} from '@chakra-ui/react';
import { FaUpload, FaCamera, FaMobile, FaDesktop } from 'react-icons/fa';
import axios from 'axios';
import { CloseIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

/**
 * File upload component that handles image uploads and camera capture
 * Supports both file selection and camera capture for product images
 */
const FileUpload = ({ onUploadSuccess, isMobileView }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const toast = useToast();
  const fileInputRef = useRef(null);
  const { colorMode, toggleColorMode } = useColorMode();
  const [categoryErrorModal, setCategoryErrorModal] = useState(false);
  const navigate = useNavigate();

  /**
   * Handles file selection from input
   * Creates a preview URL for the selected image
   */
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  /**
   * Initializes and starts the camera for image capture
   * Handles various camera-related errors with appropriate messages
   */
  const startCamera = async () => {
    try {
      // Update camera state first
      setIsCameraOpen(true);
      
      // Wait for video element to be created
      await new Promise(resolve => setTimeout(resolve, 100));

      // Clear existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Set camera properties
      const constraints = {
        video: {
          facingMode: 'environment', // Prefer back camera on mobile devices
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      // Check if video element is ready
      if (!videoRef.current) {
        throw new Error('Video element not ready');
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      videoRef.current.srcObject = stream;
      streamRef.current = stream;

      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(error => {
          console.error('Video playback error:', error);
        });
      };

    } catch (error) {
      console.error('Camera error:', error);
      let errorMessage = 'Cannot access camera';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please check browser permissions.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found. Please make sure a camera is connected.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera may be in use by another application.';
      } else if (error.message.includes('Video element')) {
        errorMessage = 'Camera failed to start. Please refresh the page and try again.';
      }

      toast({
        title: 'Camera Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsCameraOpen(false);
    } catch (error) {
      console.error('Camera stop error:', error);
    }
  };

  // Clean up camera when component unmounts
  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      stopCamera();
    }, 'image/jpeg');
  };

  /**
   * Handles file upload to the server
   * Shows appropriate error messages for various failure cases
   */
  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'Error',
        description: 'Please select or take a photo first',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:8000/api/upload', formData);
      setAnalysisResult(response.data);
      setIsModalOpen(true);
    } catch (error) {
      // Special modal for category not found error
      if (error.response && error.response.data && error.response.data.error === 'No category found for this product.') {
        setCategoryErrorModal(true);
      } else {
        console.error('Error uploading file:', error);
        toast({
          title: 'Error',
          description: 'An error occurred while uploading the file',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedCategory) {
      toast({
        title: "Warning",
        description: "Please select a category before confirming",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Create a new product object with only the selected category
    const updatedProduct = {
      ...analysisResult,
      categories: [{
        name: selectedCategory.name,
        confidence: selectedCategory.confidence
      }]
    };

    onUploadSuccess(updatedProduct);
    setIsModalOpen(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setSelectedCategory(null);
    navigate('/products');
    
    // Fetch updated products list
    axios.get('http://localhost:8000/api/products')
      .then(response => {
        onUploadSuccess(response.data);
      })
      .catch(error => {
        console.error('Error fetching updated products:', error);
        toast({
          title: 'Warning',
          description: 'Product added but list could not be updated. Please refresh the page.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      });

    toast({
      title: 'Success',
      description: 'Product successfully added with selected category',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setAnalysisResult(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setSelectedCategory(null);
  };

  return (
    <>
      <Card 
        w="full" 
        variant="elevated" 
        bg="#bfb8b8"
        boxShadow="lg"
        borderRadius="xl"
      >
        <CardHeader borderBottomWidth="1px" borderColor="gray.200">
          <Heading size={isMobileView ? "sm" : "md"}>Upload Photo</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={isMobileView ? 3 : 4}>
            <Box
              border="2px dashed"
              borderColor="gray.300"
              borderRadius="lg"
              p={isMobileView ? 3 : 6}
              w="full"
              textAlign="center"
              bg="#bfb8b8"
              position="relative"
              transition="all 0.3s ease"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "md",
                borderColor: "blue.400"
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const files = Array.from(e.dataTransfer.files);
                if (files.length > 0) {
                  handleFileSelect({ target: { files: [files[0]] } });
                }
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                style={{ display: 'none' }}
                id="fileInput"
              />
              <VStack spacing={4}>
                {!selectedFile && !isCameraOpen && (
                  <Icon 
                    as={FaUpload} 
                    boxSize={isMobileView ? 8 : 12} 
                    color="gray.500"
                    mb={2}
                  />
                )}
                <HStack spacing={isMobileView ? 2 : 4} justify="center">
                  <Button
                    leftIcon={<FaUpload />}
                    colorScheme="blue"
                    onClick={() => document.getElementById('fileInput').click()}
                    size={isMobileView ? "sm" : "md"}
                    _hover={{ transform: "translateY(-1px)" }}
                    transition="all 0.2s"
                  >
                    Select Photo
                  </Button>
                  <Button
                    leftIcon={<FaCamera />}
                    colorScheme="teal"
                    onClick={isCameraOpen ? stopCamera : startCamera}
                    size={isMobileView ? "sm" : "md"}
                    _hover={{ transform: "translateY(-1px)" }}
                    transition="all 0.2s"
                  >
                    {isCameraOpen ? 'Close Camera' : 'Open Camera'}
                  </Button>
                </HStack>
                
                {!selectedFile && !isCameraOpen && (
                  <Text color="gray.500" fontSize={isMobileView ? "sm" : "md"}>
                    or drag and drop your photo here
                  </Text>
                )}
              </VStack>
              
              {isCameraOpen ? (
                <VStack mt={4} spacing={4} position="relative">
                  <IconButton
                    icon={<CloseIcon />}
                    position="absolute"
                    right="0"
                    top="0"
                    zIndex="1"
                    colorScheme="red"
                    bg="red.100"
                    _hover={{ bg: 'red.200' }}
                    size={isMobileView ? "xs" : "sm"}
                    onClick={stopCamera}
                    aria-label="Close Camera"
                  />
                  <Box
                    as="video"
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    w="100%"
                    maxH={isMobileView ? "200px" : "300px"}
                    objectFit="contain"
                    borderRadius="md"
                    boxShadow="md"
                  />
                  <Button 
                    colorScheme="green" 
                    onClick={capturePhoto}
                    size={isMobileView ? "sm" : "md"}
                    _hover={{ transform: "translateY(-1px)" }}
                    transition="all 0.2s"
                  >
                    Take Photo
                  </Button>
                </VStack>
              ) : (
                <>
                  {selectedFile && (
                    <Text mt={2} color="gray.600" fontSize={isMobileView ? "xs" : "sm"}>
                      Selected: {selectedFile.name}
                    </Text>
                  )}
                  {previewUrl && (
                    <Box position="relative" display="inline-block" mt={4}>
                    <Image
                      src={previewUrl}
                      alt="Preview"
                        maxH={isMobileView ? "200px" : "300px"}
                      mx="auto"
                      objectFit="contain"
                      borderRadius="md"
                      boxShadow="md"
                    />
                      <IconButton
                        icon={<CloseIcon />}
                        size="sm"
                        colorScheme="red"
                        position="absolute"
                        top={2}
                        right={2}
                        aria-label="Remove photo"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                          setAnalysisResult(null);
                        }}
                      />
                    </Box>
                  )}
                </>
              )}
            </Box>

            <Button
              colorScheme="green"
              w="full"
              onClick={handleUpload}
              isLoading={loading}
              loadingText="Analyzing..."
              size={isMobileView ? "sm" : "md"}
              _hover={{ transform: "translateY(-1px)" }}
              transition="all 0.2s"
              boxShadow="md"
            >
              Upload and Analyze
            </Button>
          </VStack>
        </CardBody>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCancel} 
        size={isMobileView ? "sm" : "md"}
        motionPreset="scale"
        isCentered
      >
        <ModalOverlay backdropFilter="blur(2px)" />
        <ModalContent 
          mx={4} 
          my="auto"
          maxH="90vh"
          overflowY="auto"
        >
          <ModalHeader fontSize={isMobileView ? "md" : "lg"}>Select Product Category</ModalHeader>
          <ModalCloseButton onClick={handleCancel} />
          <ModalBody>
            {analysisResult && (
              <VStack spacing={4} align="stretch">
                <Image
                  src={`http://localhost:8000${analysisResult.image_url}`}
                  alt="Uploaded product"
                  maxH={isMobileView ? "200px" : "300px"}
                  mx="auto"
                  objectFit="contain"
                  borderRadius="md"
                  boxShadow="md"
                />
                {(!analysisResult.categories || analysisResult.categories.length === 0) ? (
                  <Box p={2} bg="red.50" borderRadius="md" color="red.500" textAlign="center">
                    No category found for this product.
                  </Box>
                ) : (
                <Box>
                  <Text fontWeight="bold" mb={2} fontSize={isMobileView ? "sm" : "md"}>
                    Choose the correct category:
                  </Text>
                  <RadioGroup 
                    onChange={(value) => setSelectedCategory(analysisResult.categories[parseInt(value)])} 
                    value={selectedCategory ? analysisResult.categories.findIndex(cat => cat === selectedCategory).toString() : undefined}
                  >
                    <Stack spacing={3}>
                      {[...analysisResult.categories]
                        .sort((a, b) => b.confidence - a.confidence)
                        .map((category, index) => (
                          <Box 
                            key={index}
                            as="label"
                            p={3}
                            bg={
                              selectedCategory === category ? "blue.50" :
                              category.confidence > 0.7 ? "green.50" :
                              category.confidence > 0.5 ? "yellow.50" : "red.50"
                            }
                            borderRadius="md"
                            borderWidth="1px"
                            borderColor={
                              selectedCategory === category ? "blue.200" :
                              category.confidence > 0.7 ? "green.200" :
                              category.confidence > 0.5 ? "yellow.200" : "red.200"
                            }
                            boxShadow="sm"
                            cursor="pointer"
                            _hover={{
                              transform: "translateY(-2px)",
                              boxShadow: "md",
                            }}
                            transition="all 0.2s"
                          >
                            <Radio 
                              value={index.toString()}
                              mb={2}
                              isChecked={selectedCategory === category}
                            >
                              <Text 
                                color="gray.800" 
                                fontWeight="medium"
                                fontSize={isMobileView ? "sm" : "md"}
                                ml={2}
                              >
                                {category.name}
                              </Text>
                            </Radio>
                            <Text 
                              fontSize={isMobileView ? "xs" : "sm"} 
                              color={
                                category.confidence > 0.7 ? "green.600" :
                                category.confidence > 0.5 ? "yellow.600" : "red.600"
                              }
                              ml={6}
                            >
                              Confidence Score: {(category.confidence * 100).toFixed(1)}%
                            </Text>
                          </Box>
                      ))}
                    </Stack>
                  </RadioGroup>
                </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red" 
              mr={3} 
              onClick={handleCancel}
              size={isMobileView ? "sm" : "md"}
              _hover={{ transform: "translateY(-1px)" }}
              transition="all 0.2s"
            >
              Cancel
            </Button>
            <Button 
              colorScheme="green" 
              onClick={handleConfirm}
              size={isMobileView ? "sm" : "md"}
              _hover={{ transform: "translateY(-1px)" }}
              transition="all 0.2s"
              isDisabled={!selectedCategory || !analysisResult.categories || analysisResult.categories.length === 0}
            >
              Confirm Selected Category
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal 
        isOpen={categoryErrorModal}
        onClose={() => setCategoryErrorModal(false)}
        size={isMobileView ? "sm" : "md"}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize={isMobileView ? "md" : "lg"}>Category Not Found</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box p={2} bg="red.50" borderRadius="md" color="red.500" textAlign="center">
              No category found for this product. Please try another photo.
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" onClick={() => setCategoryErrorModal(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FileUpload; 