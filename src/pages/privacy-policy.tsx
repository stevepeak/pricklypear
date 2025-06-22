import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Footer from '@/components/ui/footer';

export default function PrivacyPolicy() {
  const [activeTab, setActiveTab] = useState('full');

  return (
    <>
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

        <p className="text-sm text-muted-foreground mb-8">
          Effective Date: June 22, 2025
        </p>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="full">Full Version</TabsTrigger>
            <TabsTrigger value="summarized">Summarized</TabsTrigger>
          </TabsList>

          <TabsContent value="full" className="mt-6">
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-4">Introduction</h2>
                <p className="mb-4">
                  Prickly Pear ("we," "us," or "our") is a co-parenting
                  communication platform committed to protecting your privacy.
                  This Privacy Policy explains what information we collect, how
                  we use and store it, and under what circumstances we share it.
                  By using Prickly Pear, you agree to the data practices
                  described in this policy and in our Terms of Use.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  Information We Collect
                </h2>

                <h3 className="text-lg font-medium mb-3">
                  Personal Information
                </h3>
                <p className="mb-4">
                  When you create an account or use Prickly Pear, we may collect
                  personally identifiable information such as your name, email
                  address, contact information, and other details you provide.
                  This information is collected solely to provide and support
                  the Prickly Pear service and to communicate with you. We do
                  not collect any payment card information directly; if payments
                  are processed, they are handled by secure third-party
                  processors (e.g., app store or payment gateways) and we do not
                  store your credit/debit card numbers.
                </p>

                <h3 className="text-lg font-medium mb-3">
                  Communications Data
                </h3>
                <p className="mb-4">
                  Prickly Pear is a communication tool, so we store the content
                  of messages, calendar entries, shared files, and other
                  communications you send or receive through the platform. All
                  messages and entries are retained in our system to maintain a
                  complete and unalterable record for you and your co-parent.
                  Please note: once a message or file is sent, it becomes part
                  of a permanent record accessible to both parents, and you will
                  not be able to edit or delete it after sending (except to add
                  clarifications through new messages). Each user has access to
                  the full history of communications in their case, including
                  messages from the other parent. Prickly Pear also retains an
                  ownership interest in the compiled communication record in
                  order to fulfill legal obligations and provide certified
                  records if required (we will not delete records upon
                  unilateral user request, given the need to preserve an
                  accurate history).
                </p>

                <h3 className="text-lg font-medium mb-3">
                  Automatically Collected Data
                </h3>
                <p className="mb-4">
                  Like most online services, we gather certain technical data
                  automatically. This includes Log Data such as your device's
                  Internet Protocol (IP) address, browser type, device
                  identifiers, operating system, referring webpage, pages
                  visited, timestamps, and similar usage statistics. We also use
                  cookies and similar technologies to remember your preferences
                  and enhance your experience. You can disable cookies via your
                  browser settings, but be aware that some features of Prickly
                  Pear may not function properly without cookies.
                </p>

                <h3 className="text-lg font-medium mb-3">Children's Data</h3>
                <p className="mb-4">
                  Prickly Pear is intended for use by adult co-parents. We do
                  not knowingly collect personal information from children under
                  13. Any information about children (such as names or
                  schedules) that parents input into the platform is considered
                  provided with parental consent and is used only for the
                  purposes of facilitating co-parenting communication. If we
                  learn that a child under 13 has directly provided personal
                  data, we will delete that information. Parents should
                  supervise their child's use of our service and ensure only
                  appropriate information is shared.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  How We Use Your Information
                </h2>
                <p className="mb-4">We use the collected information to:</p>

                <h3 className="text-lg font-medium mb-3">
                  Provide and Improve the Service
                </h3>
                <p className="mb-4">
                  We process your personal information and communications to
                  operate Prickly Pear and deliver its features. For example, we
                  use your email to authenticate your login and send you
                  notifications, and we use message content to deliver it to
                  your intended recipient. We may also analyze usage trends
                  (e.g. feature use frequency) to improve our platform's
                  functionality and user experience. This may include using
                  aggregated, non-identifying data to understand how users
                  interact with Prickly Pear and to enhance our services (we may
                  compile statistics or insights that no longer identify any
                  individual and share or use those for lawful purposes).
                </p>

                <h3 className="text-lg font-medium mb-3">
                  Facilitate Communication and Conflict Reduction
                </h3>
                <p className="mb-4">
                  Our platform's goal is to help co-parents communicate in a
                  productive, civil manner. To that end, we may use automated
                  tools (including artificial intelligence) to assist with tone
                  and content moderation. For example, Prickly Pear may offer an
                  AI-powered tone suggestion feature that recommends alternative
                  phrasing for messages based on the perceived tone and
                  language, helping you avoid confrontational or unproductive
                  language. Any such AI features operate on the data you
                  intentionally provide (your message drafts) and are used only
                  to provide you with real-time suggestions or insights at your
                  request. We do not allow any third-party AI providers to use
                  your personal data to train their own models. The AI analysis
                  happens in a secure manner, and partners or third-party
                  services will not see your personal communications except as
                  necessary to deliver the AI functionality as part of our
                  service.
                </p>

                <h3 className="text-lg font-medium mb-3">
                  Customer Support and Communication
                </h3>
                <p className="mb-4">
                  We may use your contact information to respond to support
                  inquiries, send important account and service updates, or
                  inform you of new features. We will also send Records of
                  Communication or certified transcripts to you or others as you
                  direct (for example, if you request a full record for court).
                  Any marketing or optional communications will be sent only in
                  accordance with applicable law, and you can opt out of
                  promotional emails at any time. Even if you opt out of
                  marketing, you will continue to receive essential
                  service-related messages (e.g. account notices, payment
                  confirmations).
                </p>

                <h3 className="text-lg font-medium mb-3">
                  Legal Compliance and Security
                </h3>
                <p className="mb-4">
                  We may use personal data to comply with legal obligations,
                  such as verifying identity to prevent fraud or responding to
                  lawful requests. We also process data as needed to secure the
                  platform, investigate potential violations of our Terms, or
                  enforce our rights and the safety of our users.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  When We Share or Disclose Information
                </h2>
                <p className="mb-4">
                  Prickly Pear understands the sensitivity of your data. We do
                  not sell your personal information to third parties for their
                  own marketing or profit. We share data only in the following
                  circumstances:
                </p>

                <h3 className="text-lg font-medium mb-3">
                  With Your Co-Parent (Other Party)
                </h3>
                <p className="mb-4">
                  By the nature of the service, the content of your
                  communications is shared with the other parent (and any other
                  participant you explicitly include in the communication, such
                  as a neutral third-party or professional) in real time. Both
                  co-parents have equal access to the communication records at
                  all times. Please be mindful: once you send a message or
                  upload a file, the recipients will be able to view it, and
                  even if you later remove it on your interface, it remains
                  accessible in their record (all edits or deletions are
                  logged). Each user effectively "owns" a copy of the entire
                  communication record with the other parent, and they are free
                  to retain or share that record outside the platform if they
                  choose. Prickly Pear cannot control what a recipient does with
                  the information you send – for example, your co-parent may
                  share messages with their attorney, a court, or even with
                  others – and we are not responsible for any unlawful,
                  improper, or unintended distribution or use of your
                  communications by another user or third party. Our system is
                  designed with the expectation that records may be used in
                  legal proceedings, which we hope encourages all users to
                  communicate maturely and professionally.
                </p>

                <h3 className="text-lg font-medium mb-3">Service Providers</h3>
                <p className="mb-4">
                  We employ trusted third-party companies to perform certain
                  functions on our behalf in order to operate Prickly Pear (for
                  example, cloud hosting, data storage, payment processing, or
                  email delivery). These providers only receive the information
                  necessary to perform their specific services, and they are
                  contractually obligated to protect your data and use it solely
                  for providing services to us. For instance, our
                  hosting/infrastructure providers maintain our databases and
                  backups; our AI suggestion feature may rely on a secure AI
                  engine to process text input and return suggestions, but such
                  engines do not retain your data or use it for any purpose
                  beyond delivering the suggestion. We ensure that any partner
                  involved in handling personal data upholds strong privacy and
                  security standards.
                </p>

                <h3 className="text-lg font-medium mb-3">Legal Requirements</h3>
                <p className="mb-4">
                  We may disclose your personal information or communications if
                  required by law, subpoena, court order, or other legal
                  process. If a court with proper jurisdiction compels us to
                  produce records of your communications, we will comply with
                  such order. In general, if we receive a subpoena or court
                  order for your data, we will attempt to notify you (e.g., via
                  the email on file) before disclosure, unless we are legally
                  prohibited from doing so. Additionally, if we believe in good
                  faith that disclosure is necessary to investigate or remedy a
                  violation of our Terms, protect the rights and safety of
                  Prickly Pear, our employees, users, or others, or detect and
                  prevent fraud or security issues, we may share information as
                  needed in such circumstances. For example, if law enforcement
                  provides a lawful request relating to an emergency situation,
                  we may share relevant data to assist.
                </p>

                <h3 className="text-lg font-medium mb-3">Business Transfers</h3>
                <p className="mb-4">
                  If Prickly Pear (or its operating company) is involved in a
                  merger, acquisition, reorganization, or asset sale, your
                  information may be transferred as part of that transaction. We
                  will ensure any successor entity continues to protect your
                  data in line with this Privacy Policy and applicable law.
                </p>

                <h3 className="text-lg font-medium mb-3">With Your Consent</h3>
                <p className="mb-4">
                  In cases where you explicitly authorize or request us to share
                  information, we will do so. For instance, if you invite a
                  family law professional (like a mediator, attorney, or
                  therapist) to have access to your account or records, and we
                  have a feature enabling professional access, we will share
                  data with that professional as directed by you (or as enabled
                  through a dedicated "professional access" feature on our
                  platform). Such professional access, if used, is typically
                  read-only and can be revoked by you at any time.
                </p>

                <p className="mb-4">
                  We will never share your personal information with third
                  parties for their independent marketing or uses not described
                  in this policy without your consent. Any sharing that does
                  occur is solely to provide or improve the Prickly Pear
                  service, or to comply with legal obligations.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">Data Retention</h2>
                <p className="mb-4">
                  Prickly Pear retains your information for as long as necessary
                  to fulfill the purposes outlined in this policy. In practice,
                  co-parenting communication records are kept for the duration
                  of your account's existence and, often, beyond that if
                  required for legal reasons. Because maintaining an accurate
                  record is integral to the service (especially for court
                  evidence purposes), we generally do not delete or purge
                  communications at user request. Even if you stop using Prickly
                  Pear or deactivate your account, the communications that
                  occurred while your account was active may be preserved. Both
                  you and your co-parent will continue to have access to the
                  past communications. We may also retain backup copies for a
                  certain period, even after deletion from the live database, to
                  ensure we can recover data in case of accidental deletion or
                  system failure.
                </p>
                <p className="mb-4">
                  In jurisdictions with data protection laws (like the EU GDPR
                  or California's CCPA), you may have rights to request deletion
                  of personal data. We will honor such requests to the extent
                  possible; however, there are important exceptions: if there is
                  an ongoing legal requirement or right to maintain the records
                  (for example, a court order mandating use of the service, an
                  ongoing custody litigation, or evidence preservation
                  obligations), we may be unable to delete communications
                  related to those matters. We will also not delete records that
                  would infringe on another user's rights (since each parent has
                  joint rights to the communication record) absent mutual
                  agreement or legal mandate. We will inform you if any
                  requested deletion is not possible due to these constraints.
                  Non-communications personal data (like your profile
                  information) can be deleted or anonymized upon verified
                  request, provided that doing so does not break the record
                  integrity or legal compliance.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  Security Measures
                </h2>
                <p className="mb-4">
                  We take the security of your data seriously and implement
                  industry-standard measures to protect it. Prickly Pear uses
                  encryption to safeguard data in transit (e.g., HTTPS for data
                  transfer) and at rest on our servers, similar to "bank-level"
                  security used by other co-parenting apps. We also employ
                  techniques like firewalls, access controls, and regular
                  security audits to prevent unauthorized access. Additionally,
                  you can enable features like two-factor authentication for
                  your account (if available) to add an extra layer of login
                  protection.
                </p>
                <p className="mb-4">
                  However, no security system is foolproof. We remind you that
                  "no security system is perfect" and you should take steps to
                  safeguard your own account credentials. Keep your password
                  confidential and change it periodically. If you suspect any
                  unauthorized access to your account, notify us immediately and
                  change your password. While we strive to protect your personal
                  information, Prickly Pear cannot guarantee absolute security
                  and is not liable for unauthorized access or breaches beyond
                  our control. In the event of a data breach that affects your
                  personal information, we will notify you and the appropriate
                  authorities as required by law, and we will take prompt action
                  to mitigate the breach.
                </p>
                <p className="mb-4">
                  It's important to note that communications on Prickly Pear are
                  not end-to-end encrypted in a way that prevents our system
                  from accessing them – in order to provide features like record
                  downloads, search, or AI suggestions, the service must be able
                  to process message content (much like email or other cloud
                  services). This design ensures we can provide certified,
                  unalterable records when needed, but it also means users
                  should be mindful of what they share. Avoid sending highly
                  sensitive personal information (such as passwords, social
                  security numbers, or confidential health details) through the
                  messaging system. In fact, our Terms of Use prohibit sharing
                  certain sensitive data like protected health information (PHI)
                  through the platform; if you choose to do so anyway, you
                  assume all associated risks and we disclaim liability for any
                  exposure of that information.
                </p>
                <p className="mb-4">
                  We will continue to update our security practices as new
                  technologies and threats emerge. You can find more details in
                  our Security Policy (available on our website). Remember that
                  you also play a key role in security: use a strong, unique
                  password and do not share your account with unauthorized
                  individuals.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  Use of Artificial Intelligence (AI)
                </h2>
                <p className="mb-4">
                  Prickly Pear may incorporate AI-driven features to enhance
                  your experience. For example, we might use AI to analyze the
                  tone of your messages and suggest less confrontational
                  wording, or to provide insights such as identifying
                  potentially contentious language. When you use these features,
                  your content is processed by our AI tools to generate the
                  suggestions or analysis you requested. We do not use AI to
                  make decisions for you, nor do we allow any third-party AI
                  service to train on or store your identifiable data. AI
                  processing is done in a secured environment solely to provide
                  you with the feature's functionality.
                </p>

                <h3 className="text-lg font-medium mb-3">
                  Important Disclaimers on AI
                </h3>
                <p className="mb-4">
                  While AI can be a helpful tool, it is not perfect.
                  AI-generated suggestions or responses may contain errors or
                  inaccuracies. The AI might occasionally misunderstand context
                  or produce content that is not suitable. We urge you not to
                  rely on AI output as fact or as a substitute for professional
                  advice. Prickly Pear's AI features are intended to assist you,
                  not to replace your own judgment. You should carefully review
                  any AI-proposed message edits or information. All AI
                  suggestions should be evaluated by you for accuracy,
                  appropriateness, and tone before you use them. If needed, seek
                  human review or professional guidance, especially for critical
                  or sensitive situations.
                </p>
                <p className="mb-4">
                  By using the AI functions, you acknowledge that any output is
                  for general assistance only and may not be 100% reliable or
                  correct. We will continually work to improve our AI, but given
                  the evolving nature of machine learning technology, results
                  are not guaranteed. Also, you agree not to misuse the AI
                  features. For example, you should not use Prickly Pear's AI
                  outputs to make decisions that could cause personal injury,
                  break the law, or in any context where human professional
                  advice is more appropriate. These AI-related terms are an
                  integral part of both this Privacy Policy and our Terms of
                  Use, and by using the service you accept them.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  Your Rights and Choices
                </h2>
                <p className="mb-4">
                  Depending on your jurisdiction, you may have certain rights
                  regarding your personal data. This can include the right to
                  access the information we hold about you, the right to request
                  correction of inaccurate data, or the right to request
                  deletion (erasure) of your data, subject to the limitations
                  noted above. Prickly Pear will respect and facilitate these
                  rights in accordance with applicable data protection laws. For
                  example, California residents have the right to know what
                  personal information is collected and how it's used or shared,
                  to request deletion of their personal info (with exceptions),
                  and to not be discriminated against for exercising privacy
                  rights. EU/UK users may have rights to access, rectify, or
                  erase data, among others.
                </p>
                <p className="mb-4">
                  To exercise any privacy rights, you can contact us using the
                  information in the "Contact Us" section below. We may need to
                  verify your identity before fulfilling certain requests. Bear
                  in mind that if you request deletion of your data, this could
                  impact your ability to use Prickly Pear (e.g., deleting your
                  account email will prevent us from sending you login codes).
                  Additionally, as discussed, communications data may be
                  retained if required for the other party's rights or legal
                  reasons. We will explain any denial of a deletion request and
                  the reason (such as an overriding legal necessity).
                </p>
                <p className="mb-4">
                  You may adjust certain preferences on your account at any
                  time, such as email notification settings or profile
                  information. If you wish to discontinue use of Prickly Pear,
                  you may deactivate your account. Even after deactivation, this
                  Privacy Policy will continue to apply to the information we
                  retain about you.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  Changes to This Privacy Policy
                </h2>
                <p className="mb-4">
                  We may update this Privacy Policy from time to time to reflect
                  changes in our practices or for legal reasons. If we make
                  material changes, we will notify users by posting the updated
                  policy on our website and updating the "Effective Date" at the
                  top. In some cases, we may provide additional notice (such as
                  via email or in-app notification). Your continued use of
                  Prickly Pear after an update signifies your acceptance of the
                  revised policy. We encourage you to review this Privacy Policy
                  periodically to stay informed about how we are protecting your
                  information.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
                <p className="mb-4">
                  If you have any questions, concerns, or requests regarding
                  this Privacy Policy or your personal data, please contact us
                  at:
                </p>
                <p className="mb-2">
                  <strong>Prickly Pear Support Team</strong>
                </p>
                <p className="mb-2">Email: hello@prickly.app</p>
                <p className="mb-4">
                  We are committed to working with you to address any privacy
                  concerns. Your trust is important to us, and we welcome
                  feedback on how we can better protect and manage your
                  information.
                </p>
              </section>
            </div>
          </TabsContent>

          <TabsContent value="summarized" className="mt-6">
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-4">Introduction</h2>
                <p className="mb-4">
                  Prickly Pear ("we," "us," or "our") is a co-parenting
                  communication platform committed to protecting your privacy.
                  This Privacy Policy explains what information we collect, how
                  we use and store it, and under what circumstances we share it.
                  By using Prickly Pear, you agree to the data practices
                  described in this policy and in our Terms of Use.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  Information We Collect
                </h2>

                <h3 className="text-lg font-medium mb-3">
                  Personal Information
                </h3>
                <p className="mb-4">
                  We collect information you provide when creating an account
                  and using our services.
                </p>

                <h3 className="text-lg font-medium mb-3">
                  Communications Data
                </h3>
                <p className="mb-4">
                  We store communications between co-parents to facilitate
                  record-keeping and conflict resolution.
                </p>

                <h3 className="text-lg font-medium mb-3">
                  Automatically Collected Data
                </h3>
                <p className="mb-4">
                  We collect usage data, device information, and analytics to
                  improve our service.
                </p>

                <h3 className="text-lg font-medium mb-3">Children's Data</h3>
                <p className="mb-4">
                  We do not knowingly collect personal information from children
                  under 13 without parental consent.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  How We Use Your Information
                </h2>

                <h3 className="text-lg font-medium mb-3">
                  Provide and Improve the Service
                </h3>
                <p className="mb-4">
                  To deliver our co-parenting communication platform and enhance
                  user experience.
                </p>

                <h3 className="text-lg font-medium mb-3">
                  Facilitate Communication and Conflict Reduction
                </h3>
                <p className="mb-4">
                  To enable effective communication between co-parents and
                  provide AI-assisted tone suggestions.
                </p>

                <h3 className="text-lg font-medium mb-3">
                  Customer Support and Communication
                </h3>
                <p className="mb-4">
                  To respond to your inquiries and provide technical support.
                </p>

                <h3 className="text-lg font-medium mb-3">
                  Legal Compliance and Security
                </h3>
                <p className="mb-4">
                  To comply with legal obligations and protect against fraud and
                  abuse.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  When We Share or Disclose Information
                </h2>

                <h3 className="text-lg font-medium mb-3">
                  With Your Co-Parent (Other Party)
                </h3>
                <p className="mb-4">
                  Communications are shared with the other party in your
                  co-parenting relationship.
                </p>

                <h3 className="text-lg font-medium mb-3">Service Providers</h3>
                <p className="mb-4">
                  We may share data with trusted third-party service providers
                  who assist in operating our platform.
                </p>

                <h3 className="text-lg font-medium mb-3">Legal Requirements</h3>
                <p className="mb-4">
                  We may disclose information when required by law or to protect
                  our rights and safety.
                </p>

                <h3 className="text-lg font-medium mb-3">Business Transfers</h3>
                <p className="mb-4">
                  In the event of a merger or acquisition, your information may
                  be transferred to the new entity.
                </p>

                <h3 className="text-lg font-medium mb-3">With Your Consent</h3>
                <p className="mb-4">
                  We may share information in other ways with your explicit
                  consent.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">Data Retention</h2>
                <p className="mb-4">
                  We retain information for as long as necessary to fulfill
                  service and legal obligations. Communication records are
                  generally not deleted.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  Security Measures
                </h2>
                <p className="mb-4">
                  We use industry-standard encryption, firewalls, and access
                  controls. Communications are not end-to-end encrypted to allow
                  for record export and moderation.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  Use of Artificial Intelligence (AI)
                </h2>
                <p className="mb-4">
                  Prickly Pear uses AI to assist with tone suggestions and
                  content moderation. AI may make errors. Users must evaluate
                  all AI outputs before using them.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  Your Rights and Choices
                </h2>
                <p className="mb-4">
                  Rights may include data access, correction, deletion (with
                  limitations). Contact support to exercise your rights.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  Changes to This Privacy Policy
                </h2>
                <p className="mb-4">
                  We may update this policy. Continued use of the service
                  signifies acceptance of changes.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
                <p className="mb-2">Email: hello@prickly.app</p>
              </section>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </>
  );
}
