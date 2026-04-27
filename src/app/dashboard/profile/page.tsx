'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Box, Button, Flex, Heading, Text, VStack, Avatar,
  Spinner, Center, useToast, Badge, SimpleGrid,
  Separator, Input, Icon, HStack
} from '@chakra-ui/react'
import { FiCamera, FiUser, FiMail, FiShield, FiStar, FiCalendar, FiUploadCloud } from 'react-icons/fi'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Load auth user from local storage
    const stored = localStorage.getItem('user')
    if (stored) {
      const parsedUser = JSON.parse(stored)
      setUser(parsedUser)
      fetchProfile(parsedUser.id)
    } else {
      window.location.href = '/login'
    }
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const res = await fetch(`/api/profile?userId=${userId}`)
      const data = await res.json()
      if (data.user) {
        setProfileData(data.user)
        
        // Update local storage if DB has newer picture (like from another device)
        if (user && data.user.picture !== user.picture) {
          const updatedUser = { ...user, picture: data.user.picture }
          localStorage.setItem('user', JSON.stringify(updatedUser))
          setUser(updatedUser)
          window.dispatchEvent(new CustomEvent('user-update', { detail: updatedUser }))
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert('File is too large. Please choose an image under 2MB.')
      return
    }

    setIsUploading(true)
    const reader = new FileReader()
    
    reader.onloadend = async () => {
      const base64String = reader.result as string
      
      try {
        const res = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: user.id, picture: base64String })
        })
        
        const data = await res.json()
        if (data.user) {
          setProfileData(data.user)
          const updatedUser = { ...user, picture: data.user.picture }
          localStorage.setItem('user', JSON.stringify(updatedUser))
          setUser(updatedUser)
          window.dispatchEvent(new CustomEvent('user-update', { detail: updatedUser }))
        }
      } catch (error) {
        console.error('Failed to update picture', error)
        alert('Failed to update picture. Please try again.')
      } finally {
        setIsUploading(false)
      }
    }

    reader.readAsDataURL(file)
  }

  if (isLoading || !profileData) return (
    <Center minH="calc(100vh - 100px)">
      <Spinner size="xl" color="blue.500" />
    </Center>
  )

  const roleLabels: Record<string, string> = {
    admin: 'Administrator',
    student: 'Student Learner',
    user_system: 'Platform Staff'
  }

  const roleColors: Record<string, string> = {
    admin: 'red',
    student: 'blue',
    user_system: 'purple'
  }

  return (
    <Box maxW="850px" mx="auto" p={{ base: 4, md: 8 }}>
      <VStack gap={6} align="stretch">
        <Box 
          bg="white" 
          rounded="2xl" 
          shadow="lg" 
          p={{ base: 6, md: 10 }} 
          borderWidth="1px"
          borderColor="gray.100"
        >
          <Flex direction={{ base: 'column', md: 'row' }} gap={10} align={{ base: 'center', md: 'flex-start' }}>
            
            {/* Left: Avatar Changer */}
            <VStack gap={4} width="200px">
              <Box position="relative" cursor="pointer" onClick={() => fileInputRef.current?.click()}>
                <Box 
                  w="140px" h="140px" 
                  rounded="full" 
                  overflow="hidden" 
                  border="4px solid white" 
                  shadow="md"
                  position="relative"
                >
                  {profileData.picture ? (
                    <img 
                      src={profileData.picture} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isUploading ? 'blur(4px)' : 'none', transition: '0.3s' }}
                      alt="Profile"
                    />
                  ) : (
                    <Center w="full" h="full" bg="#f1f5f9">
                      <FiUser size={50} color="#94a3b8" />
                    </Center>
                  )}

                  {/* Hover Overlay */}
                  <Flex 
                    position="absolute" 
                    inset={0} 
                    bg="blackAlpha.600" 
                    opacity={0} 
                    _hover={{ opacity: 1 }}
                    transition="all 0.3s"
                    align="center" justify="center" direction="column" gap={1}
                  >
                    <FiCamera color="white" size={20} />
                    <Text color="white" fontSize="10px" fontWeight="bold">Change</Text>
                  </Flex>

                  {/* Upload Spinner */}
                  {isUploading && (
                    <Center position="absolute" inset={0} bg="blackAlpha.400">
                      <Spinner color="white" size="md" />
                    </Center>
                  )}
                </Box>
                
                {/* Upload Button */}
                <Button 
                  size="sm" 
                  variant="outline" 
                  colorScheme="blue" 
                  w="full" 
                  mt={4} 
                  shadow="sm"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  disabled={isUploading}
                >
                  <FiUploadCloud style={{ marginRight: '8px' }} /> Upload New
                </Button>
                
                {/* Hidden File Input */}
                <Input 
                  type="file" 
                  accept="image/png, image/jpeg, image/webp" 
                  hidden 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                />
              </Box>
              <Text fontSize="10px" color="gray.400" textAlign="center">
                JPG or PNG. Max 2MB.
              </Text>
            </VStack>

            <Separator orientation="vertical" h="180px" display={{ base: 'none', md: 'block' }} />

            {/* Right: User Details */}
            <VStack align="flex-start" flex={1} gap={6} w="full">
              <Box w="full">
                <HStack justify="space-between" align="center" mb={1}>
                  <Heading size="lg" color="gray.800" fontWeight="black" letterSpacing="-0.5px">
                    {profileData.name}
                  </Heading>
                  <Badge 
                    colorPalette={roleColors[profileData.role] || 'gray'} 
                    px={3} py={1} 
                    rounded="full" 
                    fontSize="xs"
                    fontWeight="bold"
                    letterSpacing="wide"
                  >
                    {roleLabels[profileData.role] || profileData.role.toUpperCase()}
                  </Badge>
                </HStack>
                <Text color="gray.500" fontSize="sm" fontWeight="medium">
                  Settings & Details
                </Text>
              </Box>

              <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4} w="full" mt={2}>
                <Box p={4} rounded="xl" bg="gray.50" borderWidth="1px" borderColor="gray.100">
                  <HStack color="gray.500" mb={1}>
                    <FiUser size={14} />
                    <Text fontSize="10px" fontWeight="bold" letterSpacing="wide">NAME</Text>
                  </HStack>
                  <Text fontWeight="bold" fontSize="sm" color="gray.800">{profileData.name}</Text>
                </Box>

                 <Box p={4} rounded="xl" bg="gray.50" borderWidth="1px" borderColor="gray.100">
                  <HStack color="gray.500" mb={1}>
                    <FiMail size={14} />
                    <Text fontSize="10px" fontWeight="bold" letterSpacing="wide">EMAIL</Text>
                  </HStack>
                  <Text fontWeight="bold" fontSize="sm" color="gray.800" isTruncated>{profileData.email}</Text>
                </Box>
              </SimpleGrid>
            </VStack>
          </Flex>
        </Box>
      </VStack>
    </Box>
  )
}
