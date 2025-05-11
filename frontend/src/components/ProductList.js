import React, { useEffect, useState } from 'react';
import { SimpleGrid, Box, Heading } from '@chakra-ui/react';
import Product from './Product';
import axios from 'axios';

const ProductList = ({ isMobileView }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/products')
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]));
  }, []);

  const handleDelete = (id) => {
    setProducts(products => products.filter(p => p.id !== id));
  };

  return (
    <Box width="100%" px="0" display="flex" justifyContent="center">
      <Box width="100%" maxWidth="1200px">
        <Heading as="h2" size={isMobileView ? "md" : "lg"} textAlign="center" mt="100px" fontSize={isMobileView ? "1.25rem" : "3rem"}>
          My Products
        </Heading>
        <Box mt="80px">
          <SimpleGrid 
            columns={isMobileView ? 1 : 3}
            spacing={isMobileView ? "8px" : "24px"}
            width="100%"
            alignItems="stretch"
            justifyItems="center"
          >
            {products.map((product) => (
              <Product
                key={product.id}
                product={product}
                isMobileView={isMobileView}
                onDelete={handleDelete}
              />
            ))}
          </SimpleGrid>
        </Box>
      </Box>
    </Box>
  );
};

export default ProductList; 