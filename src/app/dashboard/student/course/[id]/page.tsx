'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Flex,
  Badge,
  Separator,
  Card,
  Image,
  Spinner,
  Center,
  Progress
} from '@chakra-ui/react'
import {
  FiArrowLeft,
  FiPlayCircle,
  FiCheckCircle,
  FiFileText,
  FiDownload,
  FiMessageSquare,
  FiSettings,
  FiMaximize,
  FiVolume2,
  FiLink
} from 'react-icons/fi'

export default function CoursePlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const [course, setCourse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeLesson, setActiveLesson] = useState(0)

  const lessons = [
    { title: 'Introduction & Curriculum', duration: '5:20', completed: true },
    { title: 'Getting Started: Environment Setup', duration: '12:45', completed: false },
    { title: 'The Core Concepts of the Module', duration: '18:10', completed: false },
    { title: 'Interactive Exercise: First Steps', duration: '10:00', completed: false },
    { title: 'Advanced Strategy & Deep Dive', duration: '25:30', completed: false },
    { title: 'Final Summary & Next Steps', duration: '08:15', completed: false },
  ]

  useEffect(() => {
    fetch(`/api/jobs`)
      .then(res => res.json())
      .then(data => {
        const found = data.jobs?.find((j: any) => j.id.toString() === id)
        setCourse(found)
      })
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) return <Center h="100vh" bg="#0a0b1e"><Spinner size="xl" color="blue.500" /></Center>
  if (!course) return <Center h="100vh" bg="#0a0b1e" color="white">Course not found.</Center>

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
    if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
    return url;
  };

  const videoEmbed = getEmbedUrl(course.video_url);

  return (
    <Box minH="100vh" bg="#0a0b1e" color="white" p={0}>
      <Flex direction={{ base: 'column', lg: 'row' }} h="100vh">
        
        {/* Main Player Area */}
        <Box flex={1} p={6} overflowY="auto">
          <HStack mb={6} justify="space-between">
            <Button variant="ghost" color="whiteAlpha.800" _hover={{ bg: 'whiteAlpha.100' }} onClick={() => window.location.href = '/dashboard/student'}>
              <FiArrowLeft /> Back to Dashboard
            </Button>
            <HStack gap={4}>
               <Badge colorPalette="blue" variant="solid">{course.level?.toUpperCase()}</Badge>
               <Text fontSize="sm" fontWeight="bold" opacity={0.6}>Progress: 15%</Text>
            </HStack>
          </HStack>

          {/* Premium Video Frame */}
          <Box 
            w="full" 
            aspectRatio={16/9} 
            bg="black" 
            rounded="3xl" 
            shadow="2xl" 
            position="relative" 
            overflow="hidden"
            border="1px solid"
            borderColor="whiteAlpha.100"
          >
             {videoEmbed ? (
               <iframe 
                 width="100%" 
                 height="100%" 
                 src={videoEmbed} 
                 title="Course Video" 
                 frameBorder="0" 
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                 allowFullScreen
               ></iframe>
             ) : (
                <>
                  <Image 
                    src={course.image_url || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80`} 
                    alt="Placeholder" 
                    w="full" h="full" objectFit="cover" opacity={0.3} 
                  />
                  <Center position="absolute" top={0} left={0} w="full" h="full" flexDirection="column" gap={6}>
                      <Box boxSize="80px" rounded="full" bg="blue.500" display="flex" alignItems="center" justifyContent="center">
                        <FiPlayCircle size={40} />
                      </Box>
                      <VStack gap={0}>
                        <Heading size="lg">Module Ready</Heading>
                        <Text opacity={0.6}>No video lesson link provided yet.</Text>
                      </VStack>
                  </Center>
                </>
             )}
          </Box>

          <VStack align="flex-start" mt={8} gap={4}>
             <Heading size="2xl" fontWeight="black">{course.title}</Heading>
             <Text fontSize="lg" opacity={0.8}>{course.description}</Text>
             <Separator opacity={0.1} my={6} />
             <HStack gap={8}>
                <Button variant="ghost" color="white" gap={2} _hover={{ bg: 'whiteAlpha.100' }}><FiFileText /> Resources</Button>
                <Button variant="ghost" color="white" gap={2} _hover={{ bg: 'whiteAlpha.100' }}><FiMessageSquare /> Discussion</Button>
                <Button variant="ghost" color="white" gap={2} _hover={{ bg: 'whiteAlpha.100' }}><FiDownload /> Offline Access</Button>
             </HStack>
          </VStack>
        </Box>

        {/* Lesson Sidebar */}
        <Box w={{ base: 'full', lg: '400px' }} bg="#14152a" borderLeft="1px solid" borderColor="whiteAlpha.100" p={6} overflowY="auto">
           <VStack align="stretch" gap={6}>
              <Box mb={4}>
                 <Text fontSize="9px" fontWeight="black" color="blue.400" mb={2} letterSpacing="2px">LEARNING PATH</Text>
                 <Heading size="md" mb={4}>Module Curriculum</Heading>
                 <Progress.Root value={15} rounded="full" h="6px">
                    <Progress.Track bg="whiteAlpha.100">
                        <Progress.Range bg="blue.500" />
                    </Progress.Track>
                 </Progress.Root>
              </Box>

              <VStack align="stretch" gap={3}>
                 {lessons.map((lesson, idx) => (
                   <Card.Root 
                     key={idx} 
                     bg={activeLesson === idx ? 'blue.900' : 'whiteAlpha.50'} 
                     border="none" 
                     rounded="2xl" 
                     cursor={idx === activeLesson ? 'default' : 'pointer'}
                     onClick={() => setActiveLesson(idx)}
                   >
                     <Card.Body p={4}>
                        <HStack justify="space-between">
                           <HStack gap={4}>
                              <Box boxSize="32px" rounded="lg" bg={lesson.completed ? 'green.500' : 'whiteAlpha.200'} display="flex" alignItems="center" justifyContent="center">
                                 {lesson.completed ? <FiCheckCircle size={16} /> : idx + 1}
                              </Box>
                              <VStack align="flex-start" gap={0}>
                                 <Text fontSize="sm" fontWeight="bold">{lesson.title}</Text>
                                 <Text fontSize="xs" opacity={0.5}>{lesson.duration} • MP4 Lesson</Text>
                              </VStack>
                           </HStack>
                           {lesson.completed && <FiCheckCircle color="#48BB78" />}
                        </HStack>
                     </Card.Body>
                   </Card.Root>
                 ))}
              </VStack>

              <Button w="full" h="60px" bg="blue.500" color="white" rounded="2xl" fontWeight="black" mt={6}>
                 CONTINUE TO NEXT LESSON
              </Button>
           </VStack>
        </Box>
      </Flex>
    </Box>
  )
}
