import React from 'react'
import { ModeToggle } from './mode-toggle'
import { useAuthStore } from '@/stores/authStore'
import { NavUser } from './NavUser'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

const Navbar = () => {
  const { authUser } = useAuthStore()

  return (
    <nav className="fixed top-0 left-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-screen-lg items-center justify-between px-4">

        {/* Logo */}
        <Link
          to="/"
          className="group flex items-center gap-2"
        >
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/20">
            <Sparkles className="size-4 text-white" />
          </div>

          <div>
            <h1 className="text-sm font-bold tracking-tight">
              Study Planner
            </h1>

            <p className="hidden text-[10px] text-muted-foreground sm:block">
              Plan. Focus. Grow.
            </p>
          </div>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ModeToggle />

          {authUser && <NavUser />}
        </div>

      </div>
    </nav>
  )
}

export default Navbar