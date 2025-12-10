'use client';

import {
  Box,
  Container,
  Grid,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  Center,
  Spinner,
  Card,
  CardBody,
  useToast,
  Badge,
  Flex,
  Spacer,
  Select,
  IconButton,
  Tooltip,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Input,
  InputGroup,
  InputLeftElement,
  Icon
} from '@chakra-ui/react';
import { DeleteIcon, ViewIcon, RepeatIcon, SettingsIcon, TimeIcon, SearchIcon, AddIcon } from '@chakra-ui/icons';
import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

import SkeletonCard from '@/components/SkeletonCard';
import ProductSyncModal from '@/components/ProductSyncModal';
import ImprovedProductCard from '@/components/ImprovedProductCard';

const BackofficeProductCard = dynamic(() => import('@/components/BackofficeProductCard'), {
  loading: () => <SkeletonCard />,
  ssr: true
});
import BackofficeLayout from '@/components/BackofficeLayout';

interface SavedProduct {
  id: number;
  item_id: string;
  product_name: string;
  shop_name: string;
  shop_id: string;
  price: number;
  price_min: number;
  price_max: number;
  commission_rate: number;
  seller_commission_rate: number;
  shopee_commission_rate: number;
  commission_amount: number;
  image_url: string;
  product_link: string;
  offer_link: string;
  rating_star: number;
  sales_count: number;
  discount_rate: number;
  period_start_time: string;
  period_end_time: string;
  campaign_active: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  isFlashSale?: boolean; // ⭐ เพิ่ม Flash Sale status
}

export default function SavedProductsPage() {
  const [products, setProducts] = useState<SavedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [status, setStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isSync, setIsSync] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isSyncOpen,
    onOpen: onSyncOpen,
    onClose: onSyncClose
  } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();
  
  const ITEMS_PER_PAGE = 20;

  const fetchSavedProducts = async (page: number, statusFilter: string, searchQuery = '', forceRefresh = false) => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        status: statusFilter
      });
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      // Smart caching strategy
      const cacheOptions = forceRefresh ? 
        { cache: 'no-store' as RequestCache } : // Force refresh when needed
        { cache: 'default' as RequestCache, next: { revalidate: 30 } }; // Cache for 30 seconds
      
      const response = await fetch('/api/shopee/saved-products?' + params, cacheOptions);
      const result = await response.json();

      if (response.ok && result.success) {
        // Merge with Flash Sale status from database
        const productsWithFlashSale = (result.data || []).map((product: any) => ({
          ...product,
          isFlashSale: product.is_flash_sale === 1 || product.is_flash_sale === true || product.is_flash_sale === "1"
        }));
        
        // Log for debugging if needed
        if (productsWithFlashSale.length > 0) {
          // Debug: console.log(`✅ Loaded ${productsWithFlashSale.length} saved products`);
        }
        
        setProducts(productsWithFlashSale);
        setTotalItems(result.total || 0);
        setTotalPages(Math.ceil((result.total || 0) / ITEMS_PER_PAGE));
        
        if (result.data && result.data.length > 0) {
          // ใช้ toast id เพื่อป้องกันการซ้ำ
          const toastId = 'fetch-saved-success';
          if (!toast.isActive(toastId)) {
            toast({
              id: toastId,
              title: 'สำเร็จ',
              description: `พบสินค้าที่บันทึกแล้ว ${result.data.length} รายการ`,
              status: 'success',
              duration: 2000,
              isClosable: true,
            });
          }
        }
      } else {
        throw new Error(result.message || 'Failed to fetch saved products');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch saved products';
      setError(errorMessage);
      
      // ใช้ toast id เพื่อป้องกันการซ้ำ
      const toastId = 'fetch-saved-error';
      if (!toast.isActive(toastId)) {
        toast({
          id: toastId,
          title: 'เกิดข้อผิดพลาด',
          description: errorMessage,
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSync(true);
    setSyncProgress(0);
    setSyncResult(null);
    onSyncOpen();
    
    try {
      // Debug: console.log('🔄 Starting product sync with Shopee API...');
      
      // Animate progress during API call
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 500);
      
      // Call the sync API endpoint
      const response = await fetch('/api/sync-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync products');
      }
      
      const result = await response.json();
      // Debug: console.log('Sync result:', result);
      
      // Complete progress and store result
      setSyncProgress(100);
      setSyncResult(result);
      
      // Update last sync time
      setLastSyncTime(new Date().toISOString());
      localStorage.setItem('lastSyncTime', new Date().toISOString());
      
      // Reload products after sync
      await fetchSavedProducts(currentPage, status);
      
      // Show toast notification
      if (result.success && result.summary) {
        const { summary } = result;
        toast({
          title: '✅ ซิงค์เสร็จสิ้น',
          description: `อัพเดท ${summary.totalUpdated} รายการ${summary.totalErrors > 0 ? `, ข้อผิดพลาด ${summary.totalErrors} รายการ` : ''}`,
          status: summary.totalErrors === 0 ? 'success' : 'warning',
          duration: 5000,
          isClosable: true,
        });
      }
      
    } catch (error: any) {
      console.error('Sync error:', error);
      
      // Store error result
      setSyncProgress(100);
      setSyncResult({
        success: false,
        error: error.message || 'ไม่สามารถซิงค์ข้อมูลได้'
      });
      
      toast({
        title: '❌ เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถซิงค์ข้อมูลได้',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSync(false);
    }
  };

  // Handle Flash Sale Toggle
  const handleFlashSaleToggle = async (itemId: string | number, isFlashSale: boolean) => {
    try {
      const response = await fetch(`/api/flash-sale/${itemId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isFlashSale }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setProducts(prev => 
          prev.map(product => 
            product.item_id === itemId.toString() 
              ? { ...product, is_flash_sale: isFlashSale }
              : product
          )
        );

        toast({
          title: '✨ อัพเดทเรียบร้อย!',
          description: `${isFlashSale ? 'เปิดใช้งาน' : 'ปิดการใช้งาน'} Flash Sale แล้ว`,
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        throw new Error(result.error || 'ไม่สามารถอัพเดท Flash Sale ได้');
      }
    } catch (error: any) {
      toast({
        title: '❌ เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถอัพเดท Flash Sale ได้',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle Product Status Toggle
  const handleStatusToggle = async (itemId: string | number, status: string) => {
    try {
      const response = await fetch('/api/shopee/saved-products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId, status }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setProducts(prev => 
          prev.map(product => 
            product.item_id === itemId.toString() 
              ? { ...product, status }
              : product
          )
        );

        toast({
          title: '✅ อัพเดทเรียบร้อย!',
          description: `${status === 'active' ? 'เปิดใช้งาน' : 'ปิดการใช้งาน'} สินค้าแล้ว`,
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        throw new Error(result.error || 'ไม่สามารถอัพเดทสถานะได้');
      }
    } catch (error: any) {
      toast({
        title: '❌ เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถอัพเดทสถานะได้',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchSavedProducts(currentPage, status, searchTerm, false); // Use cache by default
  }, [currentPage, status]);

  // Load last sync time on component mount
  useEffect(() => {
    const savedSyncTime = localStorage.getItem('lastSyncTime');
    if (savedSyncTime) {
      setLastSyncTime(savedSyncTime);
    }
  }, []);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setCurrentPage(1);
    setSearchTerm(''); // Clear search when changing status
  };

  const confirmDelete = (productId: number) => {
    setDeleteId(productId);
    onOpen();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      const response = await fetch(`/api/shopee/saved-products?id=${deleteId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        // ใช้ toast id เพื่อป้องกันการซ้ำ
        const toastId = `delete-saved-${deleteId}`;
        if (!toast.isActive(toastId)) {
          toast({
            id: toastId,
            title: 'สำเร็จ',
            description: 'ลบสินค้าเรียบร้อยแล้ว',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
        
        // Refresh the list with fresh data
        fetchSavedProducts(currentPage, status, searchTerm, true); // Force refresh after delete
      } else {
        throw new Error(result.message || 'Failed to delete product');
      }
    } catch (error) {
      // ใช้ toast id เพื่อป้องกันการซ้ำ
      const toastId = `delete-error-${deleteId}`;
      if (!toast.isActive(toastId)) {
        toast({
          id: toastId,
          title: 'เกิดข้อผิดพลาด',
          description: error instanceof Error ? error.message : 'ไม่สามารถลบสินค้าได้',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      }
    } finally {
      onClose();
      setDeleteId(null);
    }
  };

  // Handle Product Removal
  const handleProductRemove = async (productId: number) => {
    try {
      const response = await fetch('/api/shopee/saved-products', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: productId }),
      });

      const result = await response.json();

      if (result.success) {
        // Remove from local state
        setProducts(prev => prev.filter(product => product.id !== productId));
        setTotalItems(prev => prev - 1);

        toast({
          title: '🗑️ ลบเรียบร้อย!',
          description: 'ลบสินค้าออกจากระบบแล้ว',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        throw new Error(result.error || 'ไม่สามารถลบสินค้าได้');
      }
    } catch (error: any) {
      toast({
        title: '❌ เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถลบสินค้าได้',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // ฟังก์ชันการค้นหา
  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when searching
    fetchSavedProducts(1, status, searchTerm);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Auto-search when user clears the input
    if (value.trim() === '') {
      setCurrentPage(1);
      fetchSavedProducts(1, status, '');
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Convert saved product to display format
  const convertToDisplayProduct = (savedProduct: SavedProduct) => ({
    productName: savedProduct.product_name,
    itemId: savedProduct.item_id,
    commissionRate: savedProduct.commission_rate,
    commission: savedProduct.commission_amount,
    price: savedProduct.price,
    sales: savedProduct.sales_count,
    imageUrl: savedProduct.image_url,
    shopName: savedProduct.shop_name,
    productLink: savedProduct.product_link,
    offerLink: savedProduct.offer_link,
    periodStartTime: savedProduct.period_start_time,
    periodEndTime: savedProduct.period_end_time,
    priceMin: savedProduct.price_min,
    priceMax: savedProduct.price_max,
    ratingStar: savedProduct.rating_star,
    priceDiscountRate: savedProduct.discount_rate,
    shopId: savedProduct.shop_id,
    sellerCommissionRate: savedProduct.seller_commission_rate,
    shopeeCommissionRate: savedProduct.shopee_commission_rate,
    isFlashSale: savedProduct.isFlashSale, // ⭐ เพิ่ม Flash Sale status
  });

  return (
    <BackofficeLayout
      showHeader={true}
      headerTitle="จัดการสินค้า"
      headerDescription="ค้นหาสินค้าใน Shopee และเพิ่มเข้าสู่ระบบ"
      onSearch={(term) => {
        setSearchTerm(term);
        setCurrentPage(1);
        fetchSavedProducts(1, status, term, true);
      }}
      onFilterChange={(filter) => {
        setStatus(filter);
        setCurrentPage(1);
        setSearchTerm('');
        fetchSavedProducts(1, filter, '', true);
      }}
      onClearFilter={() => {
        setStatus('all');
        setSearchTerm('');
        setCurrentPage(1);
        fetchSavedProducts(1, 'all', '', true);
      }}
      onSync={handleSync}
      onRefresh={() => fetchSavedProducts(currentPage, status, searchTerm, true)}
      searchValue={searchTerm}
      filterValue={status}
      isLoading={loading || isSync}
      totalItems={totalItems}
      lastSyncTime={lastSyncTime ? lastSyncTime : undefined}
      showResults={true}
      currentResults={products.length}
      currentPage={currentPage}
      totalPages={totalPages}
    >




      {/* Product Sync Modal */}
      <ProductSyncModal
        isOpen={isSyncOpen}
        onClose={onSyncClose}
        isSync={isSync}
        syncProgress={syncProgress}
        syncResult={syncResult}
      />

      {/* Main Content */}
      <Container 
        maxW="container.2xl" 
        py={{ base: 2, md: 6 }} 
        px={{ base: 2, md: 6 }}
        pt={{ base: 12, md: 4 }}
        bg="#000000"
        minH="100vh"
      >
        <VStack spacing={{ base: 3, md: 6 }} align="stretch">
        {loading ? (
          <Center py={20}>
            <VStack spacing={6}>
              <Box position="relative">
                <Spinner 
                  size="xl" 
                  color="#3b82f6" 
                  thickness="4px"
                  speed="0.8s"
                />
                <Box
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                >
                  <Spinner size="md" color="#10b981" thickness="3px" speed="1.2s" />
                </Box>
              </Box>
              <VStack spacing={2}>
                <Text color="#f8fafc" fontSize="lg" fontWeight="600">กำลังโหลดสินค้า...</Text>
                <Text color="#94a3b8" fontSize="sm">โปรดรอสักครู่</Text>
              </VStack>
            </VStack>
          </Center>
          ) : error ? (
            <Center py={16}>
              <VStack spacing={6}>
                <Box 
                  bg="#1f2937" 
                  p={8} 
                  borderRadius="3xl" 
                  border="1px solid" 
                  borderColor="#ef4444"
                  boxShadow="0 8px 25px rgba(239, 68, 68, 0.2)"
                >
                  <VStack spacing={4}>
                    <Box fontSize="4xl">⚠️</Box>
                    <Text color="#ef4444" fontSize="xl" fontWeight="700" textAlign="center">{error}</Text>
                    <Button
                      onClick={() => fetchSavedProducts(currentPage, status, searchTerm)}
                      bg="#ef4444"
                      color="white"
                      size="lg"
                      _hover={{ 
                        bg: '#dc2626',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4)'
                      }}
                      borderRadius="xl"
                      fontWeight="600"
                      px={8}
                    >
                      🔄 ลองใหม่อีกครั้ง
                    </Button>
                  </VStack>
                </Box>
              </VStack>
            </Center>
          ) : products.length === 0 ? (
            <Center py={20}>
              <VStack spacing={8}>
                <Box 
                  bg="#18181b" 
                  p={12} 
                  borderRadius="3xl" 
                  boxShadow="0 20px 40px rgba(0,0,0,0.3)"
                  border="1px solid"
                  borderColor="#27272a"
                  maxW="md"
                  textAlign="center"
                >
                  <VStack spacing={6}>
                    <Box fontSize="6xl">
                      {searchTerm ? "🔍" : "📦"}
                    </Box>
                    <VStack spacing={2}>
                      <Text fontSize="2xl" fontWeight="700" color="#f4f4f5">
                        {searchTerm ? "ไม่พบสินค้า" : "ยังไม่มีสินค้า"}
                      </Text>
                      <Text fontSize="md" color="#a1a1aa">
                        {searchTerm 
                          ? `ไม่พบสินค้าที่ตรงกับ "${searchTerm}"` 
                          : `ยังไม่มีสินค้าที่บันทึกในสถานะ "${status}"`
                        }
                      </Text>
                    </VStack>
                    {searchTerm ? (
                      <Button
                        onClick={() => {
                          setSearchTerm('');
                          setCurrentPage(1);
                          fetchSavedProducts(1, status, '');
                        }}
                        bg="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                        color="white"
                        size="lg"
                        _hover={{ 
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(79, 172, 254, 0.4)'
                        }}
                        borderRadius="xl"
                        fontWeight="600"
                        px={8}
                      >
                        🧹 ล้างการค้นหา
                      </Button>
                    ) : (
                      <Button
                        as="a"
                        href="/backoffice"
                        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        color="white"
                        size="lg"
                        _hover={{ 
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                        }}
                        borderRadius="xl"
                        fontWeight="600"
                        px={8}
                      >
                        ➕ ไปเพิ่มสินค้า
                      </Button>
                    )}
                  </VStack>
                </Box>
              </VStack>
            </Center>
          ) : (
            <>
              {/* Products Container */}
              <Box bg="#18181b" borderRadius={{ base: "xl", md: "2xl" }} p={{ base: 2, md: 4 }} border="1px solid" borderColor="#27272a">
                <VStack spacing={{ base: 2, md: 4 }} align="stretch">
                {products.map((savedProduct) => {
                  const displayProduct = convertToDisplayProduct(savedProduct);
                  return (
                    <ImprovedProductCard
                      key={savedProduct.id}
                      product={{
                        ...displayProduct,
                        status: savedProduct.status
                      }}
                      onToggleFlashSale={handleFlashSaleToggle}
                      onToggleStatus={handleStatusToggle}
                      onRemove={() => {
                        // Handle product removal
                        if (status !== 'deleted') {
                          handleProductRemove(savedProduct.id);
                        }
                      }}
                    />
                  );
                })}
              </VStack>
            </Box>

              {/* Pagination - Mobile Friendly */}
              {totalPages > 1 && (
                <Center mt={{ base: 6, md: 8 }} py={4}>
                  <VStack spacing={4}>
                    {/* Mobile: Show simple prev/next with page info */}
                    <HStack spacing={2} display={{ base: 'flex', md: 'none' }}>
                      <Button
                        onClick={() => handlePageChange(currentPage - 1)}
                        isDisabled={currentPage === 1}
                        colorScheme="green"
                        variant="outline"
                        size="sm"
                        flex={1}
                      >
                        ก่อนหน้า
                      </Button>
                      <Text fontSize="sm" color="#a1a1aa" px={3}>
                        {currentPage} / {totalPages}
                      </Text>
                      <Button
                        onClick={() => handlePageChange(currentPage + 1)}
                        isDisabled={currentPage === totalPages}
                        colorScheme="green"
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
                        colorScheme="green"
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
                              colorScheme={currentPage === pageNum ? 'green' : 'gray'}
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
                        colorScheme="green"
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg="#18181b" border="1px solid" borderColor="#27272a">
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="#f4f4f5">
              ยืนยันการลบสินค้า
            </AlertDialogHeader>

            <AlertDialogBody color="#a1a1aa">
              คุณแน่ใจหรือว่าต้องการลบสินค้านี้? การดำเนินการนี้ไม่สามารถยกเลิกได้
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} bg="#27272a" color="#f4f4f5" _hover={{ bg: "#3f3f46" }}>
                ยกเลิก
              </Button>
              <Button 
                bg="red.500" 
                color="white" 
                _hover={{ bg: "red.600" }} 
                onClick={handleDelete} 
                ml={3}
              >
                ลบ
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </BackofficeLayout>
  );
}