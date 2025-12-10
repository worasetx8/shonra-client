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
  const linkRef = useRef<HTMLAnchorElement>(null);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper function to open link using hidden <a> tag (avoids popup blocker and preserves cookies)
  const openLink = (url: string) => {
    if (linkRef.current) {
      linkRef.current.href = url;
      linkRef.current.click();
    } else {
      // Fallback: create temporary <a> tag
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Handle Shop Now click for Shopee products
  const handleShopNow = async (e: React.MouseEvent | React.TouchEvent) => {
    if (!product.fromShopee) {
      // Regular product - just open link
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    if (isSaving) return;

    // Use hidden <a> tag to open link (avoids popup blocker and preserves cookies/tracking)
    // This method works on both mobile and desktop
    openLink(product.offerLink);

    setIsSaving(true);
    
    // Save product to database (do this AFTER opening window)
    // Backend uses commissionRate for commission_rate column
    // commissionRate from Shopee API is already in decimal (0.1 = 10%)
    // If we have commissionRateOriginal (from API), use it directly
    // Otherwise, convert from percentage (if > 1) or use as decimal
    const commissionRateOriginal = (product as any).commissionRateOriginal;
    let commissionRateDecimal = 0;
    
    if (commissionRateOriginal !== undefined) {
      // Use original commissionRate from Shopee API (already in decimal)
      commissionRateDecimal = commissionRateOriginal;
    } else {
      // Fallback: convert from percentage if needed
      const commissionRatePercent = product.commissionRate || 0;
      commissionRateDecimal = commissionRatePercent > 1 ? commissionRatePercent / 100 : commissionRatePercent;
    }
    
    const sellerCommissionRate = product.sellerCommissionRate !== undefined 
      ? product.sellerCommissionRate 
      : commissionRateDecimal; // Fallback to commissionRate
    
    // Use actual values from Shopee API if available, otherwise use defaults
    const productData = {
      itemId: product.itemId,
      productName: product.productName,
      shopName: product.shopName || '',
      shopId: product.shopId || '',
      price: product.price,
      priceMin: product.priceMin,
      priceMax: product.priceMax,
      // Backend uses commissionRate for commission_rate column
      // Use commissionRate from Shopee API (already in decimal)
      commissionRate: commissionRateDecimal, // Use commissionRate from API (decimal)
      sellerCommissionRate: sellerCommissionRate,
      shopeeCommissionRate: product.shopeeCommissionRate || 0,
      commission: product.commission || 0,
      imageUrl: product.imageUrl,
      productLink: product.productLink || product.offerLink,
      offerLink: product.offerLink,
      ratingStar: product.ratingStar || 0,
      sold: product.salesCount || 0,
      discountRate: product.priceDiscountRate || 0,
      // Use actual values from Shopee API response, not hardcoded 0
      periodStartTime: product.periodStartTime !== undefined ? product.periodStartTime : 0,
      periodEndTime: product.periodEndTime !== undefined ? product.periodEndTime : 0,
      campaignActive: product.campaignActive !== undefined ? product.campaignActive : false,
      is_flash_sale: false,
    };

    // Save product in background (window is already open)
    fetch('/api/products/save-from-frontend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    })
    .then(async (saveResponse) => {
      if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        console.error('Save product failed:', {
          status: saveResponse.status,
          statusText: saveResponse.statusText,
          error: errorText
        });
      } else {
        const result = await saveResponse.json();
        console.log('Product saved successfully:', result);
      }
    })
    .catch((error) => {
      console.error('Error saving product:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
    })
    .finally(() => {
      setIsSaving(false);
    });
  };

  // Handle card click for Shopee products (mouse events)
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on button or other interactive elements
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return;
    }
    
    // Prevent default behavior to avoid double navigation
    e.preventDefault();
    e.stopPropagation();
    
    if (product.fromShopee) {
      handleShopNow(e);
    } else {
      // For non-Shopee products, use same method as Shopee products
      openLink(product.offerLink);
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

  // Handle touch move to detect scrolling
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    
    // If movement is more than 10px, mark as scrolling
    if (deltaX > 10 || deltaY > 10) {
      // Reset touch start to prevent click on touch end
      touchStartRef.current = null;
    }
  };

  // Handle touch end - only trigger click if it wasn't a scroll
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) {
      // Was a scroll, don't trigger click
      return;
    }

    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    
    // Reset touch start
    touchStartRef.current = null;
    
    // If movement is more than 10px, consider it a scroll, not a tap
    const isScroll = deltaX > 10 || deltaY > 10;
    
    // Only trigger click if it wasn't a scroll
    if (!isScroll) {
      // Don't trigger if clicking on button or other interactive elements
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        return;
      }
      
      // Trigger action immediately (must be in user interaction context to avoid popup blocker)
      // Don't use setTimeout as it breaks the user interaction context
      if (product.fromShopee) {
        handleShopNow(e);
      } else {
        // For non-Shopee products, use same method as Shopee products
        openLink(product.offerLink);
      }
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
    <Box
      bg="white"
      border="1px"
      borderColor="transparent"
      _hover={{ 
        borderColor: '#C53030', 
        shadow: 'lg' 
      }}
      transition="all 0.2s"
      cursor="pointer"
      borderRadius="sm"
      position="relative"
      overflow="hidden"
      display="flex"
      flexDirection="column"
      h="full"
      w="full"
      role="group"
      onClick={handleCardClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Mall Badge */}
      {isMall && (
        <Badge
          position="absolute"
          top={0}
          left={0}
          bg="#d0011b"
          color="white"
          fontSize="10px"
          fontWeight="bold"
          px={2}
          py={0.5}
          zIndex={10}
          borderRadius="0"
          borderBottomRightRadius="sm"
        >
          Mall
        </Badge>
      )}
      
      {/* Discount Badge */}
      {hasDiscount && (
        <Box
          position="absolute"
          top={0}
          right={0}
          bg="yellow.400"
          color="white"
          fontSize="xs"
          fontWeight="bold"
          px={1}
          py={1}
          w={{ base: 9, md: 10 }}
          textAlign="center"
          zIndex={10}
        >
          <Text display="block">{Math.round(discountRate)}%</Text>
          <Text fontSize={{ base: '8px', md: '10px' }} fontWeight="normal" textTransform="uppercase">
            OFF
          </Text>
        </Box>
      )}

      {/* Image */}
      <Box
        aspectRatio="1"
        w="full"
        overflow="hidden"
        bg="gray.100"
        position="relative"
      >
        <Image
          src={product.imageUrl}
          alt={product.productName}
          w="full"
          h="full"
          objectFit="cover"
          transition="transform 0.5s"
          _groupHover={{ transform: 'scale(1.05)' }}
          loading="lazy"
        />
      </Box>

      {/* Content */}
      <Box p={{ base: 2.5, md: 2 }} display="flex" flexDirection="column" flexGrow={1} justifyContent="space-between">
        <VStack spacing={0} align="stretch">
          <Box
            minH={{ base: '3.9rem', md: '3.6rem' }}
            mb={1}
            pr={{ base: 2, md: 2 }}
            position="relative"
            zIndex={1}
          >
            <Text
              fontSize={{ base: 'xs', md: 'xs' }}
              color="gray.800"
              noOfLines={3}
              lineHeight="1.3"
              fontWeight="medium"
              display="-webkit-box"
              style={{
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {product.productName}
            </Text>
          </Box>

        </VStack>

        {/* Price Section - Bottom of card */}
        <VStack align="stretch" spacing={{ base: 1.5, md: 2 }} mt="auto">
          {/* Original Price (if discount exists) */}
          {hasDiscount && (
            <HStack spacing={1} alignItems="center" justify="space-between">
              <Text
                fontSize={{ base: 'xs', md: 'xs' }}
                color="gray.400"
                textDecoration="line-through"
                fontWeight="normal"
              >
                ฿{originalPrice.toLocaleString()}
              </Text>
              <Text fontSize={{ base: 'xs', md: 'xs' }} color="#C53030" fontWeight="medium" bg="red.50" px={1.5} py={0.5} borderRadius="sm">
                -{discountRate}%
              </Text>
            </HStack>
          )}
          
          {/* Sale Price */}
          <HStack spacing={{ base: 0.5, md: 1 }} color="#C53030" alignItems="baseline">
            <Text fontSize={{ base: 'sm', md: 'sm' }} fontWeight="medium">฿</Text>
            <Text fontSize={{ base: 'xl', md: 'xl' }} fontWeight="bold" lineHeight="1">
              {currentPrice.toLocaleString()}
            </Text>
            {product.priceMin !== product.priceMax && product.priceMax && (
              <>
                <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.500" fontWeight="medium">-</Text>
                <Text fontSize={{ base: 'xl', md: 'xl' }} fontWeight="bold" lineHeight="1">
                  {Number(product.priceMax).toLocaleString()}
                </Text>
              </>
            )}
          </HStack>
          
          {/* Rating - Small and subtle */}
          {rating > 0 && (
            <HStack align="center" justify="space-between">
              <HStack>
                {[...Array(5)].map((_, i) => (
                  <StarIcon 
                    key={i} 
                    w={{ base: 2.5, md: 2 }} 
                    h={{ base: 2.5, md: 2 }}
                    color={i < Math.floor(rating) ? 'yellow.400' : 'gray.200'}
                  />
                ))}
                <Text fontSize={{ base: '10px', md: '9px' }} color="gray.400" ml={1}>
                  ({rating.toFixed(1)})
                </Text>
              </HStack>
            </HStack>
          )}
          
          {/* Shop Now Button - Enhanced CTA for both Mobile and Desktop */}
          <Box mt={2}>
            <Box
              as="button"
              w="full"
              bg="#DC2626"
              color="white"
              py={2.5}
              borderRadius="md"
              fontSize="sm"
              fontWeight="bold"
              textAlign="center"
              textTransform="uppercase"
              letterSpacing="0.5px"
              _hover={{ bg: '#B91C1C', transform: 'translateY(-1px)', boxShadow: 'md' }}
              _active={{ bg: '#991B1B', transform: 'translateY(0)' }}
              transition="all 0.2s"
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                if (product.fromShopee) {
                  handleShopNow(e);
                } else {
                  // For non-Shopee products, use same method as Shopee products
                  openLink(product.offerLink);
                }
              }}
              disabled={isSaving}
              opacity={isSaving ? 0.7 : 1}
              cursor={isSaving ? 'not-allowed' : 'pointer'}
              boxShadow="sm"
            >
              {isSaving ? 'Saving...' : 'SHOP NOW'}
            </Box>
          </Box>
        </VStack>
      </Box>
      
      {/* Hidden <a> tag for opening links (avoids popup blocker and preserves cookies/tracking) */}
      <Box
        as="a"
        ref={linkRef}
        href={product.offerLink}
        target="_blank"
        rel="noopener noreferrer"
        position="absolute"
        opacity={0}
        pointerEvents="none"
        aria-hidden="true"
        tabIndex={-1}
        style={{ width: 0, height: 0, overflow: 'hidden' }}
      />
    </Box>
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