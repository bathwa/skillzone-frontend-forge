import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Shield, Globe, Star, Users, Briefcase, CreditCard } from 'lucide-react'

export const Landing = () => {
  const features = [
    {
      icon: Shield,
      title: 'Secure Transactions',
      description: 'Token-based escrow system ensures safe payments for both clients and service providers.',
    },
    {
      icon: Globe,
      title: 'SADC Regional Focus',
      description: 'Connecting talent across Southern African Development Community countries.',
    },
    {
      icon: Star,
      title: 'Verified Professionals',
      description: 'Comprehensive rating and review system to help you find trusted partners.',
    },
    {
      icon: Users,
      title: 'Growing Network',
      description: 'Join thousands of professionals building successful careers on our platform.',
    },
    {
      icon: Briefcase,
      title: 'Premium Opportunities',
      description: 'Access exclusive high-value projects with our premium opportunity system.',
    },
    {
      icon: CreditCard,
      title: 'Flexible Pricing',
      description: 'Multiple subscription tiers and token-based access to match your needs.',
    },
  ]

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Web Developer',
      country: 'South Africa',
      content: 'SkillZone helped me connect with amazing clients across the region. The platform is professional and secure.',
      rating: 5,
    },
    {
      name: 'David K.',
      role: 'Business Owner',
      country: 'Botswana',
      content: 'Finding quality developers has never been easier. The verification system gives me confidence in hiring.',
      rating: 5,
    },
    {
      name: 'Amara T.',
      role: 'Graphic Designer',
      country: 'Zimbabwe',
      content: 'The token system is fair and transparent. I love being able to access premium opportunities.',
      rating: 5,
    },
  ]

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container py-20 md:py-32 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6">
              🎉 Now serving 16 SADC countries
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Connect. Create. <span className="gradient-text">Collaborate.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Africa's premier freelance marketplace connecting talented professionals 
              with meaningful opportunities across the SADC region.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8">
                <Link to="/signup">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8">
                <Link to="/opportunities">
                  Explore Opportunities
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose SkillZone?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built specifically for the African market with features that matter to local professionals
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Simple steps to start your journey
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Create Your Profile</h3>
              <p className="text-muted-foreground">
                Sign up and build your professional profile with your skills, experience, and portfolio.
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">Find Opportunities</h3>
              <p className="text-muted-foreground">
                Browse thousands of projects or let clients find you. Use tokens to access premium opportunities.
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Start Working</h3>
              <p className="text-muted-foreground">
                Collaborate securely with our built-in chat, milestone tracking, and escrow protection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-muted-foreground">
              Real stories from our growing community
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role} • {testimonial.country}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of professionals who are already building successful careers on SkillZone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8">
                <Link to="/signup?role=freelancer">
                  Start as a Service Provider
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8">
                <Link to="/signup?role=client">
                  Post Your First Project
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
