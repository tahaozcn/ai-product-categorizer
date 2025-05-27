import React, { useState } from 'react';
import { Box, Heading, Button, VStack, Input, Textarea, Image, Text, FormControl, FormLabel, HStack, Tag, TagLabel, useToast, Checkbox, CheckboxGroup } from '@chakra-ui/react';
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
    const toast = useToast();
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleAICategorize = async () => {
        if (!image) {
            toast({ title: 'Please upload a product image.', status: 'warning' });
            return;
        }
        setLoading(true);
        const formData = new FormData();
        formData.append('image', image);
        try {
            const res = await axios.post('http://localhost:8000/api/categorize', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setAiCategories(res.data.categories || []);
            setSelectedCategories([]);
            toast({ title: 'AI category suggestions received!', status: 'success' });
        } catch (err) {
            toast({ title: 'AI categorization failed.', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image || !name || !description || !price || selectedCategories.length === 0) {
            toast({ title: 'Please fill all fields and select at least one category.', status: 'warning' });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast({ title: 'Please login to continue.', status: 'error' });
                return;
            }

            // Tek API call ile hem upload hem kayıt
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
                title: 'Product saved successfully!',
                description: `${name} has been added to the store.`,
                status: 'success',
                duration: 2000
            });

            // Form'u sıfırla
            setShowForm(false);
            setImage(null);
            setImagePreview(null);
            setName('');
            setDescription('');
            setPrice('');
            setAiCategories([]);
            setSelectedCategories([]);

            // Products sayfasına yönlendir
            setTimeout(() => navigate('/products'), 1000);

        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Product save failed.';
            toast({
                title: 'Product save failed.',
                description: errorMessage,
                status: 'error',
                duration: 4000
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box maxW="4xl" mx="auto" py={10}>
            <Heading size="xl" mb={8} color="purple.700">🛍️ Seller Dashboard</Heading>
            <Text mb={6} color="gray.600" fontSize="lg">
                Upload your products with AI-powered categorization and reach more customers!
            </Text>

            {!showForm ? (
                <VStack spacing={4} align="stretch">
                    <Button
                        colorScheme="purple"
                        size="lg"
                        onClick={() => setShowForm(true)}
                        leftIcon={<Text>🤖</Text>}
                    >
                        Add New Product with AI Categorization
                    </Button>
                    <Button
                        variant="outline"
                        colorScheme="purple"
                        onClick={() => navigate('/products')}
                    >
                        View All Products
                    </Button>
                </VStack>
            ) : (
                <Box bg="white" p={8} borderRadius="xl" boxShadow="lg">
                    <form onSubmit={handleSubmit}>
                        <VStack spacing={6} align="stretch">
                            <FormControl isRequired>
                                <FormLabel>Product Image</FormLabel>
                                <Button as="label" htmlFor="product-image-upload" colorScheme="purple" variant="outline" cursor="pointer" mb={2}>
                                    Choose File
                                </Button>
                                <Input id="product-image-upload" type="file" accept="image/*" onChange={handleImageChange} display="none" />
                                {image && <Text fontSize="sm" color="gray.600">{image.name}</Text>}
                                {imagePreview && <Image src={imagePreview} alt="Preview" boxSize="200px" mt={2} borderRadius="md" />}
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Product Name</FormLabel>
                                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Enter product name" />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Description</FormLabel>
                                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your product" />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Price ($)</FormLabel>
                                <Input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
                            </FormControl>

                            <Button
                                colorScheme="blue"
                                onClick={handleAICategorize}
                                isLoading={loading && aiCategories.length === 0}
                                type="button"
                                leftIcon={<Text>🧠</Text>}
                            >
                                Get AI Category Suggestions
                            </Button>

                            {aiCategories.length > 0 && (
                                <FormControl>
                                    <FormLabel>AI Category Suggestions (select at least one)</FormLabel>
                                    <CheckboxGroup
                                        value={selectedCategories}
                                        onChange={setSelectedCategories}
                                    >
                                        <VStack align="start">
                                            {aiCategories.map((cat, i) => (
                                                <Checkbox key={i} value={cat.name}>
                                                    {cat.name}
                                                    <Text as="span" fontSize="sm" color="gray.500" ml={2}>
                                                        ({(cat.confidence * 100).toFixed(1)}% confidence)
                                                    </Text>
                                                </Checkbox>
                                            ))}
                                        </VStack>
                                    </CheckboxGroup>
                                </FormControl>
                            )}

                            {selectedCategories.length > 0 && (
                                <Box>
                                    <Text mb={2} fontWeight="medium">Selected Categories:</Text>
                                    <HStack wrap="wrap">
                                        {selectedCategories.map((cat, i) => (
                                            <Tag key={i} colorScheme="purple"><TagLabel>{cat}</TagLabel></Tag>
                                        ))}
                                    </HStack>
                                </Box>
                            )}

                            <HStack spacing={4}>
                                <Button
                                    colorScheme="green"
                                    type="submit"
                                    isLoading={loading}
                                    loadingText="Saving Product..."
                                    leftIcon={<Text>💾</Text>}
                                >
                                    Save Product
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </Button>
                            </HStack>
                        </VStack>
                    </form>
                </Box>
            )}
        </Box>
    );
};

export default SellerDashboard; 