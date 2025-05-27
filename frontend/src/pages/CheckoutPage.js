import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Card,
    CardBody,
    CardHeader,
    Button,
    Input,
    Select,
    FormControl,
    FormLabel,
    FormErrorMessage,
    RadioGroup,
    Radio,
    Stack,
    Divider,
    SimpleGrid,
    Image,
    Badge,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Step,
    StepDescription,
    StepIcon,
    StepIndicator,
    StepNumber,
    StepSeparator,
    StepStatus,
    StepTitle,
    Stepper,
    useSteps,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useDisclosure
} from '@chakra-ui/react';
import { FaCreditCard, FaPaypal, FaTruck, FaCheckCircle, FaApplePay } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const steps = [
    { title: 'Shipping', description: 'Delivery address' },
    { title: 'Payment', description: 'Payment method' },
    { title: 'Review', description: 'Order summary' },
    { title: 'Confirmation', description: 'Order placed' }
];

const CheckoutPage = () => {
    const { items, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { activeStep, setActiveStep } = useSteps({
        index: 0,
        count: steps.length,
    });

    const [orderData, setOrderData] = useState({
        shipping: {
            firstName: '',
            lastName: '',
            email: user?.email || '',
            phone: '',
            address: '',
            apartment: '',
            city: '',
            zipCode: '',
            country: 'United States'
        },
        payment: {
            method: 'credit_card',
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            cardHolder: ''
        }
    });

    const [errors, setErrors] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderId, setOrderId] = useState(null);

    // Redirect if cart is empty
    useEffect(() => {
        if (items.length === 0) {
            navigate('/cart');
        }
    }, [items, navigate]);

    const validateStep = (step) => {
        const newErrors = {};

        if (step === 0) { // Shipping validation
            const { shipping } = orderData;
            if (!shipping.firstName) newErrors.firstName = 'First name is required';
            if (!shipping.lastName) newErrors.lastName = 'Last name is required';
            if (!shipping.email) newErrors.email = 'Email is required';
            if (!shipping.phone) newErrors.phone = 'Phone number is required';
            if (!shipping.address) newErrors.address = 'Address is required';
            if (!shipping.city) newErrors.city = 'City is required';
            if (!shipping.zipCode) newErrors.zipCode = 'ZIP code is required';
        }

        if (step === 1) { // Payment validation
            const { payment } = orderData;
            if (payment.method === 'credit_card') {
                if (!payment.cardNumber) newErrors.cardNumber = 'Card number is required';
                if (!payment.expiryDate) newErrors.expiryDate = 'Expiry date is required';
                if (!payment.cvv) newErrors.cvv = 'CVV is required';
                if (!payment.cardHolder) newErrors.cardHolder = 'Card holder name is required';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(activeStep)) {
            setActiveStep(activeStep + 1);
        }
    };

    const handlePrevious = () => {
        setActiveStep(activeStep - 1);
    };

    const handleInputChange = (section, field, value) => {
        setOrderData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handlePlaceOrder = async () => {
        if (!validateStep(1)) return;

        setIsProcessing(true);

        try {
            // Simulate order processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Create order object
            const order = {
                id: Date.now().toString(),
                items: items,
                shipping: orderData.shipping,
                payment: { method: orderData.payment.method },
                total: (cartTotal * 1.1).toFixed(2),
                subtotal: cartTotal.toFixed(2),
                tax: (cartTotal * 0.1).toFixed(2),
                shipping_cost: 0,
                status: 'confirmed',
                created_at: new Date().toISOString(),
                user_id: user?.id
            };

            // Save to localStorage (in real app, send to backend)
            const existingOrders = JSON.parse(localStorage.getItem('user_orders') || '[]');
            existingOrders.push(order);
            localStorage.setItem('user_orders', JSON.stringify(existingOrders));

            setOrderId(order.id);
            setActiveStep(3);
            clearCart();

            toast({
                title: 'Order placed successfully!',
                description: `Your order #${order.id} has been confirmed.`,
                status: 'success',
                duration: 5000,
                isClosable: true,
            });

        } catch (error) {
            console.error('Order processing error:', error);
            toast({
                title: 'Order failed',
                description: 'There was an error processing your order. Please try again.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsProcessing(false);
        }
    };

    if (items.length === 0) {
        return null; // Will redirect in useEffect
    }

    const taxAmount = cartTotal * 0.1;
    const totalAmount = cartTotal + taxAmount;

    return (
        <Box maxW="6xl" mx="auto" py={8} px={{ base: 2, md: 8 }}>
            <VStack spacing={8} align="stretch">
                {/* Header */}
                <Heading size="2xl" fontWeight="extrabold" color="purple.700">
                    🛍️ Checkout
                </Heading>

                {/* Progress Stepper */}
                <Card>
                    <CardBody>
                        <Stepper index={activeStep} colorScheme="purple">
                            {steps.map((step, index) => (
                                <Step key={index}>
                                    <StepIndicator>
                                        <StepStatus
                                            complete={<StepIcon />}
                                            incomplete={<StepNumber />}
                                            active={<StepNumber />}
                                        />
                                    </StepIndicator>
                                    <Box flexShrink="0">
                                        <StepTitle>{step.title}</StepTitle>
                                        <StepDescription>{step.description}</StepDescription>
                                    </Box>
                                    <StepSeparator />
                                </Step>
                            ))}
                        </Stepper>
                    </CardBody>
                </Card>

                <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
                    {/* Main Content */}
                    <Box gridColumn={{ lg: "1 / 3" }}>
                        {/* Step 0: Shipping Information */}
                        {activeStep === 0 && (
                            <Card>
                                <CardHeader>
                                    <Heading size="lg">🚚 Shipping Information</Heading>
                                </CardHeader>
                                <CardBody>
                                    <VStack spacing={4} align="stretch">
                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                            <FormControl isInvalid={errors.firstName}>
                                                <FormLabel>First Name</FormLabel>
                                                <Input
                                                    value={orderData.shipping.firstName}
                                                    onChange={(e) => handleInputChange('shipping', 'firstName', e.target.value)}
                                                />
                                                <FormErrorMessage>{errors.firstName}</FormErrorMessage>
                                            </FormControl>
                                            <FormControl isInvalid={errors.lastName}>
                                                <FormLabel>Last Name</FormLabel>
                                                <Input
                                                    value={orderData.shipping.lastName}
                                                    onChange={(e) => handleInputChange('shipping', 'lastName', e.target.value)}
                                                />
                                                <FormErrorMessage>{errors.lastName}</FormErrorMessage>
                                            </FormControl>
                                        </SimpleGrid>

                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                            <FormControl isInvalid={errors.email}>
                                                <FormLabel>Email</FormLabel>
                                                <Input
                                                    type="email"
                                                    value={orderData.shipping.email}
                                                    onChange={(e) => handleInputChange('shipping', 'email', e.target.value)}
                                                />
                                                <FormErrorMessage>{errors.email}</FormErrorMessage>
                                            </FormControl>
                                            <FormControl isInvalid={errors.phone}>
                                                <FormLabel>Phone Number</FormLabel>
                                                <Input
                                                    value={orderData.shipping.phone}
                                                    onChange={(e) => handleInputChange('shipping', 'phone', e.target.value)}
                                                />
                                                <FormErrorMessage>{errors.phone}</FormErrorMessage>
                                            </FormControl>
                                        </SimpleGrid>

                                        <FormControl isInvalid={errors.address}>
                                            <FormLabel>Street Address</FormLabel>
                                            <Input
                                                value={orderData.shipping.address}
                                                onChange={(e) => handleInputChange('shipping', 'address', e.target.value)}
                                            />
                                            <FormErrorMessage>{errors.address}</FormErrorMessage>
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel>Apartment, suite, etc. (optional)</FormLabel>
                                            <Input
                                                value={orderData.shipping.apartment}
                                                onChange={(e) => handleInputChange('shipping', 'apartment', e.target.value)}
                                            />
                                        </FormControl>

                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                            <FormControl isInvalid={errors.city}>
                                                <FormLabel>City</FormLabel>
                                                <Input
                                                    value={orderData.shipping.city}
                                                    onChange={(e) => handleInputChange('shipping', 'city', e.target.value)}
                                                />
                                                <FormErrorMessage>{errors.city}</FormErrorMessage>
                                            </FormControl>
                                            <FormControl isInvalid={errors.zipCode}>
                                                <FormLabel>ZIP Code</FormLabel>
                                                <Input
                                                    value={orderData.shipping.zipCode}
                                                    onChange={(e) => handleInputChange('shipping', 'zipCode', e.target.value)}
                                                />
                                                <FormErrorMessage>{errors.zipCode}</FormErrorMessage>
                                            </FormControl>
                                        </SimpleGrid>
                                    </VStack>
                                </CardBody>
                            </Card>
                        )}

                        {/* Step 1: Payment Method */}
                        {activeStep === 1 && (
                            <Card>
                                <CardHeader>
                                    <Heading size="lg">💳 Payment Method</Heading>
                                </CardHeader>
                                <CardBody>
                                    <VStack spacing={6} align="stretch">
                                        <RadioGroup
                                            value={orderData.payment.method}
                                            onChange={(value) => handleInputChange('payment', 'method', value)}
                                        >
                                            <Stack spacing={4}>
                                                <Radio value="credit_card">
                                                    <HStack>
                                                        <FaCreditCard />
                                                        <Text>Credit/Debit Card</Text>
                                                    </HStack>
                                                </Radio>
                                                <Radio value="paypal">
                                                    <HStack>
                                                        <FaPaypal />
                                                        <Text>PayPal</Text>
                                                    </HStack>
                                                </Radio>
                                                <Radio value="apple_pay">
                                                    <HStack>
                                                        <FaApplePay />
                                                        <Text>Apple Pay</Text>
                                                    </HStack>
                                                </Radio>
                                            </Stack>
                                        </RadioGroup>

                                        {orderData.payment.method === 'credit_card' && (
                                            <VStack spacing={4} align="stretch" p={4} bg="gray.50" borderRadius="md">
                                                <FormControl isInvalid={errors.cardHolder}>
                                                    <FormLabel>Card Holder Name</FormLabel>
                                                    <Input
                                                        bg="white"
                                                        value={orderData.payment.cardHolder}
                                                        onChange={(e) => handleInputChange('payment', 'cardHolder', e.target.value)}
                                                    />
                                                    <FormErrorMessage>{errors.cardHolder}</FormErrorMessage>
                                                </FormControl>

                                                <FormControl isInvalid={errors.cardNumber}>
                                                    <FormLabel>Card Number</FormLabel>
                                                    <Input
                                                        bg="white"
                                                        placeholder="1234 5678 9012 3456"
                                                        value={orderData.payment.cardNumber}
                                                        onChange={(e) => handleInputChange('payment', 'cardNumber', e.target.value)}
                                                    />
                                                    <FormErrorMessage>{errors.cardNumber}</FormErrorMessage>
                                                </FormControl>

                                                <SimpleGrid columns={2} spacing={4}>
                                                    <FormControl isInvalid={errors.expiryDate}>
                                                        <FormLabel>Expiry Date</FormLabel>
                                                        <Input
                                                            bg="white"
                                                            placeholder="MM/YY"
                                                            value={orderData.payment.expiryDate}
                                                            onChange={(e) => handleInputChange('payment', 'expiryDate', e.target.value)}
                                                        />
                                                        <FormErrorMessage>{errors.expiryDate}</FormErrorMessage>
                                                    </FormControl>
                                                    <FormControl isInvalid={errors.cvv}>
                                                        <FormLabel>CVV</FormLabel>
                                                        <Input
                                                            bg="white"
                                                            placeholder="123"
                                                            value={orderData.payment.cvv}
                                                            onChange={(e) => handleInputChange('payment', 'cvv', e.target.value)}
                                                        />
                                                        <FormErrorMessage>{errors.cvv}</FormErrorMessage>
                                                    </FormControl>
                                                </SimpleGrid>
                                            </VStack>
                                        )}

                                        {orderData.payment.method === 'paypal' && (
                                            <Alert status="info">
                                                <AlertIcon />
                                                <AlertDescription>
                                                    You will be redirected to PayPal to complete your payment.
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        {orderData.payment.method === 'apple_pay' && (
                                            <Alert status="info">
                                                <AlertIcon />
                                                <AlertDescription>
                                                    You will use Apple Pay to complete your payment.
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </VStack>
                                </CardBody>
                            </Card>
                        )}

                        {/* Step 2: Review Order */}
                        {activeStep === 2 && (
                            <Card>
                                <CardHeader>
                                    <Heading size="lg">📋 Review Your Order</Heading>
                                </CardHeader>
                                <CardBody>
                                    <VStack spacing={6} align="stretch">
                                        {/* Shipping Address Review */}
                                        <Box>
                                            <Heading size="md" mb={3}>Shipping Address</Heading>
                                            <Box p={4} bg="gray.50" borderRadius="md">
                                                <Text fontWeight="bold">
                                                    {orderData.shipping.firstName} {orderData.shipping.lastName}
                                                </Text>
                                                <Text>{orderData.shipping.address}</Text>
                                                {orderData.shipping.apartment && <Text>{orderData.shipping.apartment}</Text>}
                                                <Text>
                                                    {orderData.shipping.city}, {orderData.shipping.zipCode}
                                                </Text>
                                                <Text>{orderData.shipping.phone}</Text>
                                                <Text>{orderData.shipping.email}</Text>
                                            </Box>
                                        </Box>

                                        {/* Payment Method Review */}
                                        <Box>
                                            <Heading size="md" mb={3}>Payment Method</Heading>
                                            <Box p={4} bg="gray.50" borderRadius="md">
                                                <HStack>
                                                    {orderData.payment.method === 'credit_card' && <FaCreditCard />}
                                                    {orderData.payment.method === 'paypal' && <FaPaypal />}
                                                    {orderData.payment.method === 'apple_pay' && <FaApplePay />}
                                                    <Text fontWeight="bold">
                                                        {orderData.payment.method === 'credit_card' && 'Credit Card'}
                                                        {orderData.payment.method === 'paypal' && 'PayPal'}
                                                        {orderData.payment.method === 'apple_pay' && 'Apple Pay'}
                                                    </Text>
                                                </HStack>
                                                {orderData.payment.method === 'credit_card' && orderData.payment.cardNumber && (
                                                    <Text color="gray.600">
                                                        **** **** **** {orderData.payment.cardNumber.slice(-4)}
                                                    </Text>
                                                )}
                                            </Box>
                                        </Box>

                                        {/* Order Items Review */}
                                        <Box>
                                            <Heading size="md" mb={3}>Order Items</Heading>
                                            <VStack spacing={3}>
                                                {items.map((item) => (
                                                    <HStack key={item.id} w="full" p={3} bg="gray.50" borderRadius="md">
                                                        <Image
                                                            src={`http://localhost:8000${item.image_url}`}
                                                            alt={item.name}
                                                            boxSize="60px"
                                                            objectFit="cover"
                                                            borderRadius="md"
                                                        />
                                                        <VStack flex={1} align="start" spacing={1}>
                                                            <Text fontWeight="bold" fontSize="sm">{item.name}</Text>
                                                            <Text fontSize="xs" color="gray.600">Qty: {item.quantity}</Text>
                                                        </VStack>
                                                        <Text fontWeight="bold">${(item.price * item.quantity).toFixed(2)}</Text>
                                                    </HStack>
                                                ))}
                                            </VStack>
                                        </Box>
                                    </VStack>
                                </CardBody>
                            </Card>
                        )}

                        {/* Step 3: Confirmation */}
                        {activeStep === 3 && (
                            <Card>
                                <CardBody textAlign="center">
                                    <VStack spacing={6}>
                                        <Box fontSize="6xl">
                                            <FaCheckCircle color="green" />
                                        </Box>
                                        <Heading size="lg" color="green.600">Order Confirmed!</Heading>
                                        <Text fontSize="lg">
                                            Thank you for your order! Your order #{orderId} has been placed successfully.
                                        </Text>
                                        <Alert status="success">
                                            <AlertIcon />
                                            <Box>
                                                <AlertTitle>What's next?</AlertTitle>
                                                <AlertDescription>
                                                    You will receive an email confirmation shortly with your order details and tracking information.
                                                </AlertDescription>
                                            </Box>
                                        </Alert>
                                        <HStack spacing={4}>
                                            <Button colorScheme="purple" onClick={() => navigate('/products')}>
                                                Browse Marketplace
                                            </Button>
                                            <Button variant="outline" onClick={() => navigate('/orders')}>
                                                View Order History
                                            </Button>
                                        </HStack>
                                    </VStack>
                                </CardBody>
                            </Card>
                        )}

                        {/* Navigation Buttons */}
                        {activeStep < 3 && (
                            <HStack spacing={4} justify="space-between" mt={6}>
                                <Button
                                    variant="outline"
                                    onClick={handlePrevious}
                                    isDisabled={activeStep === 0}
                                >
                                    Previous
                                </Button>
                                <Button
                                    colorScheme="purple"
                                    onClick={activeStep === 2 ? handlePlaceOrder : handleNext}
                                    isLoading={isProcessing}
                                    loadingText="Processing..."
                                >
                                    {activeStep === 2 ? 'Place Order' : 'Continue'}
                                </Button>
                            </HStack>
                        )}
                    </Box>

                    {/* Order Summary Sidebar */}
                    {activeStep < 3 && (
                        <Box>
                            <Card position="sticky" top="100px">
                                <CardHeader>
                                    <Heading size="md">Order Summary</Heading>
                                </CardHeader>
                                <CardBody>
                                    <VStack spacing={4} align="stretch">
                                        {/* Items */}
                                        <VStack spacing={2} align="stretch">
                                            {items.map((item) => (
                                                <HStack key={item.id} justify="space-between" fontSize="sm">
                                                    <HStack spacing={2}>
                                                        <Image
                                                            src={`http://localhost:8000${item.image_url}`}
                                                            alt={item.name}
                                                            boxSize="40px"
                                                            objectFit="cover"
                                                            borderRadius="md"
                                                        />
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontWeight="medium" noOfLines={1}>{item.name}</Text>
                                                            <Text color="gray.600">Qty: {item.quantity}</Text>
                                                        </VStack>
                                                    </HStack>
                                                    <Text fontWeight="bold">${(item.price * item.quantity).toFixed(2)}</Text>
                                                </HStack>
                                            ))}
                                        </VStack>

                                        <Divider />

                                        {/* Totals */}
                                        <VStack spacing={2} align="stretch">
                                            <HStack justify="space-between">
                                                <Text>Subtotal</Text>
                                                <Text>${cartTotal.toFixed(2)}</Text>
                                            </HStack>
                                            <HStack justify="space-between">
                                                <Text>Shipping</Text>
                                                <Text color="green.600">Free</Text>
                                            </HStack>
                                            <HStack justify="space-between">
                                                <Text>Tax</Text>
                                                <Text>${taxAmount.toFixed(2)}</Text>
                                            </HStack>
                                            <Divider />
                                            <HStack justify="space-between" fontSize="lg" fontWeight="bold">
                                                <Text>Total</Text>
                                                <Text color="purple.700">${totalAmount.toFixed(2)}</Text>
                                            </HStack>
                                        </VStack>
                                    </VStack>
                                </CardBody>
                            </Card>
                        </Box>
                    )}
                </SimpleGrid>
            </VStack>
        </Box>
    );
};

export default CheckoutPage; 