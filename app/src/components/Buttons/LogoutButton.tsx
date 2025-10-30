'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      })

      if (response.ok) {
        router.push('/login')
        router.refresh()
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <Button
      variant="outlined"
      onClick={handleLogout}
      startIcon={<LogoutIcon />}
      sx={{
        color: '#124559',
        borderColor: '#124559',
        '&:hover': {
          backgroundColor: '#124559',
          borderColor: '#124559',
          color: '#ffffff',
        },
      }}
    >
      Logout
    </Button>
  )
}