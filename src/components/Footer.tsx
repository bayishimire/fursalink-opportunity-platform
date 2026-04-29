'use client'

import { Box, Container, Flex, HStack, Text, VStack, Icon, Link as ChakraLink, SimpleGrid } from '@chakra-ui/react'
import { FaWhatsapp, FaYoutube, FaInstagram, FaXTwitter } from 'react-icons/fa6'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    {
      icon: FaWhatsapp,
      label: 'WhatsApp',
      href: 'https://chat.whatsapp.com/DDyMtIB3P1sImRGeliAjl4?mode=gi_t',
      color: '#25D366'
    },
    {
      icon: FaYoutube,
      label: 'YouTube',
      href: 'https://www.youtube.com/@samu.connect',
      color: '#FF0000'
    },
    {
      icon: FaInstagram,
      label: 'Instagram',
      href: 'https://www.instagram.com/stories/cyber.hub22/3882911736865151776?utm_source=ig_story_item_share&igsh=aHJjNHJ6aWVqeTY5',
      color: '#E4405F'
    },
    {
      icon: FaXTwitter,
      label: 'X',
      href: 'https://x.com', // User requested X, provided general link or just the name
      color: '#000000'
    }
  ]

  return (
    <Box bg="gray.950" color="white" pt={16} pb={8} mt="auto" borderTop="1px solid" borderColor="whiteAlpha.100">
      <Container maxW="7xl">
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={12} mb={16}>
          {/* Brand/About Section */}
          <VStack align="flex-start" gap={6}>
            <Box>
              <img src="/logo.png" alt="Fursa.Link Logo" style={{ height: '50px', filter: 'brightness(1.2)' }} />
            </Box>
            <Text color="gray.400" fontSize="sm" lineHeight="tall">
              Empowering careers through curated opportunities. Fursa.Link is your gateway to local and global jobs, scholarships, and professional growth.
            </Text>
          </VStack>

          {/* Quick Links Section */}
          <VStack align="flex-start" gap={6}>
            <Text fontWeight="bold" fontSize="lg" letterSpacing="wider">RESOURCES</Text>
            <HStack gap={10} align="flex-start">
              <VStack align="flex-start" gap={3}>
                <ChakraLink href="#" fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>Jobs</ChakraLink>
                <ChakraLink href="#" fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>Scholarships</ChakraLink>
                <ChakraLink href="#" fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>Courses</ChakraLink>
              </VStack>
              <VStack align="flex-start" gap={3}>
                <ChakraLink href="#" fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>Support</ChakraLink>
                <ChakraLink href="#" fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>About Us</ChakraLink>
                <ChakraLink href="#" fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>Privacy</ChakraLink>
              </VStack>
            </HStack>
          </VStack>

          {/* Social Section */}
          <VStack align="flex-start" gap={6}>
            <Text fontWeight="bold" fontSize="lg" letterSpacing="wider">CONNECT WITH US</Text>
            <HStack gap={4}>
              {socialLinks.map((social) => (
                <ChakraLink
                  key={social.label}
                  href={social.href}
                  bg="whiteAlpha.100"
                  p={3}
                  rounded="full"
                  transition="all 0.3s"
                  _hover={{
                    bg: social.color,
                    transform: 'translateY(-3px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                  }}
                >
                  <Icon as={social.icon} boxSize={5} />
                </ChakraLink>
              ))}
            </HStack>
            <Text fontSize="xs" color="gray.500">
              Join our community and follow our latest updates across all platforms.
            </Text>
          </VStack>
        </SimpleGrid>

        <Box pt={8} borderTop="1px solid" borderColor="whiteAlpha.100">
          <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="center" gap={4}>
            <Text fontSize="sm" color="gray.500" suppressHydrationWarning>
              &copy; {currentYear} Fursa.Link. All rights reserved.
            </Text>
            <HStack gap={6} fontSize="xs" color="gray.600">
              <Text cursor="pointer" _hover={{ color: 'gray.400' }}>Terms of Service</Text>
              <Text cursor="pointer" _hover={{ color: 'gray.400' }}>Cookies Settings</Text>
            </HStack>
          </Flex>
        </Box>
      </Container>
    </Box>
  )
}
