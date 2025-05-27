import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import HomePage from './HomePage';

const RoleBasedHome = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            if (user.role === 'seller') {
                // Sellers go to their dashboard
                navigate('/seller-dashboard');
            } else {
                // Customers go directly to marketplace
                navigate('/products');
            }
        }
    }, [user, loading, navigate]);

    // Show home page for non-logged in users
    if (loading) return null;
    if (!user) return <HomePage />;

    // This won't show as users are redirected above
    return null;
};

export default RoleBasedHome; 