'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Box, Button, Center, Flex, Heading, HStack,
  Image, Text, VStack, Badge, Spinner
} from '@chakra-ui/react'
import { FiUser, FiShield, FiBookOpen, FiArrowRight, FiCheckCircle } from 'react-icons/fi'

const ROLES = [
  {
    id: 'student',
    label: 'Student',
    icon: <FiBookOpen size={32} />,
    description: 'I want to explore courses, apply for opportunities, and grow my skills.',
    color: 'blue',
    gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
  {
    id: 'user_system',
    label: 'Support Staff',
    icon: <FiUser size={32} />,
    description: 'I am a counselor or support member helping students navigate the platform.',
    color: 'purple',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    bg: '#f5f3ff',
    border: '#ddd6fe',
  },
]

function CompleteProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'select' | 'confirm' | 'done'>('select')

  useEffect(() => {
    const userParam = searchParams.get('user')
    if (userParam) {
      try {
        setUser(JSON.parse(decodeURIComponent(userParam)))
      } catch {
        router.replace('/login')
      }
    } else {
      router.replace('/login')
    }
  }, [searchParams, router])

  const handleConfirm = async () => {
    if (!user || !selectedRole) return
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, role: selectedRole }),
      })

      const data = await res.json()
      if (data.success) {
        const updatedUser = { ...user, role: selectedRole }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setStep('done')
        
        setTimeout(() => {
          const dashboardMap: Record<string, string> = {
            student: '/dashboard/student',
            user_system: '/dashboard/user_system',
          }
          router.push(dashboardMap[selectedRole] || '/dashboard/student')
        }, 1800)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return <Center minH="100vh"><Spinner size="xl" color="blue.500" /></Center>
  }

  if (step === 'done') {
    return (
      <Center minH="100vh" bg="white" flexDirection="column" gap={6}>
        <Box color="green.500"><FiCheckCircle size={64} /></Box>
        <Heading size="xl" color="blue.900" fontWeight="black">Profile Complete!</Heading>
        <Text color="gray.500">Redirecting to your dashboard...</Text>
        <Spinner color="blue.400" />
      </Center>
    )
  }

  return (
    <Flex minH="100vh" bg="#f8fafc">
      {/* Left: Gradient Panel */}
      <Box
        display={{ base: 'none', lg: 'flex' }}
        w="420px"
        background="linear-gradient(160deg, #1e3a8a, #1d4ed8, #3b82f6)"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        p={12}
        color="white"
        gap={6}
      >
        <Box
          boxSize="90px"
          rounded="full"
          overflow="hidden"
          border="4px solid rgba(255,255,255,0.4)"
          shadow="2xl"
          bg="white"
        >
          {user.picture ? (
            <Image src={user.picture} alt={user.name} w="full" h="full" objectFit="cover" />
          ) : (
            <Center h="full" bg="blue.100"><FiUser size={40} color="#1d4ed8" /></Center>
          )}
        </Box>

        <VStack gap={1}>
          <Heading size="xl" fontWeight="black">Hello, {user.name?.split(' ')[0]}!</Heading>
          <Text fontSize="sm" opacity={0.8}>{user.email}</Text>
          <Badge bg="whiteAlpha.200" color="white" px={3} py={1} rounded="full" mt={2}>
            GOOGLE AUTHENTICATED ✓
          </Badge>
        </VStack>

        <Box bg="whiteAlpha.100" rounded="2xl" p={6} mt={4} border="1px solid rgba(255,255,255,0.2)">
          <Text fontSize="sm" opacity={0.9} textAlign="center" lineHeight="tall">
            You're almost in! We just need to know your role so we can set up the perfect workspace for you.
          </Text>
        </Box>
      </Box>

      {/* Right: Role Selection */}
      <Flex flex={1} align="center" justify="center" p={8}>
        <Box w="full" maxW="550px">
          <VStack align="flex-start" gap={2} mb={10}>
            <Badge colorPalette="blue" px={3} py={1} rounded="full" fontSize="xs">STEP 2 OF 2</Badge>
            <Heading size="2xl" color="blue.900" fontWeight="black" letterSpacing="-1px">
              Select Your Role
            </Heading>
            <Text color="gray.500" fontSize="sm">
              Choose how you'll be using Fursa.Link. You can't change this later.
            </Text>
          </VStack>

          <VStack align="stretch" gap={4} mb={8}>
            {ROLES.map((role) => {
              const isSelected = selectedRole === role.id
              return (
                <Box
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  cursor="pointer"
                  p={6}
                  rounded="2xl"
                  border="2px solid"
                  borderColor={isSelected ? role.border : 'gray.100'}
                  bg={isSelected ? role.bg : 'white'}
                  shadow={isSelected ? 'lg' : 'sm'}
                  transition="all 0.25s"
                  _hover={{ shadow: 'lg', borderColor: role.border, transform: 'translateY(-2px)' }}
                  position="relative"
                >
                  <HStack gap={5} align="flex-start">
                    <Box
                      p={3}
                      rounded="xl"
                      style={{ background: role.gradient }}
                      color="white"
                      flexShrink={0}
                    >
                      {role.icon}
                    </Box>
                    <VStack align="flex-start" gap={1} flex={1}>
                      <Heading size="md" color="blue.900" fontWeight="black">{role.label}</Heading>
                      <Text fontSize="sm" color="gray.500" lineHeight="tall">{role.description}</Text>
                    </VStack>
                    {isSelected && (
                      <Box color="blue.500" flexShrink={0} mt={1}>
                        <FiCheckCircle size={22} />
                      </Box>
                    )}
                  </HStack>
                </Box>
              )
            })}
          </VStack>

          <Button
            w="full"
            h="56px"
            background="linear-gradient(to right, #1d4ed8, #3b82f6)"
            color="white"
            rounded="2xl"
            fontWeight="black"
            fontSize="md"
            _hover={{ background: 'linear-gradient(to right, #1e40af, #2563eb)', transform: 'translateY(-2px)', shadow: '2xl' }}
            transition="all 0.3s"
            disabled={!selectedRole}
            loading={isLoading}
            onClick={handleConfirm}
          >
            ENTER MY DASHBOARD <FiArrowRight style={{ marginLeft: '10px' }} />
          </Button>

          <Text fontSize="xs" color="gray.400" textAlign="center" mt={4}>
            By continuing, you agree to Fursa.Link's Terms of Service & Privacy Policy.
          </Text>
        </Box>
      </Flex>
    </Flex>
  )
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={<Center minH="100vh"><Spinner size="xl" /></Center>}>
      <CompleteProfileContent />
    </Suspense>
  )
}
