import React from 'react';
import {
    Box,
    Heading,
    VStack,
    HStack,
    Text,
    Image,
    Button,
    IconButton,
    Badge,
    Divider,
    SimpleGrid,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Alert,
    AlertIcon,
    useToast,
    Card,
    CardBody
} from '@chakra-ui/react';
import { FaTrash, FaShoppingBag, FaCreditCard } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
    const { items, cartTotal, itemCount, updateQuantity, removeFromCart, clearCart } = useCart();
    const toast = useToast();
    const navigate = useNavigate();

    const handleQuantityChange = (productId, newQuantity) => {
        if (newQuantity < 1) {
            handleRemoveItem(productId);
        } else {
            updateQuantity(productId, newQuantity);
        }
    };

    const handleRemoveItem = (productId) => {
        removeFromCart(productId);
        toast({
            title: 'Item removed from cart',
            status: 'info',
            duration: 2000,
            isClosable: true,
        });
    };

    const handleClearCart = () => {
        clearCart();
        toast({
            title: 'Cart cleared',
            description: 'All items have been removed from your cart',
            status: 'info',
            duration: 3000,
            isClosable: true,
        });
    };

    const handleCheckout = () => {
        // Navigate to checkout page (we'll create this next)
        navigate('/checkout');
    };

    if (items.length === 0) {
        return (
            <Box maxW="6xl" mx="auto" py={8} px={{ base: 2, md: 8 }}>
                <VStack spacing={8} align="center" py={20}>
                    <Box fontSize="6xl">🛒</Box>
                    <Heading size="lg" color="gray.500">Your cart is empty</Heading>
                    <Text color="gray.400" textAlign="center">
                        Looks like you haven't added any items to your cart yet.
                        <br />
                        Start shopping to fill it up!
                    </Text>
                    <Button
                        colorScheme="purple"
                        size="lg"
                        leftIcon={<FaShoppingBag />}
                        onClick={() => navigate('/products')}
                    >
                        Browse Marketplace
                    </Button>
                </VStack>
            </Box>
        );
    }

    return (
        <Box maxW="6xl" mx="auto" py={8} px={{ base: 2, md: 8 }}>
            <VStack spacing={8} align="stretch">
                {/* Header */}
                <HStack justify="space-between" align="center">
                    <Heading size="2xl" fontWeight="extrabold" color="purple.700">
                        🛒 Shopping Cart
                    </Heading>
                    <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </Badge>
                </HStack>

                <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
                    {/* Cart Items */}
                    <Box gridColumn={{ lg: "1 / 3" }}>
                        <VStack spacing={4} align="stretch">
                            {items.map((item) => (
                                <Card key={item.id} bg="white" boxShadow="md">
                                    <CardBody>
                                        <HStack spacing={4} align="center">
                                            {/* Product Image */}
                                            <Box flexShrink={0}>
                                                <Image
                                                    src={`http://localhost:8000${item.image_url}`}
                                                    alt={item.name}
                                                    boxSize="100px"
                                                    objectFit="cover"
                                                    borderRadius="md"
                                                    fallbackSrc="https://via.placeholder.com/100x100?text=No+Image"
                                                />
                                            </Box>

                                            {/* Product Details */}
                                            <VStack flex={1} align="start" spacing={2}>
                                                <Heading size="md" noOfLines={2}>
                                                    {item.name}
                                                </Heading>
                                                <Text fontSize="sm" color="gray.600">
                                                    by {item.seller}
                                                </Text>
                                                <Text fontSize="lg" fontWeight="bold" color="purple.700">
                                                    ${item.price}
                                                </Text>
                                            </VStack>

                                            {/* Quantity Controls */}
                                            <VStack spacing={2}>
                                                <Text fontSize="sm" color="gray.600">Quantity</Text>
                                                <NumberInput
                                                    size="sm"
                                                    maxW="80px"
                                                    value={item.quantity}
                                                    min={1}
                                                    onChange={(valueString) => {
                                                        const value = parseInt(valueString) || 1;
                                                        handleQuantityChange(item.id, value);
                                                    }}
                                                >
                                                    <NumberInputField />
                                                    <NumberInputStepper>
                                                        <NumberIncrementStepper />
                                                        <NumberDecrementStepper />
                                                    </NumberInputStepper>
                                                </NumberInput>
                                            </VStack>

                                            {/* Item Total */}
                                            <VStack spacing={2} align="end">
                                                <Text fontSize="sm" color="gray.600">Total</Text>
                                                <Text fontSize="lg" fontWeight="bold" color="green.600">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </Text>
                                            </VStack>

                                            {/* Remove Button */}
                                            <IconButton
                                                aria-label="Remove item"
                                                icon={<FaTrash />}
                                                colorScheme="red"
                                                variant="ghost"
                                                onClick={() => handleRemoveItem(item.id)}
                                            />
                                        </HStack>
                                    </CardBody>
                                </Card>
                            ))}

                            {/* Clear Cart Button */}
                            <Button
                                variant="outline"
                                colorScheme="red"
                                size="sm"
                                alignSelf="start"
                                onClick={handleClearCart}
                            >
                                Clear Cart
                            </Button>
                        </VStack>
                    </Box>

                    {/* Order Summary */}
                    <Box>
                        <Card bg="white" boxShadow="lg" position="sticky" top="100px">
                            <CardBody>
                                <VStack spacing={4} align="stretch">
                                    <Heading size="md">Order Summary</Heading>
                                    <Divider />

                                    <HStack justify="space-between">
                                        <Text>Subtotal ({itemCount} items)</Text>
                                        <Text fontWeight="medium">${cartTotal.toFixed(2)}</Text>
                                    </HStack>

                                    <HStack justify="space-between">
                                        <Text>Shipping</Text>
                                        <Text fontWeight="medium" color="green.600">Free</Text>
                                    </HStack>

                                    <HStack justify="space-between">
                                        <Text>Tax</Text>
                                        <Text fontWeight="medium">${(cartTotal * 0.1).toFixed(2)}</Text>
                                    </HStack>

                                    <Divider />

                                    <HStack justify="space-between" fontSize="lg">
                                        <Text fontWeight="bold">Total</Text>
                                        <Text fontWeight="bold" color="purple.700">
                                            ${(cartTotal * 1.1).toFixed(2)}
                                        </Text>
                                    </HStack>

                                    <Button
                                        colorScheme="purple"
                                        size="lg"
                                        leftIcon={<FaCreditCard />}
                                        onClick={handleCheckout}
                                        w="full"
                                    >
                                        Proceed to Checkout
                                    </Button>

                                    <Button
                                        variant="outline"
                                        colorScheme="purple"
                                        onClick={() => navigate('/products')}
                                        w="full"
                                    >
                                        Browse Marketplace
                                    </Button>
                                </VStack>
                            </CardBody>
                        </Card>
                    </Box>
                </SimpleGrid>
            </VStack>
        </Box>
    );
};

export default CartPage; 