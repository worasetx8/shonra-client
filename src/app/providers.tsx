'use client';

import { ChakraProvider, extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  fonts: {
    heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.900',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      },
    },
  },
  components: {
    Card: {
      baseStyle: {
        container: {
          backgroundColor: 'white',
          boxShadow: 'sm',
          borderRadius: 'lg',
          overflow: 'hidden',
          transition: 'all 0.2s',
          _hover: {
            boxShadow: 'md',
          },
        },
      },
    },
    Link: {
      baseStyle: {
        _hover: {
          textDecoration: 'none',
        },
      },
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}