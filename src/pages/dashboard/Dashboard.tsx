
import React from 'react'
import { useAuthStore } from '@/stores/authStore'
import ClientDashboard from './ClientDashboard'
import FreelancerDashboard from './FreelancerDashboard'

export default function Dashboard() {
  const { user } = useAuthStore()

  if (!user) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your dashboard</h1>
        </div>
      </div>
    )
  }

  // Role-based dashboard routing
  if (user.role === 'client') {
    return <ClientDashboard />
  } else if (user.role === 'freelancer') {
    return <FreelancerDashboard />
  } else if (user.role === 'admin') {
    // Admin users see a different dashboard
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-muted-foreground mb-4">
            Access the admin panel to manage the platform.
          </p>
          <a href="/admin/dashboard" className="text-blue-600 hover:underline">
            Go to Admin Panel
          </a>
        </div>
      </div>
    )
  }

  // Fallback for unknown roles
  return <FreelancerDashboard />
}
