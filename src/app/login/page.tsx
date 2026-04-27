'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
  HStack,
  IconButton
} from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { HiFingerPrint } from 'react-icons/hi'
import { FiUser, FiLock, FiEye, FiLogIn, FiUserPlus, FiKey, FiHeadphones, FiAlertTriangle } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'warning', message: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Read URL error params
    const errorParam = searchParams.get('error')
    if (errorParam === 'google_not_configured') {
      setStatus({ type: 'warning', message: '⚠️ Google Sign-In is not configured yet. Please add your Google Client ID & Secret in .env.local to activate it.' })
    } else if (errorParam === 'google_failed' || errorParam === 'token_failed') {
      setStatus({ type: 'error', message: 'Google Sign-In failed. Please try again or use email login.' })
    }
  }, [searchParams])

  useEffect(() => {
    // Show temporary messages for 5 seconds, then disappear
    if (status?.type !== 'warning' && status) {
      const timer = setTimeout(() => setStatus(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [status])

  useEffect(() => {
    // Click outside handler for menu
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password }) // username field is used for email
      })

      const data = await response.json()

      if (response.ok) {
        if (!data.user.is_verified) {
          setStatus({ type: 'warning', message: 'Account not verified. Redirecting to OTP verification...' })
          setTimeout(() => router.push(`/verify-otp?email=${encodeURIComponent(data.user.email)}`), 2000)
          return
        }

        setStatus({ type: 'success', message: `Welcome back, ${data.user.name}!` })

        // Save user info for session persistence
        localStorage.setItem('user', JSON.stringify(data.user))

        const role = data.user.role
        setTimeout(() => {
          if (role === 'admin') router.push('/dashboard/admin')
          else if (role === 'user_system') router.push('/dashboard/user_system')
          else router.push('/dashboard/student')
        }, 1500)
      } else {
        setStatus({ type: 'error', message: data.message || 'Login failed' })
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Connection error. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Flex direction="column" minH="100vh" bg="#f4f7f6" position="relative">
      <Navbar />

      <Flex flex={1} align="center" justify="center" p={{ base: 4, md: 8 }}>
        <Flex
          w="full"
          maxW="850px"
          bg="white"
          rounded="3xl"
          shadow="2xl"
          overflow="hidden"
          direction={{ base: 'column', md: 'row' }}
        >
          {/* Left Side: Gradient Banner */}
          <Box
            flex="1"
            background="linear-gradient(to bottom right, #14d590, #0daaf9, #3f4dfa)"
            color="white"
            p={{ base: 8, md: 10 }}
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
          >
            <VStack gap={4} align="center" mt={6}>
              <Box p={3} rounded="3xl" bg="whiteAlpha.200" borderWidth="1px" borderColor="whiteAlpha.400">
                <HiFingerPrint size={48} color="white" />
              </Box>
              <Heading size="xl" fontWeight="extrabold" textAlign="center" mt={2} letterSpacing="tight">
                Welcome Back
              </Heading>
              <Text textAlign="center" fontSize="sm" color="whiteAlpha.900" maxW="220px" lineHeight="tall">
                Sign in to access your workspace and community.
              </Text>
            </VStack>

            {/* Steps at bottom */}
            <HStack gap={3} justify="center" mt={10}>
              <VStack gap={1}>
                <Flex align="center" justify="center" w="32px" h="32px" rounded="full" borderWidth="2px" borderColor="white" bg="transparent">
                  <Text fontSize="xs" fontWeight="bold" color="white">1</Text>
                </Flex>
                <Text fontSize="2xs" fontWeight="bold" color="white">Login</Text>
              </VStack>
              <Box w="20px" h="1px" bg="whiteAlpha.500" mb={4} />
              <VStack gap={1}>
                <Flex align="center" justify="center" w="32px" h="32px" rounded="full" borderWidth="1px" borderColor="whiteAlpha.500" bg="transparent">
                  <Text fontSize="xs" color="whiteAlpha.700">2</Text>
                </Flex>
                <Text fontSize="2xs" color="whiteAlpha.700">Verify</Text>
              </VStack>
              <Box w="20px" h="1px" bg="whiteAlpha.500" mb={4} />
              <VStack gap={1}>
                <Flex align="center" justify="center" w="32px" h="32px" rounded="full" borderWidth="1px" borderColor="whiteAlpha.500" bg="transparent">
                  <Text fontSize="xs" color="whiteAlpha.700">3</Text>
                </Flex>
                <Text fontSize="2xs" color="whiteAlpha.700">Dashboard</Text>
              </VStack>
            </HStack>
          </Box>

          {/* Right Side: Form */}
          <Box flex="1.2" p={{ base: 6, md: 10 }} bg="white" position="relative">
            {/* Top Right Dots Menu */}
            <Box position="absolute" top={4} right={4} ref={menuRef}>
              <Box
                w="8"
                h="8"
                rounded="xl"
                bg="#f4f7f6"
                display="flex"
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                _hover={{ bg: "#e2e8f0" }}
                transition="background 0.2s"
              >
                <Text color="#8b5cf6" fontWeight="extrabold" fontSize="lg" mt="-8px" letterSpacing="widest">...</Text>
              </Box>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <Box
                  position="absolute"
                  top="110%"
                  right={0}
                  bg="white"
                  shadow="xl"
                  rounded="2xl"
                  borderWidth="1px"
                  borderColor="#e2e8f0"
                  w="200px"
                  py={2}
                  zIndex={50}
                >
                  <VStack align="stretch" gap={0}>
                    <Flex align="center" gap={3} px={4} py={2} cursor="pointer" _hover={{ bg: "#f8fafc" }} onClick={() => router.push('/register')}>
                      <FiUserPlus color="#4a5568" size={14} />
                      <Text fontSize="sm" fontWeight="medium" color="#2d3748">Create Account</Text>
                    </Flex>
                    <Flex align="center" gap={3} px={4} py={2} cursor="pointer" _hover={{ bg: "#f8fafc" }}>
                      <FiKey color="#4a5568" size={14} />
                      <Text fontSize="sm" fontWeight="medium" color="#2d3748">Forgot Password</Text>
                    </Flex>
                    <Box h="1px" bg="#e2e8f0" my={1} mx={3} />
                    <Flex align="center" gap={3} px={4} py={2} cursor="pointer" _hover={{ bg: "#f8fafc" }}>
                      <FiHeadphones color="#4a5568" size={14} />
                      <Text fontSize="sm" fontWeight="medium" color="#2d3748">Support</Text>
                    </Flex>
                  </VStack>
                </Box>
              )}
            </Box>

            <VStack gap={4} align="stretch" mt={2}>
              <Box mb={2}>
                <Heading size="xl" color="#1a202c" fontWeight="extrabold" letterSpacing="tight">Sign In</Heading>
              </Box>

              {status && (
                <Box
                  p={4}
                  rounded="xl"
                  bg={status.type === 'success' ? '#f0fdf4' : status.type === 'warning' ? '#fffbeb' : '#fef2f2'}
                  borderWidth="1px"
                  borderColor={status.type === 'success' ? '#bbf7d0' : status.type === 'warning' ? '#fde68a' : '#fecaca'}
                  color={status.type === 'success' ? '#16a34a' : status.type === 'warning' ? '#92400e' : '#dc2626'}
                >
                  <Text fontSize="sm" fontWeight="bold">{status.message}</Text>
                </Box>
              )}

              <form onSubmit={handleLogin}>
                <VStack gap={5}>
                  <Box w="full">
                    <Text mb={2} fontSize="xs" fontWeight="bold" color="#4a5568" letterSpacing="wide">
                      USERNAME OR EMAIL
                    </Text>
                    <Box position="relative">
                      <Box position="absolute" left={4} top="50%" transform="translateY(-50%)" zIndex={2}>
                        <FiUser color="#a0aec0" size={18} />
                      </Box>
                      <Input
                        placeholder="Email or Username"
                        bg="transparent"
                        pl={10} py={5} rounded="lg" borderWidth="2px" borderColor="#e2e8f0" color="#2d3748" fontWeight="medium"
                        value={username} onChange={(e) => setUsername(e.target.value)}
                        _focus={{ borderColor: "#8b5cf6", boxShadow: "outline" }}
                        _placeholder={{ color: "#a0aec0" }}
                      />
                    </Box>
                  </Box>
                  <Box w="full">
                    <Text mb={2} fontSize="xs" fontWeight="bold" color="#4a5568" letterSpacing="wide">
                      PASSWORD
                    </Text>
                    <Box position="relative">
                      <Box position="absolute" left={4} top="50%" transform="translateY(-50%)" zIndex={2}>
                        <FiLock color="#a0aec0" size={18} />
                      </Box>
                      <Input
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        bg="transparent"
                        pl={10}
                        pr={10}
                        py={5}
                        rounded="lg"
                        borderWidth="2px"
                        borderColor="#e2e8f0"
                        color="#2d3748"
                        fontWeight="medium"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        _focus={{ borderColor: "#0daaf9", boxShadow: "outline" }}
                        _placeholder={{ color: "#a0aec0" }}
                      />
                      <Box
                        position="absolute"
                        right={4}
                        top="50%"
                        transform="translateY(-50%)"
                        zIndex={2}
                        cursor="pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <FiEye color="#a0aec0" size={18} />
                      </Box>
                    </Box>
                  </Box>

                  <Button
                    type="submit"
                    background="linear-gradient(to right, #1dd389, #08aeea)"
                    _hover={{ background: "linear-gradient(to right, #15b976, #0796ca)" }}
                    color="white"
                    fontWeight="bold"
                    w="full"
                    size="lg"
                    py={6}
                    rounded="lg"
                    mt={2}
                    shadow="md"
                    loading={isLoading}
                    border="none"
                  >
                    <FiLogIn style={{ marginRight: '8px' }} /> Sign In
                  </Button>
                </VStack>
              </form>

              <Flex align="center" gap={4} mt={3}>
                <Box flex="1" h="1px" bg="#e2e8f0" />
                <Text fontSize="xs" color="#a0aec0" fontWeight="bold" whiteSpace="nowrap">or continue with</Text>
                <Box flex="1" h="1px" bg="#e2e8f0" />
              </Flex>

              <VStack gap={6} mt={2}>
                <Flex
                  w="full"
                  py={3}
                  borderWidth="2px"
                  borderColor="#22c55e"
                  bg="#f0fdf4"
                  rounded="xl"
                  justify="center"
                  align="center"
                  cursor="pointer"
                  _hover={{ bg: '#dcfce7', borderColor: '#22c55e', transform: 'translateY(-1px)', shadow: 'md' }}
                  transition="all 0.2s"
                  title="Continue with Google (requires Google Cloud credentials)"
                  onClick={() => window.location.href = '/api/auth/google'}
                >
                  <FcGoogle size={24} />
                  <Text ml={3} color="#1a202c" fontWeight="bold" fontSize="md">Continue with Google</Text>
                </Flex>

                <Text fontSize="sm" color="#718096">
                  Don&apos;t have an account?{' '}
                  <Link href="/register" style={{ color: '#8b5cf6', fontWeight: 'bold' }}>
                    Create one now
                  </Link>
                </Text>
              </VStack>
            </VStack>
          </Box>
        </Flex>
      </Flex>

      {/* Floating WhatsApp Button */}
      <Box position="fixed" bottom={8} right={8} zIndex={100}>
        <Flex
          bg="#25D366"
          w="60px"
          h="60px"
          rounded="full"
          justify="center"
          align="center"
          shadow="xl"
          cursor="pointer"
          _hover={{ transform: 'scale(1.05)' }}
          transition="all 0.2s"
        >
          <FaWhatsapp size={32} color="white" />
        </Flex>
      </Box>

      <Footer />
    </Flex>
  )
}
