import { 
  Box, 
  Text, 
  VStack, 
  Badge, 
  Link, 
  HStack, 
  Button, 
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Grid,
  GridItem,
  useToast,
  IconButton,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Switch,
  FormControl,
  FormLabel,
  Flex
} from '@chakra-ui/react';
import { ExternalLinkIcon, CopyIcon, StarIcon, AddIcon, WarningIcon, DeleteIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import Image from 'next/image';

interface BackofficeProductCardProps {
  product: {
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
  };
  onProductUpdate?: () => void; // Callback to refresh the product list
}

import { memo, useCallback, useEffect } from 'react';

const BackofficeProductCard = memo(function BackofficeProductCard({ product, onProductUpdate }: BackofficeProductCardProps) {
  const toast = useToast();

  // Safety check for product data
  if (!product) {
    return (
      <Box borderWidth="1px" borderRadius="lg" p={4} bg="gray.50">
        <Text color="gray.500">No product data available</Text>
      </Box>
    );
  }
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFlashSale, setIsFlashSale] = useState(Boolean(product.isFlashSale) || false);
  const [isUpdatingFlashSale, setIsUpdatingFlashSale] = useState(false);

  // Update Flash Sale state when product changes (for saved products page only)
  useEffect(() => {
    if (product.isFlashSale !== undefined) {
      const currentFlashSaleStatus = Boolean(product.isFlashSale);
      setIsFlashSale(currentFlashSaleStatus);
    }
  }, [product.isFlashSale, product.itemId]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    
    // ใช้ toast id เพื่อป้องกันการซ้ำ
    const toastId = `copy-${product.itemId}-${label}`;
    if (!toast.isActive(toastId)) {
      toast({
        id: toastId,
        title: 'คัดลอกแล้ว',
        description: `คัดลอก${label}เรียบร้อยแล้ว`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(parseInt(dateString) * 1000).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  const getRatingStars = (rating?: string | number | null) => {
    if (!rating) return 0;
    const num = typeof rating === 'string' ? parseFloat(rating) : rating;
    return isNaN(num) ? 0 : Math.round(num);
  };

  const checkProduct = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    
    try {
      const response = await fetch('/api/shopee/check-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product)
      });

      const result = await response.json();

      if (result.exists) {
        setComparisonData(result);
        onOpen(); // Show comparison modal
      } else {
        // Product doesn't exist, add directly
        await performAddToDatabase();
      }
    } catch (error) {
      console.error('Check product error:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถตรวจสอบสินค้าได้',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsChecking(false);
    }
  };

  const performAddToDatabase = async () => {
    if (isAdding || isAdded) return;
    
    setIsAdding(true);
    
    try {
      const response = await fetch('/api/shopee/add-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product)
      });

      const result = await response.json();

      if (result.success) {
        setIsAdded(true);
        onClose(); // Close modal if open
        
        // Show appropriate message based on operation type
        const isUpdate = result.operation === 'update';
        const isInsert = result.operation === 'insert';
        
        // ใช้ toast id เพื่อป้องกันการซ้ำ
        const toastId = `add-product-${product.itemId}`;
        if (!toast.isActive(toastId)) {
          toast({
            id: toastId,
            title: 'สำเร็จ!',
            description: isUpdate 
              ? `อัปเดตข้อมูลสินค้าแล้ว (แถวที่ได้รับผลกระทบ: ${result.affectedRows})`
              : isInsert 
                ? 'เพิ่มสินค้าใหม่ลงฐานข้อมูลแล้ว'
                : 'ไม่มีการเปลี่ยนแปลงข้อมูล',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
        
        // Debug: console.log('Database operation result:', result);
      } else {
        throw new Error(result.message || 'เกิดข้อผิดพลาดในการเพิ่มสินค้า');
      }
    } catch (error) {
      console.error('Add to database error:', error);
      
      // ใช้ toast id เพื่อป้องกันการซ้ำ
      const toastId = `add-error-${product.itemId}`;
      if (!toast.isActive(toastId)) {
        toast({
          id: toastId,
          title: 'เกิดข้อผิดพลาด',
          description: error instanceof Error ? error.message : 'ไม่สามารถเพิ่มสินค้าลงฐานข้อมูลได้',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      }
    } finally {
      setIsAdding(false);
    }
  };

  const toggleProductStatus = async () => {
    setIsToggling(true);
    try {
      const newStatus = product.status === 'active' ? 'inactive' : 'active';
      const response = await fetch('/api/shopee/saved-products', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: product.itemId,
          status: newStatus
        }),
      });

      const result = await response.json();

      if (result.success) {
        // ใช้ toast id เพื่อป้องกันการซ้ำ
        const toastId = `toggle-status-${product.itemId}`;
        if (!toast.isActive(toastId)) {
          toast({
            id: toastId,
            title: 'สำเร็จ!',
            description: `เปลี่ยนสถานะสินค้าเป็น ${newStatus === 'active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} แล้ว`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
        
        // Refresh the product list
        if (onProductUpdate) {
          onProductUpdate();
        }
      } else {
        throw new Error(result.message || 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      
      // ใช้ toast id เพื่อป้องกันการซ้ำ
      const toastId = `toggle-error-${product.itemId}`;
      if (!toast.isActive(toastId)) {
        toast({
          id: toastId,
          title: 'เกิดข้อผิดพลาด',
          description: error instanceof Error ? error.message : 'ไม่สามารถเปลี่ยนสถานะสินค้าได้',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      }
    } finally {
      setIsToggling(false);
    }
  };

  const toggleFlashSale = async (checked: boolean) => {
    if (isUpdatingFlashSale) return;
    
    // Debug: console.log(`🔄 Toggling Flash Sale for ${product.itemId} from ${isFlashSale} to ${checked}`);
    setIsUpdatingFlashSale(true);
    
    try {
      const response = await fetch(`/api/flash-sale/${product.itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isFlashSale: checked
        }),
      });

      const result = await response.json();
      // Debug: console.log(`📊 Flash Sale API response for ${product.itemId}:`, {
      //   success: result.success,
      //   error: result.error,
      //   newState: checked,
      //   response: result
      // });

      if (result.success) {
        setIsFlashSale(checked);
        // Debug: console.log(`✅ Flash Sale updated for ${product.itemId}:`, checked);
        
        toast({
          title: '✨ สำเร็จ!',
          description: `${checked ? 'เปิดใช้งาน' : 'ปิดการใช้งาน'} Flash Sale แล้ว`,
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right'
        });
        
        // Call callback to refresh parent component if needed
        if (onProductUpdate) {
          onProductUpdate();
        }
        // Debug: console.log('✅ Flash Sale updated and parent notified');
      } else {
        throw new Error(result.error || 'เกิดข้อผิดพลาดในการอัพเดท Flash Sale');
      }
    } catch (error) {
      console.error('Toggle Flash Sale error:', error);
      
      // Revert the state if failed
      setIsFlashSale(!checked);
      
      toast({
        title: '❌ เกิดข้อผิดพลาด',
        description: error instanceof Error ? error.message : 'ไม่สามารถอัพเดท Flash Sale ได้',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setIsUpdatingFlashSale(false);
    }
  };

  const deleteProduct = async () => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบสินค้านี้? การลบไม่สามารถกู้คืนได้')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/shopee/saved-products', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: product.itemId
        }),
      });

      const result = await response.json();

      if (result.success) {
        // ใช้ toast id เพื่อป้องกันการซ้ำ
        const toastId = `delete-product-${product.itemId}`;
        if (!toast.isActive(toastId)) {
          toast({
            id: toastId,
            title: 'สำเร็จ!',
            description: 'ลบสินค้าแล้ว',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
        
        // Refresh the product list
        if (onProductUpdate) {
          onProductUpdate();
        }
      } else {
        throw new Error(result.message || 'เกิดข้อผิดพลาดในการลบสินค้า');
      }
    } catch (error) {
      console.error('Delete product error:', error);
      
      // ใช้ toast id เพื่อป้องกันการซ้ำ
      const toastId = `delete-error-${product.itemId}`;
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
      setIsDeleting(false);
    }
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg="white"
      boxShadow="md"
      _hover={{ 
        boxShadow: 'xl',
        borderColor: 'purple.200'
      }}
      transition="all 0.3s ease"
      w="100%"
      maxW="100%"
    >
      {/* Product Image */}
      <Box position="relative" aspectRatio="1" overflow="hidden" bg="gray.50">
        <Image
          src={product.imageUrl && product.imageUrl.trim() !== '' ? product.imageUrl : '/placeholder-product.svg'}
          alt={product.productName || 'Product image'}
          width={400}
          height={400}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease'
          }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-product.svg';
          }}
        />
        {product.priceDiscountRate && product.priceDiscountRate > 0 && (
          <Badge
            position="absolute"
            top={2}
            right={2}
            bg="orange.500"
            color="white"
            fontSize="xs"
            borderRadius="full"
            px={2}
          >
            -{product.priceDiscountRate}%
          </Badge>
        )}
      </Box>

      {/* Product Details */}
      <VStack p={{ base: 3, md: 4 }} align="stretch" spacing={{ base: 2, md: 3 }}>
        {/* Product Name */}
        <Text 
          fontSize={{ base: 'xs', md: 'sm' }} 
          fontWeight="bold" 
          noOfLines={2}
          minH={{ base: '32px', md: '40px' }}
        >
          {product.productName}
        </Text>

        {/* Item ID and Shop Info */}
        <VStack spacing={{ base: 1, md: 2 }} align="stretch">
          <HStack justify="space-between" fontSize={{ base: '2xs', md: 'xs' }} color="gray.600">
            <Text>ID: {product.itemId}</Text>
            <Tooltip label="คัดลอก Item ID">
              <IconButton
                aria-label="Copy Item ID"
                icon={<CopyIcon />}
                size="xs"
                variant="ghost"
                onClick={() => copyToClipboard(product.itemId.toString(), 'Item ID')}
              />
            </Tooltip>
          </HStack>
          
          <Text fontSize={{ base: '2xs', md: 'xs' }} color="gray.600" noOfLines={1}>
            ร้าน: {product.shopName}
          </Text>
        </VStack>

        <Divider />

        {/* Price and Commission Info */}
        <Grid templateColumns="1fr 1fr" gap={{ base: 2, md: 3 }} fontSize={{ base: 'xs', md: 'sm' }}>
          <GridItem>
            <Stat size="sm">
              <StatLabel fontSize="xs">ราคา</StatLabel>
              <StatNumber fontSize="md" color="blue.600">
                {formatPrice(product.price)}
              </StatNumber>
              {product.priceMin !== product.priceMax && (
                <StatHelpText fontSize="xs" mb={0}>
                  {product.priceMin && formatPrice(product.priceMin)} - {product.priceMax && formatPrice(product.priceMax)}
                </StatHelpText>
              )}
            </Stat>
          </GridItem>
          
          <GridItem>
            <Stat size="sm">
              <StatLabel fontSize="xs">คอมมิชชั่นรวม</StatLabel>
              <StatNumber fontSize="md" color="green.600">
                {((parseFloat(product.commissionRate?.toString() || '0') || 0) * 100).toFixed(2)}%
              </StatNumber>
              <StatHelpText fontSize="xs" mb={0}>
                ≈ {formatPrice(product.commission)}
              </StatHelpText>
            </Stat>
          </GridItem>
        </Grid>

        {/* Commission Breakdown */}
        <Grid templateColumns="1fr 1fr" gap={3} fontSize="sm">
          <GridItem>
            <Stat size="sm">
              <StatLabel fontSize="xs" color="orange.600">EXTRACOMM</StatLabel>
              <StatNumber fontSize="md" color="orange.600">
                {((parseFloat(product.sellerCommissionRate?.toString() || '0') || 0) * 100).toFixed(2)}%
              </StatNumber>
            </Stat>
          </GridItem>
          
          <GridItem>
            <Stat size="sm">
              <StatLabel fontSize="xs" color="purple.600">ค่าคอมช้อปปี้</StatLabel>
              <StatNumber fontSize="md" color="purple.600">
                {((parseFloat(product.shopeeCommissionRate?.toString() || '0') || 0) * 100).toFixed(2)}%
              </StatNumber>
            </Stat>
          </GridItem>
        </Grid>

        {/* Rating and Sales */}
        <HStack justify="space-between" fontSize="sm">
          <HStack spacing={1}>
            <StarIcon color="yellow.400" boxSize={3} />
            <Text>{product.ratingStar || 'N/A'}</Text>
          </HStack>
          {product.sales && (
            <Text color="gray.600" fontSize="xs">
              ขายแล้ว {product.sales.toLocaleString()}
            </Text>
          )}
        </HStack>

        {/* Campaign Period */}
        {product.periodStartTime && product.periodEndTime && (
          <Box fontSize="xs" color="orange.600" bg="orange.50" p={2} borderRadius="md">
            <Text fontWeight="bold">ระยะเวลาแคมเปญ:</Text>
            <Text>{formatDate(product.periodStartTime)} - {formatDate(product.periodEndTime)}</Text>
          </Box>
        )}

        <Divider />

        {/* Action Buttons */}
        <VStack spacing={2}>
          <HStack spacing={2} width="100%">
            <Button
              as={Link}
              href={product.offerLink}
              isExternal
              size="sm"
              colorScheme="purple"
              flex={1}
              leftIcon={<ExternalLinkIcon />}
            >
              Affiliate Link
            </Button>
            <Button
              as={Link}
              href={product.productLink}
              isExternal
              size="sm"
              variant="outline"
              colorScheme="blue"
              flex={1}
              leftIcon={<ExternalLinkIcon />}
            >
              ดูสินค้า
            </Button>
          </HStack>
          
          <HStack spacing={2} width="100%">
            <Button
              size="xs"
              variant="outline"
              colorScheme="gray"
              flex={1}
              onClick={() => copyToClipboard(product.offerLink, 'Affiliate Link')}
            >
              คัดลอก Affiliate Link
            </Button>
          </HStack>

          {/* Status and Management Buttons - Show different buttons based on context */}
          {product.status ? (
            // Show management buttons for saved products
            <VStack spacing={2} width="100%">
              <HStack spacing={2} width="100%">
                {/* Status Toggle Button */}
                <Button
                  size="sm"
                  colorScheme={product.status === 'active' ? 'green' : 'gray'}
                  variant={product.status === 'active' ? 'solid' : 'outline'}
                  flex={1}
                  onClick={toggleProductStatus}
                  isLoading={isToggling}
                  loadingText="กำลังเปลี่ยน..."
                >
                  {product.status === 'active' ? '✓ เปิดใช้งาน' : '✕ ปิดใช้งาน'}
                </Button>

                {/* Delete Button */}
                <IconButton
                  aria-label="ลบสินค้า"
                  icon={<DeleteIcon />}
                  size="sm"
                  bg="red.50"
                  color="red.600"
                  _hover={{ bg: "red.100", color: "red.700" }}
                  variant="ghost"
                  onClick={deleteProduct}
                  isLoading={isDeleting}
                />
              </HStack>
              
              <Badge 
                colorScheme={product.status === 'active' ? 'green' : 'gray'} 
                size="sm"
                textTransform="none"
              >
                สถานะ: {product.status === 'active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
              </Badge>

              {/* Flash Sale Toggle - only show in saved products page */}
              {product.isFlashSale !== undefined && (
                <Box bg="gray.50" p={3} borderRadius="md" border="1px solid" borderColor="gray.200">
                  <FormControl display="flex" alignItems="center" justifyContent="space-between">
                    <FormLabel 
                      htmlFor={`flash-sale-${product.itemId}`} 
                      mb="0" 
                      fontSize="sm" 
                      fontWeight="medium"
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      <Text>⚡</Text>
                      <Text>Flash Sale</Text>
                    </FormLabel>
                    <Switch
                      id={`flash-sale-${product.itemId}`}
                      colorScheme="red"
                      size="sm"
                      isChecked={isFlashSale}
                      onChange={(e) => toggleFlashSale(e.target.checked)}
                      isDisabled={isUpdatingFlashSale || product.status !== 'active'}
                    />
                  </FormControl>
                  
                  {isFlashSale && (
                    <Badge 
                      colorScheme="red" 
                      variant="solid" 
                      fontSize="2xs" 
                      mt={1}
                      px={2}
                      py={0.5}
                      borderRadius="full"
                    >
                      🔥 Flash Sale Active
                    </Badge>
                  )}
                  
                  {product.status !== 'active' && (
                    <Text fontSize="2xs" color="gray.500" mt={1}>
                      เปิดใช้งานสินค้าก่อนเพื่อตั้ง Flash Sale
                    </Text>
                  )}
                </Box>
              )}
            </VStack>
          ) : (
            // Show add button for new products
            <Button
              leftIcon={<AddIcon />}
              colorScheme={isAdded ? "green" : "orange"}
              size="sm"
              width="100%"
              onClick={checkProduct}
              isLoading={isChecking || isAdding}
              loadingText={isChecking ? "กำลังตรวจสอบ..." : "กำลังบันทึก..."}
              isDisabled={isAdded}
            >
              {isAdded ? "บันทึกแล้ว ✓" : "เพิ่มลงฐานข้อมูล"}
            </Button>
          )}
        </VStack>

        {/* Comparison Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack>
                <WarningIcon color="orange.500" />
                <Text>สินค้านี้มีอยู่ในฐานข้อมูลแล้ว</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4} align="stretch">
                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Item ID: {product.itemId}</AlertTitle>
                    <AlertDescription>
                      สินค้านี้มีอยู่ในระบบแล้ว กรุณาตรวจสอบข้อมูลที่แตกต่างด้านล่าง
                    </AlertDescription>
                  </Box>
                </Alert>

                {comparisonData && (
                  <>
                    {comparisonData.hasChanges ? (
                      <>
                        <Alert status="warning">
                          <AlertIcon />
                          <AlertDescription>
                            พบการเปลี่ยนแปลงข้อมูล {comparisonData.differences.length} รายการ
                          </AlertDescription>
                        </Alert>

                        <Box>
                          <Text fontWeight="bold" mb={3}>รายการข้อมูลที่เปลี่ยนแปลง:</Text>
                          <TableContainer>
                            <Table size="sm" variant="striped">
                              <Thead>
                                <Tr>
                                  <Th>รายการ</Th>
                                  <Th>ข้อมูลเดิม</Th>
                                  <Th>ข้อมูลใหม่</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {comparisonData.differences.map((diff: any, index: number) => (
                                  <Tr key={index}>
                                    <Td fontWeight="medium">{diff.field}</Td>
                                    <Td color="red.600">{diff.oldValue || '-'}</Td>
                                    <Td color="green.600" fontWeight="bold">{diff.newValue || '-'}</Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          </TableContainer>
                        </Box>

                        <Alert status="info">
                          <AlertIcon />
                          <AlertDescription>
                            ต้องการอัปเดตข้อมูลสินค้าด้วยข้อมูลใหม่หรือไม่?
                          </AlertDescription>
                        </Alert>
                      </>
                    ) : (
                      <Alert status="success">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>ข้อมูลเหมือนกัน</AlertTitle>
                          <AlertDescription>
                            ข้อมูลสินค้าที่จะเพิ่มเหมือนกับข้อมูลที่มีอยู่ในระบบ ไม่จำเป็นต้องอัปเดต
                          </AlertDescription>
                        </Box>
                      </Alert>
                    )}

                    <Box bg="gray.50" p={3} borderRadius="md">
                      <Text fontSize="sm" color="gray.600">
                        <strong>วันที่เพิ่มครั้งล่าสุด:</strong> {' '}
                        {comparisonData.existingProduct?.created_at 
                          ? new Date(comparisonData.existingProduct.created_at).toLocaleString('th-TH')
                          : '-'
                        }
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        <strong>วันที่อัปเดตล่าสุด:</strong> {' '}
                        {comparisonData.existingProduct?.updated_at 
                          ? new Date(comparisonData.existingProduct.updated_at).toLocaleString('th-TH')
                          : '-'
                        }
                      </Text>
                    </Box>
                  </>
                )}
              </VStack>
            </ModalBody>

            <ModalFooter>
              <HStack spacing={3}>
                <Button variant="ghost" onClick={onClose}>
                  ยกเลิก
                </Button>
                {comparisonData?.hasChanges ? (
                  <Button
                    colorScheme="orange"
                    onClick={performAddToDatabase}
                    isLoading={isAdding}
                    loadingText="กำลังอัปเดต..."
                  >
                    อัปเดตข้อมูล
                  </Button>
                ) : (
                  <Button
                    colorScheme="blue"
                    onClick={onClose}
                  >
                    ปิด
                  </Button>
                )}
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>

      </VStack>
    </Box>
  );
});

export default BackofficeProductCard;