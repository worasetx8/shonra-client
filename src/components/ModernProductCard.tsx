'use client';

import React, { useState, useEffect, memo, useRef } from 'react';
import {
  Box,
  Image,
  Text,
  VStack,
  HStack,
  Badge,
  Flex
} from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';

interface ProductCardProps {
  product: {
    productName: string;
    itemId: string | number;
    price: number;
    priceMin?: number;
    priceMax?: number;
    imageUrl: string;
    ratingStar?: string | number | null;
    priceDiscountRate?: number;
    offerLink: string;
    shopType?: string;
    fromShopee?: boolean; // Indicates if product is from Shopee API
    shopId?: string | number;
    productLink?: string;
    commissionRate?: number;
    sellerCommissionRate?: number;
    shopeeCommissionRate?: number;
    commission?: number;
    shopName?: string;
    salesCount?: number;
    periodStartTime?: number;
    periodEndTime?: number;
    campaignActive?: boolean;
  };
}

const ModernProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle Shop Now click for Shopee products
  const handleShopNow = async (e: React.MouseEvent | React.TouchEvent) => {
    if (!product.fromShopee) {
      // Regular product - just open link
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    if (isSaving) return;

    setIsSaving(true);
    
    // Prepare product data for saving
    const commissionRateOriginal = (product as any).commissionRateOriginal;
    let commissionRateDecimal = 0;
    
    if (commissionRateOriginal !== undefined) {
      commissionRateDecimal = commissionRateOriginal;
    } else {
      const commissionRatePercent = product.commissionRate || 0;
      commissionRateDecimal = commissionRatePercent > 1 ? commissionRatePercent / 100 : commissionRatePercent;
    }
    
    const sellerCommissionRate = product.sellerCommissionRate !== undefined 
      ? product.sellerCommissionRate 
      : commissionRateDecimal;
    
    const productData = {
      itemId: product.itemId,
      productName: product.productName,
      shopName: product.shopName || '',
      shopId: product.shopId || '',
      price: product.price,
      priceMin: product.priceMin,
      priceMax: product.priceMax,
      commissionRate: commissionRateDecimal,
      sellerCommissionRate: sellerCommissionRate,
      shopeeCommissionRate: product.shopeeCommissionRate || 0,
      commission: product.commission || 0,
        imageUrl: product.imageUrl,
        productLink: product.productLink || product.offerLink,
        offerLink: product.offerLink,
        ratingStar: product.ratingStar || 0,
        sold: product.salesCount || 0,
        discountRate: product.priceDiscountRate || 0,
      periodStartTime: product.periodStartTime !== undefined ? product.periodStartTime : 0,
      periodEndTime: product.periodEndTime !== undefined ? product.periodEndTime : 0,
      campaignActive: product.campaignActive !== undefined ? product.campaignActive : false,
      is_flash_sale: false,
    };

    // Navigate immediately to avoid popup blocker (will open in Shopee app if installed)
    window.location.href = product.offerLink;

    // Save product in background using sendBeacon (guaranteed delivery)
    try {
      const blob = new Blob([JSON.stringify(productData)], { type: 'application/json' });
      const sent = navigator.sendBeacon('/api/products/save-from-frontend', blob);
      
      if (!sent) {
        // Fallback to fetch if sendBeacon fails (rare)
        console.warn('sendBeacon failed, using fetch fallback');
        fetch('/api/products/save-from-frontend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
          keepalive: true,
        }).catch(err => console.error('Fetch fallback error:', err));
      }
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle card click for products
  const handleCardClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return;
    }
    
    if (product.fromShopee) {
      handleShopNow(e);
    } else {
      // Regular products - navigate directly
      window.location.href = product.offerLink;
    }
  };

  // Handle touch start to track initial touch position
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  };

  // Handle touch end - only trigger click if it wasn't a scroll
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    
    // If movement is more than 10px, consider it a scroll, not a tap
    const isScroll = deltaX > 10 || deltaY > 10;
    
    // Reset touch start
    touchStartRef.current = null;

    // Only trigger click if it wasn't a scroll
    if (!isScroll) {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        return;
      }
      handleCardClick(e);
    }
  };

  const isMall = product.shopType === '1';
  const rating = typeof product.ratingStar === 'string' ? parseFloat(product.ratingStar) || 0 : Number(product.ratingStar) || 0;
  const hasDiscount = product.priceDiscountRate && product.priceDiscountRate > 0;
  
  // Safe price calculations
  // Use priceMin if available and > 0, otherwise use price, fallback to priceMax
  let currentPrice = 0;
  if (product.priceMin && product.priceMin > 0) {
    currentPrice = Number(product.priceMin);
  } else if (product.price && product.price > 0) {
    currentPrice = Number(product.price);
  } else if (product.priceMax && product.priceMax > 0) {
    currentPrice = Number(product.priceMax);
  }
  
  // Only calculate discountRate if priceDiscountRate exists and is greater than 0
  const discountRate = product.priceDiscountRate && product.priceDiscountRate > 0 ? Number(product.priceDiscountRate) : 0;
  
  // Only calculate original price after component is mounted
  let originalPrice = currentPrice;
  if (mounted && hasDiscount && discountRate > 0 && currentPrice > 0) {
    originalPrice = Math.ceil(currentPrice / (1 - discountRate / 100));
  }
  
  // Don't render if price is 0 (invalid product)
  if (currentPrice === 0) {
    return null;
  }
  
  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <Box
        bg="white"
        border="1px"
        borderColor="gray.200"
        borderRadius="sm"
        h="400px"
        w="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize="sm" color="gray.400">Loading...</Text>
      </Box>
    );
  }

  return (
    <a
      href={product.offerLink}
      onClick={handleCardClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="block bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition cursor-pointer"
    >
      {/* Image */}
      <div className="relative">
        <img
          src={product.imageUrl}
          alt={product.productName}
          className="w-full aspect-square object-cover"
          loading="lazy"
        />
        
        {/* Mall Badge */}
        {isMall && (
          <div className="absolute top-0 left-0 bg-[#d0011b] text-white text-[10px] font-bold px-2 py-0.5">
            Mall
          </div>
        )}
        
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-0 right-0 bg-yellow-400 text-white text-[10px] font-bold px-2 py-1">
            {Math.round(discountRate)}% OFF
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2">
        <h4 className="text-xs font-medium text-gray-900 mb-1 overflow-hidden" style={{ 
          height: '2.5rem',
          lineHeight: '1.25rem'
        }}>
          {product.productName}
        </h4>

        {/* Original Price (if discount exists) */}
        {hasDiscount && (
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-400 line-through">
              ฿{originalPrice.toLocaleString()}
            </span>
            <span className="text-[10px] text-[#C53030] font-medium bg-red-50 px-1.5 py-0.5 rounded-sm">
              -{discountRate}%
            </span>
          </div>
        )}
        
        {/* Sale Price */}
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-red-600 font-bold text-sm">
            ฿{currentPrice.toLocaleString()}
          </span>
          {product.priceMin !== product.priceMax && product.priceMax && (
            <>
              <span className="text-gray-500 text-xs">-</span>
              <span className="text-red-600 font-bold text-sm">
                {Number(product.priceMax).toLocaleString()}
              </span>
            </>
          )}
        </div>
        
        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg 
                key={i}
                className={`w-2 h-2 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-200'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-[10px] text-gray-400 ml-1">
              ({rating.toFixed(1)})
            </span>
          </div>
        )}
      </div>
    </a>
  );
};

// Memoize component to prevent unnecessary re-renders when parent re-renders
export default memo(ModernProductCard, (prevProps, nextProps) => {
  // Only re-render if product data actually changed
  return (
    prevProps.product.itemId === nextProps.product.itemId &&
    prevProps.product.price === nextProps.product.price &&
    prevProps.product.priceMin === nextProps.product.priceMin &&
    prevProps.product.priceMax === nextProps.product.priceMax &&
    prevProps.product.productName === nextProps.product.productName &&
    prevProps.product.imageUrl === nextProps.product.imageUrl &&
    prevProps.product.ratingStar === nextProps.product.ratingStar &&
    prevProps.product.priceDiscountRate === nextProps.product.priceDiscountRate &&
    prevProps.product.commission === nextProps.product.commission &&
    prevProps.product.shopType === nextProps.product.shopType &&
    prevProps.product.fromShopee === nextProps.product.fromShopee
  );
});