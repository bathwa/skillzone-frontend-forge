import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Link } from 'react-router-dom'

export const Privacy = () => {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>1. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Personal Information:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Name and contact information (email, phone)</li>
                  <li>• Profile information (bio, skills, experience)</li>
                  <li>• Payment information (processed securely)</li>
                  <li>• Communication preferences</li>
                </ul>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">Usage Information:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Platform usage patterns and interactions</li>
                  <li>• Project and proposal data</li>
                  <li>• Communication logs</li>
                  <li>• Technical information (IP address, browser type)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              We use your information to:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Provide and improve our platform services</li>
              <li>• Connect clients with service providers</li>
              <li>• Process payments and transactions</li>
              <li>• Send important notifications and updates</li>
              <li>• Provide customer support</li>
              <li>• Ensure platform security and prevent fraud</li>
              <li>• Comply with legal obligations</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Information Sharing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We may share your information in the following circumstances:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• <strong>With other users:</strong> Profile information is visible to other platform users</li>
                <li>• <strong>Service providers:</strong> With trusted third-party services (payment processors, hosting)</li>
                <li>• <strong>Legal requirements:</strong> When required by law or to protect rights</li>
                <li>• <strong>Business transfers:</strong> In case of merger, acquisition, or sale of assets</li>
                <li>• <strong>With consent:</strong> When you explicitly authorize sharing</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Data Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We implement appropriate security measures to protect your information:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4">
              <li>• Encryption of sensitive data in transit and at rest</li>
              <li>• Regular security audits and updates</li>
              <li>• Access controls and authentication</li>
              <li>• Secure payment processing</li>
              <li>• Regular backups and disaster recovery</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Data Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We retain your information for as long as necessary to provide our services and comply with legal obligations. 
              You may request deletion of your account and associated data, subject to legal requirements.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Your Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You have the right to:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Access and review your personal information</li>
              <li>• Update or correct inaccurate information</li>
              <li>• Request deletion of your account and data</li>
              <li>• Opt out of marketing communications</li>
              <li>• Export your data in a portable format</li>
              <li>• Lodge complaints with relevant authorities</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Cookies and Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We use cookies and similar technologies to improve your experience, analyze usage, and provide personalized content. 
              You can control cookie settings through your browser preferences.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Our platform may integrate with third-party services (payment processors, analytics, etc.). 
              These services have their own privacy policies, and we encourage you to review them.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. International Data Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your information may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place to protect your data during such transfers.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Our platform is not intended for children under 18 years of age. We do not knowingly collect 
              personal information from children under 18.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>11. Changes to Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We may update this privacy policy from time to time. We will notify you of significant changes 
              through the platform or email. Continued use after changes constitutes acceptance of the new policy.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>12. Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If you have questions about this privacy policy or our data practices, please contact us at:{' '}
              <a href="mailto:admin@abathwa.com" className="text-primary hover:underline">
                admin@abathwa.com
              </a>
            </p>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            By using SkillZone, you acknowledge that you have read and understood this Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
} 