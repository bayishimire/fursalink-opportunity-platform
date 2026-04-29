'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  Button,
  HStack,
  VStack,
  Table,
  Badge,
  Input,
  Flex,
  Separator,
  Grid,
  GridItem,
  Textarea
} from '@chakra-ui/react'
import {
  FiUsers,
  FiShield,
  FiBell,
  FiActivity,
  FiSave,
  FiEdit2,
  FiTrash2,
  FiUserPlus,
  FiCheckCircle,
  FiSearch,
  FiPlusCircle,
  FiBriefcase,
  FiBookOpen,
  FiArrowLeft,
  FiLink,
  FiUploadCloud,
  FiTrendingUp,
  FiBarChart2,
  FiPieChart,
  FiUserCheck,
  FiLogIn,
  FiZap,
  FiDatabase,
  FiMapPin,
  FiCalendar,
  FiAlignLeft,
  FiUser,
  FiMail,
  FiAtSign,
  FiXCircle,
  FiSend
} from 'react-icons/fi'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [selectedStatDetail, setSelectedStatDetail] = useState<{ title: string, data: any[] } | null>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Form States
  const [users, setUsers] = useState<any[]>([])

  const [newUser, setNewUser] = useState({ firstName: '', lastName: '', username: '', email: '', role: 'student' })
  const [dbJobs, setDbJobs] = useState<any[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    deadline: '',
    url: '',
    description: '',
    location: '',
    startDate: '',
    experience: 'Not Required',
    level: 'programming',
    video_url: '',
    image: null as string | null,
    exam_url: ''
  })

  // File Input Refs
  const userFileRef = useRef<HTMLInputElement>(null)
  const jobFileRef = useRef<HTMLInputElement>(null)

  const [editingUserId, setEditingUserId] = useState<number | null>(null)

  const fetchContent = () => {
    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => setDbJobs(data.jobs || []))
      .catch(err => console.error("Error fetching content:", err))

    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Error fetching stats:", err))

    fetch('/api/applications')
      .then(res => res.json())
      .then(data => setApplications(data.applications || []))
      .catch(err => console.error("Error fetching apps:", err))

    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => setUsers(data.users || []))
      .catch(err => console.error("Error fetching users:", err))
  }

  useEffect(() => {
    fetchContent();
  }, [])

  const deleteUser = async (id: number) => {
    if (!window.confirm('Permanently delete this user account?')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('User removed successfully');
        fetchContent();
      } else {
        showToast('Failed to delete user', 'error');
      }
    } catch (e) {
      showToast('Network error — delete failed', 'error');
    }
  }

  const startEditUser = (user: any) => {
    setEditingUserId(user.id);
    const names = user.name.split(' ');
    setNewUser({
      firstName: names[0] || '',
      lastName: names.slice(1).join(' ') || '',
      username: user.email.split('@')[0], // username isn't in GET for now, using email prefix
      email: user.email,
      role: user.role
    });
    setPhotoPreview(user.picture);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const onboardUser = async () => {
    if (!newUser.email || !newUser.username) {
      showToast('Please fill in Email and Username', 'error');
      return;
    }
    const fullName = `${newUser.firstName} ${newUser.lastName}`.trim() || newUser.username;

    try {
      const url = editingUserId ? `/api/admin/users/${editingUserId}` : '/api/admin/users';
      const method = editingUserId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: newUser.email,
          username: newUser.username,
          role: newUser.role,
          picture: photoPreview
        })
      });

      if (res.ok) {
        showToast(editingUserId ? `Identity updated — ${fullName}` : `${fullName} authorized successfully`);

        const stored = localStorage.getItem('user');
        if (stored && editingUserId) {
          const currUser = JSON.parse(stored);
          if (currUser.id == editingUserId) {
            const updatedUser = { ...currUser, name: fullName, picture: photoPreview || currUser.picture };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.dispatchEvent(new CustomEvent('user-update', { detail: updatedUser }));
          }
        }

        setNewUser({ firstName: '', lastName: '', username: '', email: '', role: 'student' });
        setPhotoPreview(null);
        setEditingUserId(null);
        fetchContent();
      } else {
        const error = await res.json();
        showToast(`Failed: ${error.message}`, 'error');
      }
    } catch (e) {
      showToast('Network error — sync failed', 'error');
    }
  }

  const deleteJob = async (id: number) => {
    if (!window.confirm('Remove this content from the platform?')) return;
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Content removed from platform');
        fetchContent();
      } else {
        showToast('Failed to remove content', 'error');
      }
    } catch (e) {
      showToast('Network error — delete failed', 'error');
    }
  }

  const updateAppStatus = async (id: number, status: string) => {
    try {
      const res = await fetch('/api/applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        showToast(`Enrollment ${status === 'approved' ? 'approved ✓' : 'rejected ✗'}`, status === 'approved' ? 'success' : 'error');
        fetchContent();
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch (e) {
      showToast('Network error — update failed', 'error');
    }
  }

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setJobForm({
      title: item.title,
      company: item.company,
      deadline: item.deadline,
      url: item.application_url,
      description: item.description,
      location: item.location || '',
      startDate: item.start_date || '',
      experience: item.experience || 'Not Required',
      level: item.level || 'programming',
      video_url: item.video_url || '',
      image: item.image_url || null,
      exam_url: item.exam_url || ''
    });
    setActiveTab(item.category === 'job' ? 'jobs' : item.category === 'scholarship' ? 'scholarships' : 'courses');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const handleJobImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setJobForm({ ...jobForm, image: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <Box p={3} bg="white" rounded="xl" shadow="sm" border="1px solid" borderColor="gray.50">
      <HStack gap={3} mb={1}>
        <Box p={1.5} bg={`${color}.50`} rounded="lg">
          <Icon size={14} color={`var(--chakra-colors-${color}-500)`} />
        </Box>
        <Text fontSize="10px" fontWeight="black" color="gray.400" letterSpacing="0.8px">{label}</Text>
      </HStack>
      <Heading size="lg" color="gray.800" fontWeight="900" letterSpacing="-0.5px" ml={1}>{value}</Heading>
    </Box>
  );

  const renderDashboard = () => (
    <VStack align="stretch" gap={6}>
      {/* Activity Today Section */}
      <Box mb={2}>
        <HStack gap={3} mb={4}>
          <Box p={2} bg="blue.900" rounded="xl" color="white"><FiActivity size={16} /></Box>
          <Heading size="lg" color="blue.900" fontWeight="900">Platform Command Center</Heading>
        </HStack>

        <SimpleGrid columns={{ base: 2, md: 5 }} gap={4}>
          <StatCard icon={FiUsers} label="TOTAL USERS" value={stats?.summary?.totalUsers || 0} color="blue" />
          <StatCard icon={FiUserCheck} label="ACTIVE LOGINS" value={stats?.summary?.activeLogins || 0} color="green" />
          <StatCard icon={FiMail} label="TICKETS" value={stats?.summary?.supportTickets || 0} color="orange" />
          <StatCard icon={FiBriefcase} label="POSTS" value={stats?.summary?.jobsPosted || 0} color="purple" />
          <StatCard icon={FiSend} label="APPS" value={stats?.summary?.applicationsSent || 0} color="cyan" />
        </SimpleGrid>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
        <Box bg="white" p={5} rounded="2xl" shadow="sm" border="1px solid" borderColor="gray.50">
          <Text fontSize="10px" fontWeight="900" color="gray.400" mb={4} letterSpacing="1px">ENGAGEMENT ANALYTICS</Text>
          <VStack align="stretch" gap={4}>
            <Box>
              <Flex justify="space-between" mb={1.5}>
                <Text fontSize="11px" fontWeight="black" color="gray.600">RETENTION INDEX</Text>
                <Text fontSize="10px" fontWeight="black" color="blue.500">{stats?.summary?.totalUsers ? Math.round((stats.summary.activeLogins / stats.summary.totalUsers) * 100) : 0}%</Text>
              </Flex>
              <Box h="6px" bg="gray.50" rounded="full" overflow="hidden">
                <Box h="full" bg="blue.500" w={`${stats?.summary?.totalUsers ? (stats.summary.activeLogins / stats.summary.totalUsers) * 100 : 0}%`} />
              </Box>
            </Box>
            <Box>
              <Flex justify="space-between" mb={1.5}>
                <Text fontSize="11px" fontWeight="black" color="gray.600">CONVERSION RATIO</Text>
                <Text fontSize="10px" fontWeight="black" color="purple.500">{stats?.summary?.activeLogins ? Math.round((stats.summary.applicationsSent / stats.summary.activeLogins) * 100) : 0}%</Text>
              </Flex>
              <Box h="6px" bg="gray.50" rounded="full" overflow="hidden">
                <Box h="full" bg="purple.500" w={`${stats?.summary?.activeLogins ? (stats.summary.applicationsSent / stats.summary.activeLogins) * 100 : 0}%`} />
              </Box>
            </Box>
          </VStack>
        </Box>
        <Box bg="white" p={5} rounded="2xl" shadow="sm" border="1px solid" borderColor="gray.50">
          <Text fontSize="10px" fontWeight="900" color="gray.400" mb={4} letterSpacing="1px">GROWTH DYNAMICS</Text>
          <Box height="100px" display="flex" alignItems="flex-end" gap={2}>
            {(stats?.growth || [2, 5, 3, 8, 6]).map((g: any, i: number) => (
              <Box key={i} flex={1} bg="blue.50" h={`${(g.count || g || 0) * 8}px`} rounded="md" _hover={{ bg: 'blue.500' }} transition="0.3s" />
            ))}
          </Box>
        </Box>
      </SimpleGrid>

      <Box mt={4} bg="white" p={6} rounded="2xl" shadow="sm" border="1px solid" borderColor="gray.50">
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="md" color="blue.900" fontWeight="900">Active Publications Command Center</Heading>
          <HStack bg="gray.50" px={3} py={1.5} rounded="xl" w="300px">
            <FiSearch size={14} color="gray" />
            <Input variant="subtle" placeholder="Search across all publications..." fontSize="12px" fontWeight="medium" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} border="none" />
          </HStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, xl: 3 }} gap={8}>
          {/* Courses Column */}
          <Box borderRight={{ xl: "1px solid" }} borderColor="gray.50" pr={{ xl: 4 }}>
            <HStack mb={4} color="green.600">
               <FiBookOpen size={16} />
               <Heading size="sm" fontWeight="black">LEARNING RESOURCES</Heading>
               <Badge variant="subtle" colorPalette="green" rounded="md">{dbJobs.filter(j => j.category === 'course').length}</Badge>
            </HStack>
            <VStack align="stretch" gap={3}>
              {dbJobs.filter(j => j.category === 'course' && j.title.toLowerCase().includes(searchTerm.toLowerCase())).map((job, i) => (
                <Box key={i} p={3} bg="gray.50" rounded="xl" _hover={{ bg: 'green.50' }} transition="0.2s">
                  <Flex justify="space-between" align="center">
                    <Box flex={1}>
                      <Text fontWeight="900" fontSize="12px" color="blue.900" lineClamp={1}>{job.title}</Text>
                      <Text fontSize="10px" fontWeight="bold" color="gray.400">{job.company}</Text>
                    </Box>
                    <HStack gap={1}>
                      <Button size="xs" variant="ghost" colorPalette="blue" onClick={() => startEdit(job)}><FiEdit2 size={10} /></Button>
                      <Button size="xs" variant="ghost" colorPalette="red" onClick={() => deleteJob(job.id)}><FiTrash2 size={10} /></Button>
                    </HStack>
                  </Flex>
                </Box>
              ))}
            </VStack>
          </Box>

          {/* Scholarships Column */}
          <Box borderRight={{ xl: "1px solid" }} borderColor="gray.50" px={{ xl: 4 }}>
            <HStack mb={4} color="purple.600">
               <FiZap size={16} />
               <Heading size="sm" fontWeight="black">SCHOLARSHIP GRANTS</Heading>
               <Badge variant="subtle" colorPalette="purple" rounded="md">{dbJobs.filter(j => j.category === 'scholarship').length}</Badge>
            </HStack>
            <VStack align="stretch" gap={3}>
              {dbJobs.filter(j => j.category === 'scholarship' && j.title.toLowerCase().includes(searchTerm.toLowerCase())).map((job, i) => (
                <Box key={i} p={3} bg="gray.50" rounded="xl" _hover={{ bg: 'purple.50' }} transition="0.2s">
                  <Flex justify="space-between" align="center">
                    <Box flex={1}>
                      <Text fontWeight="900" fontSize="12px" color="blue.900" lineClamp={1}>{job.title}</Text>
                      <Text fontSize="10px" fontWeight="bold" color="gray.400">{job.company}</Text>
                    </Box>
                    <HStack gap={1}>
                      <Button size="xs" variant="ghost" colorPalette="blue" onClick={() => startEdit(job)}><FiEdit2 size={10} /></Button>
                      <Button size="xs" variant="ghost" colorPalette="red" onClick={() => deleteJob(job.id)}><FiTrash2 size={10} /></Button>
                    </HStack>
                  </Flex>
                </Box>
              ))}
            </VStack>
          </Box>

          {/* Jobs Column */}
          <Box pl={{ xl: 4 }}>
            <HStack mb={4} color="blue.600">
               <FiBriefcase size={16} />
               <Heading size="sm" fontWeight="black">CAREER OPPORTUNITIES</Heading>
               <Badge variant="subtle" colorPalette="blue" rounded="md">{dbJobs.filter(j => (j.category === 'job' || !j.category)).length}</Badge>
            </HStack>
            <VStack align="stretch" gap={3}>
              {dbJobs.filter(j => (j.category === 'job' || !j.category) && j.title.toLowerCase().includes(searchTerm.toLowerCase())).map((job, i) => (
                <Box key={i} p={3} bg="gray.50" rounded="xl" _hover={{ bg: 'blue.50' }} transition="0.2s">
                  <Flex justify="space-between" align="center">
                    <Box flex={1}>
                      <Text fontWeight="900" fontSize="12px" color="blue.900" lineClamp={1}>{job.title}</Text>
                      <Text fontSize="10px" fontWeight="bold" color="gray.400">{job.company}</Text>
                    </Box>
                    <HStack gap={1}>
                      <Button size="xs" variant="ghost" colorPalette="blue" onClick={() => startEdit(job)}><FiEdit2 size={10} /></Button>
                      <Button size="xs" variant="ghost" colorPalette="red" onClick={() => deleteJob(job.id)}><FiTrash2 size={10} /></Button>
                    </HStack>
                  </Flex>
                </Box>
              ))}
            </VStack>
          </Box>
        </SimpleGrid>
      </Box>
    </VStack>
  )

  const renderUserControl = () => (
    <VStack align="stretch" gap={8}>
      <Flex direction={{ base: 'column', xl: 'row' }} gap={10}>
        <Box w={{ base: 'full', xl: '320px' }}>
          <Heading size="md" mb={5} color="blue.900" fontWeight="900">Provision Identity</Heading>
          <Grid templateColumns="repeat(2, 1fr)" gap={3}>
            <GridItem colSpan={2}>
              <Box border="2px dashed" borderColor="gray.100" p={5} rounded="2xl" textAlign="center" cursor="pointer" onClick={() => userFileRef.current?.click()} _hover={{ bg: 'gray.50', borderColor: 'blue.200' }} transition="0.3s">
                {photoPreview ? <img src={photoPreview} style={{ width: '40px', height: '40px', borderRadius: '50%', margin: 'auto', objectFit: 'cover' }} alt="P" /> : <FiUploadCloud size={20} color="#3b82f6" />}
                <Text fontSize="10px" fontWeight="black" color="blue.500" mt={2}>UPLOAD AVATAR</Text>
                <input type="file" ref={userFileRef} onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </Box>
            </GridItem>
            <GridItem><Input placeholder="First" variant="subtle" bg="gray.50" fontSize="11px" fontWeight="bold" h="38px" value={newUser.firstName} onChange={e => setNewUser({ ...newUser, firstName: e.target.value })} rounded="xl" /></GridItem>
            <GridItem><Input placeholder="Last" variant="subtle" bg="gray.50" fontSize="11px" fontWeight="bold" h="38px" value={newUser.lastName} onChange={e => setNewUser({ ...newUser, lastName: e.target.value })} rounded="xl" /></GridItem>
            <GridItem colSpan={2}><Input placeholder="Username" variant="subtle" bg="gray.50" fontSize="11px" fontWeight="bold" h="38px" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} rounded="xl" /></GridItem>
            <GridItem colSpan={2}><Input placeholder="Email Address" variant="subtle" bg="gray.50" fontSize="11px" fontWeight="bold" h="38px" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} rounded="xl" /></GridItem>
            <GridItem colSpan={2} pt={2}><Button w="full" h="44px" bg="blue.900" color="white" fontSize="12px" fontWeight="black" rounded="xl" onClick={onboardUser} _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}>{editingUserId ? 'SYNC CHANGES' : 'AUTHORIZE ACCESS'}</Button></GridItem>
          </Grid>
        </Box>
        <Box flex="1" bg="white" p={6} rounded="3xl" shadow="sm" border="1px solid" borderColor="gray.50">
          <Heading size="md" mb={6} color="blue.900" fontWeight="900">Identity Records</Heading>
          <Table.Root size="md" variant="line">
            <Table.Header>
              <Table.Row borderBottom="1px solid" borderColor="gray.50">
                <Table.ColumnHeader py={3} fontSize="10px" color="gray.400">IDENTITY</Table.ColumnHeader>
                <Table.ColumnHeader py={3} fontSize="10px" color="gray.400">PERMISSION</Table.ColumnHeader>
                <Table.ColumnHeader py={3} fontSize="10px" color="gray.400" textAlign="right">OPS</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredUsers.map((u, i) => (
                <Table.Row key={i} borderBottom="1px solid" borderColor="gray.50" _hover={{ bg: 'blue.50' }}>
                  <Table.Cell py={3}>
                    <HStack gap={3}>
                      <Box boxSize="28px" rounded="full" overflow="hidden" bg="gray.100" border="2px solid white" shadow="sm">
                        {u.picture ? <img src={u.picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="U" /> : <FiUser size={12} color="gray" />}
                      </Box>
                      <Box>
                        <Text fontWeight="900" fontSize="12px" color="blue.900">{u.name}</Text>
                        <Text fontSize="10px" fontWeight="bold" color="gray.400">{u.email}</Text>
                      </Box>
                    </HStack>
                  </Table.Cell>
                  <Table.Cell py={3}><Badge fontSize="10px" px={2} py={0.5} rounded="full" variant="subtle" colorPalette={u.role === 'admin' ? 'purple' : 'blue'}>{u.role?.toUpperCase()}</Badge></Table.Cell>
                  <Table.Cell py={3} textAlign="right">
                    <HStack gap={2} justify="flex-end">
                      <Button size="sm" variant="ghost" rounded="lg" onClick={() => startEditUser(u)}><FiEdit2 size={12} /></Button>
                      <Button size="sm" variant="ghost" colorPalette="red" rounded="lg" onClick={() => deleteUser(u.id)}><FiTrash2 size={12} /></Button>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Flex>
    </VStack>
  )

  const renderApplications = () => (
    <Box bg="white" p={6} rounded="3xl" shadow="sm" border="1px solid" borderColor="gray.50">
      <Heading size="md" mb={6} color="blue.900" fontWeight="900">Unified Enrollment Queue</Heading>
      <Table.Root size="md" variant="plain">
        <Table.Header>
          <Table.Row borderBottom="1px solid" borderColor="gray.50">
            <Table.ColumnHeader py={3} fontSize="10px" color="gray.400">CANDIDATE</Table.ColumnHeader>
            <Table.ColumnHeader py={3} fontSize="10px" color="gray.400">TARGET RESOURCE</Table.ColumnHeader>
            <Table.ColumnHeader py={3} fontSize="10px" color="gray.400">STATUS</Table.ColumnHeader>
            <Table.ColumnHeader py={3} fontSize="10px" color="gray.400" textAlign="right">DECISION</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {applications.map((app, i) => (
            <Table.Row key={i} borderBottom="1px solid" borderColor="gray.50" _hover={{ bg: 'blue.50' }}>
              <Table.Cell py={3}><Text fontWeight="900" fontSize="12px" color="blue.900">{app.user_name}</Text></Table.Cell>
              <Table.Cell py={3}><Text fontSize="11px" fontWeight="bold" color="gray.500">{app.job_title}</Text></Table.Cell>
              <Table.Cell py={3}><Badge fontSize="9px" px={2} py={0.5} rounded="full" colorPalette={app.status === 'approved' ? 'green' : 'orange'}>{app.status.toUpperCase()}</Badge></Table.Cell>
              <Table.Cell py={3} textAlign="right">
                {app.status === 'pending' && (
                  <HStack gap={2} justify="flex-end">
                    <Button size="sm" colorPalette="green" variant="ghost" rounded="lg" onClick={() => updateAppStatus(app.id, 'approved')}><FiCheckCircle size={14} /></Button>
                    <Button size="sm" colorPalette="red" variant="ghost" rounded="lg" onClick={() => updateAppStatus(app.id, 'rejected')}><FiXCircle size={14} /></Button>
                  </HStack>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  )

  const renderJobForm = () => {
    const isEditing = !!editingId;
    const typeConfigs: any = {
      jobs: { title: 'Job Opportunity', color: 'blue.900' },
      scholarships: { title: 'Scholarship Grant', color: 'purple.900' },
      courses: { title: 'Learning Resource', color: 'green.900' }
    };
    const config = typeConfigs[activeTab] || typeConfigs.jobs;

    return (
      <VStack align="stretch" gap={6}>
        <Flex justify="space-between" align="center">
          <Heading size="lg" color={config.color} fontWeight="900">Broadcast {config.title}</Heading>
          <Button variant="outline" size="sm" rounded="xl" onClick={() => { setEditingId(null); setActiveTab('dashboard'); }} fontWeight="black">CANCEL</Button>
        </Flex>
        <Box bg="white" p={8} rounded="3xl" shadow="sm" border="1px solid" borderColor="gray.50">
          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            <GridItem colSpan={2}>
              <Box border="2px dashed" borderColor="gray.100" p={5} rounded="2xl" textAlign="center" cursor="pointer" onClick={() => jobFileRef.current?.click()} _hover={{ bg: 'gray.50', borderColor: 'blue.200' }} transition="0.3s">
                {jobForm.image ? (
                  <Box position="relative" display="inline-block">
                    <img src={jobForm.image} style={{ maxHeight: '150px', borderRadius: '12px', margin: 'auto' }} alt="P" />
                    <Button size="xs" colorPalette="red" position="absolute" top="-10px" right="-10px" onClick={(e) => { e.stopPropagation(); setJobForm({ ...jobForm, image: null }) }}>X</Button>
                  </Box>
                ) : (
                  <VStack gap={1}>
                    <FiUploadCloud size={30} color={config.color === 'blue.900' ? '#3b82f6' : config.color === 'purple.900' ? '#a855f7' : '#22c55e'} />
                    <Text fontSize="11px" fontWeight="black" color="gray.400">UPLOAD COVER IMAGE (OPTIONAL)</Text>
                  </VStack>
                )}
                <input type="file" ref={jobFileRef} onChange={handleJobImageUpload} style={{ display: 'none' }} accept="image/*" />
              </Box>
            </GridItem>

            <GridItem colSpan={2}>
              <VStack align="stretch" gap={2}>
                <Input placeholder="Video URL (YouTube/Vimeo/Direct Link) - Optional" bg="gray.50" h="44px" fontSize="12px" fontWeight="bold" rounded="xl" px={4} value={jobForm.video_url} onChange={e => setJobForm({ ...jobForm, video_url: e.target.value })} border="none" />
                {jobForm.video_url && (
                  <Box mt={2} rounded="xl" overflow="hidden" shadow="md">
                    {/* Simple video player preview */}
                    <iframe
                      width="100%"
                      height="200px"
                      src={jobForm.video_url.includes('youtube.com') ? jobForm.video_url.replace('watch?v=', 'embed/') : jobForm.video_url}
                      style={{ border: 'none' }}
                      title="Video preview"
                    />
                  </Box>
                )}
              </VStack>
            </GridItem>

            <GridItem colSpan={2}><Input placeholder="Title" bg="gray.50" h="44px" fontSize="13px" fontWeight="bold" rounded="xl" px={4} value={jobForm.title} onChange={e => setJobForm({ ...jobForm, title: e.target.value })} border="none" /></GridItem>
            <GridItem><Input placeholder="Organization / Provider" bg="gray.50" h="44px" fontSize="12px" fontWeight="bold" rounded="xl" px={4} value={jobForm.company} onChange={e => setJobForm({ ...jobForm, company: e.target.value })} border="none" /></GridItem>
            <GridItem><Input placeholder="Location / Mode" bg="gray.50" h="44px" fontSize="12px" fontWeight="bold" rounded="xl" px={4} value={jobForm.location} onChange={e => setJobForm({ ...jobForm, location: e.target.value })} border="none" /></GridItem>
            <GridItem colSpan={2}><Input placeholder="Application/Registration Link (URL)" bg="gray.50" h="44px" fontSize="12px" fontWeight="bold" rounded="xl" px={4} value={jobForm.url} onChange={e => setJobForm({ ...jobForm, url: e.target.value })} border="none" color="blue.600" /></GridItem>
            <GridItem colSpan={2}><Input placeholder="Practice Exam Link (Optional URL)" bg="gray.50" h="44px" fontSize="12px" fontWeight="bold" rounded="xl" px={4} value={jobForm.exam_url} onChange={e => setJobForm({ ...jobForm, exam_url: e.target.value })} border="none" color="orange.600" /></GridItem>
            <GridItem colSpan={2}><Textarea placeholder="Construct a detailed broadcast description..." bg="gray.50" fontSize="12px" fontWeight="medium" p={4} rows={6} rounded="xl" value={jobForm.description} onChange={e => setJobForm({ ...jobForm, description: e.target.value })} border="none" /></GridItem>
            <GridItem colSpan={2} pt={4}>
              <Button
                w="full" h="50px" bg={config.color} color="white" fontSize="14px" fontWeight="black" rounded="2xl" shadow="lg"
                loading={isSubmitting}
                _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                onClick={async () => {
                  try {
                    setIsSubmitting(true);
                    const categoryMap = { jobs: 'job', scholarships: 'scholarship', courses: 'course' };
                    const category = (categoryMap as any)[activeTab] || 'job';

                    const url = editingId ? `/api/jobs/${editingId}` : '/api/jobs';
                    const method = editingId ? 'PUT' : 'POST';

                    const res = await fetch(url, {
                      method,
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ ...jobForm, category, deadline: '2026-12-31' })
                    });
                    if (res.ok) {
                      showToast(editingId ? 'Broadcast updated successfully' : 'Broadcast deployed successfully');
                      setJobForm({
                        title: '', company: '', deadline: '', url: '', description: '', location: '',
                        startDate: '', experience: 'Not Required', level: 'programming', video_url: '', image: null, exam_url: ''
                      });
                      setEditingId(null);
                      fetchContent();
                      setActiveTab('dashboard');
                    } else {
                      showToast(editingId ? 'Failed to update broadcast' : 'Failed to deploy broadcast', 'error');
                    }
                  } catch (e) {
                    showToast('Network error', 'error');
                  } finally { setIsSubmitting(false); }
                }}
              >
                {editingId ? 'UPDATE BROADCAST' : 'DEPLOY BROADCAST'}
              </Button>
            </GridItem>
          </Grid>
        </Box>
      </VStack>
    );
  }

  return (
    <Box pb={10} maxW="1600px" mx="auto" px={6}>

      {/* ── Toast Notification ── */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.6; }
        }
      `}</style>
      {toast && (
        <Box
          position="fixed"
          top="24px"
          right="24px"
          zIndex={9999}
          bg={toast.type === 'success' ? 'green.500' : 'red.500'}
          color="white"
          px={5}
          py={3}
          rounded="2xl"
          shadow="2xl"
          display="flex"
          alignItems="center"
          gap={3}
          minW="240px"
          maxW="360px"
          style={{ animation: 'slideInRight 0.3s ease-out' }}
        >
          <Box fontSize="16px">{toast.type === 'success' ? '✓' : '✕'}</Box>
          <Text fontWeight="bold" fontSize="13px" flex="1">{toast.message}</Text>
        </Box>
      )}

      <Flex mb={10} justify="space-between" align="center" py={6} borderBottom="1px solid" borderColor="gray.50">
        <VStack align="flex-start" gap={0}>
          <Heading size="3xl" color="blue.900" fontWeight="900" letterSpacing="-1.5px">FURSA<span style={{ color: '#3b82f6' }}>.</span>LINK</Heading>
          <Text fontSize="10px" fontWeight="black" color="gray.400" letterSpacing="2px">COMMAND SYSTEM</Text>
        </VStack>
        <HStack gap={3}>
          <Button variant="ghost" size="md" fontWeight="900" fontSize="12px" rounded="xl" onClick={() => setActiveTab('dashboard')} bg={activeTab === 'dashboard' ? 'blue.50' : 'transparent'} color={activeTab === 'dashboard' ? 'blue.600' : 'gray.500'}>OVERVIEW</Button>
          <Button variant="ghost" size="md" fontWeight="900" fontSize="12px" rounded="xl" onClick={() => setActiveTab('users')} bg={activeTab === 'users' ? 'blue.50' : 'transparent'} color={activeTab === 'users' ? 'blue.600' : 'gray.500'} position="relative">
            <HStack gap={1.5}>
              <Box position="relative">
                <FiUsers size={14} />
                {users.length > 0 && (
                  <Box
                    position="absolute"
                    top="-4px"
                    right="-5px"
                    bg="blue.500"
                    color="white"
                    fontSize="8px"
                    fontWeight="black"
                    rounded="full"
                    minW="14px"
                    h="14px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    px="2px"
                    lineHeight="1"
                  >
                    {users.length}
                  </Box>
                )}
              </Box>
              <Text fontSize="12px" fontWeight="900">CONTROL USER</Text>
            </HStack>
          </Button>
          <Button variant="ghost" size="md" fontWeight="900" fontSize="12px" rounded="xl" onClick={() => setActiveTab('applications')} bg={activeTab === 'applications' ? 'blue.50' : 'transparent'} color={activeTab === 'applications' ? 'blue.600' : 'gray.500'} position="relative">
            <HStack gap={1.5}>
              <Box position="relative">
                <FiBell size={14} />
                {applications.filter(a => a.status === 'pending').length > 0 && (
                  <Box
                    position="absolute"
                    top="-4px"
                    right="-5px"
                    bg="orange.500"
                    color="white"
                    fontSize="8px"
                    fontWeight="black"
                    rounded="full"
                    minW="14px"
                    h="14px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    px="2px"
                    lineHeight="1"
                    style={{ animation: 'pulse 2s infinite' }}
                  >
                    {applications.filter(a => a.status === 'pending').length}
                  </Box>
                )}
              </Box>
              <Text fontSize="12px" fontWeight="900">LIVE NOTIFICATION</Text>
            </HStack>
          </Button>
          <Separator orientation="vertical" h="20px" mx={2} />
          <Button size="md" fontWeight="black" fontSize="12px" rounded="xl" px={5} onClick={() => setActiveTab('jobs')} bg={activeTab === 'jobs' ? 'blue.100' : 'blue.900'} color={activeTab === 'jobs' ? 'blue.800' : 'white'} variant={activeTab === 'jobs' ? 'subtle' : 'solid'}>+ JOB</Button>
          <Button size="md" fontWeight="black" fontSize="12px" rounded="xl" px={5} onClick={() => setActiveTab('scholarships')} bg={activeTab === 'scholarships' ? 'purple.100' : 'purple.700'} color={activeTab === 'scholarships' ? 'purple.800' : 'white'} variant={activeTab === 'scholarships' ? 'subtle' : 'solid'}>+ SCHOLARSHIP</Button>
          <Button size="md" fontWeight="black" fontSize="12px" rounded="xl" px={5} onClick={() => setActiveTab('courses')} bg={activeTab === 'courses' ? 'green.100' : 'green.700'} color={activeTab === 'courses' ? 'green.800' : 'white'} variant={activeTab === 'courses' ? 'subtle' : 'solid'}>+ COURSE</Button>
        </HStack>
      </Flex>

      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'users' && renderUserControl()}
      {activeTab === 'applications' && renderApplications()}
      {(activeTab === 'jobs' || activeTab === 'scholarships' || activeTab === 'courses') && renderJobForm()}
    </Box>
  )
}
