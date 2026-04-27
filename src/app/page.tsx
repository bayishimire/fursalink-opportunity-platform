'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Text,
  VStack,
  Badge,
  Spinner,
} from '@chakra-ui/react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { FiSearch, FiClock, FiArrowRight } from 'react-icons/fi'

export default function Home() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [dbJobs, setDbJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAuthAlert, setShowAuthAlert] = useState(false)
  const [selectedOpp, setSelectedOpp] = useState<any>(null)

  const calculateDaysRemaining = (deadline: string) => {
    if (!deadline || deadline === 'Self-Paced') return null;
    const target = new Date(deadline);
    const now = new Date();
    if (isNaN(target.getTime())) return null;
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  useEffect(() => {
    setMounted(true)
    fetch('/api/jobs')
      .then((res) => res.json())
      .then((data) => {
        if (data.jobs) setDbJobs(data.jobs)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (!mounted) return <div style={{ minHeight: '100vh', background: '#f9fafb' }} />;

  const opportunities = [
    {
      id: 999001,
      type: 'Job',
      title: 'Frontend Developer',
      description: 'TechCorp Inc. is looking for a skilled React developer with Chakra UI experience.',
      deadline: 'Oct 15',
      color: 'green'
    },
    {
      id: 999002,
      type: 'Scholarship',
      title: 'Global Excellence Award',
      description: 'Full funding available for international students pursuing a master\'s degree.',
      deadline: 'Nov 01',
      color: 'purple'
    },
    {
      id: 999003,
      type: 'Course',
      title: 'Advanced Next.js 15',
      description: 'Learn the latest features of Next.js including App Router and Server Components.',
      deadline: 'Self-Paced',
      color: 'orange'
    },
    {
      id: 999004,
      type: 'Job',
      title: 'Backend Engineer',
      description: 'Join our team to build scalable Node.js microservices and database systems.',
      deadline: 'Sep 30',
      color: 'green'
    },
    {
      id: 999005,
      type: 'Project',
      title: 'Digital Marketing Campaign',
      description: 'Launch a global marketing campaign focusing on SEO and social media engagement.',
      deadline: 'Dec 05',
      color: 'blue'
    },
    {
      id: 9990006,
      type: 'Scholarship',
      title: 'STEM Research Grant',
      description: 'Funding for innovative research projects in Science, Technology, and Engineering.',
      deadline: 'Jan 15',
      color: 'purple'
    }
  ]

  const mappedDbJobs = dbJobs.map((job) => ({
    ...job,
    id: job.id, // Keep numeric ID
    type: 'Job',
    color: 'green'
  }))

  const allOpps = [...mappedDbJobs, ...opportunities]

  // Filter opportunities in real-time
  const filteredOpps = allOpps.filter(opp =>
    opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Flex direction="column" minH="100vh" bg="gray.50">
      <Navbar />

      <Flex flex={1} direction="column">
        {/* Dynamic Hero Section */}
        <Box
          bg="white"
          pt={{ base: 6, md: 10 }}
          pb={{ base: 6, md: 10 }}
          borderBottom="1px solid"
          borderColor="gray.100"
          position="relative"
          overflow="hidden"
        >
          {/* Background Decorative Element */}
          <Box
            position="absolute"
            top="-10%"
            right="-5%"
            w="600px"
            h="600px"
            bg="blue.50"
            rounded="full"
            filter="blur(80px)"
            opacity={0.6}
            zIndex={0}
          />

          <Container maxW="7xl" position="relative" zIndex={1}>
            <VStack gap={3} textAlign="center">
              <Badge colorPalette="blue" px={4} py={1.5} rounded="full" fontSize="10px" fontWeight="black" letterSpacing="1px">
                GATEWAY TO ENDLESS OPPORTUNITIES
              </Badge>
              <Heading as="h1" fontSize={{ base: "3xl", md: "4xl" }} maxW="4xl" fontWeight="black" color="gray.900" letterSpacing="tight" lineHeight="1.1">
                Discover Your Next <Text as="span" color="blue.600">Breakthrough</Text>
              </Heading>
              <Text fontSize="14px" maxW="2xl" color="gray.500" fontWeight="medium">
                Fursa.Link is the premier platform connecting talent with the world&apos;s most impactful jobs, scholarships, and learning paths.
              </Text>

              <Box w="full" maxW="600px" mt={4}>
                <HStack
                  bg="white"
                  p={1.5}
                  rounded="xl"
                  shadow="lg"
                  borderWidth="1px"
                  borderColor="gray.200"
                  gap={0}
                >
                  <Box px={3} color="gray.400">
                    <FiSearch size={20} />
                  </Box>
                  <Input
                    placeholder="Search jobs, scholarships, or courses..."
                    variant="unstyled"
                    size="md"
                    flex={1}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    fontWeight="bold"
                    fontSize="14px"
                    _placeholder={{ color: "gray.300" }}
                  />
                  <Button
                    background="linear-gradient(135deg, #14d590 0%, #0daaf9 100%)"
                    color="white"
                    size="lg"
                    px={8}
                    height="46px"
                    rounded="lg"
                    fontWeight="black"
                    letterSpacing="1px"
                    fontSize="12px"
                    _hover={{ transform: 'scale(1.02)' }}
                    transition="0.2s"
                  >
                    SEARCH
                  </Button>
                </HStack>
              </Box>
            </VStack>
          </Container>
        </Box>

        {/* Opportunities Display Section */}
        <Container maxW="7xl" py={12}>

          

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {loading ? (
              <Flex justify="center" w="full" py={12} gridColumn={{ md: "span 2", lg: "span 3" }}>
                <Spinner size="xl" color="blue.500" />
              </Flex>
            ) : filteredOpps.length > 0 ? filteredOpps.map((opp) => (
              <Box
                key={opp.id}
                bg="white"
                p={5}
                rounded="2xl"
                shadow="sm"
                borderWidth="1px"
                borderColor="gray.100"
                transition="all 0.3s"
                _hover={{ shadow: 'xl', transform: 'translateY(-5px)', borderColor: 'blue.200' }}
                display="flex"
                flexDirection="column"
              >
                <Box h="150px" w="full" mb={4} rounded="xl" overflow="hidden" position="relative" bg="gray.100">
                  <img 
                    src={(opp as any).image_url || `https://picsum.photos/seed/${opp.id}/400/200`} 
                    alt={opp.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </Box>
                <Badge
                  colorPalette={opp.color}
                  mb={3}
                  px={2}
                  py={0.5}
                  rounded="md"
                  fontSize="9px"
                  fontWeight="black"
                  variant="surface"
                >
                  {opp.type}
                </Badge>
                <Heading fontSize="14px" mb={2} color="gray.800" fontWeight="extrabold">{opp.title}</Heading>
                <Text color="gray.500" mb={6} fontSize="12px" fontWeight="medium" lineHeight="short">
                  {opp.description}
                </Text>
                <Flex justify="space-between" align="center" mt="auto" pt={4} borderTop="1px solid" borderColor="gray.50">
                  <VStack align="flex-start" gap={1}>
                    <HStack color="red.500" fontWeight="black" fontSize="9px" gap={1.5}>
                      <FiClock />
                      <Text>{opp.deadline === 'Self-Paced' ? opp.deadline : `DEADLINE: ${opp.deadline}`}</Text>
                    </HStack>
                    {calculateDaysRemaining(opp.deadline) !== null && (
                      <Text fontSize="10px" fontWeight="black" color="blue.600" bg="blue.50" px={2} rounded="md">
                        {calculateDaysRemaining(opp.deadline)! > 0 
                          ? `${calculateDaysRemaining(opp.deadline)} DAYS REMAINING` 
                          : 'APPLICATION CLOSED'}
                      </Text>
                    )}
                  </VStack>
                  <Button
                    size="xs"
                    variant="outline"
                    colorPalette="blue"
                    rounded="lg"
                    fontWeight="black"
                    fontSize="9px"
                    px={3}
                    onClick={() => {
                      const user = localStorage.getItem('user');
                      if (!user) {
                        setShowAuthAlert(true);
                        setTimeout(() => {
                          setShowAuthAlert(false);
                          router.push('/login');
                        }, 3000);
                        return;
                      }
                      setSelectedOpp(opp);
                    }}
                  >
                    VIEW DETAILS
                  </Button>
                </Flex>
              </Box>
            )) : (
              <Box gridColumn={{ base: "span 1", md: "span 2", lg: "span 3" }} py={16} textAlign="center">
                <VStack gap={4}>
                  <Box p={6} bg="blue.50" rounded="full">
                    <FiSearch size={32} color="#3182ce" />
                  </Box>
                  <Heading size="md" color="gray.800">No matching opportunities</Heading>
                  <Text color="gray.500" fontSize="12px">We couldn&apos;t find anything matching &quot;{searchTerm}&quot;. Try another keyword!</Text>
                </VStack>
              </Box>
            )}
          </SimpleGrid>
        </Container>
      </Flex>

      <Footer />

      {/* Opportunity Details Modal */}
      {selectedOpp && (
        <Flex 
          position="fixed" top="0" left="0" w="full" h="full" bg="rgba(0,0,0,0.8)" 
          zIndex={9998} align="center" justify="center" backdropFilter="blur(10px)" px={4}
        >
          <Box 
            bg="white" w="full" maxW="600px" rounded="3xl" overflow="hidden" shadow="2xl" 
            animation="fadeIn 0.3s ease-out" position="relative"
          >
            <Button 
              position="absolute" top={4} right={4} variant="ghost" rounded="full" 
              onClick={() => setSelectedOpp(null)} zIndex={10}
            >
              ✕
            </Button>
            
            <Box h="200px" w="full" bg="gray.100">
              <img 
                src={(selectedOpp as any).image_url || `https://picsum.photos/seed/${selectedOpp.id}/600/300`} 
                alt={selectedOpp.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </Box>

            <Box p={8}>
              <Badge colorPalette={selectedOpp.color} mb={4} px={3} py={1} rounded="lg" fontSize="xs" fontWeight="black">
                {selectedOpp.type}
              </Badge>
              <Heading size="xl" color="blue.900" fontWeight="black" mb={2}>{selectedOpp.title}</Heading>
              <Text fontSize="md" color="gray.500" fontWeight="bold" mb={6}>{selectedOpp.company}</Text>
              
              <SimpleGrid columns={2} gap={6} mb={8}>
                <Box>
                  <Text fontSize="2xs" fontWeight="black" color="gray.400" letterSpacing="1px">LOCATION</Text>
                  <Text fontWeight="bold" color="gray.700">{(selectedOpp as any).location || 'Global / Remote'}</Text>
                </Box>
                <Box>
                  <Text fontSize="2xs" fontWeight="black" color="gray.400" letterSpacing="1px">START DATE</Text>
                  <Text fontWeight="bold" color="gray.700">{(selectedOpp as any).start_date || 'TBA'}</Text>
                </Box>
                <Box>
                  <Text fontSize="2xs" fontWeight="black" color="gray.400" letterSpacing="1px">CLOSED DATE</Text>
                  <Text fontWeight="bold" color="red.500">{selectedOpp.deadline}</Text>
                </Box>
                <Box>
                  <Text fontSize="2xs" fontWeight="black" color="gray.400" letterSpacing="1px">EXPERIENCE</Text>
                  <Text fontWeight="bold" color="gray.700">{(selectedOpp as any).experience || 'Open to All'}</Text>
                </Box>
              </SimpleGrid>

              <Text color="gray.600" mb={8} fontSize="sm" lineHeight="tall">
                {selectedOpp.description}
              </Text>

              <Button 
                onClick={async () => {
                  const storedUser = localStorage.getItem('user');
                  if (storedUser) {
                    const user = JSON.parse(storedUser);
                    try {
                      await fetch('/api/applications', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ user_id: user.id, job_id: (selectedOpp as any).id })
                      });
                    } catch (e) {
                      console.error('Failed to log application');
                    }
                  }
                  window.open((selectedOpp as any).application_url || '#', '_blank');
                }}
                background="linear-gradient(to right, #0daaf9, #1a202c)" 
                color="white" w="full" height="56px" rounded="xl" fontWeight="black" 
                textTransform="uppercase" letterSpacing="1px"
                _hover={{ shadow: 'xl' }}
              >
                APPLY FOR THIS OPPORTUNITY
              </Button>
            </Box>
          </Box>
        </Flex>
      )}

      {/* Auth Alert Overlay */}
      {showAuthAlert && (
        <Flex 
          position="fixed" 
          top="0" 
          left="0" 
          w="full" 
          h="full" 
          bg="rgba(0,0,0,0.7)" 
          zIndex={9999} 
          align="center" 
          justify="center"
          backdropFilter="blur(8px)"
          animation="fadeIn 0.3s ease-out"
        >
          <Box 
            bg="white" 
            p={8} 
            rounded="3xl" 
            textAlign="center" 
            shadow="2xl"
            maxW="400px"
            mx={4}
            transform="scale(1)"
            animation="popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
          >
            <Box color="red.500" mb={4} display="flex" justifyContent="center">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </Box>
            <Heading size="md" mb={2} color="gray.800" fontWeight="black">Unauthorized Access</Heading>
            <Text color="gray.600" fontWeight="bold">Please sign in to view full details and apply.</Text>
            <Box mt={6} w="full" h="4px" bg="gray.100" rounded="full" overflow="hidden">
              <Box h="full" bg="blue.500" animation="progressLoad 3s linear forwards" />
            </Box>
            <Text mt={2} fontSize="xs" color="gray.400" fontWeight="bold">REDIRECTING TO LOGIN...</Text>
          </Box>
        </Flex>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        @keyframes progressLoad { from { width: 0%; } to { width: 100%; } }
      `}} />
    </Flex>
  )
}
