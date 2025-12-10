'use client';

import { 
  Box, 
  Flex, 
  Heading, 
  Button, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Badge, 
  useDisclosure, 
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
  HStack,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Card,
  CardBody,
  CardHeader,
  Icon,
  useColorModeValue,
  Avatar,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon, ViewIcon, SearchIcon } from '@chakra-ui/icons';
import { FiUsers, FiPlus, FiTrash2, FiToggleLeft, FiToggleRight, FiMoreVertical, FiEdit, FiEye } from 'react-icons/fi';
import BackofficeLayout from '@/components/BackofficeLayout';
import { useEffect, useState, useRef } from 'react';

interface Admin {
  id: number;
  username: string;
  role: string;
  created_at: string;
  status: 'active' | 'inactive';
}

interface CreateAdminData {
  username: string;
  password: string;
  role: 'admin' | 'super_admin';
}

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState<CreateAdminData>({
    username: '',
    password: '',
    role: 'admin'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  // Vuexy-inspired colors
  const bgColor = useColorModeValue('#f4f5fa', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const primaryColor = '#7367f0';
  const accentColor = '#28c76f';
  const textColor = useColorModeValue('#5e5873', 'white');
  const mutedColor = useColorModeValue('#b9b9c3', 'gray.400');
  const borderColor = useColorModeValue('#ebe9f1', 'gray.600');

  const fetchAdmins = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('auth-token');
      
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAdmins(data);
      } else {
        throw new Error('Failed to fetch admins');
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast({
        title: 'Error',
        description: 'Unable to load admin list',
        status: 'error',
        duration: 3000,
        position: 'top-right',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async () => {
    if (!formData.username || !formData.password) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in username and password',
        status: 'error',
        duration: 3000,
        position: 'top-right',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem('auth-token');
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Success!',
          description: 'New admin user created successfully',
          status: 'success',
          duration: 3000,
          position: 'top-right',
        });
        onCreateClose();
        setFormData({ username: '', password: '', role: 'admin' });
        fetchAdmins();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create admin');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Unable to create admin',
        status: 'error',
        duration: 3000,
        position: 'top-right',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;

    try {
      // Get token from localStorage
      const token = localStorage.getItem('auth-token');
      
      const response = await fetch(`/api/admin/users/${selectedAdmin.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: 'Success!',
          description: 'Admin user deleted successfully',
          status: 'success',
          duration: 3000,
          position: 'top-right',
        });
        onDeleteClose();
        fetchAdmins();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete admin');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Unable to delete admin',
        status: 'error',
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  const handleStatusToggle = async (admin: Admin) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('auth-token');
      
      const newStatus = admin.status === 'active' ? 'inactive' : 'active';
      const response = await fetch(`/api/admin/users/${admin.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast({
          title: 'Success!',
          description: `Admin status updated to ${newStatus}`,
          status: 'success',
          duration: 3000,
          position: 'top-right',
        });
        fetchAdmins();
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Unable to update status',
        status: 'error',
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  const openDeleteDialog = (admin: Admin) => {
    setSelectedAdmin(admin);
    onDeleteOpen();
  };

  const activeAdmins = admins.filter(admin => admin.status === 'active').length;
  const totalAdmins = admins.length;

  return (
    <BackofficeLayout>
      <Box bg={bgColor} minH="100vh" p={{ base: 3, sm: 4, md: 6 }}>
        {/* Breadcrumb - Responsive */}
        <HStack 
          spacing={2} 
          mb={{ base: 4, md: 6 }} 
          color={mutedColor} 
          fontSize={{ base: 'xs', md: 'sm' }}
          display={{ base: 'none', sm: 'flex' }}
        >
          <Text>Dashboard</Text>
          <Text>/</Text>
          <Text color={textColor} fontWeight="500">Users</Text>
        </HStack>

        {/* Header Section - Responsive */}
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          justify="space-between" 
          align={{ base: 'stretch', md: 'center' }}
          gap={{ base: 4, md: 0 }}
          mb={8}
        >
          <Box>
            <Heading size={{ base: 'md', md: 'lg' }} color={textColor} fontWeight="600" mb={2}>
              User Management
            </Heading>
            <Text color={mutedColor} fontSize={{ base: 'xs', md: 'sm' }}>
              Manage system administrators and their permissions
            </Text>
          </Box>
          
          <Button 
            leftIcon={<Icon as={FiPlus} />}
            bg={primaryColor}
            color="white"
            _hover={{ bg: '#6c5ce7', shadow: 'md' }}
            w={{ base: 'full', md: 'auto' }}
            size={{ base: 'md', md: 'md' }}
            transition="all 0.2s"
            borderRadius="lg"
            px={6}
            fontWeight="500"
            shadow="sm"
            onClick={onCreateOpen}
          >
            Add New User
          </Button>
        </Flex>

        {/* Stats Cards - Responsive */}
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={{ base: 4, md: 6 }} mb={{ base: 6, md: 8 }}>
          <Card bg={cardBg} shadow="sm" border="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color={mutedColor} fontSize="sm">Total Users</StatLabel>
                <StatNumber color={textColor} fontSize="2xl" fontWeight="600">
                  {totalAdmins}
                </StatNumber>
                <StatHelpText color={mutedColor} fontSize="xs">
                  All registered administrators
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} shadow="sm" border="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color={mutedColor} fontSize="sm">Active Users</StatLabel>
                <StatNumber color={accentColor} fontSize="2xl" fontWeight="600">
                  {activeAdmins}
                </StatNumber>
                <StatHelpText color={mutedColor} fontSize="xs">
                  Currently active administrators
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} shadow="sm" border="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color={mutedColor} fontSize="sm">Inactive Users</StatLabel>
                <StatNumber color="red.500" fontSize="2xl" fontWeight="600">
                  {totalAdmins - activeAdmins}
                </StatNumber>
                <StatHelpText color={mutedColor} fontSize="xs">
                  Disabled administrator accounts
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Main Content Card - Responsive */}
        <Card bg={cardBg} shadow="sm" border="1px" borderColor={borderColor}>
          <CardHeader pb={4}>
            <Flex 
              direction={{ base: 'column', md: 'row' }}
              justify="space-between" 
              align={{ base: 'start', md: 'center' }}
              gap={{ base: 3, md: 0 }}
            >
              <Box>
                <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="600" color={textColor} mb={1}>
                  Administrator List
                </Text>
                <Text fontSize={{ base: 'xs', md: 'sm' }} color={mutedColor}>
                  Manage user accounts and permissions
                </Text>
              </Box>
              
              {/* Search - Responsive */}
              <Box position="relative" w={{ base: 'full', md: '300px' }}>
                <Input 
                  placeholder="Search users..."
                  size={{ base: 'md', md: 'sm' }}
                  pl={10}
                  bg="gray.50"
                  border="1px"
                  borderColor="transparent"
                  _focus={{ bg: 'white', borderColor: primaryColor }}
                  borderRadius="lg"
                />
                <Icon 
                  as={SearchIcon} 
                  position="absolute" 
                  left={3} 
                  top="50%" 
                  transform="translateY(-50%)" 
                  color={mutedColor} 
                  fontSize="sm"
                />
              </Box>
            </Flex>
          </CardHeader>
          
          <CardBody pt={0}>
            {isLoading ? (
              <Flex justify="center" align="center" py={20}>
                <VStack spacing={4}>
                  <Box 
                    w={12} 
                    h={12} 
                    border="4px solid" 
                    borderColor={borderColor}
                    borderTopColor={primaryColor}
                    borderRadius="full"
                    className="animate-spin"
                  />
                  <Text color={mutedColor}>Loading...</Text>
                </VStack>
              </Flex>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
                  <Thead display={{ base: 'none', md: 'table-header-group' }}>
                    <Tr>
                      <Th color={mutedColor} fontWeight="600" fontSize="xs" py={4} textTransform="uppercase">
                        User
                      </Th>
                      <Th color={mutedColor} fontWeight="600" fontSize="xs" py={4} textTransform="uppercase">
                        Role
                      </Th>
                      <Th color={mutedColor} fontWeight="600" fontSize="xs" py={4} textTransform="uppercase">
                        Status
                      </Th>
                      <Th color={mutedColor} fontWeight="600" fontSize="xs" py={4} textTransform="uppercase">
                        Created
                      </Th>
                      <Th color={mutedColor} fontWeight="600" fontSize="xs" py={4} textTransform="uppercase" textAlign="center">
                        Actions
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {admins.map((admin, index) => (
                      <Tr 
                        key={admin.id} 
                        _hover={{ bg: 'gray.50' }}
                        transition="all 0.2s"
                        borderBottom={index === admins.length - 1 ? 'none' : '1px'}
                        borderColor={borderColor}
                        display={{ base: 'block', md: 'table-row' }}
                      >
                        <Td py={{ base: 3, md: 4 }} display={{ base: 'block', md: 'table-cell' }}>
                          <Flex 
                            direction={{ base: 'row', md: 'row' }}
                            align="center" 
                            justify={{ base: 'space-between', md: 'start' }}
                            gap={3}
                          >
                            <HStack spacing={3}>
                              <Avatar 
                                size={{ base: 'sm', md: 'sm' }} 
                                name={admin.username} 
                                bg={`linear-gradient(135deg, ${primaryColor} 0%, #9c88ff 100%)`}
                                color="white"
                              />
                              <Box>
                                <Text fontWeight="500" color={textColor} fontSize={{ base: 'sm', md: 'sm' }}>
                                  {admin.username}
                                </Text>
                                <Text fontSize="xs" color={mutedColor} display={{ base: 'block', md: 'block' }}>
                                  @{admin.username.toLowerCase()}
                                </Text>
                              </Box>
                            </HStack>
                            {/* Mobile: Show actions inline */}
                            <HStack spacing={1} display={{ base: 'flex', md: 'none' }}>
                              <IconButton
                                aria-label="View user"
                                icon={<Icon as={FiEye} />}
                                size="sm"
                                variant="ghost"
                                color={mutedColor}
                                _hover={{ color: primaryColor, bg: `${primaryColor}10` }}
                                borderRadius="lg"
                              />
                              <Menu>
                                <MenuButton
                                  as={IconButton}
                                  aria-label="More actions"
                                  icon={<Icon as={FiMoreVertical} />}
                                  size="sm"
                                  variant="ghost"
                                  color={mutedColor}
                                  _hover={{ color: textColor, bg: 'gray.100' }}
                                  borderRadius="lg"
                                />
                                <MenuList shadow="lg" border="1px" borderColor={borderColor}>
                                  <MenuItem 
                                    icon={<Icon as={admin.status === 'active' ? FiToggleRight : FiToggleLeft} />}
                                    onClick={() => handleStatusToggle(admin)}
                                    _hover={{ bg: 'gray.50' }}
                                  >
                                    {admin.status === 'active' ? 'Deactivate' : 'Activate'}
                                  </MenuItem>
                                  <MenuItem 
                                    icon={<Icon as={FiTrash2} />}
                                    onClick={() => openDeleteDialog(admin)}
                                    color="red.500"
                                    _hover={{ bg: 'red.50' }}
                                  >
                                    Delete
                                  </MenuItem>
                                </MenuList>
                              </Menu>
                            </HStack>
                          </Flex>
                          {/* Mobile: Show additional info below */}
                          <VStack align="start" spacing={1} mt={2} display={{ base: 'flex', md: 'none' }}>
                            <HStack spacing={2}>
                              <Badge 
                                colorScheme={admin.role === 'super_admin' ? 'purple' : 'blue'}
                                variant="subtle"
                                px={2}
                                py={1}
                                borderRadius="full"
                                fontSize="xs"
                                fontWeight="500"
                              >
                                {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                              </Badge>
                              <Badge 
                                bg={admin.status === 'active' ? `${accentColor}20` : 'red.100'}
                                color={admin.status === 'active' ? accentColor : 'red.500'}
                                px={2}
                                py={1}
                                borderRadius="full"
                                fontSize="xs"
                                fontWeight="500"
                              >
                                {admin.status === 'active' ? 'Active' : 'Inactive'}
                              </Badge>
                            </HStack>
                            <Text color={mutedColor} fontSize="xs">
                              Created: {new Date(admin.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </Text>
                          </VStack>
                        </Td>
                        <Td py={4} display={{ base: 'none', md: 'table-cell' }}>
                          <Badge 
                            colorScheme={admin.role === 'super_admin' ? 'purple' : 'blue'}
                            variant="subtle"
                            px={3}
                            py={1}
                            borderRadius="full"
                            fontSize="xs"
                            fontWeight="500"
                          >
                            {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                          </Badge>
                        </Td>
                        <Td py={4} display={{ base: 'none', md: 'table-cell' }}>
                          <Badge 
                            bg={admin.status === 'active' ? `${accentColor}20` : 'red.100'}
                            color={admin.status === 'active' ? accentColor : 'red.500'}
                            px={3}
                            py={1}
                            borderRadius="full"
                            fontSize="xs"
                            fontWeight="500"
                          >
                            {admin.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                        </Td>
                        <Td py={4} display={{ base: 'none', md: 'table-cell' }}>
                          <Text color={mutedColor} fontSize="sm">
                            {new Date(admin.created_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </Text>
                        </Td>
                        <Td py={4} display={{ base: 'none', md: 'table-cell' }}>
                          <HStack spacing={1} justify="center">
                            <IconButton
                              aria-label="View user"
                              icon={<Icon as={FiEye} />}
                              size="sm"
                              variant="ghost"
                              color={mutedColor}
                              _hover={{ color: primaryColor, bg: `${primaryColor}10` }}
                              borderRadius="lg"
                            />
                            <IconButton
                              aria-label="Edit user"
                              icon={<Icon as={FiEdit} />}
                              size="sm"
                              variant="ghost"
                              color={mutedColor}
                              _hover={{ color: primaryColor, bg: `${primaryColor}10` }}
                              borderRadius="lg"
                            />
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                aria-label="More actions"
                                icon={<Icon as={FiMoreVertical} />}
                                size="sm"
                                variant="ghost"
                                color={mutedColor}
                                _hover={{ color: textColor, bg: 'gray.100' }}
                                borderRadius="lg"
                              />
                              <MenuList shadow="lg" border="1px" borderColor={borderColor}>
                                <MenuItem 
                                  icon={<Icon as={admin.status === 'active' ? FiToggleRight : FiToggleLeft} />}
                                  onClick={() => handleStatusToggle(admin)}
                                  _hover={{ bg: 'gray.50' }}
                                >
                                  {admin.status === 'active' ? 'Deactivate' : 'Activate'}
                                </MenuItem>
                                <MenuItem 
                                  icon={<Icon as={FiTrash2} />}
                                  onClick={() => openDeleteDialog(admin)}
                                  color="red.500"
                                  _hover={{ bg: 'red.50' }}
                                >
                                  Delete
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </CardBody>
        </Card>

        {/* Create Admin Modal */}
        <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="md">
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
          <ModalContent borderRadius="2xl" mx={4}>
            <ModalHeader bg={cardBg} borderTopRadius="2xl" pb={4}>
              <Text fontSize="lg" fontWeight="600" color={textColor}>
                Add New Administrator
              </Text>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody py={6}>
              <VStack spacing={5}>
                <FormControl isRequired>
                  <FormLabel color={textColor} fontWeight="500" fontSize="sm">Username</FormLabel>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Enter username"
                    borderRadius="lg"
                    border="2px"
                    borderColor={borderColor}
                    _focus={{ borderColor: primaryColor, shadow: `0 0 0 1px ${primaryColor}` }}
                    _hover={{ borderColor: 'gray.300' }}
                    py={3}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel color={textColor} fontWeight="500" fontSize="sm">Password</FormLabel>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                    borderRadius="lg"
                    border="2px"
                    borderColor={borderColor}
                    _focus={{ borderColor: primaryColor, shadow: `0 0 0 1px ${primaryColor}` }}
                    _hover={{ borderColor: 'gray.300' }}
                    py={3}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color={textColor} fontWeight="500" fontSize="sm">Role</FormLabel>
                  <Select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'super_admin' })}
                    borderRadius="lg"
                    border="2px"
                    borderColor={borderColor}
                    _focus={{ borderColor: primaryColor, shadow: `0 0 0 1px ${primaryColor}` }}
                    _hover={{ borderColor: 'gray.300' }}
                    py={3}
                  >
                    <option value="admin">Administrator</option>
                    <option value="super_admin">Super Administrator</option>
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter py={6}>
              <Button 
                variant="ghost" 
                mr={3} 
                onClick={onCreateClose}
                borderRadius="lg"
                color={mutedColor}
              >
                Cancel
              </Button>
              <Button 
                bg={primaryColor}
                color="white"
                _hover={{ bg: '#6c5ce7' }}
                onClick={handleCreateAdmin}
                isLoading={isSubmitting}
                loadingText="Creating..."
                borderRadius="lg"
                px={6}
              >
                Create User
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          isOpen={isDeleteOpen}
          leastDestructiveRef={cancelRef}
          onClose={onDeleteClose}
        >
          <AlertDialogOverlay bg="blackAlpha.300" backdropFilter="blur(10px)">
            <AlertDialogContent borderRadius="2xl" mx={4}>
              <AlertDialogHeader fontSize="lg" fontWeight="600" color={textColor}>
                Delete Administrator
              </AlertDialogHeader>

              <AlertDialogBody color={mutedColor}>
                Are you sure you want to delete administrator <strong style={{ color: primaryColor }}>{selectedAdmin?.username}</strong>? 
                <br />
                <Text fontSize="sm" mt={2} color="red.500">
                  This action cannot be undone.
                </Text>
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button 
                  ref={cancelRef} 
                  onClick={onDeleteClose}
                  borderRadius="lg"
                  color={mutedColor}
                >
                  Cancel
                </Button>
                <Button 
                  bg="red.500" 
                  color="white"
                  _hover={{ bg: "red.600" }}
                  onClick={handleDeleteAdmin} 
                  ml={3}
                  borderRadius="lg"
                >
                  Delete User
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Box>
    </BackofficeLayout>
  );
}