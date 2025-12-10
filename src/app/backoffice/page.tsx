'use client';

import React from 'react';
import {
  Box,
  Container,
  Grid,
  Heading,
  Input,
  VStack,
  HStack,
  Text,
  Button,
  Center,
  Spinner,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Card,
  CardBody,
  useToast,
  Divider,
  Badge,
  SimpleGrid,
  Flex,
  Spacer,
  Progress,
  CircularProgress,
  CircularProgressLabel
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

import SkeletonCard from '@/components/SkeletonCard';
import BackofficeLayout from '@/components/BackofficeLayout';

const BackofficeProductCard = dynamic(() => import('@/components/BackofficeProductCard'), {
  loading: () => <SkeletonCard />,
  ssr: true
});

interface Product {
  productName: string;
  itemId: string | number;
  commissionRate: number;
  commission: number;
  price: number;
  sales?: number;
  imageUrl: string;
  shopName: string;
  productLink: string;
  offerLink: string;
  periodStartTime?: string;
  periodEndTime?: string;
  priceMin?: number;
  priceMax?: number;
  ratingStar?: string | number | null;
  priceDiscountRate?: number;
  shopId?: string | number;
  shopType?: string;
  sellerCommissionRate?: number;
  shopeeCommissionRate?: number;
  status?: string;
  isFlashSale?: boolean;
}

interface SearchFilters {
  productName: string;
  commissionRate: number;
  ratingStar: number;
}

export default function BackofficeProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // For first page load
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const toast = useToast();

  // Handle initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 800); // Simulate initial load time
    return () => clearTimeout(timer);
  }, []);
  
  const [filters, setFilters] = useState<SearchFilters>({
    productName: '',
    commissionRate: 0,
    ratingStar: 0
  });

  const ITEMS_PER_PAGE = 20;

  const fetchProducts = async (searchFilters: SearchFilters, page: number) => {
    let progressInterval: NodeJS.Timeout | null = null;
    
    try {
      setLoading(true);
      setError('');
      setLoadingProgress(0);
      
      // Simulate progress updates
      progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev < 90) return prev + 10;
          return prev;
        });
      }, 200);
      
      const params = new URLSearchParams({
        page: page.toString(),
        search: searchFilters.productName,
        commissionRate: searchFilters.commissionRate.toString(),
        ratingStar: searchFilters.ratingStar.toString()
      });

      const response = await fetch('/api/shopee?' + params);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'Error fetching products');
      }

      // Transform products for display (no Flash Sale functionality)
      const shopeeProducts = data.data?.productOfferV2?.nodes || [];
      setProducts(shopeeProducts);
      // Debug: console.log(`✅ Loaded ${shopeeProducts.length} products for display`);
      setTotalPages(Math.ceil((data.data?.productOfferV2?.total || 0) / ITEMS_PER_PAGE));
      
      // Clear progress interval
      if (progressInterval) clearInterval(progressInterval);
      
      // Success toast with enhanced information
      const productsCount = data.data?.productOfferV2?.nodes?.length || 0;
      toast({
        title: '✅ ค้นหาสำเร็จ!',
        description: `พบสินค้า ${productsCount} รายการ${productsCount > 0 ? ' พร้อมแสดงผล' : ''}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      
    } catch (err) {
      // Clear progress interval on error
      if (progressInterval) clearInterval(progressInterval);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(errorMessage);
      
      // Enhanced error toast
      toast({
        title: '❌ เกิดข้อผิดพลาด',
        description: `${errorMessage}. กรุณาลองใหม่อีกครั้ง`,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setLoadingProgress(100);
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
      }, 300);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setSearchSubmitted(true);
    
    // Show immediate feedback
    const searchToast = toast({
      title: 'เริ่มค้นหา',
      description: 'กำลังเชื่อมต่อกับ Shopee API...',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
    
    fetchProducts(filters, 1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchProducts(filters, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (field: keyof SearchFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      productName: '',
      commissionRate: 0,
      ratingStar: 0
    });
    setProducts([]);
    setSearchSubmitted(false);
    setError('');
  };

  return (
    <BackofficeLayout>
      {/* Page Header - Responsive */}
      <Box 
        bg="white" 
        boxShadow="md" 
        borderBottom="2px" 
        borderColor="purple.100"
        position="sticky"
        top={{ base: '60px', lg: 0 }}
        zIndex="997"
        backdropFilter="blur(10px)"
        backgroundColor="rgba(255, 255, 255, 0.98)"
      >
        <Container maxW="container.xl" py={{ base: 3, md: 6 }} px={{ base: 3, sm: 4, md: 8 }}>
          <VStack spacing={{ base: 2, md: 3 }} align="stretch">
            <Heading 
              size={{ base: 'md', md: 'lg' }} 
              color="purple.600" 
              textAlign={{ base: 'center', md: 'left' }}
            >
              เพิ่มสินค้าจาก Shopee
            </Heading>
            <Text 
              color="gray.600" 
              fontSize={{ base: 'sm', md: 'md' }}
              textAlign={{ base: 'center', md: 'left' }}
              lineHeight="1.4"
            >
              ค้นหาและเพิ่มสินค้าจาก Shopee Affiliate เข้าสู่ระบบ
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Search Filters */}
      <Container maxW="container.xl" py={{ base: 4, md: 6 }} px={{ base: 3, sm: 4, md: 8 }}>
        <Card 
          mb={{ base: 4, md: 6 }}
          bg="white"
          shadow="lg"
          borderRadius="xl"
          border="1px solid"
          borderColor="purple.100"
        >
          <CardBody p={{ base: 4, sm: 5, md: 6 }}>
            <VStack spacing={{ base: 4, md: 6 }} align="stretch">
              <Heading 
                size={{ base: 'sm', md: 'md' }} 
                color="purple.700"
                fontWeight="bold"
                textAlign={{ base: 'center', md: 'left' }}
              >
                🛍️ ค้นหาสินค้าใหม่
              </Heading>
              
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 3, md: 4 }}>
                <FormControl>
                  <FormLabel fontSize={{ base: 'sm', md: 'md' }} color="gray.700">ชื่อสินค้า</FormLabel>
                  <Input
                    placeholder="ค้นหาชื่อสินค้า..."
                    value={filters.productName}
                    onChange={(e) => handleFilterChange('productName', e.target.value)}
                    size="md"
                    h="44px"
                    inputMode="search"
                    autoComplete="off"
                    borderColor="gray.300"
                    _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px var(--chakra-colors-purple-400)' }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize={{ base: 'sm', md: 'md' }} color="gray.700">EXTRACOMM (%)</FormLabel>
                  <NumberInput
                    min={0}
                    max={100}
                    step={0.1}
                    value={filters.commissionRate}
                    onChange={(value) => handleFilterChange('commissionRate', parseFloat(value) || 0)}
                    size="md"
                  >
                    <NumberInputField 
                      placeholder="0.0" 
                      h="44px"
                      borderColor="gray.300"
                      _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px var(--chakra-colors-purple-400)' }}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize={{ base: 'sm', md: 'md' }} color="gray.700">เรตติ้งดาว</FormLabel>
                  <Select
                    value={filters.ratingStar}
                    onChange={(e) => handleFilterChange('ratingStar', parseFloat(e.target.value) || 0)}
                    size="md"
                    h="44px"
                    borderColor="gray.300"
                    _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px var(--chakra-colors-purple-400)' }}
                  >
                    <option value={0}>ทุกเรตติ้ง</option>
                    <option value={1}>1 ดาวขึ้นไป</option>
                    <option value={2}>2 ดาวขึ้นไป</option>
                    <option value={3}>3 ดาวขึ้นไป</option>
                    <option value={4}>4 ดาวขึ้นไป</option>
                    <option value={5}>5 ดาว</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <Flex 
                direction={{ base: 'column', sm: 'row' }} 
                gap={{ base: 2, sm: 3 }}
                justify="center"
                align="stretch"
              >
                <Button
                  leftIcon={loading ? undefined : <SearchIcon />}
                  colorScheme="purple"
                  size="md"
                  onClick={handleSearch}
                  isLoading={loading}
                  loadingText={`ค้นหา... ${loadingProgress}%`}
                  isDisabled={loading}
                  flex={{ base: 1, sm: 'none' }}
                  h="44px"
                  minW={{ sm: '150px' }}
                  fontSize="sm"
                  fontWeight="semibold"
                >
                  {loading ? `กำลังค้นหา ${loadingProgress}%` : '🔍 ค้นหาสินค้า'}
                </Button>
                
                <Button
                  variant="outline"
                  colorScheme="gray"
                  size="md"
                  onClick={resetFilters}
                  flex={{ base: 1, sm: 'none' }}
                  h="44px"
                  minW={{ sm: '120px' }}
                  fontSize="sm"
                >
                  🔄 รีเซ็ต
                </Button>
              </Flex>
            </VStack>
          </CardBody>
        </Card>

        {/* Results Section */}
        <VStack spacing={{ base: 4, sm: 5, md: 6, lg: 8 }} align="stretch">
          {initialLoading ? (
            // Initial page load skeleton
            <VStack spacing={4}>
              <Center py={8}>
                <VStack spacing={4}>
                  <Spinner size="xl" color="purple.500" thickness="4px" />
                  <Text color="gray.600" fontWeight="medium">กำลังเตรียมหน้าจัดการสินค้า...</Text>
                  <Text color="gray.500" fontSize="sm">กรุณารอสักครู่</Text>
                </VStack>
              </Center>
              {/* Skeleton Cards */}
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing={{ base: 4, md: 6 }}>
                {Array.from({ length: 8 }, (_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </SimpleGrid>
            </VStack>
          ) : loading ? (
            // Search loading state
            <Center py={12}>
              <VStack spacing={6} maxW="md" mx="auto">
                <CircularProgress 
                  value={loadingProgress} 
                  size="80px" 
                  color="purple.500"
                  thickness="8px"
                  capIsRound
                >
                  <CircularProgressLabel fontSize="sm" fontWeight="bold" color="purple.600">
                    {loadingProgress}%
                  </CircularProgressLabel>
                </CircularProgress>
                
                <VStack spacing={3}>
                  <Text color="gray.700" fontWeight="medium" fontSize="lg">กำลังค้นหาสินค้า</Text>
                  <Text color="gray.500" fontSize="sm" textAlign="center">
                    {loadingProgress < 30 && "เชื่อมต่อกับ Shopee API..."}
                    {loadingProgress >= 30 && loadingProgress < 70 && "ประมวลผลข้อมูลสินค้า..."}
                    {loadingProgress >= 70 && "กำลังจัดเรียงผลลัพธ์..."}
                  </Text>
                  
                  <Progress 
                    value={loadingProgress} 
                    w="250px" 
                    colorScheme="purple" 
                    size="sm" 
                    borderRadius="full"
                    bg="gray.100"
                  />
                  
                  <Badge colorScheme="purple" variant="subtle" fontSize="xs" px={3} py={1} borderRadius="full">
                    โปรดอดทน ใช้เวลาประมาณ 5-10 วินาที
                  </Badge>
                </VStack>
              </VStack>
            </Center>
          ) : error ? (
            <Center py={12}>
              <VStack spacing={4}>
                <Text color="red.500" fontSize="lg">{error}</Text>
                <Button
                  onClick={handleSearch}
                  colorScheme="purple"
                  size="sm"
                >
                  ลองใหม่อีกครั้ง
                </Button>
              </VStack>
            </Center>
          ) : !searchSubmitted ? (
            <Center py={12}>
              <VStack spacing={4}>
                <Text fontSize="lg" color="gray.600">
                  กรุณาใส่เงื่อนไขการค้นหาและกดปุ่ม "ค้นหาสินค้า"
                </Text>
              </VStack>
            </Center>
          ) : products.length === 0 ? (
            <Center py={12}>
              <VStack spacing={4}>
                <Text fontSize="lg" color="gray.600">
                  ไม่พบสินค้าที่ตรงกับเงื่อนไข
                </Text>
                <Button
                  onClick={resetFilters}
                  colorScheme="purple"
                  variant="outline"
                  size="sm"
                >
                  ล้างตัวกรองและลองใหม่
                </Button>
              </VStack>
            </Center>
          ) : (
            <>
              {/* Results Summary - Mobile Friendly */}
              <Box bg="white" p={{ base: 3, md: 4 }} borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.100">
                <VStack spacing={{ base: 2, md: 0 }} align="stretch">
                  <Flex 
                    direction={{ base: 'column', sm: 'row' }} 
                    justify="space-between" 
                    align={{ base: 'start', sm: 'center' }}
                    gap={{ base: 2, sm: 4 }}
                  >
                    <HStack spacing={2} wrap="wrap">
                      <Badge colorScheme="green" fontSize={{ base: 'xs', sm: 'sm' }} px={{ base: 2, md: 3 }} py={1}>
                        พบสินค้า {products.length} รายการ
                      </Badge>
                      {filters.productName && (
                        <Badge 
                          bg="#7367f0" 
                          color="white" 
                          fontSize={{ base: 'xs', md: 'sm' }} 
                          px={{ base: 2, md: 3 }} 
                          py={{ base: 1, md: 2 }}
                          borderRadius="lg"
                          fontWeight="600"
                          boxShadow="0 2px 4px rgba(115, 103, 240, 0.2)"
                        >
                          ชื่อ: {filters.productName}
                        </Badge>
                      )}
                      {filters.commissionRate > 0 && (
                        <Badge colorScheme="orange" fontSize="sm" px={2} py={1}>
                          EXTRACOMM: {filters.commissionRate}%+
                        </Badge>
                      )}
                      {filters.ratingStar > 0 && (
                        <Badge colorScheme="yellow" fontSize="sm" px={2} py={1}>
                          เรตติ้ง: {filters.ratingStar}+ ดาว
                        </Badge>
                      )}
                    </HStack>
                  </Flex>
                </VStack>
              </Box>

              {/* Products Grid */}
              <Grid
                templateColumns={{
                  base: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(2, 1fr)',
                  lg: 'repeat(3, 1fr)',
                  xl: 'repeat(4, 1fr)'
                }}
                gap={{ base: 3, sm: 4, md: 5, lg: 6 }}
              >
                {products.map((product, index) => (
                  <BackofficeProductCard key={product.productLink + index} product={product} />
                ))}
              </Grid>

              {/* Pagination - Mobile Responsive */}
              {totalPages > 1 && (
                <Center mt={{ base: 6, md: 8 }} py={4}>
                  <VStack spacing={4}>
                    {/* Mobile: Show simple prev/next with page info */}
                    <HStack spacing={2} display={{ base: 'flex', md: 'none' }}>
                      <Button
                        onClick={() => handlePageChange(currentPage - 1)}
                        isDisabled={currentPage === 1}
                        colorScheme="purple"
                        variant="outline"
                        size="sm"
                        flex={1}
                      >
                        ก่อนหน้า
                      </Button>
                      <Text fontSize="sm" color="gray.600" px={3}>
                        {currentPage} / {totalPages}
                      </Text>
                      <Button
                        onClick={() => handlePageChange(currentPage + 1)}
                        isDisabled={currentPage === totalPages}
                        colorScheme="purple"
                        variant="outline"
                        size="sm"
                        flex={1}
                      >
                        ถัดไป
                      </Button>
                    </HStack>
                    
                    {/* Desktop: Show full pagination */}
                    <HStack spacing={2} display={{ base: 'none', md: 'flex' }}>
                      <Button
                        onClick={() => handlePageChange(currentPage - 1)}
                        isDisabled={currentPage === 1}
                        colorScheme="purple"
                        variant="outline"
                        size="md"
                      >
                        ก่อนหน้า
                      </Button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum = currentPage;
                        if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - (4 - i);
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        if (pageNum > 0 && pageNum <= totalPages) {
                          return (
                            <Button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              colorScheme={currentPage === pageNum ? 'purple' : 'gray'}
                              variant={currentPage === pageNum ? 'solid' : 'outline'}
                              size="md"
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                        return null;
                      })}
                      <Button
                        onClick={() => handlePageChange(currentPage + 1)}
                        isDisabled={currentPage === totalPages}
                        colorScheme="purple"
                        variant="outline"
                        size="md"
                      >
                        ถัดไป
                      </Button>
                    </HStack>
                  </VStack>
                </Center>
              )}
            </>
          )}
        </VStack>
      </Container>
    </BackofficeLayout>
  );
}