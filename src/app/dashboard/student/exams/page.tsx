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
  Card,
  Image,
  Spinner,
  Center,
  Separator,
  SimpleGrid
} from '@chakra-ui/react'
import {
  FiZap,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiBookOpen,
  FiArrowRight,
  FiAward
} from 'react-icons/fi'

export default function StudentExamsPage() {
  const [enrolledExams, setEnrolledExams] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 1. Fetch Enrolled Courses and their Exams
    const fetchExams = async () => {
      try {
        const [jobsRes, appsRes] = await Promise.all([
          fetch('/api/jobs'),
          fetch('/api/applications')
        ]);
        
        const jobsData = await jobsRes.json();
        const appsData = await appsRes.json();
        
        // Filter jobs that student has 'approved' applications for AND that have an exam_url
        const approvedJobIds = appsData.applications
          ?.filter((a: any) => a.status === 'approved')
          .map((a: any) => a.job_id);
          
        const exams = jobsData.jobs?.filter((j: any) => 
          approvedJobIds.includes(j.id) && j.exam_url
        );
        
        setEnrolledExams(exams || []);
      } catch (e) {
        console.error("Exam fetch error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExams();
  }, []);

  if (isLoading) return <Center h="60vh"><Spinner size="xl" color="blue.500" /></Center>

  return (
    <Box p={8} maxW="1200px" mx="auto">
      <VStack align="flex-start" mb={12} gap={2}>
        <HStack gap={3}>
           <Box p={3} bg="orange.400" color="white" rounded="2xl" shadow="0 10px 20px rgba(251, 146, 60, 0.3)">
              <FiZap size={24} />
           </Box>
           <Heading size="3xl" color="blue.900" fontWeight="black">Examination Center</Heading>
        </HStack>
        <Text color="gray.500" fontSize="lg" fontWeight="medium">Evaluate your progress and earn certifications for your enrolled modules.</Text>
      </VStack>

      {enrolledExams.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
          {enrolledExams.map((exam, idx) => (
            <Card.Root key={idx} rounded="3xl" shadow="xl" border="1px solid" borderColor="gray.100" overflow="hidden" _hover={{ transform: 'translateY(-5px)', shadow: '2xl' }} transition="0.3s">
              <Card.Body p={6}>
                 <HStack justify="space-between" mb={6}>
                    <Badge colorPalette="orange" variant="solid" rounded="lg" px={3} py={1}>CERTIFICATION EXAM</Badge>
                    <HStack color="gray.400" fontSize="xs" fontWeight="bold">
                       <FiClock /><Text>45 MINS</Text>
                    </HStack>
                 </HStack>
                 
                 <VStack align="flex-start" gap={3} mb={8}>
                    <Heading size="xl" color="blue.900" fontWeight="black">{exam.title} Final Exam</Heading>
                    <Text color="gray.500" fontSize="sm" lineClamp={2}>This assessment covers all core objectives of the {exam.level} tier. Passing requires a score of 75% or higher.</Text>
                 </VStack>

                 <Separator mb={8} opacity={0.5} />
                 
                 <Flex justify="space-between" align="center">
                    <HStack gap={2} color="green.600" fontWeight="black" fontSize="xs">
                       <FiCheckCircle /><Text>PREREQUISITES MET</Text>
                    </HStack>
                    <Button 
                      onClick={() => window.open(exam.exam_url, '_blank')}
                      bg="blue.900" color="white" rounded="xl" fontWeight="black" px={8} _hover={{ bg: 'blue.800' }}
                    >
                      START EXAM <FiArrowRight style={{marginLeft: '8px'}} />
                    </Button>
                 </Flex>
              </Card.Body>
            </Card.Root>
          ))}
        </SimpleGrid>
      ) : (
        <Center py={20} flexDirection="column" gap={6} bg="gray.50" rounded="3xl" border="2px dashed" borderColor="gray.200">
           <Box boxSize="80px" rounded="full" bg="white" display="flex" alignItems="center" justifyContent="center" shadow="lg">
              <FiAward size={40} color="#CBD5E0" />
           </Box>
           <VStack gap={1}>
              <Heading size="lg" color="gray.400">No Exams Available Yet</Heading>
              <Text color="gray.400" textAlign="center" px={10}>Exams will appear here once you are **Enrolled & Approved** in courses that include a final assessment.</Text>
           </VStack>
           <Button variant="outline" colorPalette="blue" rounded="xl" fontWeight="black" onClick={() => window.location.href='/dashboard/student'}>BROWSE COURSES</Button>
        </Center>
      )}
    </Box>
  )
}
