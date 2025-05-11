import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Spinner,
  Alert,
  AlertIcon,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Container,
  TableCaption
} from '@chakra-ui/react';
import axios from 'axios';

const AdminPanel = ({ isMobileView }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('http://localhost:8000/api/admin/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUsers(res.data);
      } catch (err) {
        setError('Failed to fetch users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <Box overflowX="auto" width="100vw" p={0}>
      <Heading mb={12} mt={12} textAlign="center" fontSize={isMobileView ? '1.6rem' : '2.7rem'}>User Management</Heading>
      <Box style={{ marginLeft: '15vw', marginRight: '15vw' }}>
        <Table variant="unstyled" width="100%" border="2px solid #dededf" borderRadius="16px">
          <Thead>
            <Tr>
              <Th style={{ textAlign: 'center', background: '#ebebeb', color: '#000', padding: isMobileView ? '4px' : '10px', border: '1px solid #dededf', minWidth: isMobileView ? 50 : 100, fontSize: isMobileView ? 'sm' : 'md' }}>ID</Th>
              <Th style={{ textAlign: 'center', background: '#ebebeb', color: '#000', padding: isMobileView ? '4px' : '10px', border: '1px solid #dededf', minWidth: isMobileView ? 100 : 200, fontSize: isMobileView ? 'sm' : 'md' }}>E mail</Th>
              <Th style={{ textAlign: 'center', background: '#ebebeb', color: '#000', padding: isMobileView ? '4px' : '10px', border: '1px solid #dededf', minWidth: isMobileView ? 50 : 100, fontSize: isMobileView ? 'sm' : 'md' }}>Role</Th>
              <Th style={{ textAlign: 'center', background: '#ebebeb', color: '#000', padding: isMobileView ? '4px' : '10px', border: '1px solid #dededf', minWidth: isMobileView ? 150 : 300, fontSize: isMobileView ? 'sm' : 'md' }}>Name Surname</Th>
              <Th style={{ textAlign: 'center', background: '#ebebeb', color: '#000', padding: isMobileView ? '4px' : '10px', border: '1px solid #dededf', minWidth: isMobileView ? 350 : 700, fontSize: isMobileView ? 'sm' : 'md' }}>Address</Th>
              <Th style={{ textAlign: 'center', background: '#ebebeb', color: '#000', padding: isMobileView ? '4px' : '10px', border: '1px solid #dededf', minWidth: isMobileView ? 100 : 200, fontSize: isMobileView ? 'sm' : 'md' }}>Phone</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map(user => (
              <Tr key={user.id}>
                <Td style={{ textAlign: 'center', background: '#fff', color: '#000', padding: isMobileView ? '4px' : '10px', border: '1px solid #dededf', minWidth: isMobileView ? 50 : 100, fontSize: isMobileView ? 'sm' : 'md' }}>{user.id}</Td>
                <Td style={{ textAlign: 'center', background: '#fff', color: '#000', padding: isMobileView ? '4px' : '10px', border: '1px solid #dededf', minWidth: isMobileView ? 100 : 200, fontSize: isMobileView ? 'sm' : 'md' }}>{user.email}</Td>
                <Td style={{ textAlign: 'center', background: '#fff', color: '#000', padding: isMobileView ? '4px' : '10px', border: '1px solid #dededf', minWidth: isMobileView ? 50 : 100, fontSize: isMobileView ? 'sm' : 'md' }}>{user.role}</Td>
                <Td style={{ textAlign: 'center', background: '#fff', color: '#000', padding: isMobileView ? '4px' : '10px', border: '1px solid #dededf', minWidth: isMobileView ? 150 : 300, fontSize: isMobileView ? 'sm' : 'md' }}>{user.name_surname}</Td>
                <Td style={{ textAlign: 'center', background: '#fff', color: '#000', padding: isMobileView ? '4px' : '10px', border: '1px solid #dededf', minWidth: isMobileView ? 350 : 700, fontSize: isMobileView ? 'sm' : 'md' }}>{user.address}</Td>
                <Td style={{ textAlign: 'center', background: '#fff', color: '#000', padding: isMobileView ? '4px' : '10px', border: '1px solid #dededf', minWidth: isMobileView ? 100 : 200, fontSize: isMobileView ? 'sm' : 'md' }}>{user.phone}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default AdminPanel; 