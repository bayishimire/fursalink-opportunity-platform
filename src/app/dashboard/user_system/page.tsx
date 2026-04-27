'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  Center,
  Spinner
} from '@chakra-ui/react'
import {
  FiSearch,
  FiMapPin,
  FiBriefcase,
  FiBookOpen,
  FiZap,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiHelpCircle,
  FiHeart,
  FiFileText
} from 'react-icons/fi'

export default function UserSystemDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [jobs, setJobs] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [appliedIds, setAppliedIds] = useState<number[]>([])
  const [savedIds, setSavedIds] = useState<number[]>([])

  // Support System States
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)
  const [supportJob, setSupportJob] = useState<any>(null)
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false)
  const [supportForm, setSupportForm] = useState({
    phone: '',
    education: '',
    skills: '',
    message: ''
  })

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('user')
    if (stored) {
      setUser(JSON.parse(stored))
    } else {
      router.push('/')
    }
    fetchJobs();
  }, [router])

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (e) {
      console.error("Fetch jobs failed", e);
    } finally {
      setIsLoading(false);
    }
  }

  const handleApply = async (jobId: number) => {
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id || 2, job_id: jobId })
      });
      if (res.ok) {
        setAppliedIds([...appliedIds, jobId]);
        alert("Application submitted successfully!");
      }
    } catch (e) {
      alert("Error submitting application");
    }
  }

  const handleSupportSubmit = async () => {
    setIsSubmittingSupport(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id || 2,
          name: user.name || 'Anonymous User',
          email: user.email || 'user@example.com',
          phone: supportForm.phone,
          job_id: supportJob.id,
          job_title: supportJob.title,
          education: supportForm.education,
          skills: supportForm.skills,
          message: supportForm.message
        })
      });
      if (res.ok) {
        alert("Support request sent! An admin will contact you shortly.");
        setIsSupportModalOpen(false);
        setSupportForm({ phone: '', education: '', skills: '', message: '' });
      }
    } catch (e) {
      alert("Failed to send support request");
    } finally {
      setIsSubmittingSupport(false);
    }
  }

  if (!mounted || !user) return <Center h="100vh"><Spinner color="blue.500" /></Center>

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'scholarship': return <FiBookOpen size={14} color="#8b5cf6" />;
      case 'course': return <FiZap size={14} color="#10b981" />;
      default: return <FiBriefcase size={14} color="#3182ce" />;
    }
  }

  return (
    <Box maxW="1200px" mx="auto" pt={10} pb={20}>
      {/* Support System Modal Overlay */}
      {isSupportModalOpen && supportJob && (
         <Flex 
           position="fixed" top="0" left="0" w="full" h="full" bg="rgba(0,0,0,0.8)" 
           zIndex={9999} align="center" justify="center" backdropFilter="blur(12px)" p={4}
         >
           <Box bg="white" w="full" maxW="600px" rounded="3xl" overflow="hidden" shadow="2xl" border="1px solid" borderColor="gray.100">
             <Box bg="blue.900" p={8} color="white">
                <HStack justify="space-between" mb={2}>
                   <Badge colorPalette="blue" variant="solid" px={3} py={1} rounded="md">SUPPORT SYSTEM</Badge>
                   <Button variant="ghost" color="white" onClick={() => setIsSupportModalOpen(false)}>✕</Button>
                </HStack>
                <Heading size="lg" fontWeight="black" mb={2}>Apply with Support</Heading>
                <Text fontSize="xs" opacity={0.7}>Requesting help for: <b>{supportJob.title}</b> (ID: {supportJob.id})</Text>
             </Box>
             
             <Box p={8}>
                <SimpleGrid columns={2} gap={4} mb={6}>
                   <VStack align="flex-start" gap={1}>
                      <Text fontSize="10px" fontWeight="black" color="gray.400">PHONE NUMBER</Text>
                      <Input placeholder="+250 788..." rounded="xl" fontSize="sm" h="45px" value={supportForm.phone} onChange={(e)=>setSupportForm({...supportForm, phone: e.target.value})} />
                   </VStack>
                   <VStack align="flex-start" gap={1}>
                      <Text fontSize="10px" fontWeight="black" color="gray.400">EDUCATION LEVEL</Text>
                      <Input placeholder="e.g. Bachelor's IT" rounded="xl" fontSize="sm" h="45px" value={supportForm.education} onChange={(e)=>setSupportForm({...supportForm, education: e.target.value})} />
                   </VStack>
                </SimpleGrid>

                <VStack align="flex-start" gap={1} mb={6}>
                   <Text fontSize="10px" fontWeight="black" color="gray.400">KEYWORDS/SKILLS</Text>
                   <Input placeholder="React, Python, Accounting..." rounded="xl" fontSize="sm" h="45px" value={supportForm.skills} onChange={(e)=>setSupportForm({...supportForm, skills: e.target.value})} />
                </VStack>

                <VStack align="flex-start" gap={1} mb={8}>
                   <Text fontSize="10px" fontWeight="black" color="gray.400">HOW CAN WE HELP? (MESSAGE)</Text>
                   <textarea 
                     style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #edf2f7', fontSize: '14px', height: '120px', backgroundColor: '#f7fafc' }}
                     placeholder="How can we help you apply?" 
                     value={supportForm.message} 
                     onChange={(e)=>setSupportForm({...supportForm, message: e.target.value})} 
                   />
                </VStack>

                <Button 
                   onClick={handleSupportSubmit}
                   loading={isSubmittingSupport}
                   w="full" h="56px" background="linear-gradient(to right, #111827, #374151)" color="white" rounded="2xl" fontWeight="black" fontSize="md" _hover={{ shadow: 'xl' }}
                >
                   SUBMIT SUPPORT REQUEST
                </Button>
             </Box>
           </Box>
         </Flex>
      )}

      {/* Header Section */}
      <Flex justify="space-between" align="center" mb={10} flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="2xl" color="blue.900" fontWeight="black" mb={2}>User Discovery Hub</Heading>
          <Text color="gray.500" fontWeight="medium">Find the perfect job, scholarship, or course.</Text>
        </Box>
        <HStack bg="white" p={1} rounded="2xl" shadow="md" border="1px solid" borderColor="gray.100">
           {['all', 'job', 'scholarship', 'course'].map((cat) => (
             <Button
               key={cat}
               variant="ghost"
               size="sm"
               fontSize="xs"
               fontWeight="black"
               px={6}
               rounded="xl"
               bg={selectedCategory === cat ? 'blue.900' : 'transparent'}
               color={selectedCategory === cat ? 'white' : 'gray.500'}
               _hover={{ bg: selectedCategory === cat ? 'blue.800' : 'gray.50' }}
               onClick={() => setSelectedCategory(cat)}
               textTransform="capitalize"
             >
               {cat}
             </Button>
           ))}
        </HStack>
      </Flex>

      {/* Small Horizontal Search Bar */}
      <Card.Root mb={8} rounded="full" shadow="sm" border="1px solid" borderColor="gray.100" bg="white" maxW="700px" mx="auto">
        <Card.Body p={2}>
          <HStack gap={2} w="full">
             <Box flex={1} position="relative">
               <Box position="absolute" left={4} top="50%" transform="translateY(-50%)" zIndex={1} color="gray.400">
                 <FiSearch size={14} />
               </Box>
               <Input 
                 placeholder="Search jobs, internships..." 
                 bg="white"
                 border="none"
                 outline="none"
                 _focus={{ ring: 'none' }}
                 color="blue.900"
                 h="40px"
                 pl={10}
                 fontSize="xs"
                 fontWeight="bold"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </Box>
             <Button h="40px" px={8} bg="blue.500" color="white" rounded="full" fontWeight="black" fontSize="xs" _hover={{ bg: 'blue.600' }}>SEARCH</Button>
          </HStack>
        </Card.Body>
      </Card.Root>

      {/* Main Opportunity Section */}
      <Box mb={6}>
        <HStack justify="space-between" mb={6}>
          <Heading size="md" color="blue.900" fontWeight="black">📌 OPPORTUNITIES FOR YOU</Heading>
          <Badge bg="blue.50" color="blue.600" px={3} py={1} rounded="full" fontWeight="black">DISCOVERY MODE</Badge>
        </HStack>

        {isLoading ? (
          <Center py={20}><Spinner size="xl" color="blue.500" /></Center>
        ) : filteredJobs.length > 0 ? (
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8}>
            {filteredJobs.map((job) => (
              <Card.Root key={job.id} rounded="3xl" shadow="xl" border="1px solid" borderColor="gray.100" overflow="hidden" _hover={{ transform: 'translateY(-4px)', shadow: '2xl' }} transition="0.3s">
                <Box p={6}>
                  <Flex gap={6}>
                    <Box w="100px" h="100px" rounded="2xl" overflow="hidden" flexShrink={0} bg="gray.100">
                      <Image 
                        src={job.image_url || `https://picsum.photos/seed/${job.id}/200/200`} 
                        alt="company" 
                        objectFit="cover" 
                        w="full" 
                        h="full" 
                      />
                    </Box>
                    <VStack align="stretch" flex={1} gap={2}>
                      <HStack justify="space-between" align="flex-start">
                        <Box>
                          <HStack gap={2} mb={1}>
                             <Box p={1} bg="gray.50" rounded="md">{getCategoryIcon(job.category)}</Box>
                             <Text fontSize="10px" fontWeight="black" color="gray.400" letterSpacing="1px" textTransform="uppercase">{job.category || 'JOB'}</Text>
                          </HStack>
                          <Heading size="md" color="blue.900" fontWeight="black">{job.title}</Heading>
                          <Text color="blue.600" fontWeight="black" fontSize="sm">{job.company}</Text>
                        </Box>
                        <HStack>
                          <Button variant="ghost" size="sm" rounded="full" onClick={() => setSavedIds([...savedIds, job.id])}>
                            <FiHeart color={savedIds.includes(job.id) ? 'red' : 'gray'} fill={savedIds.includes(job.id) ? 'red' : 'none'} />
                          </Button>
                          {appliedIds.includes(job.id) && (
                            <Badge bg="green.50" color="green.600" px={2} py={1} rounded="md"><FiCheckCircle /> APPLIED</Badge>
                          )}
                        </HStack>
                      </HStack>
                      
                      <HStack gap={4} py={2}>
                        <HStack color="gray.500" fontSize="xs" fontWeight="bold"><FiMapPin /><Text>{job.location || 'Online'}</Text></HStack>
                        <HStack color="gray.500" fontSize="xs" fontWeight="bold"><FiClock /><Text>Due: {job.deadline}</Text></HStack>
                      </HStack>
                    </VStack>
                  </Flex>
                  
                  <Separator my={6} borderColor="gray.50" />
                  
                  <Flex justify="space-between" align="center" gap={4}>
                     <HStack gap={2}>
                        <Button 
                          variant="outline" size="sm" rounded="xl" fontSize="10px" fontWeight="black" gap={2}
                          onClick={() => { setSupportJob(job); setIsSupportModalOpen(true); }}
                        >
                          <FiHelpCircle /> HELP?
                        </Button>
                     </HStack>
                     <Button 
                       onClick={() => handleApply(job.id)}
                       disabled={appliedIds.includes(job.id)}
                       size="sm" 
                       background={appliedIds.includes(job.id) ? 'gray.100' : "linear-gradient(to right, #111827, #374151)"}
                       color={appliedIds.includes(job.id) ? 'gray.400' : 'white'}
                       px={6} 
                       rounded="xl" 
                       fontWeight="black" 
                       fontSize="xs"
                       _hover={!appliedIds.includes(job.id) ? { transform: 'scale(1.05)', shadow: 'xl' } : {}}
                     >
                        {appliedIds.includes(job.id) ? 'SUBMITTED' : 'APPLY NOW'}
                     </Button>
                  </Flex>
                </Box>
              </Card.Root>
            ))}
          </SimpleGrid>
        ) : (
          <Center py={20} flexDirection="column" gap={4}>
             <FiSearch size={48} color="gray.200" />
             <Text color="gray.500" fontWeight="bold">No opportunities found.</Text>
          </Center>
        )}
      </Box>
    </Box>
  )
}
