import { 
  Box, 
  Text, 
  VStack, 
  HStack,
  Badge, 
  Button, 
  Switch,
  IconButton,
  Tooltip,
  useToast,
  Flex,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Tag,
  TagLabel,
  TagRightIcon,
  useColorModeValue,
  Collapse,
  useDisclosure,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText
} from '@chakra-ui/react';
import { 
  ExternalLinkIcon, 
  CopyIcon, 
  StarIcon, 
  ChevronDownIcon,
  ChevronUpIcon,
  SettingsIcon,
  ViewIcon,
  EditIcon,
  DeleteIcon
} from '@chakra-ui/icons';
import { useState } from 'react';
import Image from 'next/image';

interface ImprovedProductCardProps {
  product: {
    productName: string;
    itemId: string | number;
    imageUrl?: string;
    price?: number;
    sellerCommissionRate?: string | number;
    shopeeCommissionRate?: string | number;
    sales?: number;
    ratingStar?: string | number;
    shopName?: string;
    status?: string;
    isFlashSale?: boolean;
    productLink?: string;
    offerLink?: string;
  };
  onToggleFlashSale?: (itemId: string | number, isFlashSale: boolean) => void;
  onToggleStatus?: (itemId: string | number, status: string) => void;
  onRemove?: () => void;
}

export default function ImprovedProductCard({ 
  product, 
  onToggleFlashSale,
  onToggleStatus,
  onRemove 
}: ImprovedProductCardProps) {
  const toast = useToast();
  const { isOpen: isExpanded, onToggle } = useDisclosure();
  const [isFlashSale, setIsFlashSale] = useState(Boolean(product.isFlashSale));

  // Lumina Design System Colors
  const cardBg = '#18181b';
  const borderColor = '#27272a';
  const textColor = '#f4f4f5';
  const mutedColor = '#a1a1aa';
  const accentColor = '#6366f1';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'คัดลอกแล้ว!',
      description: `${label} ถูกคัดลอกแล้ว`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'ไม่ระบุ';
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(price);
  };

  const formatCommission = (rate?: string | number) => {
    if (!rate) return '0%';
    const num = typeof rate === 'string' ? parseFloat(rate) : rate;
    return `${(num * 100).toFixed(2)}%`;
  };

  const getRatingStars = (rating?: string | number) => {
    if (!rating) return 0;
    const num = typeof rating === 'string' ? parseFloat(rating) : rating;
    return Math.round(num);
  };

  const handleFlashSaleToggle = (checked: boolean) => {
    setIsFlashSale(checked);
    onToggleFlashSale?.(product.itemId, checked);
  };

  return (
    <Box
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      overflow="hidden"
      shadow="sm"
      _hover={{ shadow: 'md' }}
      transition="all 0.2s"
    >
      {/* Header Section - Always Visible */}
      <Flex p={{ base: 2, md: 4 }} align="center" gap={{ base: 2, md: 3 }}>
        {/* Product Image */}
        <Box position="relative" flexShrink={0}>
          <Image
            src={product.imageUrl || '/placeholder-product.svg'}
            alt={product.productName}
            width={60}
            height={60}
            style={{ 
              borderRadius: '8px',
              objectFit: 'cover' 
            }}
          />
          {/* Flash Sale Badge */}
          {isFlashSale && (
            <Tag
              size="sm"
              position="absolute"
              top="-1"
              right="-1"
              bg="red.500"
              color="white"
              borderRadius="full"
            >
              ⚡ Flash
            </Tag>
          )}
        </Box>

        {/* Product Info */}
        <VStack flex="1" align="start" spacing={{ base: 1, md: 2 }}>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            fontWeight="600"
            color={textColor}
            noOfLines={{ base: 1, md: 2 }}
            lineHeight="1.2"
          >
            {product.productName}
          </Text>
          
          {/* Mobile: Show only price and rating */}
          <HStack spacing={2} fontSize={{ base: "xs", md: "sm" }} color={mutedColor} display={{ base: 'flex', md: 'none' }}>
            <Text fontWeight="600" color={accentColor}>
              {formatPrice(product.price)}
            </Text>
            {product.ratingStar && (
              <HStack spacing={1}>
                <StarIcon color="yellow.400" w={2} h={2} />
                <Text>{product.ratingStar}</Text>
              </HStack>
            )}
          </HStack>
          
          {/* Desktop: Show all info */}
          <VStack spacing={1} align="start" display={{ base: 'none', md: 'flex' }}>
            <HStack spacing={3} fontSize="sm" color={mutedColor}>
              <Text>ID: {product.itemId}</Text>
              {product.sales && (
                <Text>ขาย: {product.sales.toLocaleString()}</Text>
              )}
              {product.ratingStar && (
                <HStack spacing={1}>
                  <StarIcon color="yellow.400" w={3} h={3} />
                  <Text>{product.ratingStar}</Text>
                </HStack>
              )}
            </HStack>

            {/* Price & Commission Info */}
            <HStack spacing={3} fontSize="sm" flexWrap="wrap">
              <Text fontWeight="600" color={accentColor}>
                {formatPrice(product.price)}
              </Text>
              <Badge colorScheme="green" variant="subtle" size="sm">
                ค่าคอม: {formatCommission(product.sellerCommissionRate)}
              </Badge>
              <Badge colorScheme="blue" variant="subtle" size="sm">
                Shopee: {formatCommission(product.shopeeCommissionRate)}
              </Badge>
            </HStack>

            {/* Shop Name */}
            <Text fontSize="sm" color={mutedColor} noOfLines={1}>
              ร้านค้า: {product.shopName || 'ไม่ระบุ'}
            </Text>
          </VStack>
        </VStack>

        {/* Status & Quick Info */}
        <VStack spacing={1} flexShrink={0} align="center">
          {/* Mobile: Show compact status */}
          <VStack spacing={1} display={{ base: 'flex', md: 'none' }}>
            {isFlashSale && (
              <Tag size="xs" colorScheme="red" variant="solid">
                Flash
              </Tag>
            )}
            <IconButton
              aria-label="จัดการ"
              icon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
              size="xs"
              variant="ghost"
              onClick={onToggle}
            />
          </VStack>
          
          {/* Desktop: Show full status */}
          <VStack spacing={2} display={{ base: 'none', md: 'flex' }}>
            <Tag
              size="sm"
              colorScheme={isFlashSale ? "red" : "gray"}
              variant={isFlashSale ? "solid" : "outline"}
            >
              {isFlashSale ? "⚡ Flash Sale" : "ปกติ"}
            </Tag>

            <Tag
              size="sm"
              colorScheme={product.status === 'active' ? "green" : "gray"}
              variant="outline"
            >
              {product.status === 'active' ? '🟢 เปิด' : '🔴 ปิด'}
            </Tag>

            <IconButton
              aria-label="จัดการ"
              icon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
              size="sm"
              variant="ghost"
              onClick={onToggle}
            />
          </VStack>
        </VStack>
      </Flex>

      {/* Expanded Management Section */}
      <Collapse in={isExpanded}>
        <Box px={{ base: 2, md: 4 }} pb={{ base: 2, md: 4 }}>
          <Divider mb={{ base: 2, md: 4 }} />
          
          {/* Management Controls Grid */}
          <VStack spacing={4} align="stretch">
            
            {/* Flash Sale & Status Toggle */}
            <HStack spacing={4} justify="space-between" p={3} bg="#27272a" borderRadius="md" border="1px solid" borderColor="#3f3f46">
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" fontWeight="600" color={textColor}>Flash Sale</Text>
                <Text fontSize="xs" color={mutedColor}>เปิด/ปิด Flash Sale</Text>
              </VStack>
              <Switch
                size="lg"
                colorScheme="red"
                isChecked={isFlashSale}
                onChange={(e) => handleFlashSaleToggle(e.target.checked)}
              />
            </HStack>

            {/* Product Status Toggle */}
            <HStack spacing={4} justify="space-between" p={3} bg="#27272a" borderRadius="md" border="1px solid" borderColor="#3f3f46">
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" fontWeight="600" color={textColor}>สถานะสินค้า</Text>
                <Text fontSize="xs" color={mutedColor}>เปิด/ปิดการแสดงสินค้า</Text>
              </VStack>
              <Switch
                size="lg"
                colorScheme="green"
                isChecked={product.status === 'active'}
                onChange={(e) => onToggleStatus?.(product.itemId, e.target.checked ? 'active' : 'inactive')}
              />
            </HStack>

            {/* Quick Action Buttons */}
            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={2}>
              {/* Copy ID Button */}
              <Button
                size="sm"
                variant="outline"
                leftIcon={<CopyIcon />}
                onClick={() => copyToClipboard(product.itemId.toString(), 'Product ID')}
              >
                Copy ID
              </Button>

              {/* View Product */}
              {product.productLink && (
                <Button
                  as="a"
                  href={product.productLink}
                  target="_blank"
                  size="sm"
                  variant="outline"
                  leftIcon={<ViewIcon />}
                  colorScheme="blue"
                >
                  ดูสินค้า
                </Button>
              )}

              {/* Affiliate Link */}
              {product.offerLink && (
                <Button
                  as="a"
                  href={product.offerLink}
                  target="_blank"
                  size="sm"
                  variant="outline"
                  leftIcon={<ExternalLinkIcon />}
                  colorScheme="green"
                >
                  Affiliate Link
                </Button>
              )}
            </Grid>

            {/* Management Actions */}
            <HStack spacing={2} justify="center">
              <Button
                size="sm"
                colorScheme="red"
                variant="outline"
                leftIcon={<DeleteIcon />}
                onClick={onRemove}
              >
                ลบออกจากระบบ
              </Button>
            </HStack>

          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
}