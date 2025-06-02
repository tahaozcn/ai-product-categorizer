import React, { useState } from 'react';
import {
    Box,
    Button,
    Container,
    Heading,
    Text,
    VStack,
    HStack,
    Input,
    InputGroup,
    InputRightElement,
    SimpleGrid,
    Card,
    CardBody,
    Icon,
    Badge,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    useColorModeValue,
    Flex,
    Image,
} from '@chakra-ui/react';
import { FaSearch, FaRocket, FaBrain, FaChartLine, FaUsers, FaShoppingCart, FaStore, FaRobot, FaCamera } from 'react-icons/fa';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const categories = [
    { name: 'Electronics', count: 1243, image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80' },
    { name: 'Clothing & Fashion', count: 857, image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80' },
    { name: 'Home & Kitchen', count: 765, image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80' },
    { name: 'Beauty & Personal Care', count: 532, image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80' },
];

const products = [
    { name: 'Modern Glass Vase', price: 29.99, seller: 'HomeDecor Studio', image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80', desc: 'Elegant hand-blown glass vase perfect for any modern home decor.' },
    { name: 'Wireless Headphones', price: 149.99, seller: 'Tech Gadgets Inc.', image: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=400&q=80', desc: 'Premium noise-cancelling wireless headphones with 30-hour battery life.' },
    { name: 'Leather Messenger Bag', price: 89.99, seller: 'Urban Leather', image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', desc: 'Handcrafted genuine leather messenger bag with multiple compartments.' },
    { name: 'Ceramic Plant Pot', price: 24.99, seller: 'HomeDecor Studio', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', desc: 'Modern minimalist ceramic plant pot for indoor plants and succulents.' },
];

const testimonials = [
    { name: 'Jane Doe', company: 'Vintage Collectibles', text: 'The AI categorization saves me at least 10 minutes per product. With hundreds of vintage items to list, this has been a game-changer for my business.', rating: 5 },
    { name: 'Michael Smith', company: 'Tech Gadgets Pro', text: 'The accuracy of the AI categorization is impressive. It correctly identified even my most niche electronic components and placed them in the right subcategory.', rating: 5 },
    { name: 'Sarah Collins', company: 'Handmade Jewelry', text: 'The platform has helped me reach more customers since my products are now properly categorized and easier to find. My sales have increased by 30% in just two months.', rating: 4 },
];

const PLACEHOLDER_IMG = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

const HomePage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Navigate to marketplace with search query
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            navigate('/products');
        }
    };

    return (
        <Box>
            {/* Hero Section */}
            <Box bg="linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" color="white" py={{ base: 20, md: 32 }}>
                <Container maxW="6xl">
                    <VStack spacing={8} textAlign="center">
                        <Heading
                            fontSize={{ base: '4xl', md: '6xl' }}
                            fontWeight="extrabold"
                            bgGradient="linear(to-r, white, purple.200)"
                            bgClip="text"
                            lineHeight="1.3"
                            letterSpacing="-0.01em"
                            fontFamily="'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                            textAlign="center"
                            display="block"
                            py={2}
                            css={{
                                textRendering: 'optimizeLegibility',
                                WebkitFontSmoothing: 'antialiased',
                                MozOsxFontSmoothing: 'grayscale',
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text',
                                overflow: 'visible'
                            }}
                        >
                            <Text as="span" display="inline-block">AI Product Categorizer</Text>
                        </Heading>
                        <Text fontSize={{ base: 'xl', md: '2xl' }} maxW="3xl" opacity={0.9}>
                            Upload your product photos and get instant AI-powered category suggestions.
                            Save time on product listing with accurate categorization.
                        </Text>

                        {/* Smart Search Bar */}
                        <Box w="full" maxW="2xl">
                            <form onSubmit={handleSearch}>
                                <InputGroup size="lg">
                                    <Input
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        bg="white"
                                        color="gray.800"
                                        border="none"
                                        borderRadius="full"
                                        fontSize="lg"
                                        _placeholder={{ color: 'gray.500' }}
                                        _focus={{ boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.3)' }}
                                    />
                                    <InputRightElement width="4.5rem">
                                        <Button
                                            h="1.75rem"
                                            size="sm"
                                            colorScheme="purple"
                                            borderRadius="full"
                                            type="submit"
                                        >
                                            <FaSearch />
                                        </Button>
                                    </InputRightElement>
                                </InputGroup>
                            </form>
                        </Box>

                        <HStack spacing={4} flexWrap="wrap" justify="center">
                            <Button
                                as={RouterLink}
                                to="/products"
                                size="lg"
                                colorScheme="white"
                                variant="solid"
                                color="indigo.700"
                                leftIcon={<FaShoppingCart />}
                                _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
                                borderRadius="full"
                                border="2px solid white"
                                px={8}
                            >
                                Browse Products
                            </Button>
                            <Button
                                as={RouterLink}
                                to="/register"
                                size="lg"
                                variant="outline"
                                color="white"
                                borderColor="white"
                                borderWidth="2px"
                                leftIcon={<FaStore />}
                                _hover={{ bg: 'whiteAlpha.200', transform: 'translateY(-2px)' }}
                                borderRadius="full"
                                px={8}
                            >
                                Start Categorizing
                            </Button>
                        </HStack>
                    </VStack>
                </Container>
            </Box>

            {/* AI Features Section */}
            <Box py={20} bg="gray.50">
                <Container maxW="6xl">
                    <VStack spacing={16}>
                        <VStack spacing={4} textAlign="center">
                            <Heading size="2xl" color="gray.800">
                                How It Works
                            </Heading>
                            <Text fontSize="xl" color="gray.600" maxW="3xl">
                                Our AI analyzes your product images and suggests the most accurate categories.
                                Perfect for sellers who want to quickly categorize their products without guesswork.
                            </Text>
                        </VStack>

                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
                            <Card
                                bg="white"
                                boxShadow="xl"
                                borderRadius="2xl"
                                overflow="hidden"
                                _hover={{ transform: 'translateY(-8px)', boxShadow: '2xl' }}
                                transition="all 0.3s"
                            >
                                <CardBody p={8} textAlign="center">
                                    <Icon as={FaRobot} boxSize={16} color="indigo.500" mb={4} />
                                    <Heading size="lg" mb={4} color="gray.800">
                                        Auto Categorization
                                    </Heading>
                                    <Text color="gray.600" fontSize="lg">
                                        Upload product images and let our system automatically categorize them
                                        into 100+ precise categories with confidence scoring.
                                    </Text>
                                </CardBody>
                            </Card>

                            <Card
                                bg="white"
                                boxShadow="xl"
                                borderRadius="2xl"
                                overflow="hidden"
                                _hover={{ transform: 'translateY(-8px)', boxShadow: '2xl' }}
                                transition="all 0.3s"
                            >
                                <CardBody p={8} textAlign="center">
                                    <Icon as={FaBrain} boxSize={16} color="emerald.500" mb={4} />
                                    <Heading size="lg" mb={4} color="gray.800">
                                        Smart Search
                                    </Heading>
                                    <Text color="gray.600" fontSize="lg">
                                        Find exactly what you're looking for with enhanced search
                                        that understands context and visual similarity.
                                    </Text>
                                </CardBody>
                            </Card>

                            <Card
                                bg="white"
                                boxShadow="xl"
                                borderRadius="2xl"
                                overflow="hidden"
                                _hover={{ transform: 'translateY(-8px)', boxShadow: '2xl' }}
                                transition="all 0.3s"
                            >
                                <CardBody p={8} textAlign="center">
                                    <Icon as={FaCamera} boxSize={16} color="gray.800" mb={4} />
                                    <Heading size="lg" mb={4} color="gray.800">
                                        Instant Photo Capture
                                    </Heading>
                                    <Text color="gray.600" fontSize="lg">
                                        Upload product photos instantly with our camera capture feature
                                        or choose from your device gallery for quick and easy listing.
                                    </Text>
                                </CardBody>
                            </Card>
                        </SimpleGrid>
                    </VStack>
                </Container>
            </Box>

            {/* CTA Section */}
            <Box py={20} bg="linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" color="white">
                <Container maxW="4xl">
                    <VStack spacing={8} textAlign="center">
                        <Heading size="2xl" fontWeight="bold">
                            Ready to Try AI Product Categorization?
                        </Heading>
                        <Text fontSize="xl" maxW="2xl" opacity={0.9}>
                            Upload a product photo and see how our AI categorizes it.
                            Free to try - perfect for sellers who want accurate product categorization.
                        </Text>
                        <HStack spacing={6} flexWrap="wrap" justify="center">
                            <Button
                                as={RouterLink}
                                to="/register"
                                size="xl"
                                colorScheme="white"
                                variant="solid"
                                color="indigo.700"
                                leftIcon={<FaRocket />}
                                _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
                                borderRadius="full"
                                border="2px solid white"
                                px={10}
                                py={6}
                                fontSize="lg"
                            >
                                Try Categorization
                            </Button>
                            <Button
                                as={RouterLink}
                                to="/products"
                                size="xl"
                                colorScheme="white"
                                variant="solid"
                                color="indigo.700"
                                leftIcon={<FaUsers />}
                                _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
                                borderRadius="full"
                                border="2px solid white"
                                px={10}
                                py={6}
                                fontSize="lg"
                            >
                                Browse Products
                            </Button>
                        </HStack>
                    </VStack>
                </Container>
            </Box>
        </Box>
    );
};

export default HomePage; 