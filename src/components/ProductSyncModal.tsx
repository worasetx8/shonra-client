'use client';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Progress,
  Button,
  Box,
  Divider,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  Icon,
  Spinner,
} from '@chakra-ui/react';
import { CheckIcon, WarningIcon, CloseIcon } from '@chakra-ui/icons';

interface SyncResult {
  success: boolean;
  summary?: {
    totalProducts: number;
    totalUpdated: number;
    totalErrors: number;
    totalNotFound: number;
  };
  details?: {
    updatedProducts: Array<{
      itemId: string;
      productName: string;
      status: 'updated' | 'not_found';
    }>;
    errorProducts: Array<{
      itemId: string;
      productName: string;
      error: string;
    }>;
  };
  error?: string;
}

interface ProductSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSync: boolean;
  syncProgress: number;
  syncResult: SyncResult | null;
}

export default function ProductSyncModal({
  isOpen,
  onClose,
  isSync,
  syncProgress,
  syncResult
}: ProductSyncModalProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'updated':
        return <CheckIcon color="green.500" />;
      case 'not_found':
        return <WarningIcon color="orange.500" />;
      case 'error':
        return <CloseIcon color="red.500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'updated':
        return 'green';
      case 'not_found':
        return 'orange';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      isCentered
      size={{ base: 'full', md: 'xl' }}
      closeOnOverlayClick={!isSync}
    >
      <ModalOverlay />
      <ModalContent mx={{ base: 0, md: 4 }}>
        <ModalHeader>
          <HStack>
            {isSync && <Spinner size="sm" color="purple.500" />}
            <Text>ซิงค์ข้อมูลสินค้า</Text>
          </HStack>
        </ModalHeader>
        {!isSync && <ModalCloseButton />}

        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Progress Section */}
            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" color="gray.600">
                  {isSync ? 'กำลังดำเนินการ...' : 'เสร็จสิ้น'}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {syncProgress}%
                </Text>
              </HStack>
              
              <Progress 
                value={syncProgress} 
                colorScheme={syncResult?.success === false ? 'red' : 'purple'}
                size="md"
                borderRadius="md"
                bg="gray.100"
              />
            </Box>

            {/* Status Message */}
            {isSync && (
              <Box textAlign="center" py={4}>
                <Text color="gray.600">
                  กำลังอัพเดทข้อมูลสินค้าจาก Shopee API...
                </Text>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  กรุณารอสักครู่
                </Text>
              </Box>
            )}

            {/* Results Summary */}
            {syncResult && !isSync && (
              <Box>
                <Text fontWeight="semibold" mb={3}>สรุปผลการซิงค์</Text>
                
                <VStack spacing={3} align="stretch">
                  {/* Success Summary */}
                  {syncResult.success && syncResult.summary && (
                    <Box bg="gray.50" p={4} borderRadius="md">
                      <VStack spacing={2} align="stretch">
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">อัพเดททั้งหมด</Text>
                          <Badge colorScheme="blue">{syncResult.summary.totalProducts} รายการ</Badge>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="green.600">อัพเดทสำเร็จ</Text>
                          <Badge colorScheme="green">
                            {syncResult.details?.updatedProducts ? 
                              syncResult.details.updatedProducts.filter((p: any) => p.status === "updated").length : 
                              syncResult.summary.totalUpdated
                            } รายการ
                          </Badge>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="red.600">อัพเดทไม่สำเร็จ</Text>
                          <Badge colorScheme="red">
                            {syncResult.details?.updatedProducts ? 
                              syncResult.details.updatedProducts.filter((p: any) => 
                                p.status === "not_found" || p.status === "set_inactive"
                              ).length :
                              (syncResult.summary.totalNotFound || 0) + (syncResult.summary.totalErrors || 0)
                            } รายการ
                          </Badge>
                        </HStack>
                      </VStack>
                    </Box>
                  )}

                  {/* Error Summary */}
                  {!syncResult.success && (
                    <Box bg="red.50" border="1px" borderColor="red.200" p={4} borderRadius="md">
                      <HStack mb={2}>
                        <CloseIcon color="red.500" boxSize={4} />
                        <Text fontWeight="semibold" color="red.700">เกิดข้อผิดพลาด</Text>
                      </HStack>
                      <Text fontSize="sm" color="red.600">
                        {syncResult.error || 'ไม่สามารถซิงค์ข้อมูลได้'}
                      </Text>
                    </Box>
                  )}
                </VStack>
              </Box>
            )}

            {/* Detailed Results */}
            {syncResult && !isSync && syncResult.success && syncResult.details && (
              <>
                <Divider />
                
                <Accordion allowMultiple>
                  {/* Updated Products */}
                  {syncResult.details.updatedProducts.length > 0 && (
                    <AccordionItem>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          <HStack>
                            <CheckIcon color="green.500" boxSize={3} />
                            <Text fontSize="sm">สินค้าที่อัพเดทแล้ว ({syncResult.details.updatedProducts.length})</Text>
                          </HStack>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4}>
                        <List spacing={2}>
                          {syncResult.details.updatedProducts.map((product, index) => (
                            <ListItem key={index}>
                              <HStack>
                                {getStatusIcon(product.status)}
                                <VStack align="start" spacing={0} flex={1}>
                                  <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                                    {product.productName}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    ID: {product.itemId}
                                  </Text>
                                </VStack>
                                <Badge colorScheme={getStatusColor(product.status)} fontSize="xs">
                                  {product.status === 'updated' ? 'อัพเดท' : 'ไม่พบ'}
                                </Badge>
                              </HStack>
                            </ListItem>
                          ))}
                        </List>
                      </AccordionPanel>
                    </AccordionItem>
                  )}

                  {/* Error Products */}
                  {syncResult.details.errorProducts.length > 0 && (
                    <AccordionItem>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          <HStack>
                            <CloseIcon color="red.500" boxSize={3} />
                            <Text fontSize="sm">สินค้าที่เกิดข้อผิดพลาด ({syncResult.details.errorProducts.length})</Text>
                          </HStack>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4}>
                        <List spacing={3}>
                          {syncResult.details.errorProducts.map((product, index) => (
                            <ListItem key={index}>
                              <VStack align="start" spacing={1}>
                                <HStack>
                                  <CloseIcon color="red.500" boxSize={3} />
                                  <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                                    {product.productName}
                                  </Text>
                                </HStack>
                                <Text fontSize="xs" color="gray.500" ml={5}>
                                  ID: {product.itemId}
                                </Text>
                                <Text fontSize="xs" color="red.500" ml={5}>
                                  ข้อผิดพลาด: {product.error}
                                </Text>
                              </VStack>
                            </ListItem>
                          ))}
                        </List>
                      </AccordionPanel>
                    </AccordionItem>
                  )}
                </Accordion>
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button 
            onClick={onClose}
            isDisabled={isSync}
            colorScheme={syncResult?.success === false ? 'red' : 'purple'}
            variant={syncResult?.success === false ? 'solid' : 'ghost'}
          >
            {isSync ? 'กำลังดำเนินการ...' : 'ปิด'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}