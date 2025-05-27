import React, { useEffect, useState } from 'react';
import {
    Box, Heading, SimpleGrid, Input, Checkbox, Stack, Text, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Button, VStack, HStack, Tag, TagLabel, Image, useToast
} from '@chakra-ui/react';
import { FaShoppingCart, FaPlus, FaMinus, FaLock } from 'react-icons/fa';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';

const categoriesList = [
    'Electronics',
    'Fashion & Clothing',
    'Home & Furniture',
    'Beauty & Personal Care',
    'Health & Wellness',
    'Groceries & Food',
    'Baby & Kids',
    'Sports & Outdoors',
    'Books & Stationery',
    'Automotive & Tools',
    'Pet Supplies',
    'Toys & Games',
    'Travel & Luggages'
];

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedCategories, setSelectedCategories] = useState(categoriesList);
    const [priceRange, setPriceRange] = useState([0, 2000]);
    const { addToCart, isInCart, getItemQuantity, updateQuantity, removeFromCart } = useCart();
    const { user } = useAuth();
    const toast = useToast();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);

    // Check if user is seller
    const isSeller = user && user.role === 'seller';

    // Initialize search from URL parameters
    useEffect(() => {
        const urlSearch = searchParams.get('search');
        if (urlSearch) {
            setSearch(urlSearch);
        }
    }, [searchParams]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8000/api/all-products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleAddToCart = (product) => {
        if (isSeller) {
            toast({
                title: 'Action not allowed',
                description: 'Sellers cannot purchase products. Please use a customer account.',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        addToCart(product);
        toast({
            title: 'Added to cart!',
            description: `${product.name} has been added to your cart.`,
            status: 'success',
            duration: 2000,
            isClosable: true,
        });
    };

    const handleQuantityChange = (product, change) => {
        if (isSeller) {
            toast({
                title: 'Action not allowed',
                description: 'Sellers cannot purchase products.',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        const currentQuantity = getItemQuantity(product.id);
        const newQuantity = currentQuantity + change;

        if (newQuantity <= 0) {
            removeFromCart(product.id);
            toast({
                title: 'Removed from cart',
                description: `${product.name} has been removed from your cart.`,
                status: 'info',
                duration: 2000,
                isClosable: true,
            });
        } else {
            updateQuantity(product.id, newQuantity);
        }
    };

    // Filtrelenmiş ürünler
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());

        // Kategori filtreleme - Tutarlı logic: Kategoriler seçilmişse sadece o kategoriler
        let matchesCategory = false;
        if (selectedCategories.length === 0) {
            // Hiçbir kategori seçili değilse hiçbir ürün gösterme
            matchesCategory = false;
        } else if (Array.isArray(product.categories)) {
            matchesCategory = product.categories.some(cat => {
                const categoryString = typeof cat === 'string' ? cat : (cat?.name || '');
                const mainCategory = categoryString.split(' - ')[0] || categoryString;

                return selectedCategories.some(selectedCat => {
                    // Tam eşleşme kontrolü
                    if (mainCategory.toLowerCase() === selectedCat.toLowerCase()) {
                        return true;
                    }
                    // Kısmi eşleşme kontrolü (daha esnek)
                    return mainCategory.toLowerCase().includes(selectedCat.toLowerCase()) ||
                        selectedCat.toLowerCase().includes(mainCategory.toLowerCase());
                });
            });
        }

        const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
        return matchesSearch && matchesCategory && matchesPrice;
    });

    return (
        <Box maxW="8xl" mx="auto" py={8} px={{ base: 2, md: 8 }}>
            {/* Enhanced Header */}
            <VStack spacing={6} mb={10}>
                <Heading size="2xl" fontWeight="extrabold" color="purple.700">
                    🏪 Marketplace
                </Heading>
            </VStack>

            <HStack align="start" spacing={8}>
                {/* Sol Filtre Paneli */}
                <VStack spacing={4} align="stretch">
                    {/* Products Count Badge */}
                    <Box bg="purple.50" px={4} py={2} borderRadius="full" border="1px" borderColor="purple.200" textAlign="center">
                        <Text fontSize="sm" color="purple.700" fontWeight="medium">
                            {filteredProducts.length} of {products.length} products shown
                        </Text>
                    </Box>

                    <Box minW="250px" bg="white" p={6} borderRadius="xl" boxShadow="xl" border="2px" borderColor="purple.100">
                        <HStack spacing={2} mb={4}>
                            <Box fontSize="lg">🎛️</Box>
                            <Text fontWeight="bold" color="purple.700" fontSize="lg">Filters</Text>
                        </HStack>
                        <VStack align="stretch" spacing={6}>
                            {/* Smart Search */}
                            <Box>
                                <HStack spacing={2} mb={2}>
                                    <Box fontSize="sm">🔍</Box>
                                    <Text fontWeight="medium">Search</Text>
                                </HStack>
                                <Input
                                    placeholder="Find matching products..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    bg="white"
                                    border="2px"
                                    borderColor="gray.200"
                                    _focus={{
                                        borderColor: 'purple.400',
                                        bg: 'white',
                                        boxShadow: '0 0 0 1px rgba(147, 51, 234, 0.4)'
                                    }}
                                    _hover={{ borderColor: 'gray.300' }}
                                    borderRadius="md"
                                />
                                {search && (
                                    <Text fontSize="xs" color="purple.600" mt={1}>
                                        Analyzing "{search}"...
                                    </Text>
                                )}
                            </Box>
                            {/* Categories */}
                            <Box>
                                <HStack spacing={2} mb={2}>
                                    <Box fontSize="sm">🏷️</Box>
                                    <Text fontWeight="medium">Categories</Text>
                                </HStack>
                                <VStack align="start" maxH="200px" overflowY="auto" spacing={3} p={2}>
                                    {categoriesList.map(cat => (
                                        <Checkbox
                                            key={cat}
                                            isChecked={selectedCategories.includes(cat)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedCategories([...selectedCategories, cat]);
                                                } else {
                                                    setSelectedCategories(selectedCategories.filter(c => c !== cat));
                                                }
                                            }}
                                            size="md"
                                            colorScheme="purple"
                                            borderColor="gray.300"
                                            _checked={{
                                                borderColor: 'purple.500',
                                                color: 'purple.500'
                                            }}
                                            _hover={{
                                                borderColor: 'purple.400'
                                            }}
                                            _focus={{
                                                boxShadow: 'none'
                                            }}
                                        >
                                            <Text fontSize="sm" color="gray.700" fontWeight="medium" ml={2}>
                                                {cat}
                                            </Text>
                                        </Checkbox>
                                    ))}
                                </VStack>
                                <HStack spacing={2} mt={3}>
                                    <Button size="sm" colorScheme="purple" variant="ghost" onClick={() => setSelectedCategories(categoriesList)}>
                                        Select All
                                    </Button>
                                    <Button size="sm" colorScheme="gray" variant="ghost" onClick={() => setSelectedCategories([])}>
                                        Clear All
                                    </Button>
                                </HStack>
                            </Box>
                            {/* Smart Price Range */}
                            <Box>
                                <HStack spacing={2} mb={2}>
                                    <Box fontSize="sm">💰</Box>
                                    <Text fontWeight="medium">Price Range</Text>
                                </HStack>
                                <Text fontSize="sm" color="gray.600" mb={3}>
                                    ${priceRange[0]} - ${priceRange[1]}
                                </Text>
                                <HStack spacing={2} mb={3}>
                                    <Input
                                        type="number"
                                        value={priceRange[0]}
                                        min={0}
                                        max={priceRange[1]}
                                        onChange={e => setPriceRange([+e.target.value, priceRange[1]])}
                                        w="80px"
                                        size="sm"
                                        bg="white"
                                        border="2px"
                                        borderColor="gray.200"
                                        _focus={{ borderColor: 'purple.400' }}
                                    />
                                    <Text fontWeight="medium">-</Text>
                                    <Input
                                        type="number"
                                        value={priceRange[1]}
                                        min={priceRange[0]}
                                        max={5000}
                                        onChange={e => setPriceRange([priceRange[0], +e.target.value])}
                                        w="80px"
                                        size="sm"
                                        bg="white"
                                        border="2px"
                                        borderColor="gray.200"
                                        _focus={{ borderColor: 'purple.400' }}
                                    />
                                </HStack>
                                <Slider
                                    min={0}
                                    max={2000}
                                    step={10}
                                    value={priceRange[1]}
                                    onChange={val => setPriceRange([priceRange[0], val])}
                                    colorScheme="purple"
                                >
                                    <SliderTrack><SliderFilledTrack /></SliderTrack>
                                    <SliderThumb />
                                </Slider>
                            </Box>
                        </VStack>
                    </Box>
                </VStack>
                {/* Sağ Ürün Grid */}
                <Box flex={1}>
                    {/* Products Grid */}
                    <Box flex={1}>
                        {loading ? (
                            <VStack spacing={6} py={20}>
                                <Box fontSize="6xl">⏳</Box>
                                <Text fontSize="xl" fontWeight="bold" color="purple.700">Loading products...</Text>
                                <Text color="gray.600">Please wait while we fetch the marketplace data</Text>
                            </VStack>
                        ) : filteredProducts.length === 0 ? (
                            <VStack spacing={6} py={20}>
                                <Box fontSize="6xl">🔍</Box>
                                <Text fontSize="xl" fontWeight="bold" color="gray.700">No products found</Text>
                                <Text color="gray.500" textAlign="center">
                                    {search
                                        ? `No products matching "${search}". Try adjusting your search or filters.`
                                        : "No products match your current filters."
                                    }
                                </Text>
                                <Button
                                    colorScheme="purple"
                                    onClick={() => {
                                        setSearch('');
                                        setSelectedCategories(categoriesList);
                                        setPriceRange([0, 2000]);
                                    }}
                                    leftIcon={<Box fontSize="sm">🔄</Box>}
                                >
                                    Reset Filters
                                </Button>
                            </VStack>
                        ) : (
                            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6} w="full">
                                {filteredProducts.map(product => {
                                    const inCart = isInCart(product.id);
                                    const quantity = getItemQuantity(product.id);

                                    return (
                                        <Box
                                            key={product.id}
                                            bg="white"
                                            borderRadius="xl"
                                            boxShadow="lg"
                                            border="1px"
                                            borderColor="gray.100"
                                            overflow="hidden"
                                            _hover={{
                                                boxShadow: '2xl',
                                                transform: 'translateY(-4px)',
                                                borderColor: 'indigo.200'
                                            }}
                                            transition="all 0.3s"
                                            position="relative"
                                            display="flex"
                                            flexDirection="column"
                                            h="auto"
                                            minH="480px"
                                        >
                                            <Box h="180px" bg="gray.100" display="flex" alignItems="center" justifyContent="center" position="relative" flexShrink={0}>
                                                <Image
                                                    src={product.image_url.startsWith('http') ? product.image_url : `http://localhost:8000${product.image_url}`}
                                                    alt={product.name}
                                                    objectFit="cover"
                                                    w="100%"
                                                    h="100%"
                                                    fallbackSrc="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&crop=center"
                                                    onError={(e) => {
                                                        e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjdGQUZDIi8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzIwMCAxNzIuMDkxIDIwMCAxOTQuMTgyIDIwMCAyMTYuMjczQzIwMCAyMzguMzY0IDIwMCAyNjAuNDU1IDIwMCAyODAuNDU1SDE4MEMxODAgMjYwLjQ1NSAxODAgMjM4LjM2NCAxODAgMjE2LjI3M0MxODAgMTk0LjE4MiAxODAgMTcyLjA5MSAxODAgMTUwQzE4MCAxMjcuOTA5IDE4MCAxMDUuODE4IDE4MCA4My43MjczQzE4MCA2MS42MzY0IDE4MCAzOS41NDU1IDE4MCAyMEgyMDBDMjAwIDM5LjU0NTUgMjAwIDYxLjYzNjQgMjAwIDgzLjcyNzNDMjAwIDEwNS44MTggMjAwIDEyNy45MDkgMjAwIDE1MFoiIGZpbGw9IiNEMUQ1REIiLz4KPHBhdGggZD0iTTE2NSAxNTBIMjM1IiBzdHJva2U9IiNEMUQ1REIiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjwvcmVnPgo8L3N2Zz4K";
                                                    }}
                                                />
                                            </Box>
                                            <Box p={4} flex={1} display="flex" flexDirection="column">
                                                <HStack mb={2} wrap="wrap" spacing={2}>
                                                    {Array.isArray(product.categories) && product.categories.slice(0, 3).map((cat, i) => (
                                                        <Tag key={i} colorScheme="purple" variant="solid" borderRadius="full" size="sm" bg="purple.100" color="purple.800" border="1px" borderColor="purple.200">
                                                            <TagLabel fontSize="xs" fontWeight="semibold">
                                                                {typeof cat === 'string'
                                                                    ? cat.split(' - ')[0]
                                                                    : cat?.name?.split(' - ')[0] || 'Category'
                                                                }
                                                            </TagLabel>
                                                        </Tag>
                                                    ))}
                                                </HStack>
                                                <Heading size="md" mb={2} noOfLines={2} color="gray.800">{product.name}</Heading>
                                                <HStack justify="space-between" align="center" mb={2}>
                                                    <Text fontWeight="bold" color="purple.700" fontSize="lg">${product.price}</Text>
                                                    <Text fontSize="xs" color="gray.500">by {product.seller}</Text>
                                                </HStack>
                                                <Text fontSize="sm" color="gray.600" noOfLines={3} mb={3}>{product.description}</Text>

                                                {/* Cart Controls - Always at bottom */}
                                                <Box mt="auto" pt={3} borderTop="1px" borderColor="gray.100">
                                                    {isSeller ? (
                                                        <Button
                                                            colorScheme="red"
                                                            variant="outline"
                                                            leftIcon={<FaLock />}
                                                            w="full"
                                                            size="md"
                                                            isDisabled
                                                            opacity={0.7}
                                                            borderRadius="md"
                                                            color="red.500"
                                                            borderColor="red.200"
                                                        >
                                                            Sellers Cannot Purchase
                                                        </Button>
                                                    ) : !inCart ? (
                                                        <Button
                                                            colorScheme="purple"
                                                            variant="solid"
                                                            leftIcon={<FaShoppingCart />}
                                                            onClick={() => handleAddToCart(product)}
                                                            w="full"
                                                            size="md"
                                                            borderRadius="md"
                                                            bg="purple.500"
                                                            color="white"
                                                            _hover={{
                                                                bg: 'purple.600',
                                                                transform: 'translateY(-1px)',
                                                                boxShadow: 'md'
                                                            }}
                                                            fontWeight="semibold"
                                                        >
                                                            Add to Cart
                                                        </Button>
                                                    ) : (
                                                        <VStack spacing={2} w="full">
                                                            <Text fontSize="xs" color="purple.600" fontWeight="bold" textAlign="center">
                                                                ✓ In Cart
                                                            </Text>
                                                            <HStack spacing={2} w="full">
                                                                <Button
                                                                    size="md"
                                                                    colorScheme="purple"
                                                                    variant="outline"
                                                                    onClick={() => handleQuantityChange(product, -1)}
                                                                    isDisabled={quantity <= 1}
                                                                    borderRadius="md"
                                                                    flex={1}
                                                                    borderColor="purple.300"
                                                                    color="purple.600"
                                                                    _hover={{ bg: 'purple.50' }}
                                                                >
                                                                    <FaMinus />
                                                                </Button>
                                                                <Box
                                                                    flex={2}
                                                                    textAlign="center"
                                                                    fontWeight="bold"
                                                                    fontSize="md"
                                                                    py={2}
                                                                    bg="purple.50"
                                                                    borderRadius="md"
                                                                    color="purple.700"
                                                                >
                                                                    {quantity}
                                                                </Box>
                                                                <Button
                                                                    size="md"
                                                                    colorScheme="purple"
                                                                    variant="outline"
                                                                    onClick={() => handleQuantityChange(product, 1)}
                                                                    borderRadius="md"
                                                                    flex={1}
                                                                    borderColor="purple.300"
                                                                    color="purple.600"
                                                                    _hover={{ bg: 'purple.50' }}
                                                                >
                                                                    <FaPlus />
                                                                </Button>
                                                            </HStack>
                                                        </VStack>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </SimpleGrid>
                        )}
                    </Box>
                </Box>
            </HStack>
        </Box>
    );
};

export default ProductsPage; 