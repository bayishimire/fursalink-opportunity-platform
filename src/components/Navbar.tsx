'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Button, Flex, Heading, HStack, VStack, Text } from '@chakra-ui/react'

export function Navbar() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }

  const checkUser = () => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    } else {
      setUser(null)
    }
  }

  useEffect(() => {
    setMounted(true)
    checkUser()
    const handleUpdate = (e: any) => {
      if (e.detail) setUser(e.detail)
      else checkUser()
    }

    // Listen for storage changes (for other tabs) and custom user-update (for same tab)
    window.addEventListener('storage', checkUser)
    window.addEventListener('user-update', handleUpdate)
    return () => {
      window.removeEventListener('storage', checkUser)
      window.removeEventListener('user-update', handleUpdate)
    }
  }, [])

  if (!mounted) return <Box h="64px" />

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    setIsMenuOpen(false)
    showToast('Signed out successfully')
    setTimeout(() => router.push('/'), 1500)
  }

  return (
    <Box as="nav" bg="white" shadow="sm" py={3} px={8} position="sticky" top={0} zIndex={100}>
      {/* Toast notification */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
      {toast && (
        <Box
          position="fixed"
          top="24px"
          right="24px"
          zIndex={9999}
          bg={toast.type === 'success' ? 'green.500' : 'red.500'}
          color="white"
          px={5}
          py={3}
          rounded="2xl"
          shadow="2xl"
          display="flex"
          alignItems="center"
          gap={3}
          minW="240px"
          style={{ animation: 'slideInRight 0.3s ease-out' }}
        >
          <Box fontSize="16px">{toast.type === 'success' ? '✓' : '✕'}</Box>
          <Text fontWeight="bold" fontSize="13px">{toast.message}</Text>
        </Box>
      )}
      <Flex justify="space-between" align="center" maxW="7xl" mx="auto">
        {/* Logo */}
        <Box cursor="pointer" onClick={() => router.push('/')} overflow="hidden">
          <img src="/logo.png" alt="Fursa.Link Logo" style={{ height: '40px', objectFit: 'contain' }} />
        </Box>

        {/* Nav Links */}
        <HStack gap={8} display={{ base: 'none', md: 'flex' }}>
          <Text onClick={() => router.push('/')} fontWeight="bold" fontSize="xs" color="gray.600" letterSpacing="widest" cursor="pointer" _hover={{ color: 'blue.500' }}>HOME</Text>
          <Text onClick={() => router.push('/about')} fontWeight="bold" fontSize="xs" color="gray.600" letterSpacing="widest" cursor="pointer" _hover={{ color: 'blue.500' }}>ABOUT</Text>

          {mounted && user && (
            <>
              <Text
                onClick={() => {
                  const role = user.role?.toLowerCase()
                  if (role === 'admin') router.push('/dashboard/admin')
                  else if (role === 'student') router.push('/dashboard/student')
                  else router.push('/dashboard/user_system')
                }}
                fontWeight="bold" fontSize="xs" color="gray.600" letterSpacing="widest" cursor="pointer" _hover={{ color: 'blue.500' }}
              >
                DASHBOARD
              </Text>
              <Text
                onClick={() => router.push('/dashboard/projects')}
                fontWeight="bold" fontSize="xs" color="gray.600" letterSpacing="widest" cursor="pointer" _hover={{ color: 'blue.500' }}
              >
                PROJECTS
              </Text>
            </>
          )}
        </HStack>

        <HStack gap={4} position="relative">
          {mounted && !user && (
            <HStack gap={3}>
              <Button
                background="linear-gradient(135deg, #14d590 0%, #0daaf9 100%)"
                color="white"
                px={6}
                height="40px"
                fontSize="sm"
                fontWeight="bold"
                rounded="xl"
                shadow="md"
                border="none"
                _hover={{
                  shadow: 'lg',
                  transform: 'translateY(-2px)',
                  filter: 'brightness(1.1)'
                }}
                transition="all 0.3s"
                onClick={() => router.push('/login')}
              >
                Sign In
              </Button>
              <Button
                background="linear-gradient(135deg, #14d590 0%, #0daaf9 100%)"
                color="white"
                px={6}
                height="40px"
                fontSize="sm"
                fontWeight="bold"
                rounded="xl"
                shadow="md"
                border="none"
                _hover={{
                  shadow: 'lg',
                  transform: 'translateY(-2px)',
                  filter: 'brightness(1.1)'
                }}
                transition="all 0.3s"
                onClick={() => router.push('/register')}
              >
                Register
              </Button>
            </HStack>
          )}

          {mounted && user && (
            <Box position="relative">
              {/* Profile Badge - White Theme Matching Home */}
              <Flex
                align="center"
                gap={3}
                px={4} py={2}
                rounded="full"
                border="1px solid"
                borderColor="gray.200"
                bg="gray.50"
                cursor="pointer"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                _hover={{ bg: 'gray.100' }}
                transition="0.2s"
              >
                <Box w="36px" h="36px" rounded="full" overflow="hidden" border="2px solid" borderColor="blue.400" bg="gray.100">
                  {user.picture ? (
                    <img src={user.picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile" />
                  ) : (
                    <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a0aec0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </Box>
                  )}
                </Box>
                <VStack align="flex-start" gap={0} minW="80px">
                  <HStack gap={2} w="full" justify="space-between">
                    <Text fontSize="sm" fontWeight="bold" color="blue.900" lineHeight="1" isTruncated maxW="100px">{user.name}</Text>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2b6cb0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </HStack>
                  <Text fontSize="9px" fontWeight="black" color="cyan.600" letterSpacing="1px">AUTHENTICATED</Text>
                </VStack>
              </Flex>

              {/* Dropdown Menu - Content from Screenshot */}
              {isMenuOpen && (
                <Box
                  position="absolute"
                  top="60px"
                  right="0"
                  bg="white"
                  color="gray.800"
                  shadow="2xl"
                  rounded="2xl"
                  w="260px"
                  overflow="hidden"
                  border="1px solid"
                  borderColor="gray.100"
                  zIndex={200}
                >
                  <Box p={5} bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                    <Text fontSize="xs" fontWeight="extrabold" color="gray.400" letterSpacing="2px">USER CONTROLS</Text>
                  </Box>

                  <VStack align="stretch" gap={0}>
                    <HStack
                      px={5} py={4} cursor="pointer"
                      _hover={{ bg: 'blue.50' }}
                      transition="0.2s"
                      onClick={() => { setIsMenuOpen(false); router.push('/dashboard/profile'); }}
                    >
                      <Box p={2} color="gray.600">
                        {/* My Identity Icon */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                      </Box>
                      <Text fontWeight="semibold" fontSize="sm" color="gray.700">My Identity</Text>
                    </HStack>

                    <HStack
                      px={5} py={4} cursor="pointer"
                      _hover={{ bg: 'blue.50' }}
                      transition="0.2s"
                      onClick={() => { setIsMenuOpen(false); router.push('/dashboard/settings'); }}
                    >
                      <Box p={2} color="gray.600">
                        {/* System Settings Icon */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                      </Box>
                      <Text fontWeight="semibold" fontSize="sm" color="gray.700">System Settings</Text>
                    </HStack>

                    <Box px={5} py={4} mt={2} borderTop="1px solid" borderColor="gray.100">
                      <HStack
                        justify="center"
                        cursor="pointer"
                        color="red.500"
                        _hover={{ transform: 'scale(1.02)' }}
                        transition="0.2s"
                        onClick={handleLogout}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <Text fontWeight="black" fontSize="sm">Sign Out</Text>
                      </HStack>
                    </Box>
                  </VStack>
                </Box>
              )}
            </Box>
          )}
        </HStack>
      </Flex>
    </Box>
  )
}
