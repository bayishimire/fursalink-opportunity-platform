'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Center, Spinner, Text, VStack } from '@chakra-ui/react'

export default function AuthSessionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const userParam = searchParams.get('user')
    const redirect = searchParams.get('redirect') || '/dashboard/student'

    if (userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam))
        localStorage.setItem('user', JSON.stringify(user))
        router.replace(redirect)
      } catch {
        router.replace('/login?error=session_failed')
      }
    } else {
      router.replace('/login')
    }
  }, [router, searchParams])

  return (
    <Center minH="100vh" bg="white">
      <VStack gap={4}>
        <Spinner size="xl" color="blue.500" />
        <Text fontWeight="bold" color="gray.500">Signing you in with Google...</Text>
      </VStack>
    </Center>
  )
}
