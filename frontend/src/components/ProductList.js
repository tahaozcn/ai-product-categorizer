import React from 'react';
import { SimpleGrid } from '@chakra-ui/react';
import Product from './Product';

const ProductList = ({ products, onDelete, isMobileView }) => {
  return (
    <SimpleGrid 
      columns={isMobileView ? 1 : 3} 
      spacing={isMobileView ? 4 : 6}
      width="100%"
      minChildWidth={isMobileView ? "100%" : "250px"}
      alignItems="stretch"
    >
      {products.map((product) => (
        <Product
          key={product.id}
          product={product}
          onDelete={onDelete}
          isMobileView={isMobileView}
        />
      ))}
    </SimpleGrid>
  );
};

export default ProductList; 