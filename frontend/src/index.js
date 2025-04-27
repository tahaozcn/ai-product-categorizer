import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ChakraProvider, extendTheme, ColorModeScript } from '@chakra-ui/react';

const theme = extendTheme({
  components: {
    Dialog: {
      baseStyle: {
        dialog: {
          bg: 'white',
          boxShadow: 'lg',
          rounded: 'md',
          maxW: '2xl',
        },
        backdrop: {
          bg: 'blackAlpha.600',
          backdropFilter: 'blur(4px)',
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode="light" />
      <App />
    </ChakraProvider>
  </React.StrictMode>
); 