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
  Card,
  CardBody,
  CardHeader,
  Badge,
  Flex,
  SimpleGrid,
  Icon,
  useColorModeValue,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText
} from '@chakra-ui/react';
import { ViewIcon, AddIcon, SettingsIcon } from '@chakra-ui/icons';
import { FiPackage, FiShoppingCart, FiUsers, FiBarChart, FiTrendingUp, FiDollarSign } from 'react-icons/fi';
import BackofficeLayout from '@/components/BackofficeLayout';
import { useRouter } from 'next/navigation';

export default function UnifiedDashboardPage() {
  const router = useRouter();
  
  // Vuexy-inspired colors
  const bgColor = useColorModeValue('#f4f5fa', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const primaryColor = '#7367f0';
  const accentColor = '#28c76f';
  const textColor = useColorModeValue('#5e5873', 'white');
  const mutedColor = useColorModeValue('#b9b9c3', 'gray.400');
  const borderColor = useColorModeValue('#ebe9f1', 'gray.600');

  const quickActions = [
    {
      title: 'เพิ่มสินค้าใหม่',
      description: 'ค้นหาและเพิ่มสินค้าจาก Shopee',
      icon: FiShoppingCart,
      color: primaryColor,
      href: '/backoffice',
      count: 'เริ่มต้น'
    },
    {
      title: 'จัดการสินค้า',
      description: 'สินค้าที่บันทึกไว้แล้ว',
      icon: FiPackage,
      color: accentColor,
      href: '/backoffice/saved',
      count: '156 รายการ'
    },
    {
      title: 'จัดการแอดมิน',
      description: 'ผู้ใช้และสิทธิ์การเข้าถึง',
      icon: FiUsers,
      color: '#ff9f43',
      href: '/backoffice/admin',
      count: '3 คน'
    },
    {
      title: 'รายงาน',
      description: 'สถิติและการวิเคราะห์',
      icon: FiBarChart,
      color: '#ea5455',
      href: '#',
      count: 'เร็วๆ นี้'
    }
  ];

  const statsData = [
    { label: 'สินค้าทั้งหมด', value: '1,248', growth: '+12%', color: primaryColor },
    { label: 'ยอดขายรวม', value: '฿89,240', growth: '+8.2%', color: accentColor },
    { label: 'คอมมิชชั่น', value: '฿12,480', growth: '+15.3%', color: '#ff9f43' },
    { label: 'ผู้ใช้งาน', value: '3', growth: '0%', color: '#6f42c1' }
  ];

  return (
    <BackofficeLayout>
      {/* Page Header */}
      <Box 
        bg="white" 
        boxShadow="sm" 
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
              แดชบอร์ดรวม
            </Heading>
            <Text 
              color="gray.600" 
              fontSize={{ base: 'sm', md: 'md' }}
              textAlign={{ base: 'center', md: 'left' }}
            >
              ภาพรวมการจัดการระบบ Shopee Affiliate
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="container.xl" py={{ base: 4, md: 8 }} px={{ base: 3, sm: 4, md: 8 }}>
        <VStack spacing={{ base: 6, md: 8 }} align="stretch">
          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 4, md: 6 }}>
            {statsData.map((stat, index) => (
              <Card key={index} bg={cardBg} shadow="sm" border="1px" borderColor={borderColor}>
                <CardBody>
                  <Stat>
                    <StatLabel color={mutedColor} fontSize="sm">{stat.label}</StatLabel>
                    <StatNumber color={textColor} fontSize={{ base: 'xl', md: '2xl' }} fontWeight="600">
                      {stat.value}
                    </StatNumber>
                    <StatHelpText color={stat.color} fontSize="sm" fontWeight="500">
                      {stat.growth}
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          {/* Quick Actions */}
          <Box>
            <Heading size={{ base: 'md', md: 'lg' }} color={textColor} mb={{ base: 4, md: 6 }}>
              การจัดการด่วน
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={{ base: 4, md: 6 }}>
              {quickActions.map((action, index) => (
                <Card 
                  key={index} 
                  bg={cardBg} 
                  shadow="sm" 
                  border="1px" 
                  borderColor={borderColor}
                  cursor={action.href !== '#' ? 'pointer' : 'default'}
                  _hover={action.href !== '#' ? {
                    shadow: 'md',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s'
                  } : {}}
                  onClick={() => action.href !== '#' && router.push(action.href)}
                >
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <HStack spacing={3}>
                        <Box
                          p={3}
                          bg={`${action.color}15`}
                          borderRadius="lg"
                          color={action.color}
                        >
                          <Icon as={action.icon} fontSize="xl" />
                        </Box>
                        <VStack align="start" spacing={0} flex={1}>
                          <Text fontWeight="600" color={textColor} fontSize="sm">
                            {action.title}
                          </Text>
                          <Badge 
                            size="sm" 
                            colorScheme={action.count === 'เร็วๆ นี้' ? 'orange' : 'blue'}
                            variant="subtle"
                          >
                            {action.count}
                          </Badge>
                        </VStack>
                      </HStack>
                      <Text color={mutedColor} fontSize="sm" lineHeight="1.4">
                        {action.description}
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>

          {/* Recent Activity Placeholder */}
          <Card bg={cardBg} shadow="sm" border="1px" borderColor={borderColor}>
            <CardHeader>
              <Heading size="md" color={textColor}>กิจกรรมล่าสุด</Heading>
            </CardHeader>
            <CardBody>
              <Center py={8}>
                <VStack spacing={4}>
                  <Icon as={FiBarChart} fontSize="3xl" color={mutedColor} />
                  <Text color={mutedColor} textAlign="center">
                    ฟีเจอร์กิจกรรมล่าสุดจะเปิดใช้งานเร็วๆ นี้
                  </Text>
                </VStack>
              </Center>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </BackofficeLayout>
  );
}