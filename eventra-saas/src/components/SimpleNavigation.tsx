'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function SimpleNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(true) // Force open initially

  // Ensure menu stays visible
  useEffect(() => {
    setIsMenuOpen(true)
  }, [])

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Always visible mobile menu */}
        <div className="md:hidden block py-4">
          <div className="flex flex-col space-y-2">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              Home
            </Link>
            <Link href="/events" className="text-blue-600 hover:text-blue-800">
              Events
            </Link>
            <Link href="/register" className="text-blue-600 hover:text-blue-800">
              Register
            </Link>
            <Link href="/login" className="text-blue-600 hover:text-blue-800">
              Login
            </Link>
          </div>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex space-x-6 py-4">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Home
          </Link>
          <Link href="/events" className="text-blue-600 hover:text-blue-800">
            Events
          </Link>
          <Link href="/register" className="text-blue-600 hover:text-blue-800">
            Register
          </Link>
          <Link href="/login" className="text-blue-600 hover:text-blue-800">
            Login
          </Link>
        </div>
      </div>
    </nav>
  )
}