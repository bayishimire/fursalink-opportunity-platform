'use client'

import { Box, Flex, Heading, VStack, HStack, Button, Icon, Text, Container, Separator, Card, Center } from '@chakra-ui/react'
import {
  FiHome,
  FiUser,
  FiLogOut,
  FiSettings,
  FiGrid,
  FiBookOpen,
  FiZap,
  FiTrendingUp,
  FiHelpCircle,
  FiClock,
  FiAward
} from 'react-icons/fi'
import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  const checkUser = () => {
    const stored = localStorage.getItem('user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
  }

  useEffect(() => {
    checkUser()
    const handleUpdate = (e: any) => {
      if (e.detail) setUser(e.detail)
      else checkUser()
    }
    window.addEventListener('user-update', handleUpdate)
    return () => window.removeEventListener('user-update', handleUpdate)
  }, [pathname]) 

  return (
    <Flex direction="column" minH="100vh" bg="gray.100">
      <Navbar />

      <Flex flex={1}>
        {/* Modern Support-Focused Sidebar */}
        <Box
          w={{ base: '0', lg: '280px' }}
          display={{ base: 'none', lg: 'block' }}
          bg="white"
          borderRight="1px solid"
          borderColor="gray.200"
          position="sticky"
          top="0"
          h="calc(100vh - 64px)"
          overflowY="auto"
          p={6}
        >
          <Flex direction="column" gap={2}>
            {user?.role === 'user_system' ? (
              <>
                <SidebarItem icon={FiHelpCircle} label="Support" active={pathname === '/dashboard/user_system'} onClick={() => router.push('/dashboard/user_system')} />
                <SidebarItem icon={FiSettings} label="Settings" active={pathname === '/dashboard/profile'} onClick={() => router.push('/dashboard/profile')} />
                <SidebarItem icon={FiLogOut} label="Sign Out" onClick={() => { localStorage.removeItem('user'); router.push('/'); }} />
              </>
            ) : (
              <>
                <Text fontSize="10px" fontWeight="black" color="gray.400" mb={2} letterSpacing="1px">MAIN MENU</Text>

                {/* STRICT ROLE CHECK: Only students see the student features */}
                {(user?.role === 'student' || (!user && pathname.includes('/dashboard/student'))) && (
                  <>
                    <SidebarItem icon={FiHome} label="Home" active={pathname === '/dashboard/student'} onClick={() => router.push('/dashboard/student')} />
                    <SidebarItem icon={FiBookOpen} label="Courses" active={pathname === '/dashboard/student'} onClick={() => router.push('/dashboard/student')} />
                    <SidebarItem icon={FiZap} label="Exams" active={pathname === '/dashboard/student/exams'} onClick={() => router.push('/dashboard/student/exams')} />
                    <SidebarItem icon={FiTrendingUp} label="Progress" active={pathname === '/dashboard/student/progress'} onClick={() => router.push('/dashboard/student')} />
                    <SidebarItem icon={FiClock} label="History Section" active={pathname === '/dashboard/student/history'} onClick={() => router.push('/dashboard/student/history')} />
                  </>
                )}

                <SidebarItem icon={FiHelpCircle} label="Support" active={pathname === '/dashboard/user_system'} onClick={() => router.push('/dashboard/user_system')} />

                <Separator my={6} borderColor="gray.100" />

                <Text fontSize="10px" fontWeight="black" color="gray.400" mb={2} letterSpacing="1px">ACCOUNT</Text>
                
                <SidebarItem icon={FiSettings} label="Settings" active={pathname === '/dashboard/profile'} onClick={() => router.push('/dashboard/profile')} />
                <SidebarItem icon={FiLogOut} label="Sign Out" onClick={() => { localStorage.removeItem('user'); router.push('/'); }} />
              </>
            )}
          </Flex>

          {user && user.role !== 'user_system' && (
            <Box mt="auto" pt={20}>
              <Card.Root rounded="2xl" bg="blue.50" border="none" shadow="sm">
                <Card.Body p={4}>
                  <HStack gap={3}>
                    <Box 
                      w="40px" h="40px" 
                      rounded="lg" 
                      overflow="hidden" 
                      bg="blue.500" 
                      shadow="md"
                    >
                      {user.picture ? (
                        <img src={user.picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="User" />
                      ) : (
                        <Center w="full" h="full"><FiUser color="white" /></Center>
                      )}
                    </Box>
                    <VStack align="flex-start" gap={0} flex={1}>
                      <Text fontSize="xs" fontWeight="black" color="blue.900" truncate maxW="150px">
                        {user.name.toUpperCase()}
                      </Text>
                      <Text fontSize="10px" fontWeight="bold" color="blue.600">
                        {user.role === 'admin' ? 'SYSTEM ADMIN' : user.role === 'user_system' ? 'PLATFORM STAFF' : 'PRO STUDENT'}
                      </Text>
                    </VStack>
                  </HStack>
                </Card.Body>
              </Card.Root>
            </Box>
          )}
        </Box>

        {/* Main Content */}
        <Box flex={1} bg="gray.50" overflowY="auto">
          <Box p={{ base: 4, md: 10 }}>
            {children}
          </Box>
        </Box>
      </Flex>

      <Footer />
    </Flex>
  )
}


function SidebarItem({ icon: Icon, label, active = false, onClick }: any) {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      justifyContent="flex-start"
      gap={4}
      h="50px"
      rounded="xl"
      bg={active ? 'blue.900' : 'transparent'}
      color={active ? 'white' : 'gray.600'}
      fontWeight="black"
      fontSize="sm"
      _hover={{ bg: active ? 'blue.800' : 'gray.100', transform: 'translateX(5px)' }}
      transition="0.2s"
    >
      <Icon size={18} />
      <Text>{label}</Text>
    </Button>
  )
}
