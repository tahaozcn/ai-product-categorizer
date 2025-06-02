import React, { useState, useRef } from 'react';
import {
    Box,
    Heading,
    Button,
    VStack,
    HStack,
    Input,
    Textarea,
    Image,
    Text,
    FormControl,
    FormLabel,
    Tag,
    TagLabel,
    useToast,
    Checkbox,
    CheckboxGroup,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    IconButton,
    Container,
    SimpleGrid,
    Card,
    CardBody,
    Badge,
    Progress,
    Flex,
    Icon,
    Divider,
    useColorModeValue,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Spinner,
    GridItem,
    AspectRatio
} from '@chakra-ui/react';
import {
    FaCamera,
    FaUpload,
    FaRobot,
    FaMagic,
    FaChartLine,
    FaImage,
    FaTag,
    FaDollarSign,
    FaPlay,
    FaStop,
    FaCheck,
    FaStar,
    FaLightbulb,
    FaGem
} from 'react-icons/fa';
import { CloseIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SellerDashboard = () => {
    const [showForm, setShowForm] = useState(false);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [aiCategories, setAiCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [descriptionLoading, setDescriptionLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Upload, 2: AI Analysis, 3: Details, 4: Final

    // Camera related states
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const toast = useToast();
    const navigate = useNavigate();

    const bgGradient = useColorModeValue(
        'linear(to-br, purple.50, blue.50, indigo.50)',
        'linear(to-br, purple.900, blue.900, indigo.900)'
    );

    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('purple.200', 'purple.600');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        setImagePreview(URL.createObjectURL(file));
        // Don't auto-trigger AI analysis, let user click the button
        // setStep(2);
    };

    // Camera functions
    const startCamera = async () => {
        try {
            setIsCameraModalOpen(true);
            setIsCameraOpen(true);

            await new Promise(resolve => setTimeout(resolve, 100));

            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }

            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };

            if (!videoRef.current) {
                throw new Error('Video element not ready');
            }

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
            }

            toast({
                title: 'Camera Error',
                description: errorMessage,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });

            setIsCameraOpen(false);
            setIsCameraModalOpen(false);
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
            setIsCameraModalOpen(false);
        } catch (error) {
            console.error('Camera stop error:', error);
        }
    };

    const capturePhoto = () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0);

        canvas.toBlob((blob) => {
            const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
            // Don't auto-trigger AI analysis, let user click the button
            // setStep(2);
            stopCamera();
            toast({
                title: 'Photo Captured!',
                description: 'Photo has been captured successfully. Click "Analyze with AI" to get category suggestions.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        }, 'image/jpeg');
    };

    // Clean up camera when component unmounts
    React.useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    const handleAICategorize = async () => {
        if (!image) {
            toast({ title: 'Please upload a product image.', status: 'warning' });
            return;
        }
        setAiLoading(true);
        const formData = new FormData();
        formData.append('image', image);
        try {
            // Simulate AI processing time for better UX
            await new Promise(resolve => setTimeout(resolve, 2000));

            const res = await axios.post('http://localhost:8000/api/categorize', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Extract category data with confidence scores
            const categoryResults = res.data.categories || [];

            // Normalize category data format
            const categoryData = categoryResults.map(cat => {
                // Backend'den gelen format: {name: "...", confidence: ...}
                if (typeof cat === 'object' && cat.name !== undefined) {
                    return {
                        name: cat.name,
                        confidence: cat.confidence || 0.5
                    };
                }
                // String formatında gelirse
                else if (typeof cat === 'string') {
                    return { name: cat, confidence: 0.5 };
                }
                // Eski format için backward compatibility
                else if (cat.main_category) {
                    return { name: cat.main_category, confidence: cat.confidence || 0.5 };
                }
                // Fallback
                else {
                    return { name: String(cat), confidence: 0.5 };
                }
            });

            // If no categories received, use fallback categories
            let finalCategories = categoryData;
            if (finalCategories.length === 0) {
                finalCategories = [
                    { name: 'Fashion & Clothing', confidence: 0.75 },
                    { name: 'Electronics', confidence: 0.70 },
                    { name: 'Home & Furniture', confidence: 0.65 },
                    { name: 'Beauty & Personal Care', confidence: 0.60 }
                ];

                toast({
                    title: 'Using Sample Categories',
                    description: 'AI analysis unavailable. Using sample categories for demonstration.',
                    status: 'info',
                    duration: 3000
                });
            }

            setAiCategories(finalCategories);
            setSelectedCategories([]);
            toast({
                title: 'Analysis Complete!',
                description: `Found ${finalCategories.length} relevant categories for your product.`,
                status: 'success'
            });
        } catch (err) {
            console.error('AI categorization error:', err);
            console.error('Error response:', err.response?.data);

            // Fallback to demo categories on error
            const fallbackCategories = [
                { name: 'Fashion & Clothing', confidence: 0.65 },
                { name: 'Electronics', confidence: 0.60 },
                { name: 'Home & Furniture', confidence: 0.55 },
                { name: 'Beauty & Personal Care', confidence: 0.50 }
            ];

            setAiCategories(fallbackCategories);
            setSelectedCategories([]);

            toast({
                title: 'AI Temporarily Unavailable',
                description: 'Using sample categories. Your product can still be listed successfully.',
                status: 'warning',
                duration: 5000
            });
        } finally {
            setAiLoading(false);
        }
    };

    // Generate AI description function
    const handleGenerateDescription = async () => {
        if (selectedCategories.length === 0) {
            toast({
                title: 'Select Categories First',
                description: 'Please use "Get AI Categories" button to detect product categories first.',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (!name || name.trim() === '') {
            toast({
                title: 'Product Name Required',
                description: 'Please enter a product name before generating description.',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setDescriptionLoading(true);
        try {
            // Prepare request data with image if available
            let requestData = {
                categories: selectedCategories.map(cat => ({ name: cat })),
                product_name: name.trim()
            };

            // If we have an image, send it for vision analysis
            if (image) {
                // Convert image to base64 for vision models
                const reader = new FileReader();
                const imageDataPromise = new Promise((resolve) => {
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(image);
                });

                const imageData = await imageDataPromise;
                requestData.image_data = imageData;
            }

            const response = await axios.post('http://localhost:8000/api/generate-description', requestData);

            if (response.data.description) {
                setDescription(response.data.description);
                toast({
                    title: 'Description Generated!',
                    description: 'AI has analyzed your product image and generated a professional description.',
                    status: 'success',
                    duration: 4000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error('Error generating description:', error);
            toast({
                title: 'Description Generation Failed',
                description: 'Could not generate AI description. Please try again or write manually.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setDescriptionLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image || !name || !description || !price || selectedCategories.length === 0) {
            toast({ title: 'Please fill all fields and select at least one category.', status: 'warning' });
            return;
        }

        setLoading(true);
        setStep(4);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast({ title: 'Please login to continue.', status: 'error' });
                return;
            }

            const formData = new FormData();
            formData.append('file', image);
            formData.append('name', name);
            formData.append('description', description);
            formData.append('price', price);
            formData.append('categories', JSON.stringify(selectedCategories));

            const response = await axios.post('http://localhost:8000/api/upload', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast({
                title: 'Product Listed Successfully!',
                description: `${name} has been added to your store with AI categorization.`,
                status: 'success',
                duration: 3000
            });

            // Reset form
            setShowForm(false);
            setImage(null);
            setImagePreview(null);
            setName('');
            setDescription('');
            setPrice('');
            setAiCategories([]);
            setSelectedCategories([]);
            setStep(1);
        } catch (error) {
            toast({
                title: 'Upload failed',
                description: error.response?.data?.message || 'Please try again.',
                status: 'error'
            });
            setStep(3);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setImage(null);
        setImagePreview(null);
        setName('');
        setDescription('');
        setPrice('');
        setAiCategories([]);
        setSelectedCategories([]);
        setStep(1);
    };

    return (
        <Box minH="100vh" bg={bgGradient} py={8}>
            <Container maxW="4xl">
                <VStack spacing={8}>
                    {/* Simple Header */}
                    <Box textAlign="center" py={6}>
                        <Heading size="xl" color="purple.600" mb={2}>
                            🤖 AI Product Categorizer
                        </Heading>
                        <Text fontSize="lg" color="gray.600">
                            Upload your product photo and get instant AI category suggestions
                        </Text>
                    </Box>

                    {/* Simple Action Cards */}
                    {!showForm ? (
                        <VStack spacing={6} w="full" maxW="2xl">
                            <Card bg={cardBg} w="full" boxShadow="lg">
                                <CardBody p={8} textAlign="center">
                                    <VStack spacing={6}>
                                        <Icon as={FaRobot} boxSize={16} color="purple.500" />
                                        <VStack spacing={2}>
                                            <Heading size="lg" color="purple.600">
                                                Add New Product
                                            </Heading>
                                            <Text color="gray.600">
                                                Upload photos, get AI categories, and list your product
                                            </Text>
                                        </VStack>
                                        <Button
                                            size="lg"
                                            colorScheme="purple"
                                            leftIcon={<Icon as={FaUpload} />}
                                            onClick={() => setShowForm(true)}
                                            px={8}
                                        >
                                            Start Adding Product
                                        </Button>
                                    </VStack>
                                </CardBody>
                            </Card>

                            <Button
                                variant="outline"
                                colorScheme="blue"
                                leftIcon={<Icon as={FaImage} />}
                                onClick={() => navigate('/my-products')}
                            >
                                View My Products
                            </Button>
                        </VStack>
                    ) : (
                        /* Simple Product Form */
                        <Card bg={cardBg} w="full" maxW="3xl" boxShadow="lg">
                            <CardBody p={8}>
                                <form onSubmit={handleSubmit}>
                                    <VStack spacing={8} align="stretch">

                                        {/* Product Image */}
                                        <FormControl isRequired>
                                            <FormLabel fontSize="lg" fontWeight="bold" color="purple.600">
                                                Product Photo
                                            </FormLabel>

                                            {!imagePreview ? (
                                                <VStack spacing={4}
                                                    border="2px dashed"
                                                    borderColor="purple.200"
                                                    borderRadius="lg"
                                                    p={8}
                                                    bg="purple.50"
                                                >
                                                    <Icon as={FaImage} boxSize={12} color="purple.300" />
                                                    <Text color="gray.600" textAlign="center">
                                                        Upload a clear photo of your product
                                                    </Text>
                                                    <HStack spacing={4}>
                                                        <Button
                                                            as="label"
                                                            htmlFor="file-upload"
                                                            colorScheme="purple"
                                                            leftIcon={<Icon as={FaUpload} />}
                                                            cursor="pointer"
                                                        >
                                                            Choose File
                                                            <Input
                                                                id="file-upload"
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleImageChange}
                                                                hidden
                                                            />
                                                        </Button>

                                                        <Button
                                                            colorScheme="blue"
                                                            leftIcon={<Icon as={FaCamera} />}
                                                            onClick={startCamera}
                                                        >
                                                            Take Photo
                                                        </Button>
                                                    </HStack>
                                                </VStack>
                                            ) : (
                                                <VStack spacing={4}>
                                                    <Image
                                                        src={imagePreview}
                                                        alt="Product"
                                                        maxH="300px"
                                                        borderRadius="lg"
                                                        boxShadow="md"
                                                    />
                                                    <HStack spacing={3}>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setImage(null);
                                                                setImagePreview(null);
                                                                setAiCategories([]);
                                                                setSelectedCategories([]);
                                                            }}
                                                        >
                                                            Change Photo
                                                        </Button>

                                                        <Button
                                                            colorScheme="purple"
                                                            leftIcon={<Icon as={FaRobot} />}
                                                            onClick={handleAICategorize}
                                                            isLoading={aiLoading}
                                                            loadingText="AI Analyzing..."
                                                        >
                                                            Get AI Categories
                                                        </Button>
                                                    </HStack>
                                                </VStack>
                                            )}
                                        </FormControl>

                                        {/* AI Categories */}
                                        {aiCategories.length > 0 && (
                                            <FormControl>
                                                <FormLabel fontSize="lg" fontWeight="bold" color="purple.600">
                                                    AI Suggested Categories
                                                </FormLabel>
                                                <CheckboxGroup
                                                    value={selectedCategories}
                                                    onChange={setSelectedCategories}
                                                >
                                                    <VStack align="start" spacing={2}>
                                                        {aiCategories.map((category, index) => (
                                                            <Checkbox
                                                                key={index}
                                                                value={category.name}
                                                                colorScheme="purple"
                                                            >
                                                                <Text>{category.name} ({Math.round(category.confidence * 100)}%)</Text>
                                                            </Checkbox>
                                                        ))}
                                                    </VStack>
                                                </CheckboxGroup>
                                            </FormControl>
                                        )}

                                        {/* Product Details */}
                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                            <FormControl isRequired>
                                                <FormLabel>Product Name</FormLabel>
                                                <Input
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Enter product name"
                                                />
                                            </FormControl>

                                            <FormControl isRequired>
                                                <FormLabel>Price ($)</FormLabel>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={price}
                                                    onChange={(e) => setPrice(e.target.value)}
                                                    placeholder="0.00"
                                                />
                                            </FormControl>
                                        </SimpleGrid>

                                        {/* Description */}
                                        <FormControl isRequired>
                                            <FormLabel>Description</FormLabel>
                                            <VStack spacing={2} align="stretch">
                                                <HStack>
                                                    <Button
                                                        size="sm"
                                                        colorScheme="green"
                                                        leftIcon={<Icon as={FaMagic} />}
                                                        onClick={handleGenerateDescription}
                                                        isLoading={descriptionLoading}
                                                        loadingText="Generating..."
                                                        isDisabled={selectedCategories.length === 0 || !name || name.trim() === ''}
                                                    >
                                                        Generate AI Description
                                                    </Button>
                                                    <Text fontSize="sm" color="gray.500">
                                                        {selectedCategories.length === 0 && (!name || name.trim() === '') ?
                                                            'Enter product name and select categories first' :
                                                            selectedCategories.length === 0 ?
                                                                'Select categories first' :
                                                                (!name || name.trim() === '') ?
                                                                    'Enter product name first' :
                                                                    'Click to generate AI description'
                                                        }
                                                    </Text>
                                                </HStack>
                                                <Textarea
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    placeholder="Describe your product... or click 'Generate AI Description' button above"
                                                    rows={4}
                                                />
                                            </VStack>
                                        </FormControl>

                                        {/* Manual Categories */}
                                        <FormControl>
                                            <FormLabel>Additional Categories (optional)</FormLabel>
                                            <Textarea
                                                placeholder="Add custom categories, one per line&#10;Fashion & Clothing&#10;Electronics"
                                                rows={3}
                                                onChange={(e) => {
                                                    const manualCategories = e.target.value
                                                        .split('\n')
                                                        .map(cat => cat.trim())
                                                        .filter(cat => cat.length > 0);

                                                    const aiSelected = selectedCategories.filter(cat =>
                                                        aiCategories.some(c => c.name === cat)
                                                    );

                                                    setSelectedCategories([...aiSelected, ...manualCategories]);
                                                }}
                                            />
                                        </FormControl>

                                        {/* Selected Categories Display */}
                                        {selectedCategories.length > 0 && (
                                            <Box>
                                                <Text fontWeight="bold" mb={2} color="purple.600">
                                                    Selected Categories:
                                                </Text>
                                                <HStack wrap="wrap" spacing={2}>
                                                    {selectedCategories.map((category, index) => (
                                                        <Tag key={index} colorScheme="purple">
                                                            <TagLabel>{category}</TagLabel>
                                                        </Tag>
                                                    ))}
                                                </HStack>
                                            </Box>
                                        )}

                                        {/* Action Buttons */}
                                        <HStack justify="space-between" pt={4}>
                                            <Button
                                                variant="outline"
                                                onClick={resetForm}
                                            >
                                                Cancel
                                            </Button>

                                            <Button
                                                type="submit"
                                                colorScheme="green"
                                                size="lg"
                                                isLoading={loading}
                                                loadingText="Publishing..."
                                                leftIcon={<Icon as={FaCheck} />}
                                                isDisabled={selectedCategories.length === 0}
                                            >
                                                Publish Product
                                            </Button>
                                        </HStack>
                                    </VStack>
                                </form>
                            </CardBody>
                        </Card>
                    )}

                    {/* Camera Modal - Simplified */}
                    <Modal isOpen={isCameraModalOpen} onClose={stopCamera} size="lg">
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader>Take Product Photo</ModalHeader>
                            <ModalCloseButton />
                            <ModalBody>
                                <Box
                                    w="full"
                                    h="300px"
                                    bg="black"
                                    borderRadius="lg"
                                    overflow="hidden"
                                >
                                    <video
                                        ref={videoRef}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                        autoPlay
                                        playsInline
                                    />
                                </Box>
                            </ModalBody>
                            <ModalFooter>
                                <HStack spacing={3}>
                                    <Button variant="outline" onClick={stopCamera}>
                                        Cancel
                                    </Button>
                                    <Button colorScheme="blue" onClick={capturePhoto}>
                                        Capture
                                    </Button>
                                </HStack>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                </VStack>
            </Container>
        </Box>
    );
};

export default SellerDashboard; 