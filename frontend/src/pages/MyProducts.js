import React, { useEffect, useState } from 'react';
import {
    Box,
    Heading,
    SimpleGrid,
    Button,
    VStack,
    HStack,
    Text,
    Image,
    Tag,
    TagLabel,
    useToast,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useDisclosure,
    Input,
    Textarea,
    FormControl,
    FormLabel,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Badge,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Divider
} from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteProductId, setDeleteProductId] = useState(null);
    const [editProduct, setEditProduct] = useState(null);
    const [stats, setStats] = useState({ total: 0, avgPrice: 0, categories: {} });

    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const cancelRef = React.useRef();
    const toast = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyProducts();
    }, []);

    const fetchMyProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast({ title: 'Please login to continue.', status: 'error' });
                navigate('/login');
                return;
            }

            const response = await axios.get('http://localhost:8000/api/products', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setProducts(response.data);
            calculateStats(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast({ title: 'Failed to load products', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (productsData) => {
        const total = productsData.length;
        const avgPrice = total > 0 ? productsData.reduce((sum, p) => sum + (p.price || 0), 0) / total : 0;

        const categories = {};
        productsData.forEach(product => {
            if (product.categories && Array.isArray(product.categories)) {
                product.categories.forEach(cat => {
                    const mainCat = typeof cat === 'string' ? cat.split(' - ')[0] : cat?.name?.split(' - ')[0] || 'Other';
                    categories[mainCat] = (categories[mainCat] || 0) + 1;
                });
            }
        });

        setStats({ total, avgPrice, categories });
    };

    const handleDeleteClick = (productId) => {
        setDeleteProductId(productId);
        onDeleteOpen();
    };

    const handleDeleteConfirm = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8000/api/products/${deleteProductId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            toast({ title: 'Product deleted successfully!', status: 'success' });
            fetchMyProducts(); // Refresh the list
        } catch (error) {
            toast({ title: 'Failed to delete product', status: 'error' });
        } finally {
            onDeleteClose();
            setDeleteProductId(null);
        }
    };

    const handleEditClick = (product) => {
        setEditProduct({ ...product });
        onEditOpen();
    };

    const handleEditSave = async () => {
        try {
            const token = localStorage.getItem('token');
            // Note: You'll need to implement PUT endpoint for updating products
            await axios.put(`http://localhost:8000/api/products/${editProduct.id}`, editProduct, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            toast({ title: 'Product updated successfully!', status: 'success' });
            fetchMyProducts();
            onEditClose();
        } catch (error) {
            toast({ title: 'Failed to update product', status: 'error' });
        }
    };

    if (loading) {
        return (
            <Box maxW="8xl" mx="auto" py={8} px={{ base: 2, md: 8 }}>
                <Text>Loading your products...</Text>
            </Box>
        );
    }

    return (
        <Box maxW="8xl" mx="auto" py={8} px={{ base: 2, md: 8 }}>
            <HStack justify="space-between" mb={8}>
                <Heading size="2xl" fontWeight="extrabold" color="purple.700">
                    📦 My Products
                </Heading>
                <Button
                    colorScheme="purple"
                    onClick={() => navigate('/seller-dashboard')}
                    leftIcon={<Text>➕</Text>}
                >
                    Add New Product
                </Button>
            </HStack>

            {/* Stats Section */}
            <Box bg="white" p={6} borderRadius="xl" boxShadow="md" mb={8}>
                <Heading size="md" mb={4}>📊 Your Store Statistics</Heading>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                    <Stat>
                        <StatLabel>Total Products</StatLabel>
                        <StatNumber>{stats.total}</StatNumber>
                        <StatHelpText>Products in your store</StatHelpText>
                    </Stat>
                    <Stat>
                        <StatLabel>Average Price</StatLabel>
                        <StatNumber>${stats.avgPrice.toFixed(2)}</StatNumber>
                        <StatHelpText>Across all products</StatHelpText>
                    </Stat>
                    <Stat>
                        <StatLabel>Categories</StatLabel>
                        <StatNumber>{Object.keys(stats.categories).length}</StatNumber>
                        <StatHelpText>Different categories</StatHelpText>
                    </Stat>
                </SimpleGrid>

                {Object.keys(stats.categories).length > 0 && (
                    <>
                        <Divider my={4} />
                        <Text fontWeight="medium" mb={2}>Category Breakdown:</Text>
                        <HStack wrap="wrap">
                            {Object.entries(stats.categories).map(([category, count]) => (
                                <Badge key={category} colorScheme="purple" px={2} py={1}>
                                    {category}: {count}
                                </Badge>
                            ))}
                        </HStack>
                    </>
                )}
            </Box>

            {/* Products Grid */}
            {products.length === 0 ? (
                <Box textAlign="center" py={20} bg="white" borderRadius="xl">
                    <Text fontSize="xl" color="gray.500" mb={4}>
                        🛍️ No products yet
                    </Text>
                    <Text color="gray.400" mb={6}>
                        Start building your store by adding your first product!
                    </Text>
                    <Button
                        colorScheme="purple"
                        size="lg"
                        onClick={() => navigate('/seller-dashboard')}
                    >
                        Add Your First Product
                    </Button>
                </Box>
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                    {products.map(product => (
                        <Box
                            key={product.id}
                            bg="white"
                            borderRadius="xl"
                            boxShadow="md"
                            overflow="hidden"
                            _hover={{ boxShadow: '2xl', transform: 'translateY(-2px)' }}
                            transition="all 0.2s"
                        >
                            <Box h="200px" bg="gray.100" display="flex" alignItems="center" justifyContent="center">
                                <Image
                                    src={`http://localhost:8000${product.image_url}`}
                                    alt={product.name}
                                    objectFit="cover"
                                    w="100%"
                                    h="100%"
                                    fallbackSrc="https://via.placeholder.com/400x300?text=No+Image"
                                />
                            </Box>

                            <Box p={6}>
                                <HStack mb={2} wrap="wrap">
                                    {Array.isArray(product.categories) && product.categories.slice(0, 2).map((cat, i) => (
                                        <Tag key={i} colorScheme="purple" variant="subtle" size="sm">
                                            <TagLabel>
                                                {typeof cat === 'string'
                                                    ? cat.split(' - ')[0]
                                                    : cat?.name?.split(' - ')[0] || 'Category'
                                                }
                                            </TagLabel>
                                        </Tag>
                                    ))}
                                </HStack>

                                <Heading size="md" mb={2} noOfLines={2}>{product.name}</Heading>
                                <Text fontWeight="bold" color="purple.700" mb={2} fontSize="lg">
                                    ${product.price}
                                </Text>
                                <Text fontSize="sm" color="gray.600" noOfLines={3} mb={4}>
                                    {product.description}
                                </Text>

                                <HStack spacing={2}>
                                    <Button
                                        size="sm"
                                        colorScheme="blue"
                                        variant="outline"
                                        onClick={() => handleEditClick(product)}
                                        flex={1}
                                    >
                                        ✏️ Edit
                                    </Button>
                                    <Button
                                        size="sm"
                                        colorScheme="red"
                                        variant="outline"
                                        onClick={() => handleDeleteClick(product.id)}
                                        flex={1}
                                    >
                                        🗑️ Delete
                                    </Button>
                                </HStack>
                            </Box>
                        </Box>
                    ))}
                </SimpleGrid>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                isOpen={isDeleteOpen}
                leastDestructiveRef={cancelRef}
                onClose={onDeleteClose}
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
                            <Button ref={cancelRef} onClick={onDeleteClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            {/* Edit Product Modal */}
            <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Edit Product</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {editProduct && (
                            <VStack spacing={4}>
                                <FormControl>
                                    <FormLabel>Product Name</FormLabel>
                                    <Input
                                        value={editProduct.name}
                                        onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Description</FormLabel>
                                    <Textarea
                                        value={editProduct.description}
                                        onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Price ($)</FormLabel>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={editProduct.price}
                                        onChange={(e) => setEditProduct({ ...editProduct, price: parseFloat(e.target.value) })}
                                    />
                                </FormControl>
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onEditClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue" onClick={handleEditSave}>
                            Save Changes
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default MyProducts; 