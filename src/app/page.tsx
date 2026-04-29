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

  useEffect(() => {
    if (showAuthAlert) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showAuthAlert, router]);

  const isAuthenticated = () => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('user');
  }

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

  const opportunities = [
    {
      id: 999001,
      type: 'Job',
      title: 'Frontend Developer',
      description: 'TechCorp Inc. is looking for a skilled React developer with Chakra UI experience.',
      deadline: 'Oct 15',
      url: 'https://example.com/apply/frontend',
      color: 'green'
    },
    {
      id: 999002,
      type: 'Scholarship',
      title: 'Global Excellence Award',
      description: 'Full funding available for international students pursuing a master\'s degree.',
      deadline: 'Nov 01',
      url: 'https://example.com/apply/scholarship',
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
      {!mounted ? (
        <Box minH="100vh" bg="#f9fafb" />
      ) : (
        <>
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
                        variant="flushed"
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
                    <HStack gap={2} mt="auto" pt={4} borderTop="1px solid" borderColor="gray.50">
                      <VStack align="flex-start" gap={0} flex={1}>
                        <HStack color="red.500" fontWeight="black" fontSize="9px" gap={1.5}>
                          <FiClock />
                          <Text>{opp.deadline === 'Self-Paced' ? opp.deadline : `DEADLINE: ${opp.deadline}`}</Text>
                        </HStack>
                        {calculateDaysRemaining(opp.deadline) !== null && (
                          <Text fontSize="9px" fontWeight="black" color="blue.600">
                            {calculateDaysRemaining(opp.deadline)! > 0
                              ? `${calculateDaysRemaining(opp.deadline)}D LEFT`
                              : 'CLOSED'}
                          </Text>
                        )}
                      </VStack>
                      <HStack gap={1}>
                        <Button
                          size="xs"
                          variant="ghost"
                          colorPalette="gray"
                          rounded="lg"
                          fontWeight="black"
                          fontSize="9px"
                          px={2}
                          onClick={() => {
                            if (!isAuthenticated()) {
                              setShowAuthAlert(true);
                              return;
                            }
                            setSelectedOpp(opp);
                          }}
                        >
                          DETAILS
                        </Button>
                        <Button
                          size="xs"
                          variant="solid"
                          background="blue.900"
                          color="white"
                          rounded="lg"
                          fontWeight="black"
                          fontSize="9px"
                          px={3}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isAuthenticated()) {
                              setShowAuthAlert(true);
                              return;
                            }
                            const targetUrl = (opp as any).application_url || (opp as any).url;
                            if (targetUrl) window.open(targetUrl, '_blank');
                          }}
                        >
                          APPLY
                        </Button>
                      </HStack>
                    </HStack>
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
                bg="white" w="full" maxW="850px" maxH="90vh" rounded="3xl" overflow="hidden" shadow="2xl"
                animation="fadeIn 0.3s ease-out" position="relative" display="flex" flexDirection="column"
              >
                <Button
                  position="absolute" top={4} right={4} variant="subtle" colorPalette="gray" rounded="full" boxSize="36px"
                  onClick={() => setSelectedOpp(null)} zIndex={10}
                >
                  ✕
                </Button>

                <Box overflowY="auto" flex="1">
                  <Box w="full" bg="gray.100">
                    {selectedOpp.video_url ? (
                      <Box position="relative" pt="56.25%" w="full">
                        <iframe
                          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                          src={selectedOpp.video_url.includes('youtube.com')
                            ? `${selectedOpp.video_url.replace('watch?v=', 'embed/')}?autoplay=1&mute=1`
                            : selectedOpp.video_url}
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                        />
                      </Box>
                    ) : (
                      <Box h={{ base: "200px", md: "350px" }} w="full">
                        <img
                          src={(selectedOpp as any).image_url || `https://picsum.photos/seed/${selectedOpp.id}/800/400`}
                          alt={selectedOpp.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                    )}
                  </Box>

                  <Box p={{ base: 6, md: 10 }}>
                    <HStack justify="space-between" mb={4} align="flex-start">
                      <VStack align="flex-start" gap={1}>
                        <Badge colorPalette={selectedOpp.color} px={3} py={1} rounded="lg" fontSize="xs" fontWeight="black">
                          {selectedOpp.type?.toUpperCase()}
                        </Badge>
                        <Heading size="3xl" color="blue.900" fontWeight="900" mt={2} letterSpacing="-1px">{selectedOpp.title}</Heading>
                        <Text fontSize="lg" color="gray.500" fontWeight="bold">{selectedOpp.company}</Text>
                      </VStack>
                      {selectedOpp.exam_url && (
                        <Button variant="surface" colorPalette="orange" rounded="xl" size="sm" gap={2} onClick={() => window.open(selectedOpp.exam_url, '_blank')}>
                          <FiArrowRight /> PRACTICE EXAM
                        </Button>
                      )}
                    </HStack>

                    <SimpleGrid columns={{ base: 2, md: 4 }} gap={6} mb={10} bg="gray.50" p={6} rounded="2xl" border="1px solid" borderColor="gray.100">
                      <Box>
                        <Text fontSize="10px" fontWeight="black" color="gray.400" letterSpacing="1px">LOCATION</Text>
                        <Text fontWeight="extrabold" color="gray.800" fontSize="13px">{(selectedOpp as any).location || 'Global / Remote'}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="10px" fontWeight="black" color="gray.400" letterSpacing="1px">START DATE</Text>
                        <Text fontWeight="extrabold" color="gray.800" fontSize="13px">{(selectedOpp as any).start_date || 'TBA'}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="10px" fontWeight="black" color="gray.400" letterSpacing="1px">DEADLINE</Text>
                        <Text fontWeight="extrabold" color="red.500" fontSize="13px">{selectedOpp.deadline}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="10px" fontWeight="black" color="gray.400" letterSpacing="1px">EXPERIENCE</Text>
                        <Text fontWeight="extrabold" color="gray.800" fontSize="13px">{(selectedOpp as any).experience || 'Not Required'}</Text>
                      </Box>
                    </SimpleGrid>

                    <VStack align="flex-start" gap={6}>
                      <Box>
                        <Heading size="md" mb={3} color="blue.900" fontWeight="900">Program Description</Heading>
                        <Text color="gray.600" fontSize="15px" lineHeight="relaxed" whiteSpace="pre-wrap">
                          {selectedOpp.description}
                        </Text>
                      </Box>
                      {((selectedOpp as any).application_url || (selectedOpp as any).url) && (
                        <Box w="full" pt={4}>
                          <HStack gap={4} w="full">
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
                                const targetUrl = (selectedOpp as any).application_url || (selectedOpp as any).url;
                                window.open(targetUrl || '#', '_blank');
                              }}
                              background="linear-gradient(to right, #0daaf9, #1a202c)"
                              color="white" flex="2" height="56px" rounded="2xl" fontWeight="black"
                              textTransform="uppercase" letterSpacing="1.5px" shadow="xl"
                              _hover={{ transform: 'translateY(-2px)', shadow: '2xl' }}
                            >
                              APPLY NOW
                            </Button>
                            <Button
                              variant="outline" flex="1" height="56px" rounded="2xl" fontWeight="black"
                              textTransform="uppercase" color="gray.500" borderColor="gray.200"
                              _hover={{ bg: 'gray.50' }}
                              onClick={() => setSelectedOpp(null)}
                            >
                              CANCEL
                            </Button>
                          </HStack>
                        </Box>
                      )}
                    </VStack>
                  </Box>
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
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </Box>
                <Heading size="md" mb={2} color="gray.800" fontWeight="black">Access Restricted</Heading>
                <Text color="gray.600" fontWeight="bold">Please login first to view details and apply.</Text>
                <Box mt={6} w="full" h="4px" bg="gray.100" rounded="full" overflow="hidden">
                  <Box h="full" bg="blue.500" animation="progressLoad 3s linear forwards" />
                </Box>
                <Text mt={2} fontSize="xs" color="gray.400" fontWeight="bold">REDIRECTING TO LOGIN...</Text>
              </Box>
            </Flex>
          )}
        </>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        @keyframes progressLoad { from { width: 0%; } to { width: 100%; } }
      `}} />
    </Flex>
  )
}
