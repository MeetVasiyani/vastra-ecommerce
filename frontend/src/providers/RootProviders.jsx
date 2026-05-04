import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import { SaleProvider } from '../context/SaleContext';

const RootProviders = ({ children }) => (
  <AuthProvider>
    <CartProvider>
      <WishlistProvider>
        <SaleProvider>{children}</SaleProvider>
      </WishlistProvider>
    </CartProvider>
  </AuthProvider>
);

export default RootProviders;
