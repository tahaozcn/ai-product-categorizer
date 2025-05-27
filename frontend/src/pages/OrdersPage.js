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
    Badge,
    Button,
    Collapse,
    SimpleGrid,
    Image,
    Divider,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Tab,
    Tabs,
    TabList,
    TabPanel,
    TabPanels,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Progress,
    useDisclosure,
    Flex,
    Spacer,
    Icon
} from '@chakra-ui/react';
import { FaBox, FaTruck, FaCheckCircle, FaEye, FaCalendarAlt, FaShoppingBag, FaDownload } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const getStatusColor = (status) => {
    switch (status) {
        case 'confirmed': return 'blue';
        case 'processing': return 'yellow';
        case 'shipped': return 'purple';
        case 'delivered': return 'green';
        case 'cancelled': return 'red';
        default: return 'gray';
    }
};

const getStatusIcon = (status) => {
    switch (status) {
        case 'confirmed': return FaBox;
        case 'processing': return FaBox;
        case 'shipped': return FaTruck;
        case 'delivered': return FaCheckCircle;
        case 'cancelled': return FaBox;
        default: return FaBox;
    }
};

const getStatusProgress = (status) => {
    switch (status) {
        case 'confirmed': return 25;
        case 'processing': return 50;
        case 'shipped': return 75;
        case 'delivered': return 100;
        case 'cancelled': return 0;
        default: return 0;
    }
};

const OrderItem = ({ order }) => {
    const { isOpen, onToggle } = useDisclosure();

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Card mb={4} boxShadow="md" _hover={{ boxShadow: 'lg' }} transition="all 0.2s">
            <CardHeader>
                <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={1}>
                        <HStack>
                            <Heading size="md">Order #{order.id}</Heading>
                            <Badge
                                colorScheme={getStatusColor(order.status)}
                                variant="solid"
                                fontSize="sm"
                                px={3}
                                py={1}
                                borderRadius="full"
                            >
                                <HStack spacing={1}>
                                    <Icon as={getStatusIcon(order.status)} />
                                    <Text>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</Text>
                                </HStack>
                            </Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                            <Icon as={FaCalendarAlt} mr={1} />
                            Placed on {formatDate(order.created_at)}
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color="purple.700">
                            Total: ${order.total}
                        </Text>
                    </VStack>

                    <VStack spacing={2}>
                        <Button
                            size="sm"
                            leftIcon={<FaEye />}
                            onClick={onToggle}
                            variant="outline"
                            colorScheme="purple"
                        >
                            {isOpen ? 'Hide Details' : 'View Details'}
                        </Button>
                        <Button
                            size="sm"
                            leftIcon={<FaDownload />}
                            variant="ghost"
                            colorScheme="gray"
                        >
                            Invoice
                        </Button>
                    </VStack>
                </HStack>

                {/* Progress Bar */}
                <Box mt={4}>
                    <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" fontWeight="medium">Order Progress</Text>
                        <Text fontSize="sm" color="gray.600">{getStatusProgress(order.status)}% Complete</Text>
                    </HStack>
                    <Progress
                        value={getStatusProgress(order.status)}
                        colorScheme={getStatusColor(order.status)}
                        size="sm"
                        borderRadius="full"
                    />
                </Box>
            </CardHeader>

            <Collapse in={isOpen} animateOpacity>
                <CardBody pt={0}>
                    <Divider mb={4} />

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        {/* Order Items */}
                        <Box>
                            <Heading size="sm" mb={3}>Items Ordered ({order.items.length})</Heading>
                            <VStack spacing={3} align="stretch">
                                {order.items.map((item, index) => (
                                    <HStack key={index} p={3} bg="gray.50" borderRadius="md" spacing={3}>
                                        <Image
                                            src={`http://localhost:8000${item.image_url}`}
                                            alt={item.name}
                                            boxSize="60px"
                                            objectFit="cover"
                                            borderRadius="md"
                                            fallbackSrc="https://via.placeholder.com/60x60?text=No+Image"
                                        />
                                        <VStack align="start" flex={1} spacing={1}>
                                            <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
                                                {item.name}
                                            </Text>
                                            <Text fontSize="xs" color="gray.600">
                                                Quantity: {item.quantity}
                                            </Text>
                                            <Text fontSize="xs" color="gray.600">
                                                Price: ${item.price} each
                                            </Text>
                                        </VStack>
                                        <Text fontWeight="bold" color="purple.700">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </Text>
                                    </HStack>
                                ))}
                            </VStack>
                        </Box>

                        {/* Order Summary & Shipping */}
                        <VStack spacing={4} align="stretch">
                            {/* Order Summary */}
                            <Box>
                                <Heading size="sm" mb={3}>Order Summary</Heading>
                                <VStack spacing={2} align="stretch" p={4} bg="gray.50" borderRadius="md">
                                    <HStack justify="space-between">
                                        <Text>Subtotal</Text>
                                        <Text>${order.subtotal}</Text>
                                    </HStack>
                                    <HStack justify="space-between">
                                        <Text>Tax</Text>
                                        <Text>${order.tax}</Text>
                                    </HStack>
                                    <HStack justify="space-between">
                                        <Text>Shipping</Text>
                                        <Text color="green.600">${order.shipping_cost || 'Free'}</Text>
                                    </HStack>
                                    <Divider />
                                    <HStack justify="space-between" fontWeight="bold" fontSize="lg">
                                        <Text>Total</Text>
                                        <Text color="purple.700">${order.total}</Text>
                                    </HStack>
                                </VStack>
                            </Box>

                            {/* Shipping Information */}
                            {order.shipping && (
                                <Box>
                                    <Heading size="sm" mb={3}>Shipping Address</Heading>
                                    <Box p={4} bg="gray.50" borderRadius="md">
                                        <VStack align="start" spacing={1}>
                                            <Text fontWeight="bold">
                                                {order.shipping.firstName} {order.shipping.lastName}
                                            </Text>
                                            <Text>{order.shipping.address}</Text>
                                            {order.shipping.apartment && <Text>{order.shipping.apartment}</Text>}
                                            <Text>
                                                {order.shipping.city}, {order.shipping.zipCode}
                                            </Text>
                                            <Text>{order.shipping.phone}</Text>
                                            <Text>{order.shipping.email}</Text>
                                        </VStack>
                                    </Box>
                                </Box>
                            )}

                            {/* Payment Information */}
                            {order.payment && (
                                <Box>
                                    <Heading size="sm" mb={3}>Payment Method</Heading>
                                    <Box p={4} bg="gray.50" borderRadius="md">
                                        <Text fontWeight="medium">
                                            {order.payment.method === 'credit_card' && 'Credit Card'}
                                            {order.payment.method === 'paypal' && 'PayPal'}
                                            {order.payment.method === 'apple_pay' && 'Apple Pay'}
                                        </Text>
                                    </Box>
                                </Box>
                            )}
                        </VStack>
                    </SimpleGrid>
                </CardBody>
            </Collapse>
        </Card>
    );
};

const OrdersPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [selectedTab, setSelectedTab] = useState(0);

    useEffect(() => {
        // Load orders from localStorage
        const userOrders = JSON.parse(localStorage.getItem('user_orders') || '[]');
        // Filter orders for current user (in real app, this would be done on backend)
        const currentUserOrders = userOrders.filter(order => order.user_id === user?.id);
        setOrders(currentUserOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    }, [user]);

    // Filter orders by status
    const filterOrdersByStatus = (status) => {
        if (status === 'all') return orders;
        return orders.filter(order => order.status === status);
    };

    const tabData = [
        { label: 'All Orders', status: 'all', count: orders.length },
        { label: 'Confirmed', status: 'confirmed', count: filterOrdersByStatus('confirmed').length },
        { label: 'Processing', status: 'processing', count: filterOrdersByStatus('processing').length },
        { label: 'Shipped', status: 'shipped', count: filterOrdersByStatus('shipped').length },
        { label: 'Delivered', status: 'delivered', count: filterOrdersByStatus('delivered').length },
    ];

    const currentOrders = filterOrdersByStatus(tabData[selectedTab].status);

    // Calculate statistics
    const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const totalItems = orders.reduce((sum, order) => sum + order.items.length, 0);

    if (orders.length === 0) {
        return (
            <Box maxW="6xl" mx="auto" py={8} px={{ base: 2, md: 8 }}>
                <VStack spacing={8} align="center" py={20}>
                    <Box fontSize="6xl">📦</Box>
                    <Heading size="lg" color="gray.500">No orders yet</Heading>
                    <Text color="gray.400" textAlign="center">
                        You haven't placed any orders yet.
                        <br />
                        Start shopping to see your order history here!
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
                <Heading size="2xl" fontWeight="extrabold" color="purple.700">
                    📦 Order History
                </Heading>

                {/* Statistics */}
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                    <Stat>
                        <StatLabel>Total Orders</StatLabel>
                        <StatNumber>{orders.length}</StatNumber>
                        <StatHelpText>All time orders</StatHelpText>
                    </Stat>
                    <Stat>
                        <StatLabel>Total Spent</StatLabel>
                        <StatNumber>${totalSpent.toFixed(2)}</StatNumber>
                        <StatHelpText>Lifetime value</StatHelpText>
                    </Stat>
                    <Stat>
                        <StatLabel>Items Purchased</StatLabel>
                        <StatNumber>{totalItems}</StatNumber>
                        <StatHelpText>Total items bought</StatHelpText>
                    </Stat>
                </SimpleGrid>

                {/* Tabs for filtering */}
                <Tabs index={selectedTab} onChange={setSelectedTab} colorScheme="purple">
                    <TabList>
                        {tabData.map((tab, index) => (
                            <Tab key={index}>
                                {tab.label}
                                {tab.count > 0 && (
                                    <Badge ml={2} colorScheme="purple" variant="solid" borderRadius="full">
                                        {tab.count}
                                    </Badge>
                                )}
                            </Tab>
                        ))}
                    </TabList>

                    <TabPanels>
                        {tabData.map((tab, index) => (
                            <TabPanel key={index} px={0}>
                                {currentOrders.length === 0 ? (
                                    <Box textAlign="center" py={10}>
                                        <Text fontSize="lg" color="gray.500">
                                            No {tab.label.toLowerCase()} found.
                                        </Text>
                                    </Box>
                                ) : (
                                    <VStack spacing={4} align="stretch">
                                        {currentOrders.map((order) => (
                                            <OrderItem key={order.id} order={order} />
                                        ))}
                                    </VStack>
                                )}
                            </TabPanel>
                        ))}
                    </TabPanels>
                </Tabs>
            </VStack>
        </Box>
    );
};

export default OrdersPage; 