'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Box, Button, Flex, Heading, Text, VStack, Avatar,
  Spinner, Center, useToast, Badge, SimpleGrid,
  Separator, Input, Icon, HStack
} from '@chakra-ui/react'
import { FiCamera, FiUser, FiMail, FiShield, FiStar, FiCalendar, FiUploadCloud, FiSave, FiCheckCircle } from 'react-icons/fi'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editName, setEditName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }

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
        setEditName(data.user.name)
        
        // Update local storage if DB has newer picture or name (like from another device)
        if (user && (data.user.picture !== user.picture || data.user.name !== user.name)) {
          const updatedUser = { ...user, name: data.user.name, picture: data.user.picture }
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
      showToast('File is too large. Max 2MB.', 'error')
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
          showToast('Profile photo updated successfully')
        }
      } catch (error) {
        console.error('Failed to update picture', error)
        showToast('Failed to update picture', 'error')
      } finally {
        setIsUploading(false)
      }
    }

    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      showToast('Name cannot be empty', 'error')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, name: editName })
      })
      
      const data = await res.json()
      if (data.user) {
        setProfileData(data.user)
        const updatedUser = { ...user, name: data.user.name }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
        window.dispatchEvent(new CustomEvent('user-update', { detail: updatedUser }))
        showToast('Identity updated across platform')
      }
    } catch (error) {
      console.error('Failed to update name', error)
      showToast('Failed to sync identity', 'error')
    } finally {
      setIsSaving(false)
    }
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
      {/* Toast Notification */}
      <style>{`@keyframes slideInRight { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
      {toast && (
        <Box position="fixed" top="24px" right="24px" zIndex={9999} bg={toast.type === 'success' ? 'green.500' : 'red.500'} color="white" px={5} py={3} rounded="2xl" shadow="2xl" display="flex" alignItems="center" gap={3} style={{ animation: 'slideInRight 0.3s ease-out' }}>
          <Icon as={toast.type === 'success' ? FiCheckCircle : FiShield} />
          <Text fontWeight="bold" fontSize="13px">{toast.message}</Text>
        </Box>
      )}

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
                  bg="gray.50"
                  _hover={{ shadow: 'xl' }}
                  transition="0.3s"
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
                   colorPalette="blue"
                  w="full" 
                  mt={4} 
                  shadow="sm"
                  rounded="xl"
                  fontWeight="black"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  disabled={isUploading}
                >
                  <FiUploadCloud style={{ marginRight: '8px' }} /> Upload New
                </Button>
                
                {/* Hidden File Input */}
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/webp" 
                  hidden 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                />
              </Box>
              <Text fontSize="10px" color="gray.400" textAlign="center" fontWeight="bold">
                JPG, PNG or WEBP. Max 2MB.
              </Text>
            </VStack>

            <Separator orientation="vertical" h="220px" display={{ base: 'none', md: 'block' }} />

            {/* Right: User Details */}
            <VStack align="flex-start" flex={1} gap={6} w="full">
              <Box w="full">
                <HStack justify="space-between" align="center" mb={1}>
                  <Heading size="lg" color="blue.900" fontWeight="900" letterSpacing="-0.5px">
                    Identity Management
                  </Heading>
                  <Badge 
                    colorPalette={roleColors[profileData.role] || 'gray'} 
                    px={3} py={1} 
                    rounded="full" 
                    fontSize="xs"
                    fontWeight="black"
                    variant="surface"
                  >
                    {roleLabels[profileData.role] || profileData.role.toUpperCase()}
                  </Badge>
                </HStack>
                <Text color="gray.500" fontSize="xs" fontWeight="bold">
                  Update your display name and profile aesthetics
                </Text>
              </Box>

              <VStack align="stretch" gap={4} w="full">
                <Box p={4} rounded="2xl" bg="gray.50" borderWidth="1px" borderColor="gray.100">
                  <HStack color="gray.400" mb={1.5}>
                    <FiUser size={12} />
                    <Text fontSize="10px" fontWeight="black" letterSpacing="1px">FULL NAME / DISPLAY IDENTITY</Text>
                  </HStack>
                  <Input 
                    variant="subtle" 
                    fontSize="sm" 
                    fontWeight="bold" 
                    value={editName} 
                    onChange={e => setEditName(e.target.value)} 
                    bg="white"
                    h="44px"
                    rounded="xl"
                    border="1px solid"
                    borderColor="gray.100"
                    _focus={{ borderColor: 'blue.300', bg: 'white' }}
                  />
                </Box>

                 <Box p={4} rounded="2xl" bg="gray.50" borderWidth="1px" borderColor="gray.100" opacity={0.8}>
                  <HStack color="gray.400" mb={1.5}>
                    <FiMail size={12} />
                    <Text fontSize="10px" fontWeight="black" letterSpacing="1px">PERMANENT EMAIL ADDRESS</Text>
                  </HStack>
                  <Text fontWeight="bold" fontSize="sm" color="gray.600" px={3}>{profileData.email}</Text>
                </Box>

                <Button 
                  w="full" 
                  h="50px" 
                  bg="blue.900" 
                  color="white" 
                  rounded="xl" 
                  fontWeight="black" 
                  fontSize="sm"
                  shadow="lg"
                  loading={isSaving}
                  onClick={handleSaveProfile}
                  _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                  gap={2}
                >
                  <FiSave /> SAVE IDENTITY SETTINGS
                </Button>
              </VStack>
            </VStack>
          </Flex>
        </Box>
      </VStack>
    </Box>
  )
}
