'use client';

import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  useToast,
  Badge,
  Link as ChakraLink,
  Icon,
  useColorModeValue,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Container,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Collapse,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import {
  HamburgerIcon,
  AddIcon,
  SettingsIcon,
  ChevronRightIcon,
  ViewIcon,
  ChevronDownIcon,
  SearchIcon,
  RepeatIcon,
  TimeIcon,
  CloseIcon,
} from '@chakra-ui/icons';
import { 
  FiShoppingCart, 
  FiPackage, 
  FiUsers, 
  FiBarChart, 
  FiSettings,
  FiLogOut,
  FiUser
} from 'react-icons/fi';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { requireAuth, logout } from '@/lib/auth';

interface BackofficeLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  headerTitle?: string;
  headerDescription?: string;
  onSearch?: (searchTerm: string) => void;
  onFilterChange?: (filter: string) => void;
  onClearFilter?: () => void;
  onSync?: () => void;
  onRefresh?: () => void;
  searchValue?: string;
  filterValue?: string;
  isLoading?: boolean;
  totalItems?: number;
  lastSyncTime?: string;
  showResults?: boolean;
  currentResults?: number;
  currentPage?: number;
  totalPages?: number;
}

interface MenuItem {
  href: string;
  label: string;
  icon: React.ReactElement;
  description?: string;
  badge?: string;
}

const menuItems: MenuItem[] = [
  {
    href: '/backoffice',
    label: 'เพิ่มสินค้า',
    icon: <Icon as={FiShoppingCart} />,
    description: 'จัดการสินค้า Shopee',
  },
  {
    href: '/backoffice/saved',
    label: 'จัดการสินค้า',
    icon: <Icon as={FiPackage} />,
    description: 'สินค้าที่บันทึกแล้ว',
  },
  {
    href: '/backoffice/admin',
    label: 'จัดการแอดมิน',
    icon: <Icon as={FiUsers} />,
    description: 'จัดการผู้ใช้แอดมิน',
  },
  {
    href: '/backoffice/analytics',
    label: 'รายงาน',
    icon: <Icon as={FiBarChart} />,
    description: 'สถิติและรายงาน',
    badge: 'เร็วๆ นี้'
  },
];

export default function BackofficeLayout({ 
  children,
  showHeader = false,
  headerTitle = 'จัดการสินค้า',
  headerDescription = 'ค้นหาสินค้าใน Shopee และเพิ่มเข้าสู่ระบบ',
  onSearch,
  onFilterChange,
  onClearFilter,
  onSync,
  onRefresh,
  searchValue = '',
  filterValue = 'all',
  isLoading: parentLoading = false,
  totalItems = 0,
  lastSyncTime,
  showResults = false,
  currentResults = 0,
  currentPage = 1,
  totalPages = 1
}: BackofficeLayoutProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchValue);
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();

  // Handle search
  const handleSearchSubmit = () => {
    if (onSearch) {
      onSearch(searchInput.trim());
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  // Sync search input with prop
  useEffect(() => {
    setSearchInput(searchValue);
  }, [searchValue]);

  // Lumina Design System - Dark Theme
  const bgGradient = '#000000'; // Pure black background
  const sidebarBg = '#000000'; // Pure black sidebar
  const sidebarGradient = 'linear(180deg, #000000 0%, #18181b 100%)';
  const primaryColor = '#ffffff'; // White for primary actions
  const secondaryColor = '#a1a1aa'; // Zinc 400
  const accentColor = '#6366f1'; // Indigo for accents
  const textColor = '#ffffff';
  const mutedColor = '#71717a'; // Zinc 500
  const borderColor = '#27272a'; // Zinc 800
  const headerBg = '#18181b'; // Zinc 900
  const cardBg = '#18181b'; // Zinc 900
  const surfaceColor = '#18181b'; // Zinc 900
  const glassEffect = {
    background: 'rgba(24, 24, 27, 0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid #27272a',
  };

  // Floating animations for modern effect
  const floatAnimation = keyframes`
    0%, 100% { transform: translateY(0) rotate(0deg); }
    33% { transform: translateY(-10px) rotate(1deg); }
    66% { transform: translateY(5px) rotate(-1deg); }
  `;

  const glowPulse = keyframes`
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.1); }
  `;

  const particleFloat = keyframes`
    0% { transform: translateY(0) translateX(0); opacity: 0.3; }
    50% { transform: translateY(-20px) translateX(10px); opacity: 0.7; }
    100% { transform: translateY(-40px) translateX(-5px); opacity: 0; }
  `;

  useEffect(() => {
    const authUser = requireAuth();
    
    if (!authUser) {
      router.push('/backoffice/login');
      return;
    }
    
    setUser(authUser);
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    logout();
    toast({
      title: '✅ ออกจากระบบแล้ว',
      description: 'ขอบคุณที่ใช้งาน เจอกันใหม่นะ!',
      status: 'success',
      duration: 3000,
      position: 'top-right',
      isClosable: true,
    });
  };

  // Floating particles animation
  const float = keyframes`
    0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
    50% { transform: translateY(-10px) rotate(180deg); opacity: 1; }
  `;

  if (isLoading) {
    return (
      <Box 
        minH="100vh" 
        bgGradient={bgGradient}
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        position="relative"
        overflow="hidden"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.3) 0%, transparent 50%)',
          zIndex: 1
        }}
      >
        <VStack spacing={6} zIndex={2}>
          <Box position="relative">
            <Box 
              w={20} 
              h={20} 
              border="3px solid" 
              borderColor="transparent"
              borderTopColor={primaryColor}
              borderRightColor={secondaryColor}
              borderRadius="full"
              className="animate-spin"
            />
            <Box
              position="absolute"
              top={2}
              left={2}
              w={16}
              h={16}
              border="2px solid"
              borderColor="transparent"
              borderTopColor={accentColor}
              borderRadius="full"
              className="animate-spin"
              style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
            />
          </Box>
          <VStack spacing={2}>
            <Text color="white" fontWeight="700" fontSize="xl">กำลังโหลด...</Text>
            <Text color={mutedColor} fontSize="sm">โปรดรอสักครู่</Text>
          </VStack>
        </VStack>
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  const SidebarContent = () => (
    <VStack spacing={0} align="stretch" h="100%" position="relative">


      {/* Glass Header */}
      <Box 
        p={6} 
        {...glassEffect}
        borderBottom="1px" 
        borderColor={borderColor}
        position="relative"
        zIndex={1}
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgGradient: sidebarGradient,
          zIndex: -1
        }}
      >
        <HStack spacing={4} mb={10}>
          <Box 
            w={12} 
            h={12} 
            bg={primaryColor}
            borderRadius="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            fontWeight="bold"
            fontSize="xl"
            boxShadow={`0 8px 25px ${primaryColor}40`}
            position="relative"
            _before={{
              content: '""',
              position: 'absolute',
              inset: '-2px',
              bg: `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})`,
              borderRadius: 'xl',
              zIndex: -1,
              opacity: 0.7,
            }}
          >
            <Text>S</Text>
          </Box>
          <VStack align="start" spacing={0.5}>
            <Heading size="lg" color={textColor} fontWeight="700" letterSpacing="tight">
              Shonra
            </Heading>
            <Text fontSize="xs" color={mutedColor} textTransform="uppercase" letterSpacing="wider" fontWeight="500">
              Admin Dashboard
            </Text>
          </VStack>
        </HStack>
      </Box>

      {/* User Info */}
      {/* <Box p={4} mx={4} mb={4} bg={cardBg} borderRadius="lg" border="1px" borderColor={borderColor} shadow="sm">
        <HStack spacing={3}>
          <Avatar 
            size="md" 
            name={user.username} 
            bg={`linear-gradient(135deg, ${primaryColor} 0%, #9c88ff 100%)`}
            color="white"
            fontWeight="600"
          />
          <Box flex={1}>
            <Text fontWeight="600" color={textColor} fontSize="sm" mb={1}>
              {user.username}
            </Text>
            <HStack spacing={2}>
              <Box w={2} h={2} bg={accentColor} borderRadius="full" />
              <Text fontSize="xs" color={accentColor} fontWeight="500">
                {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </Text>
            </HStack>
          </Box>
        </HStack>
      </Box> */}

      {/* Navigation Menu */}
      <Box px={4} flex={1}>
        <Text 
          fontSize="xs" 
          fontWeight="500" 
          color={mutedColor} 
          textTransform="uppercase" 
          letterSpacing="wider"
          mb={3}
          px={4}
          opacity={0.6}
        >
          Navigation
        </Text>
        
        <VStack spacing={2} align="stretch">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link key={item.href} href={item.href} onClick={onClose}>
                <Box
                  px={6}
                  py={4}
                  mx={3}
                  borderRadius="xl"
                  bg={isActive ? cardBg : 'transparent'}
                  border="1px solid"
                  borderColor={isActive ? borderColor : 'transparent'}
                  position="relative"
                  _hover={{
                    bg: isActive ? cardBg : 'rgba(39, 39, 42, 0.6)',
                    borderColor: isActive ? primaryColor + '60' : borderColor,
                    transform: 'translateX(4px)',
                    boxShadow: isActive ? `0 4px 20px ${primaryColor}20` : '0 2px 10px rgba(0, 0, 0, 0.2)',
                  }}
                  _before={isActive ? {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    w: '3px',
                    h: '60%',
                    bg: primaryColor,
                    borderRadius: 'full',
                  } : {}}
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  cursor="pointer"
                >
                  <HStack spacing={4}>
                    <Box 
                      color={isActive ? primaryColor : mutedColor}
                      fontSize="lg"
                      transition="all 0.2s ease"
                    >
                      {item.icon}
                    </Box>
                    <Box flex={1}>
                      <HStack justify="space-between">
                        <Text 
                          fontWeight={isActive ? "500" : "400"} 
                          fontSize="sm"
                          color={isActive ? textColor : mutedColor}
                          transition="color 0.2s ease"
                        >
                          {item.label}
                        </Text>
                        {item.badge && (
                          <Badge 
                            size="xs" 
                            bg={secondaryColor}
                            color="white"
                            borderRadius="full"
                            px={2}
                            py={0.5}
                            fontSize="10px"
                            fontWeight="500"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </HStack>
                    </Box>
                  </HStack>
                </Box>
              </Link>
            );
          })}
        </VStack>
      </Box>

      {/* Footer */}
      <Box p={4} mt="auto">
        <Button
          leftIcon={<Icon as={FiLogOut} />}
          w="100%"
          bg="linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)"
          border="1px solid rgba(239, 68, 68, 0.2)"
          onClick={handleLogout}
          color="red.300"
          _hover={{ 
            bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)',
            color: 'red.200',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.2)'
          }}
          borderRadius="xl"
          py={3.5}
          backdropFilter="blur(10px)"
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          fontWeight="500"
          justifyContent="flex-start"
          px={4}
        >
          Logout
        </Button>
        <Text fontSize="xs" color={mutedColor} textAlign="center" mt={4} opacity={0.6} fontWeight="500">
          © 2025 Shonra Pikaso • v2.0.0
        </Text>
      </Box>
    </VStack>
  );

  return (
    <Box>
      {/* Desktop Sidebar */}
      <Box
        display={{ base: 'none', lg: 'block' }}
        w="280px"
        bg={sidebarBg}
        minH="100vh"
        position="fixed"
        left={0}
        top={0}
        zIndex={10}
        overflowY="auto"
      >
        <SidebarContent />
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        size="sm"
      >
        <DrawerOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <DrawerContent bg={sidebarBg} border="1px solid" borderColor={borderColor} zIndex={1001}>
          <DrawerCloseButton color="white" _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }} zIndex={1002} />
          <SidebarContent />
        </DrawerContent>
      </Drawer>


        {/* Mobile Header - Fixed Top on Mobile Only */}
        <Box
          display={{ base: 'block', lg: 'none' }}
          position="fixed"
          top={0}
          left={0}
          right={0}
          bg={"#000000"}
          borderBottom="1px"
          borderColor={"#27272a"}
          px={3}
          py={2}
          zIndex={1000}
          shadow="md"
          backdropFilter="blur(12px)"
          h={"50px"}
        >
          <HStack justify="space-between" align="center">
            {/* Mobile Menu Button */}
            <IconButton
              aria-label="เปิดเมนู"
              icon={<HamburgerIcon />}
              onClick={onOpen}
              variant="ghost"
              size="sm"
              color="white"
              _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
              borderRadius="lg"
            />
            
            {/* Mobile Brand Logo */}
            <HStack spacing={2}>
              <Box 
                w={6} 
                h={6} 
                bg={primaryColor} 
                borderRadius="md"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontWeight="bold"
                fontSize="xs"
              >
                S
              </Box>
              <Text fontWeight="600" color="white" fontSize="md">
                Shonra
              </Text>
            </HStack>
            
            {/* Mobile User Menu */}
            <Menu>
              <MenuButton as={Button} variant="ghost" p={1} borderRadius="lg">
                <Avatar 
                  size="sm" 
                  name={user.username} 
                  bg={`linear-gradient(135deg, ${primaryColor} 0%, #9c88ff 100%)`}
                  color="white"
                />
              </MenuButton>
              <MenuList bg={cardBg} borderRadius="xl" shadow="xl" border="1px" borderColor={borderColor}>
                <Box p={3} borderBottom="1px" borderColor={borderColor}>
                  <Text fontWeight="600" color={textColor}>{user.username}</Text>
                  <Text fontSize="sm" color={mutedColor}>{user.role}</Text>
                </Box>
                <MenuItem 
                  icon={<Icon as={FiUser} />}
                  color={textColor}
                  _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                  borderRadius="md"
                  mx={2}
                  my={1}
                >
                  Profile
                </MenuItem>
                <MenuItem 
                  icon={<Icon as={FiSettings} />}
                  color={textColor}
                  _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                  borderRadius="md"
                  mx={2}
                  my={1}
                >
                  Settings
                </MenuItem>
                <MenuDivider borderColor={borderColor} />
                <MenuItem 
                  icon={<Icon as={FiLogOut} />}
                  onClick={handleLogout}
                  color="red.400"
                  _hover={{ bg: 'rgba(239, 68, 68, 0.1)' }}
                  borderRadius="md"
                  mx={2}
                  my={1}
                >
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Box>

        {/* Main Content */}
        <Box 
          ml={{ base: 0, lg: '280px' }}
          mt={{ base: 0, lg: 0 }}
          bg="#000000" 
          minH="100vh"
          flex={1}
        >
          {/* Header with Search - Show only when enabled */}
          {showHeader && (
          <Box
            position="sticky"
            top={{ base: '50px', lg: 0 }}
            zIndex={99}
            bg="#18181b"
            color="white"
            py={{ base: 3, lg: 4 }}
            px={{ base: 3, lg: 6 }}
            borderBottom="1px solid"
            borderColor="#27272a"
          >
            <VStack spacing={{ base: 2, lg: 3 }} align="stretch">
              {/* Compact Header Row with Toggle */}
              <Flex align="center" justify="space-between">
                <HStack spacing={3}>
                  <Heading size={{ base: 'sm', lg: 'md' }} fontWeight="600">
                    {headerTitle}
                  </Heading>
                  {showResults && currentResults > 0 && (
                    <Badge 
                      bg="#3b82f6"
                      color="white"
                      fontSize={{ base: '2xs', lg: 'xs' }}
                      px={{ base: 2, lg: 3 }}
                      py={1}
                      borderRadius="md"
                      fontWeight="600"
                    >
                      {currentResults}/{totalItems}
                    </Badge>
                  )}
                </HStack>
                
                <HStack spacing={2}>
                  {totalPages > 1 && showResults && (
                    <Text fontSize={{ base: '2xs', lg: 'xs' }} opacity={0.6}>
                      หน้า {currentPage}/{totalPages}
                    </Text>
                  )}
                  
                  {/* Clear Filter Button - Always Visible Outside Collapse */}
                  {(filterValue !== 'all' || searchValue) && onClearFilter && (
                    <Button
                      size="xs"
                      bg="#27272a"
                      border="1px solid"
                      borderColor="#ef4444"
                      color="#ef4444"
                      fontSize={{ base: '2xs', lg: 'xs' }}
                      px={2}
                      py={1}
                      h="24px"
                      minW="auto"
                      onClick={onClearFilter}
                      _hover={{ bg: 'rgba(239, 68, 68, 0.1)', transform: 'translateY(-1px)' }}
                      transition="all 0.2s"
                      borderRadius="md"
                      fontWeight="500"
                    >
                      <CloseIcon boxSize={2} mr={1} />
                      ล้าง
                    </Button>
                  )}
                  
                  <IconButton
                    aria-label={isControlsExpanded ? "ปิดการจัดการ" : "เปิดการจัดการ"}
                    icon={<ChevronDownIcon transform={isControlsExpanded ? 'rotate(180deg)' : 'rotate(0deg)'} />}
                    size={{ base: 'sm', lg: 'md' }}
                    variant="ghost"
                    color="white"
                    onClick={() => setIsControlsExpanded(!isControlsExpanded)}
                    transition="all 0.2s"
                    _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                  />
                </HStack>
              </Flex>

              {/* Collapsible Controls */}
              <Collapse in={isControlsExpanded} animateOpacity>
              <VStack spacing={3} align="stretch" pt={2}>
                {/* Search Row */}
                <Flex gap={2}>
                  <InputGroup size={{ base: 'sm', lg: 'md' }} flex={1}>
                    <InputLeftElement children={<SearchIcon color="#94a3b8" boxSize={{ base: 3, lg: 4 }} />} />
                    <Input
                      placeholder="ค้นหาสินค้า, ร้านค้า..."
                      bg="#27272a"
                      border="1px solid"
                      borderColor="#3f3f46"
                      color="#ffffff"
                      fontSize={{ base: 'sm', lg: 'md' }}
                      _placeholder={{ color: '#71717a' }}
                      _hover={{ borderColor: '#52525b' }}
                      _focus={{ 
                        borderColor: '#6366f1',
                        boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)'
                      }}
                      borderRadius="lg"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyPress={handleSearchKeyPress}
                    />
                  </InputGroup>
                  
                  {/* Mobile: Show sync button next to search */}
                  <Button
                    bg="white"
                    color="black"
                    size={{ base: 'sm', lg: 'md' }}
                    _hover={{ bg: '#f4f4f5', transform: 'translateY(-1px)', boxShadow: 'lg' }}
                    borderRadius="lg"
                    px={{ base: 2, lg: 4 }}
                    fontWeight="600"
                    onClick={onSync}
                    isLoading={parentLoading}
                    display={{ base: 'flex', lg: 'none' }}
                    transition="all 0.2s"
                    shadow="md"
                  >
                    ซิงค์
                  </Button>
                </Flex>
                
                {/* Filter + Actions Row */}
                <Flex gap={2} align="center">
                  <Select
                    size={{ base: 'sm', lg: 'md' }}
                    flex={1}
                    bg="#27272a"
                    borderColor="#3f3f46"
                    color="#ffffff"
                    fontSize={{ base: 'sm', lg: 'md' }}
                    _hover={{ borderColor: '#52525b' }}
                    _focus={{ borderColor: '#6366f1', boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)' }}
                    borderRadius="lg"
                    value={filterValue}
                    onChange={(e) => onFilterChange && onFilterChange(e.target.value)}
                  >
                    <option value="all" style={{ background: '#27272a', color: '#ffffff' }}>ทั้งหมด</option>
                    <option value="active" style={{ background: '#27272a', color: '#ffffff' }}>ใช้งาน</option>
                    <option value="inactive" style={{ background: '#27272a', color: '#ffffff' }}>ไม่ใช้งาน</option>
                    <option value="flash-sale" style={{ background: '#27272a', color: '#ffffff' }}>Flash Sale</option>
                  </Select>
                  
                  <Badge 
                    bg="#6366f1"
                    color="white"
                    fontSize={{ base: '2xs', lg: 'xs' }}
                    px={{ base: 2, lg: 3 }}
                    py={1}
                    borderRadius="md"
                    fontWeight="600"
                    flexShrink={0}
                    border="1px solid"
                    borderColor="rgba(99, 102, 241, 0.3)"
                  >
                    {totalItems}
                  </Badge>
                  
                  {/* Desktop: Show sync and refresh buttons */}
                  <HStack spacing={2} display={{ base: 'none', lg: 'flex' }}>
                    <Button
                      bg="white"
                      color="black"
                      size="md"
                      _hover={{ bg: '#f4f4f5', transform: 'translateY(-1px)', boxShadow: 'lg' }}
                      borderRadius="lg"
                      px={4}
                      fontWeight="600"
                      onClick={onSync}
                      isLoading={parentLoading}
                      loadingText="ซิงค์"
                      transition="all 0.2s"
                      shadow="md"
                    >
                      ซิงค์
                    </Button>
                    
                    <IconButton
                      aria-label="รีเฟรช"
                      icon={<RepeatIcon />}
                      size="md"
                      bg="#27272a"
                      border="1px solid"
                      borderColor="#3f3f46"
                      color="#a1a1aa"
                      _hover={{ bg: '#18181b', color: 'white', borderColor: '#52525b', transform: 'translateY(-1px)' }}
                      borderRadius="lg"
                      onClick={onRefresh}
                      isLoading={parentLoading}
                      transition="all 0.2s"
                    />
                  </HStack>
                  
                  {/* Mobile: Show refresh button */}
                  <IconButton
                    aria-label="รีเฟรช"
                    icon={<RepeatIcon />}
                    size={{ base: 'sm', lg: 'md' }}
                    bg="#27272a"
                    border="1px solid"
                    borderColor="#3f3f46"
                    color="#a1a1aa"
                    _hover={{ bg: '#18181b', color: 'white', borderColor: '#52525b', transform: 'translateY(-1px)' }}
                    borderRadius="lg"
                    onClick={onRefresh}
                    isLoading={parentLoading}
                    display={{ base: 'flex', lg: 'none' }}
                    transition="all 0.2s"
                  />
                </Flex>
                
                {/* Clear Filter Button Row */}
                {(filterValue !== 'all' || searchValue) && (
                  <Flex justify="center" pt={2}>
                    <Button
                      size={{ base: 'sm', lg: 'md' }}
                      variant="outline"
                      borderColor="rgba(255, 255, 255, 0.3)"
                      color="white"
                      _hover={{ 
                        bg: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.5)'
                      }}
                      onClick={onClearFilter}
                      leftIcon={<Icon as={RepeatIcon} />}
                    >
                      ล้างตัวกรอง
                    </Button>
                  </Flex>
                )}
              </VStack>
              </Collapse>
            </VStack>
          </Box>
          )}
          
          {/* Content */}
          <Box>
            {children}
          </Box>
        </Box>
      </Box>
  );
}
