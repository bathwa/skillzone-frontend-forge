
import React from 'react'
import { Link } from 'react-router-dom'

export const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-xl gradient-text">SkillZone</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-md">
              Connecting talented professionals with meaningful opportunities across the SADC region. 
              Build your career, grow your business, and make an impact.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/opportunities" className="hover:text-primary transition-colors">Browse Opportunities</Link></li>
              <li><Link to="/skills" className="hover:text-primary transition-colors">Find Talent</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SkillZone. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
