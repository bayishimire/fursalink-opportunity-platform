'use client'

import { Box, Container, Heading, Text, VStack, Flex } from '@chakra-ui/react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export default function About() {
  return (
    <Flex direction="column" minH="100vh" bg="gray.50">
      <Navbar />

      <Flex flex={1} direction="column" align="center" justify="center" p={{ base: 4, md: 10 }}>
        <Container maxW="4xl" bg="white" p={{ base: 8, md: 16 }} rounded="3xl" shadow="xl" textAlign="center" border="1px solid" borderColor="gray.100">
          <VStack gap={8}>
            <Heading size="4xl" color="blue.900" fontWeight="black" letterSpacing="tight">
              About Fursa.Link
            </Heading>
            <Text fontSize="xl" color="gray.600" lineHeight="tall" fontWeight="medium">
              Fursa.Link is a premium platform connecting talented individuals with top-tier jobs, elite scholarships, and transformative learning opportunities around the globe. Our mission is to bridge the gap between potential and success by ensuring every ambitious individual has access to the best career-accelerating opportunities.
            </Text>
            <Box w="80px" h="6px" background="linear-gradient(135deg, #14d590 0%, #0daaf9 100%)" rounded="full" />
            <Text fontSize="lg" color="gray.500" fontWeight="bold">
              We focus on delivering high-fidelity, verified listings directly to your dashboard. Whether you are a student exploring scholarships or a seasoned professional seeking a breakthrough role, Fursa.Link is your gateway.
            </Text>
          </VStack>
        </Container>
      </Flex>

      <Footer />
    </Flex>
  )
}
