import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  VStack,
  Container,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast
} from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

/**
 * Profile page component that allows users to view and update their profile information
 */
const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name_surname: '',
    address: '',
    phone: ''
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('http://localhost:8000/api/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setProfile(res.data);
        setForm({
          name_surname: res.data.name_surname || '',
          address: res.data.address || '',
          phone: res.data.phone || ''
        });
      } catch (err) {
        setError('Failed to fetch profile information.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update profile using email as identifier since users can only update their own profile
      const res = await axios.put(`http://localhost:8000/api/users/self`, form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProfile({ ...profile, ...form });
      toast({ title: 'Profile updated', status: 'success', duration: 3000, isClosable: true });
    } catch (err) {
      toast({ title: 'Update failed', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxW="md" mt={10}>
      <Box p={8} borderWidth={1} borderRadius="lg" boxShadow="lg" bg="white">
        <Heading mb={6} size="lg" textAlign="center">My Profile</Heading>
        {loading ? (
          <VStack align="center"><Spinner size="lg" /></VStack>
        ) : error ? (
          <Alert status="error"><AlertIcon />{error}</Alert>
        ) : profile ? (
          <VStack spacing={4} align="start">
            <FormControl isReadOnly>
              <FormLabel>Email</FormLabel>
              <Input value={profile.email} isReadOnly />
            </FormControl>
            <FormControl>
              <FormLabel>Name Surname</FormLabel>
              <Input name="name_surname" value={form.name_surname} onChange={handleChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Address</FormLabel>
              <Input name="address" value={form.address} onChange={handleChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Phone</FormLabel>
              <Input name="phone" value={form.phone} onChange={handleChange} />
            </FormControl>
            <Button colorScheme="green" onClick={handleSave} isLoading={saving} loadingText="Saving...">
              Save
            </Button>
          </VStack>
        ) : null}
      </Box>
    </Container>
  );
};

export default ProfilePage; 