import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Link } from 'react-router-dom'

export const Terms = () => {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              By accessing and using SkillZone, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Platform Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              SkillZone is a freelancing platform that connects clients with skilled service providers across Southern Africa. 
              The platform facilitates project posting, proposal submission, and project management.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. User Responsibilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">For Clients:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Provide accurate project requirements and budgets</li>
                <li>• Communicate clearly with service providers</li>
                <li>• Pay agreed amounts in a timely manner</li>
                <li>• Provide constructive feedback</li>
              </ul>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">For Service Providers:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Provide accurate skills and experience information</li>
                <li>• Deliver work according to agreed timelines</li>
                <li>• Maintain professional communication</li>
                <li>• Ensure work quality meets client expectations</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Platform Indemnification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                <strong>IMPORTANT:</strong> By using SkillZone, you acknowledge and agree that:
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Indemnification Clause</h4>
                <p className="text-sm text-yellow-700">
                  You hereby indemnify, defend, and hold harmless SkillZone, its owners, operators, employees, and affiliates 
                  from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable 
                  attorneys' fees) arising from or relating to:
                </p>
                <ul className="text-sm text-yellow-700 mt-2 space-y-1 ml-4">
                  <li>• Any disputes, misunderstandings, or conflicts between clients and service providers</li>
                  <li>• Quality issues, delays, or non-delivery of services</li>
                  <li>• Payment disputes or financial losses</li>
                  <li>• Intellectual property disputes</li>
                  <li>• Any breach of these terms by you</li>
                  <li>• Your use of the platform or any services obtained through it</li>
                </ul>
              </div>

              <p className="text-sm text-muted-foreground">
                This indemnification applies regardless of whether the claim arises from negligence, breach of contract, 
                or any other legal theory, and survives termination of your account.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Dispute Resolution</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              While SkillZone provides a platform for connecting clients and service providers, we are not responsible for 
              resolving disputes between parties. Users are encouraged to resolve conflicts amicably. In case of disputes:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4">
              <li>• Contact the other party directly to resolve issues</li>
              <li>• Use the platform's messaging system for communication</li>
              <li>• Consider mediation or legal counsel if necessary</li>
              <li>• SkillZone may suspend accounts involved in serious disputes</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Payment and Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              SkillZone charges platform fees for services. All payments are processed through secure payment gateways. 
              Users are responsible for all applicable taxes and fees. Refunds are subject to our refund policy.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Users retain ownership of their intellectual property. By using the platform, you grant SkillZone a 
              non-exclusive license to display and distribute your content as necessary for platform operation.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Privacy and Data Protection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your privacy is important to us. Please review our{' '}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>{' '}
              to understand how we collect, use, and protect your information.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Termination</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Either party may terminate this agreement at any time. SkillZone reserves the right to suspend or 
              terminate accounts that violate these terms or engage in fraudulent activity.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              SkillZone's liability is limited to the amount paid by you for platform services in the 12 months 
              preceding the claim. We are not liable for indirect, incidental, or consequential damages.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>11. Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We may update these terms from time to time. Continued use of the platform after changes constitutes 
              acceptance of the new terms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>12. Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              For questions about these terms, please contact us at{' '}
              <a href="mailto:admin@abathwa.com" className="text-primary hover:underline">
                admin@abathwa.com
              </a>
            </p>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            By using SkillZone, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  )
} 