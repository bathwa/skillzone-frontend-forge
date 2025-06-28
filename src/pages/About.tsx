import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { 
  Globe, 
  Users, 
  Shield, 
  TrendingUp, 
  Award, 
  Heart, 
  MapPin, 
  Target,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export const About = () => {
  const stats = [
    { label: 'Countries Served', value: '16', icon: Globe },
    { label: 'Active Users', value: '10,000+', icon: Users },
    { label: 'Projects Completed', value: '5,000+', icon: CheckCircle },
    { label: 'Success Rate', value: '95%', icon: TrendingUp },
  ]

  const values = [
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'We prioritize the safety and security of all transactions through our escrow system and verification processes.'
    },
    {
      icon: Users,
      title: 'Community First',
      description: 'Building a supportive community where African talent can thrive and grow together.'
    },
    {
      icon: Target,
      title: 'Local Focus',
      description: 'Designed specifically for the Southern African market with local payment methods and support.'
    },
    {
      icon: Heart,
      title: 'Empowerment',
      description: 'Empowering individuals to build sustainable careers through remote work opportunities.'
    }
  ]

  const milestones = [
    {
      year: '2024',
      title: 'Platform Launch',
      description: 'SkillZone officially launched, connecting freelancers and clients across Southern Africa.'
    },
    {
      year: '2024',
      title: 'Regional Expansion',
      description: 'Extended services to all 16 SADC member countries with localized support.'
    },
    {
      year: '2024',
      title: 'Token System',
      description: 'Introduced our innovative token-based system for premium opportunity access.'
    },
    {
      year: '2024',
      title: 'Mobile App',
      description: 'Launched mobile application for enhanced user experience on the go.'
    }
  ]

  const supportedCountries = [
    'Zimbabwe', 'South Africa', 'Botswana', 'Namibia', 'Zambia',
    'Lesotho', 'Eswatini', 'Malawi', 'Mozambique', 'Tanzania',
    'Angola', 'Madagascar', 'Mauritius', 'Seychelles', 'Comoros'
  ]

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-12">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6">
            About SkillZone
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Empowering African Talent
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            SkillZone is Africa's premier freelance marketplace, connecting talented professionals 
            with meaningful opportunities across the Southern African Development Community (SADC) region.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/signup">
                Join Our Community
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">
                Get in Touch
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-2">
                  <stat.icon className="h-8 w-8 text-primary" />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                To bridge the gap between African talent and global opportunities by providing a secure, 
                transparent, and user-friendly platform that empowers individuals to build sustainable 
                careers through remote work while contributing to the economic growth of the SADC region.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-6 w-6 text-primary" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                To become the leading freelance marketplace in Africa, recognized for our commitment to 
                quality, security, and community building. We envision a future where African professionals 
                have equal access to global opportunities and can showcase their skills on a world stage.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values Section */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-xl text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Journey Section */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
            <p className="text-xl text-muted-foreground">
              Key milestones in our mission to empower African talent
            </p>
          </div>
          <div className="space-y-6">
            {milestones.map((milestone, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <Badge variant="outline" className="text-sm">
                        {milestone.year}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{milestone.title}</h3>
                      <p className="text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Regional Coverage */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Regional Coverage</h2>
            <p className="text-xl text-muted-foreground">
              Serving all 16 SADC member countries
            </p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {supportedCountries.map((country, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{country}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-muted-foreground mb-6">
                Join thousands of professionals who are already building successful careers on SkillZone
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link to="/signup">
                    Create Your Profile
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/opportunities">
                    Browse Opportunities
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 