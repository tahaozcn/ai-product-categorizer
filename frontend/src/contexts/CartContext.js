import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

// Cart actions
const CART_ACTIONS = {
    ADD_ITEM: 'ADD_ITEM',
    REMOVE_ITEM: 'REMOVE_ITEM',
    UPDATE_QUANTITY: 'UPDATE_QUANTITY',
    CLEAR_CART: 'CLEAR_CART',
    LOAD_CART: 'LOAD_CART'
};

// Cart reducer
const cartReducer = (state, action) => {
    switch (action.type) {
        case CART_ACTIONS.ADD_ITEM:
            const existingItem = state.items.find(item => item.id === action.payload.id);

            if (existingItem) {
                // Update quantity if item already exists
                return {
                    ...state,
                    items: state.items.map(item =>
                        item.id === action.payload.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    )
                };
            } else {
                // Add new item
                return {
                    ...state,
                    items: [...state.items, { ...action.payload, quantity: 1 }]
                };
            }

        case CART_ACTIONS.REMOVE_ITEM:
            return {
                ...state,
                items: state.items.filter(item => item.id !== action.payload)
            };

        case CART_ACTIONS.UPDATE_QUANTITY:
            const { id, quantity } = action.payload;

            if (quantity <= 0) {
                // Remove item if quantity is 0 or less
                return {
                    ...state,
                    items: state.items.filter(item => item.id !== id)
                };
            }

            return {
                ...state,
                items: state.items.map(item =>
                    item.id === id ? { ...item, quantity } : item
                )
            };

        case CART_ACTIONS.CLEAR_CART:
            return {
                ...state,
                items: []
            };

        case CART_ACTIONS.LOAD_CART:
            return {
                ...state,
                items: action.payload || []
            };

        default:
            return state;
    }
};

// Initial state
const initialState = {
    items: []
};

// Cart Provider
export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('shopping_cart');
        if (savedCart) {
            try {
                const cartData = JSON.parse(savedCart);
                dispatch({ type: CART_ACTIONS.LOAD_CART, payload: cartData });
            } catch (error) {
                console.error('Error loading cart from localStorage:', error);
            }
        }
    }, []);

    // Save cart to localStorage whenever cart changes
    useEffect(() => {
        localStorage.setItem('shopping_cart', JSON.stringify(state.items));
    }, [state.items]);

    // Cart actions
    const addToCart = (product) => {
        dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: product });
    };

    const removeFromCart = (productId) => {
        dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: productId });
    };

    const updateQuantity = (productId, quantity) => {
        dispatch({ type: CART_ACTIONS.UPDATE_QUANTITY, payload: { id: productId, quantity } });
    };

    const clearCart = () => {
        dispatch({ type: CART_ACTIONS.CLEAR_CART });
    };

    // Calculate totals
    const cartTotal = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const itemCount = state.items.reduce((count, item) => count + item.quantity, 0);

    // Check if item is in cart
    const isInCart = (productId) => {
        return state.items.some(item => item.id === productId);
    };

    // Get item quantity
    const getItemQuantity = (productId) => {
        const item = state.items.find(item => item.id === productId);
        return item ? item.quantity : 0;
    };

    const value = {
        // State
        items: state.items,
        cartTotal,
        itemCount,

        // Actions
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,

        // Helpers
        isInCart,
        getItemQuantity
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

// Custom hook to use cart
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}; 