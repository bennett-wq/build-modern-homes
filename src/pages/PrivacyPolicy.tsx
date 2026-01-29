import { Layout } from "@/components/layout/Layout";

export default function PrivacyPolicy() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground mb-8">Last Updated: January 29, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <p className="text-foreground/90 leading-relaxed">
            Base Property Group LLC ("Base Property Group," "we," "our," or "us") operates a residential real estate and home-delivery platform, including BaseMod Homes, that helps homebuyers and real estate developers evaluate affordability and financial readiness for residential real estate transactions.
          </p>
          <p className="text-foreground/90 leading-relaxed">
            This Privacy Policy explains how we collect, use, store, and protect personal information when you use our website, applications, and related services (collectively, the "Services").
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
            <p className="text-foreground/90 mb-4">We may collect the following categories of information:</p>

            <h3 className="text-xl font-medium text-foreground mb-3">a. Information You Provide Directly</h3>
            <ul className="list-disc pl-6 space-y-1 text-foreground/90 mb-4">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Property or location information</li>
              <li>Self-reported financial information (e.g., estimated income, down payment amount)</li>
            </ul>

            <h3 className="text-xl font-medium text-foreground mb-3">b. Financial Account Information (Optional)</h3>
            <p className="text-foreground/90 mb-2">
              If you choose to connect your financial accounts, we may receive limited financial data through third-party service providers such as Plaid Inc. This may include:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-foreground/90 mb-4">
              <li>Account balances</li>
              <li>Account type</li>
              <li>Transaction summaries or metadata</li>
              <li>Asset availability indicators</li>
            </ul>
            <p className="text-foreground/90 font-medium">We do not receive or store your bank login credentials.</p>

            <h3 className="text-xl font-medium text-foreground mb-3 mt-4">c. Automatically Collected Information</h3>
            <ul className="list-disc pl-6 space-y-1 text-foreground/90">
              <li>IP address</li>
              <li>Browser type</li>
              <li>Device information</li>
              <li>Usage data related to interaction with our Services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. How We Use Information</h2>
            <p className="text-foreground/90 mb-2">We use information collected to:</p>
            <ul className="list-disc pl-6 space-y-1 text-foreground/90 mb-4">
              <li>Assess financial readiness and affordability for residential real estate purchases</li>
              <li>Provide pre-qualification insights and estimates</li>
              <li>Respond to inquiries and provide customer support</li>
              <li>Improve our Services and user experience</li>
              <li>Comply with legal and regulatory obligations</li>
            </ul>
            <p className="text-foreground/90 font-medium">We do not use financial data for marketing, advertising, or resale purposes.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Third-Party Service Providers</h2>
            <p className="text-foreground/90 mb-2">We use trusted third-party service providers to operate our Services, including:</p>
            <ul className="list-disc pl-6 space-y-1 text-foreground/90 mb-4">
              <li><strong>Plaid Inc.</strong> – to securely connect to financial institutions and retrieve account information with your explicit consent</li>
              <li><strong>Cloud infrastructure and hosting providers</strong> (e.g., database and hosting services)</li>
            </ul>
            <p className="text-foreground/90">
              These providers are authorized to use your information only as necessary to provide services to us and are subject to contractual confidentiality and security obligations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Security</h2>
            <p className="text-foreground/90 mb-2">
              We implement reasonable administrative, technical, and organizational safeguards designed to protect personal information, including:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-foreground/90 mb-4">
              <li>Encryption of data in transit using TLS</li>
              <li>Encryption of stored data at rest via managed infrastructure</li>
              <li>Role-based access controls</li>
              <li>Multi-factor authentication for administrative access</li>
            </ul>
            <p className="text-foreground/90">Despite these measures, no system can be guaranteed to be 100% secure.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Retention</h2>
            <p className="text-foreground/90 mb-4">
              We retain personal information only for as long as reasonably necessary to fulfill the purposes described in this Privacy Policy, unless a longer retention period is required or permitted by law.
            </p>
            <p className="text-foreground/90">
              Users may request deletion of their personal information, subject to legal or regulatory retention requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Your Choices and Rights</h2>
            <p className="text-foreground/90 mb-2">You may:</p>
            <ul className="list-disc pl-6 space-y-1 text-foreground/90 mb-4">
              <li>Decline to connect financial accounts</li>
              <li>Request access to or deletion of your personal information</li>
              <li>Withdraw consent for data access at any time</li>
            </ul>
            <p className="text-foreground/90">Requests can be made by contacting us using the information below.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Children's Privacy</h2>
            <p className="text-foreground/90">
              Our Services are not intended for individuals under the age of 18, and we do not knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Changes to This Policy</h2>
            <p className="text-foreground/90">
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Contact Us</h2>
            <p className="text-foreground/90 mb-2">
              If you have questions about this Privacy Policy or our data practices, contact us at:
            </p>
            <address className="text-foreground/90 not-italic">
              <strong>Base Property Group LLC</strong><br />
              Email: <a href="mailto:support@basepropertygrp.com" className="text-primary hover:underline">support@basepropertygrp.com</a>
            </address>
          </section>
        </div>
      </div>
    </Layout>
  );
}
