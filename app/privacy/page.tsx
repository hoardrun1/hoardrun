import { LanguageSwitcher } from "@/components/ui/language-switcher"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher variant="mobile" />
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-card shadow rounded-lg p-8 border border-border">
          <h1 className="text-3xl font-bold text-foreground mb-8">Privacy Policy</h1>
          
          <div className="prose max-w-none">
            <p className="text-muted-foreground mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Information We Collect</h2>
              <p className="text-foreground mb-4">
                When you sign in with Google, we collect:
              </p>
              <ul className="list-disc pl-6 text-foreground mb-4">
                <li>Your name</li>
                <li>Your email address</li>
                <li>Your Google profile picture</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Your Information</h2>
              <p className="text-foreground mb-4">
                We use your information to:
              </p>
              <ul className="list-disc pl-6 text-foreground mb-4">
                <li>Create and manage your account</li>
                <li>Provide personalized financial services</li>
                <li>Send important account notifications</li>
                <li>Improve our services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Data Security</h2>
              <p className="text-foreground mb-4">
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Third-Party Services</h2>
              <p className="text-foreground mb-4">
                We use Google OAuth for authentication. Please review Google's Privacy Policy for information about how Google handles your data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
              <p className="text-foreground">
                If you have any questions about this Privacy Policy, please contact us at:
                <br />
                Email: privacy@hoardrun.com
                <br />
                Address: [Your Business Address]
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
