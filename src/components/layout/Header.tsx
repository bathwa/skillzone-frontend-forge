
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { useTheme } from 'next-themes'
import { useAuth } from '@/components/auth/AuthProvider'
import { useNotificationStore } from '@/stores/notificationStore'
import { 
  Menu, 
  Sun, 
  Moon, 
  User, 
  Settings, 
  CreditCard, 
  Bell, 
  LogOut,
  Briefcase,
  FileText,
  MessageSquare,
  LayoutDashboard
} from 'lucide-react'

const navigationLinks = [
  { href: '/opportunities', label: 'Browse Opportunities' },
  { href: '/skills', label: 'Find Talent' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export const Header = () => {
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { getUnreadCount } = useNotificationStore()
  
  const unreadCount = getUnreadCount()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const userInitials = user ? 
    `${user.user_metadata?.first_name?.[0] || ''}${user.user_metadata?.last_name?.[0] || ''}`.toUpperCase() ||
    user.email?.[0]?.toUpperCase() || 'U'
    : 'U'

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">S</span>
          </div>
          <span className="font-bold text-xl gradient-text">SkillsPortal</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9 p-0"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {user ? (
            <>
              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-9 w-9 p-0 relative"
              >
                <Link to="/notifications">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Link>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={user.user_metadata?.avatar_url} 
                        alt={user.user_metadata?.first_name || user.email} 
                      />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">
                        {user.user_metadata?.first_name} {user.user_metadata?.last_name}
                      </p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-profile">
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/client/opportunities">
                      <Briefcase className="mr-2 h-4 w-4" />
                      My Opportunities
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/sp/proposals">
                      <FileText className="mr-2 h-4 w-4" />
                      My Proposals
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-tokens">
                      <CreditCard className="mr-2 h-4 w-4" />
                      My Tokens
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/subscriptions">
                      <Settings className="mr-2 h-4 w-4" />
                      Subscriptions
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/chat">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Messages
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-4 mt-4">
                {/* Navigation Links */}
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="border-t pt-4 mt-4">
                  {user ? (
                    <>
                      <div className="flex items-center space-x-2 mb-4">
                        <Avatar className="h-8 w-8">
                          <AvatarImage 
                            src={user.user_metadata?.avatar_url} 
                            alt={user.user_metadata?.first_name || user.email} 
                          />
                          <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {user.user_metadata?.first_name} {user.user_metadata?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      {/* User Menu Items */}
                      <div className="space-y-2">
                        <Link
                          to="/dashboard"
                          className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                          onClick={() => setMobileOpen(false)}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          to="/my-profile"
                          className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                          onClick={() => setMobileOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          to="/notifications"
                          className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                          onClick={() => setMobileOpen(false)}
                        >
                          <Bell className="h-4 w-4" />
                          <span>Notifications</span>
                          {unreadCount > 0 && (
                            <Badge variant="destructive" className="ml-auto">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </Badge>
                          )}
                        </Link>
                        <Link
                          to="/my-tokens"
                          className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                          onClick={() => setMobileOpen(false)}
                        >
                          <CreditCard className="h-4 w-4" />
                          <span>My Tokens</span>
                        </Link>
                        <Link
                          to="/subscriptions"
                          className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                          onClick={() => setMobileOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          <span>Subscriptions</span>
                        </Link>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            handleSignOut()
                            setMobileOpen(false)
                          }}
                          className="w-full justify-start text-sm font-medium text-muted-foreground hover:text-primary"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        asChild
                        className="w-full justify-start"
                        onClick={() => setMobileOpen(false)}
                      >
                        <Link to="/login">Sign In</Link>
                      </Button>
                      <Button
                        asChild
                        className="w-full"
                        onClick={() => setMobileOpen(false)}
                      >
                        <Link to="/signup">Get Started</Link>
                      </Button>
                    </div>
                  )}

                  {/* Theme Toggle */}
                  <div className="pt-4 mt-4 border-t">
                    <Button
                      variant="ghost"
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="w-full justify-start"
                    >
                      <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                      <span className="ml-6">Toggle theme</span>
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
