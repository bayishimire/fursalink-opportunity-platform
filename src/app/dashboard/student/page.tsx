'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  Input,
  Button,
  HStack,
  VStack,
  Badge,
  Flex,
  Image,
  Separator,
  Spinner,
  Center,
  Avatar
} from '@chakra-ui/react'
import {
  FiSearch,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiStar,
  FiPenTool,
  FiCode,
  FiTrendingUp,
  FiArrowRight,
  FiAlertCircle,
  FiGrid,
  FiLock,
  FiUnlock
} from 'react-icons/fi'

const STUDENT_LEVELS = [
  { id: 'all', label: 'All Levels', icon: <FiGrid /> },
  { id: 'children', label: 'Children', icon: <FiStar /> },
  { id: 'primary', label: 'Primary', icon: <FiPenTool /> },
  { id: 'secondary', label: 'Secondary', icon: <FiBookOpen /> },
  { id: 'programming', label: 'Programming', icon: <FiCode /> },
]

export default function StudentDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [courses, setCourses] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setMounted(true)
    const checkUser = () => {
      const stored = localStorage.getItem('user')
      if (stored) {
        const userData = JSON.parse(stored)
        setUser(userData)
        fetchInitialData(userData.id)
      }
    }
    
    checkUser()
    const handleUpdate = (e: any) => {
      if (e.detail) setUser(e.detail)
      else checkUser()
    }
    
    window.addEventListener('user-update', handleUpdate)
    window.addEventListener('storage', checkUser)
    
    return () => {
      window.removeEventListener('user-update', handleUpdate)
      window.removeEventListener('storage', checkUser)
    }
  }, [])

  const fetchInitialData = async (userId: number) => {
    setIsLoading(true)
    try {
      const [courseRes, appRes] = await Promise.all([
        fetch('/api/jobs'),
        fetch('/api/applications')
      ]);
      const courseData = await courseRes.json();
      const appData = await appRes.json();

      setCourses(courseData.jobs || []);
      setApplications(appData.applications?.filter((a: any) => a.user_id === userId) || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  const handleEnroll = async (courseId: number) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, job_id: courseId })
      });
      if (res.ok) {
        fetchInitialData(user.id);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!mounted) return <Center h="100vh"><Spinner /></Center>

  const getAppStatus = (courseId: number) => {
    return applications.find(a => a.job_id === courseId)?.status || null;
  }

  const CourseCard = ({ course }: { course: any }) => {
    const status = getAppStatus(course.id);
    const isEnrolled = status === 'approved';
    const isPending = status === 'pending';

    return (
      <Card.Root rounded="3xl" shadow="lg" border="1px solid" borderColor="gray.100" overflow="hidden" _hover={{ shadow: '2xl', transform: 'translateY(-4px)' }} transition="0.3s">
        <Box p={6}>
          <Flex gap={6}>
            <Box w="110px" h="110px" rounded="2xl" bg="gray.50" overflow="hidden" position="relative">
              <Image src={course.image_url || `https://picsum.photos/seed/${course.id}/300`} alt="module" objectFit="cover" w="full" h="full" />
              <Box position="absolute" top={2} left={2}>
                {isEnrolled ? <FiUnlock color="#48BB78" /> : <FiLock color="#A0AEC0" />}
              </Box>
            </Box>
            <VStack align="stretch" flex={1} gap={2}>
              <HStack justify="space-between">
                <Badge variant="subtle" colorPalette="blue" rounded="md" fontSize="9px">{course.level.toUpperCase()}</Badge>
                {isEnrolled && <Badge colorPalette="green" variant="solid">ENROLLED</Badge>}
              </HStack>
              <Heading size="md" color="blue.900" fontWeight="black">{course.title}</Heading>
              <Text color="gray.500" fontSize="xs" lineClamp={2}>{course.description}</Text>
            </VStack>
          </Flex>

          <Separator my={6} borderColor="gray.50" />

          <Flex justify="space-between" align="center">
            <HStack gap={3} color="gray.400" fontSize="xs" fontWeight="bold">
              <FiClock /><Text>Open Access</Text>
            </HStack>

            {isEnrolled ? (
              <Button
                onClick={() => window.location.href = `/dashboard/student/course/${course.id}`}
                bg="blue.900"
                color="white"
                rounded="xl"
                fontWeight="black"
                px={10}
                transition="0.3s"
                _hover={{ bg: 'blue.800', transform: 'scale(1.05)' }}
              >
                START LEARNING <FiArrowRight style={{ marginLeft: '8px' }} />
              </Button>
            ) : (
              <Button
                onClick={() => handleEnroll(course.id)}
                disabled={isPending || status === 'rejected'}
                loading={isSubmitting}
                background={isPending ? 'orange.100' : status === 'rejected' ? 'red.50' : 'blue.900'}
                color={isPending ? 'orange.700' : status === 'rejected' ? 'red.600' : 'white'}
                rounded="xl"
                fontWeight="black"
                px={10}
                fontSize="sm"
              >
                {isPending ? '⏳ Pending Approval' : status === 'rejected' ? 'Rejected' : 'Enroll Now'}
              </Button>
            )}
          </Flex>
        </Box>
      </Card.Root>
    );
  }

  const renderGroupedCourses = () => {
    const levelsToDisplay = selectedLevel === 'all'
      ? ['children', 'primary', 'secondary', 'programming']
      : [selectedLevel];

    return levelsToDisplay.map(levelId => {
      const levelCourses = courses.filter(c => c.level === levelId && (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()));
      if (levelCourses.length === 0) return null;

      return (
        <Box key={levelId} mb={12}>
          <HStack gap={3} mb={6}>
            <Box boxSize="8px" bg="blue.500" rounded="full" />
            <Heading size="lg" color="blue.900" fontWeight="black" textTransform="uppercase" letterSpacing="wide">
              {levelId} Modules
            </Heading>
            <Badge colorPalette="gray" variant="subtle" rounded="md">{levelCourses.length} COURSES</Badge>
          </HStack>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
            {levelCourses.map(course => <CourseCard key={course.id} course={course} />)}
          </SimpleGrid>
        </Box>
      );
    });
  }

  return (
    <Box maxW="1200px" mx="auto" pb={20}>
      {!mounted ? (
        <Center h="100vh"><Spinner /></Center>
      ) : (
        <>
          {/* Optimized Profile Card */}
          <Card.Root rounded="3xl" shadow="md" border="none" bg="white" mb={12}>
            <Card.Body p={8}>
              <Flex justify="space-between" align="center" flexWrap="wrap" gap={6}>
                <HStack gap={6}>
                  <Avatar.Root size="2xl" border="4px solid" borderColor="blue.50" overflow="hidden">
                    {user?.picture ? (
                      <img src={user.picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile" />
                    ) : (
                      <Avatar.Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} />
                    )}
                  </Avatar.Root>
                  <VStack align="flex-start" gap={1}>
                    <Heading size="2xl" color="blue.900" fontWeight="black">{user?.name || 'Loading Student...'}</Heading>
                    <HStack gap={3}>
                      <Badge colorPalette="blue" variant="solid" px={3} py={1} rounded="md">ACADEMIC PROFILE</Badge>
                      <HStack gap={1} color="orange.500" fontWeight="black" fontSize="xs"><FiTrendingUp /> <Text>LEVEL 4</Text></HStack>
                    </HStack>
                  </VStack>
                </HStack>
                <VStack align="flex-end" gap={0}>
                  <Text fontSize="10px" fontWeight="black" color="gray.400" letterSpacing="2px">VALIDATED COURSES</Text>
                  <Heading size="4xl" color="blue.900">{applications.filter(a => a.status === 'approved').length}</Heading>
                </VStack>
              </Flex>
            </Card.Body>
          </Card.Root>

          {/* High-Fidelity Navigation */}
          <SimpleGrid columns={{ base: 1, md: 5 }} gap={4} mb={12}>
            {STUDENT_LEVELS.map(level => (
              <Button
                key={level.id}
                onClick={() => setSelectedLevel(level.id)}
                h="70px"
                rounded="2xl"
                bg={selectedLevel === level.id ? 'blue.900' : 'white'}
                color={selectedLevel === level.id ? 'white' : 'gray.600'}
                fontWeight="black"
                variant={selectedLevel === level.id ? 'solid' : 'outline'}
                shadow={selectedLevel === level.id ? '2xl' : 'sm'}
                border={selectedLevel === level.id ? 'none' : '1px solid'}
                borderColor="gray.100"
                gap={3}
                _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                transition="0.3s"
              >
                {level.icon} {level.label.toUpperCase()}
              </Button>
            ))}
          </SimpleGrid>

          {/* Minimalist Search */}
          <Card.Root mb={14} rounded="full" shadow="sm" border="1px solid" borderColor="gray.100" bg="white" maxW="700px" mx="auto">
            <Card.Body p={2}>
              <HStack gap={2} w="full">
                <Box flex={1} position="relative">
                  <Box position="absolute" left={4} top="50%" transform="translateY(-50%)" zIndex={1} color="gray.400">
                    <FiSearch size={14} />
                  </Box>
                  <Input placeholder="Search modules, lessons, instructors..." variant="flushed" border="none" _focus={{ ring: 'none' }} h="40px" pl={10} fontSize="xs" fontWeight="bold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </Box>
                <Button h="40px" px={10} bg="blue.500" color="white" rounded="full" fontWeight="black" fontSize="xs">DISCOVER</Button>
              </HStack>
            </Card.Body>
          </Card.Root>

          {/* Live Modules Content */}
          <Box>
            {isLoading ? (
              <Center py={20}><Spinner size="xl" color="blue.500" /></Center>
            ) : courses.length > 0 ? (
              renderGroupedCourses()
            ) : (
              <Center py={20} flexDirection="column" gap={4}>
                <FiAlertCircle size={48} color="gray.200" />
                <Text color="gray.500" fontWeight="bold" fontSize="lg">The digital catalog is currently updating.</Text>
              </Center>
            )}
          </Box>

          {/* Rwanda Peace & History */}
          <Box mt={20}>
            <Card.Root rounded="3xl" bg="linear-gradient(to right, #1a365d, #2a4365)" color="white" p={12} shadow="2xl" border="none" overflow="hidden">
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={12}>
                <VStack align="flex-start" gap={6}>
                  <Badge colorPalette="cyan" variant="solid" px={4} py={1} rounded="full">HISTORY & PEACE</Badge>
                  <Heading size="3xl" fontWeight="black">Unity & Reconciliation</Heading>
                  <Text fontSize="sm" opacity={0.9} lineHeight="tall">Explore the history of Rwanda and the values that build our future. Join specialized modules on national unity and peace building.</Text>
                  <Button bg="white" color="blue.900" h="56px" px={12} rounded="xl" fontWeight="black" _hover={{ transform: 'translateX(5px)' }}>
                    EXPLORE HISTORY <FiArrowRight style={{ marginLeft: '8px' }} />
                  </Button>
                </VStack>
                <Box position="relative">
                  <Image src="https://images.unsplash.com/photo-1549194388-f61be84a6e9e?auto=format&fit=crop&q=80&w=800" alt="History" rounded="2xl" shadow="2xl" />
                  <Box position="absolute" bottom={-4} right={-4} bg="white" color="blue.900" p={6} rounded="2xl" shadow="2xl">
                    <Heading size="md" fontWeight="black">Never Again.</Heading>
                  </Box>
                </Box>
              </SimpleGrid>
            </Card.Root>
          </Box>
        </>
      )}
    </Box>
  )
}
