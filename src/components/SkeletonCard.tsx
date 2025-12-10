import { Box, VStack, HStack, Skeleton, SkeletonText } from '@chakra-ui/react';
import { memo } from 'react';

const SkeletonCard = memo(function SkeletonCard() {
  return (
    <Box
      borderWidth="1px"
      borderColor="#27272a"
      borderRadius="lg"
      overflow="hidden"
      bg="#18181b"
      w="100%"
      boxShadow="sm"
    >
      {/* Image Skeleton */}
      <Skeleton 
        aspectRatio="1"
        borderRadius="0"
        startColor="#27272a"
        endColor="#3f3f46"
      />
      
      {/* Content Skeleton */}
      <VStack p={{ base: 3, md: 4 }} align="start" spacing={{ base: 2, md: 3 }}>
        {/* Title Skeleton */}
        <SkeletonText 
          noOfLines={2} 
          spacing={2}
          skeletonHeight="3"
          w="100%"
          startColor="#27272a"
          endColor="#3f3f46"
        />
        
        {/* Price and Info Skeleton */}
        <VStack spacing={2} width="100%" align="start">
          <HStack justify="space-between" width="100%">
            <VStack align="start" spacing={1}>
              <Skeleton height="5" width="80px" startColor="#27272a" endColor="#3f3f46" />
              <Skeleton height="3" width="100px" startColor="#27272a" endColor="#3f3f46" />
            </VStack>
            
            <VStack align="end" spacing={0}>
              <Skeleton height="3" width="40px" startColor="#27272a" endColor="#3f3f46" />
              <Skeleton height="3" width="50px" startColor="#27272a" endColor="#3f3f46" />
            </VStack>
          </HStack>
        </VStack>
      </VStack>
    </Box>
  );
});

export default SkeletonCard;