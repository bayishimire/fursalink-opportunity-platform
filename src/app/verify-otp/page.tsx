'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { Box, Button, Center, Heading, Text, VStack, Input, Icon, Spinner, HStack, Link } from '@chakra-ui/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FiMail, FiShield, FiRefreshCw, FiArrowRight, FiInstagram } from 'react-icons/fi'
import { FaWhatsapp, FaYoutube, FaXTwitter } from 'react-icons/fa6'

function VerifyOTPContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [status, setStatus] = useState<{ type: 'error' | 'success', message: string } | null>(null)
  
  const [timer, setTimer] = useState(900) // 15 minutes visual countdown (matching backend)

  useEffect(() => {
    if (!email) router.push('/register')
    
    // Simple visual countdown logic
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [email, router])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      setStatus({ type: 'error', message: 'Please enter a valid 6-digit code.' })
      return
    }

    setLoading(true)
    setStatus(null)

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      })

      const data = await res.json()

      if (res.ok) {
        setStatus({ type: 'success', message: 'Email Verified Successfully! Redirecting to Dashboard...' })
        
        // Save user info for session persistence (Autologin)
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user))
          window.dispatchEvent(new CustomEvent('user-update', { detail: data.user }))
        }

        const role = data.user.role?.toLowerCase()
        setTimeout(() => {
          if (role === 'admin') router.push('/dashboard/admin')
          else if (role === 'user_system') router.push('/dashboard/user_system')
          else router.push('/dashboard/student')
        }, 2000)
      } else {
        setStatus({ type: 'error', message: data.message || 'Invalid code.' })
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'System error.' })
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setStatus(null)
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (res.ok) {
        setStatus({ type: 'success', message: 'A fresh new code has been sent to your email.' })
        setTimer(900) // Restart 15 min timer
        setOtp('')
      } else {
        setStatus({ type: 'error', message: data.message || 'Failed to resend code.' })
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'System error.' })
    } finally {
      setResending(false)
    }
  }

  return (
    <Box minH="100vh" w="full" bgGradient="linear(to-br, #f1f5f9, #e2e8f0)" display="flex" alignItems="center" justifyContent="center" px={4} py={10}>
      <Box 
        w="full" 
        maxW="450px" 
        bg="white" 
        rounded="3xl" 
        shadow="2xl" 
        p={8} 
        position="relative"
        overflow="hidden"
      >
        {/* Brand Banner Top */}
        <Box position="absolute" top={0} left={0} right={0} h="6px" bgGradient="linear(to-r, #14d590, #0daaf9)" />

        <VStack gap={6} as="form" onSubmit={handleVerify}>
          <VStack gap={4} mb={2}>
            <Box cursor="pointer" onClick={() => router.push('/')}>
              <img src="/logo.png" alt="Fursa.Link Logo" style={{ height: '40px', objectFit: 'contain' }} />
            </Box>
            <Center w="64px" h="64px" bg="blue.50" rounded="2xl" shadow="inner">
              <FiShield size={32} color="#0daaf9" />
            </Center>
          </VStack>

          <VStack gap={1} textAlign="center">
            <Heading size="lg" color="blue.900" fontWeight="black" letterSpacing="tight">
              One-Time Password
            </Heading>
            <Text color="gray.500" fontSize="sm" px={4}>
              We've sent a 6-digit activation code to <br />
              <strong style={{ color: '#2d3748' }}>{email}</strong>
            </Text>
            <Button 
                variant="ghost" 
                size="xs" 
                color="blue.500" 
                fontWeight="bold" 
                onClick={() => router.push('/register')}
                _hover={{ textDecoration: 'underline', bg: 'transparent', color: 'blue.600' }}
            >
              Not your email? Change it
            </Button>
          </VStack>

          {/* Alert Status */}
          {status && (
            <Box p={3} rounded="lg" bg={status.type === 'error' ? 'red.50' : 'green.50'} color={status.type === 'error' ? 'red.600' : 'green.600'} w="full" textAlign="center" fontSize="sm" fontWeight="bold">
              {status.message}
            </Box>
          )}

          <VStack w="full" gap={2}>
            <Text fontSize="xs" fontWeight="bold" color="gray.400" alignSelf="flex-start" letterSpacing="wide">ENTER 6-DIGIT CODE</Text>
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              size="lg"
              height="60px"
              textAlign="center"
              fontSize="3xl"
              fontWeight="black"
              letterSpacing="10px"
              placeholder="000000"
              bg="gray.50"
              border="2px solid"
              borderColor="gray.200"
              rounded="xl"
              _focus={{ borderColor: 'blue.400', bg: 'white', shadow: 'outline' }}
              transition="all 0.2s"
            />
          </VStack>

          <Button 
            type="submit"
            w="full" 
            h="50px" 
            rounded="xl" 
            color="white" 
            fontSize="md" 
            fontWeight="bold" 
            background="linear-gradient(135deg, #14d590 0%, #0daaf9 100%)"
            _hover={{ filter: 'brightness(1.1)', shadow: 'lg', transform: 'translateY(-2px)' }}
            transition="all 0.3s"
            disabled={loading || otp.length !== 6}
          >
            {loading ? <Spinner size="sm" color="white" /> : (
              <>Verify Identity <FiArrowRight style={{ marginLeft: '8px' }} /></>
            )}
          </Button>

          {/* Time & Resend Logic */}
          <Box w="full" pt={4} borderTop="1px solid" borderColor="gray.100" textAlign="center">
            {timer > 0 ? (
              <Text fontSize="sm" color="gray.500" fontWeight="medium">
                Code expires in: <strong style={{ color: '#e53e3e' }}>{formatTime(timer)}</strong>
              </Text>
            ) : (
              <VStack gap={2}>
                <Text fontSize="sm" color="red.500" fontWeight="bold">Code has expired!</Text>
                <Button 
                  variant="ghost" 
                  color="blue.500" 
                  size="sm" 
                  onClick={handleResend} 
                  disabled={resending}
                >
                  {resending ? <Spinner size="xs" /> : <><FiRefreshCw style={{ marginRight: '6px' }} /> Request New OTP Code</>}
                </Button>
              </VStack>
            )}
          </Box>
        </VStack>
      </Box>

      {/* Social Footer Icons */}
      <VStack position="fixed" bottom={8} width="full" gap={4} pointerEvents="none">
        <HStack gap={4} pointerEvents="auto" bg="whiteAlpha.800" backdropFilter="blur(8px)" px={6} py={3} rounded="full" shadow="lg" border="1px solid" borderColor="whiteAlpha.500">
          <Text fontSize="xs" fontWeight="black" color="gray.400" mr={2}>QUICK HELP:</Text>
          <Link href="https://chat.whatsapp.com/DDyMtIB3P1sImRGeliAjl4?mode=gi_t" isExternal color="#25D366" _hover={{ transform: 'scale(1.2)' }} transition="0.2s">
            <FaWhatsapp size={20} />
          </Link>
          <Link href="https://www.youtube.com/@samu.connect" isExternal color="#FF0000" _hover={{ transform: 'scale(1.2)' }} transition="0.2s">
            <FaYoutube size={20} />
          </Link>
          <Link href="https://www.instagram.com/stories/cyber.hub22/3882911736865151776?utm_source=ig_story_item_share&igsh=aHJjNHJ6aWVqeTY5" isExternal color="#E4405F" _hover={{ transform: 'scale(1.2)' }} transition="0.2s">
            <FiInstagram size={20} />
          </Link>
          <Link href="https://x.com" isExternal color="black" _hover={{ transform: 'scale(1.2)' }} transition="0.2s">
            <FaXTwitter size={18} />
          </Link>
        </HStack>
      </VStack>
    </Box>
  )
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<Box minH="100vh" display="flex" alignItems="center" justifyContent="center"><Spinner size="xl" /></Box>}>
      <VerifyOTPContent />
    </Suspense>
  )
}
