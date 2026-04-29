'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
  HStack,
  Icon
} from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { FiUser, FiMail, FiLock, FiSend, FiEye, FiCheckCircle } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Read URL params pre-filled from Google OAuth if user is new
    const urlEmail = searchParams.get('email')
    const urlName = searchParams.get('name')
    const fromGoogle = searchParams.get('from_google')

    if (urlEmail) setEmail(decodeURIComponent(urlEmail))
    if (urlName) setName(decodeURIComponent(urlName))
    
    if (fromGoogle) {
      setStatus({ type: 'info', message: 'Almost there! Please fill in the missing fields below (like a password and your role) to finish creating your account.' })
    }
  }, [searchParams])

  useEffect(() => {
    // Show temporary messages for 5 seconds, then disappear (unless it's the info message)
    if (status && status.type !== 'info') {
      const timer = setTimeout(() => {
        setStatus(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [status])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus(null)

    if (!name || !email || !password || !role) {
      setStatus({ type: 'error', message: 'Action Failed: Please fill in all fields and select a role.' })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      })

      const data = await response.json()

      if (response.ok) {
        setStatus({ type: 'success', message: 'Account created! Redirecting to verification...' })
        setTimeout(() => router.push(`/verify-otp?email=${encodeURIComponent(email)}`), 2000)
      } else {
        setStatus({ type: 'error', message: data.message || 'Registration failed' })
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
            background="linear-gradient(to bottom right, #0daaf9, #14d590)" 
            color="white" 
            p={{ base: 8, md: 10 }}
            display="flex" 
            flexDirection="column" 
            justifyContent="space-between"
          >
            <VStack gap={4} align="flex-start" mt={6}>
              <Heading size="xl" fontWeight="extrabold" letterSpacing="tight" mb={4}>
                Join Fursa.Link
              </Heading>
              
              <HStack gap={3}>
                <FiCheckCircle size={20} color="white" />
                <Text fontWeight="medium" fontSize="sm">AI-powered assistance</Text>
              </HStack>
              <HStack gap={3}>
                <FiCheckCircle size={20} color="white" />
                <Text fontWeight="medium" fontSize="sm">Certificate tracking</Text>
              </HStack>
            </VStack>

            {/* Steps at bottom */}
            <HStack gap={3} justify="center" mt={10}>
              <VStack gap={1}>
                <Flex align="center" justify="center" w="32px" h="32px" rounded="full" borderWidth="2px" borderColor="white" bg="transparent">
                  <Text fontSize="xs" fontWeight="bold" color="white">1</Text>
                </Flex>
                <Text fontSize="2xs" fontWeight="bold" color="white">Register</Text>
              </VStack>
              <Box w="20px" h="1px" bg="whiteAlpha.500" mb={4} />
              <VStack gap={1}>
                <Flex align="center" justify="center" w="32px" h="32px" rounded="full" borderWidth="1px" borderColor="whiteAlpha.500" bg="transparent">
                  <Text fontSize="xs" color="whiteAlpha.700">2</Text>
                </Flex>
                <Text fontSize="2xs" color="whiteAlpha.700" whiteSpace="nowrap">Verify OTP</Text>
              </VStack>
              <Box w="20px" h="1px" bg="whiteAlpha.500" mb={4} />
              <VStack gap={1}>
                <Flex align="center" justify="center" w="32px" h="32px" rounded="full" borderWidth="1px" borderColor="whiteAlpha.500" bg="transparent">
                  <Text fontSize="xs" color="whiteAlpha.700">3</Text>
                </Flex>
                <Text fontSize="2xs" color="whiteAlpha.700">Login</Text>
              </VStack>
            </HStack>
          </Box>

          {/* Right Side: Form */}
          <Box flex="1.2" p={{ base: 6, md: 10 }} bg="white" position="relative">
            <VStack gap={4} align="stretch" mt={2}>
              <Box mb={2}>
                <Heading size="xl" color="#1a202c" fontWeight="extrabold" letterSpacing="tight">Create Account</Heading>
              </Box>

              {status && (
                <Box 
                  p={4} 
                  rounded="xl" 
                  bg={status.type === 'success' ? '#f0fdf4' : status.type === 'info' ? '#eff6ff' : '#fef2f2'} 
                  borderWidth="1px"
                  borderColor={status.type === 'success' ? '#bbf7d0' : status.type === 'info' ? '#bfdbfe' : '#fecaca'}
                  color={status.type === 'success' ? '#16a34a' : status.type === 'info' ? '#1e40af' : '#dc2626'}
                >
                  <Text fontSize="sm" fontWeight="bold" textAlign="center">{status.message}</Text>
                </Box>
              )}

              <form onSubmit={handleRegister}>
                <VStack gap={5}>
                  <Box w="full">
                    <Text mb={2} fontSize="xs" fontWeight="bold" color="#4a5568" letterSpacing="wide">
                      FULL NAME
                    </Text>
                    <Box position="relative">
                      <Box position="absolute" left={4} top="50%" transform="translateY(-50%)" zIndex={2}>
                        <FiUser color="#a0aec0" size={18} />
                      </Box>
                      <Input 
                        placeholder="John Doe" 
                        bg="transparent" 
                        pl={10} py={5} rounded="lg" borderWidth="2px" borderColor="#e2e8f0" color="#2d3748" fontWeight="medium"
                        value={name} onChange={(e) => setName(e.target.value)}
                        _focus={{ borderColor: "#8b5cf6", boxShadow: "outline" }}
                        _placeholder={{ color: "#a0aec0" }}
                      />
                    </Box>
                  </Box>

                  <Box w="full">
                    <Text mb={2} fontSize="xs" fontWeight="bold" color="#4a5568" letterSpacing="wide">
                      EMAIL ADDRESS
                    </Text>
                    <Box position="relative">
                      <Box position="absolute" left={4} top="50%" transform="translateY(-50%)" zIndex={2}>
                        <FiMail color="#a0aec0" size={18} />
                      </Box>
                      <Input 
                        type="email"
                        placeholder="you@example.com" 
                        bg="transparent" 
                        pl={10} py={5} rounded="lg" borderWidth="2px" borderColor="#e2e8f0" color="#2d3748" fontWeight="medium"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        _focus={{ borderColor: "#8b5cf6", boxShadow: "outline" }}
                        _placeholder={{ color: "#a0aec0" }}
                      />
                    </Box>
                  </Box>

                  <Box w="full">
                    <Text mb={2} fontSize="xs" fontWeight="bold" color="#4a5568" letterSpacing="wide">
                      ROLE
                    </Text>
                    <Box position="relative">
                      <select 
                        value={role} 
                        onChange={(e) => setRole(e.target.value)}
                        style={{ 
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: '2px solid #e2e8f0',
                          backgroundColor: 'transparent',
                          color: '#2d3748',
                          fontWeight: '500',
                          appearance: 'none',
                          WebkitAppearance: 'none',
                          outline: 'none'
                        }}
                      >
                        <option value="">--select--</option>
                        <option value="student">Student</option>
                        <option value="user_system">User System</option>
                        <option value="admin">Admin</option>
                      </select>
                      <Box position="absolute" right={4} top="50%" transform="translateY(-50%)" pointerEvents="none" zIndex={2}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a0aec0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </Box>
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
                        pl={10} pr={10} py={5} rounded="lg" borderWidth="2px" borderColor="#e2e8f0" color="#2d3748" fontWeight="medium"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        _focus={{ borderColor: "#8b5cf6", boxShadow: "outline" }}
                        _placeholder={{ color: "#a0aec0" }}
                      />
                      <Box position="absolute" right={4} top="50%" transform="translateY(-50%)" zIndex={2} cursor="pointer" onClick={() => setShowPassword(!showPassword)}>
                        <FiEye color="#a0aec0" size={18} />
                      </Box>
                    </Box>
                  </Box>
                  
                  <Button 
                    type="submit" 
                    background="linear-gradient(to right, #8b5cf6, #22c55e)" 
                    _hover={{ background: "linear-gradient(to right, #7c3aed, #16a34a)" }}
                    color="white" fontWeight="bold" w="full" size="lg" py={6} rounded="lg" mt={2} shadow="md" loading={isLoading} border="none"
                  >
                     Create Account <FiSend style={{ marginLeft: '8px' }} />
                  </Button>
                </VStack>
              </form>

              <VStack mt={4}>
                <Text fontSize="sm" color="#718096">
                  Already have an account?{' '}
                  <Link href="/login" style={{ color: '#8b5cf6', fontWeight: 'bold' }}>
                    Sign in
                  </Link>
                </Text>
              </VStack>

            </VStack>
          </Box>
        </Flex>
      </Flex>

      <Footer />
    </Flex>
  )
}
