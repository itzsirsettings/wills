export const policies = {
  privacy: {
    path: '/privacy-policy', title: 'Privacy Policy',
    description: 'How Wills handles website visits, project briefs and information you choose to share.',
    sections: [
      ['Your project brief', 'The project brief is prepared in browser memory. Entering your name, email, location or project details does not submit them to Wills or store them in an application database. Leaving or reloading the page clears the current brief. Saving a brief downloads a text file to your device.'],
      ['Sharing an enquiry', 'Choosing WhatsApp or email prepares your enquiry in the service you select. Those services receive information when you use them, and their own privacy policies apply. Wills receives the information you send to discuss your project and respond to your enquiry. Share only what is needed for that conversation.'],
      ['Website requests', 'Hosting infrastructure processes technical information needed to deliver and protect the website, such as an IP address, requested URL and browser information. Operational and security logs may record these requests. These requests are separate from the project brief, which is not submitted by the website.'],
      ['Browser preferences and external services', 'The site saves your cookie-notice dismissal in a browser cookie and local storage. Optional analytics and advertising cookies are not enabled in this version. External links open services such as WhatsApp and mapping providers; those services apply their own policies. If a workshop map is displayed, its tiles are requested from OpenStreetMap.'],
      ['Information requests', 'Contact Wills to ask about information you have shared, including access, correction or deletion. Explain the request without sending passwords, payment credentials or another person’s private information. Requests concerning a third-party service should also be directed to that service.'],
    ],
  },
  terms: {
    path: '/terms-of-use', title: 'Terms of Use',
    description: 'Information about using the Wills website and preparing a project enquiry.',
    sections: [
      ['Using this website', 'This website introduces Wills Group of Company’s doors, gates, metalwork and interiors and helps you prepare a project enquiry. Online purchases and payments are currently unavailable. Preparing a brief or opening WhatsApp does not place an order.'],
      ['Designs and project information', 'Gallery photographs provide project references. Interior concept images illustrate design ideas. A reference image does not confirm that a particular design, material, dimension or finish is available for your project. Confirm the specification directly with Wills.'],
      ['Quotes and commissioned work', 'Scope, measurements, materials, fittings, finish, price and schedule must be agreed for the individual project before production or installation. Delivery, packing, site access, customs and installation responsibilities also require agreement in the quote.'],
      ['Changes, cancellations and aftercare', 'Discuss changes, cancellation arrangements, payment stages and aftercare directly with Wills before commissioning work. This informational website does not publish a standard refund period or warranty, and the project brief does not establish those arrangements.'],
      ['Responsible use', 'Provide accurate enquiry details and share only information you are entitled to share. Do not use the site to attempt unauthorised access, access another person’s information or disrupt the service. Report suspected security issues privately through the Security & Privacy Requests page.'],
      ['External services', 'Email, WhatsApp and other external services operate independently of this website. Review their terms and privacy information when using them. Contact Wills if you need clarification about a project or the information shown here.'],
    ],
  },
  cookies: {
    path: '/cookie-policy', title: 'Cookie Policy',
    description: 'The browser storage used by this website and how to revisit the privacy notice.',
    sections: [
      ['What this website saves', 'Dismissing the privacy notice sets the wills_group_cookie_consent cookie to accepted and saves the same dismissal preference under wills-group:cookie-consent in local storage. The preference prevents the notice from appearing on every visit; it does not enable advertising or analytics.'],
      ['How long the preference lasts', 'The cookie has a maximum age of 180 days. The local-storage preference remains until it is cleared from your browser. Because the site checks both, the notice may remain dismissed after the cookie expires if the local-storage entry is still present.'],
      ['Your controls', 'Use Cookie settings to reopen the notice. To remove the saved preference, clear both cookies and local storage for this website through your browser’s site-data controls. If browser storage is unavailable, the notice may appear again on later visits.'],
      ['Optional tracking and external services', 'No optional analytics or advertising cookies are enabled in this version. Opening WhatsApp, email or map links takes you to an external service, which may use its own cookies or storage. Those services’ policies apply there.'],
    ],
  },
  security: {
    path: '/security', title: 'Security & Privacy Requests',
    description: 'How to contact Wills about personal information or a website security concern.',
    sections: [
      ['Privacy requests', 'Contact Wills on WhatsApp +234 705 745 0799 to ask about access, correction or deletion of information you have shared. Describe the information and the action you are requesting. Send only the details needed to explain your request.'],
      ['Reporting a security concern', 'Report suspected website security issues privately. Include the affected page, a short description and steps that explain what you observed. Remove personal information, passwords, authentication tokens and payment credentials from any evidence you share.'],
      ['Keep testing safe', 'Do not access other people’s data, disrupt the service or test third-party systems. A contact channel for reports does not grant permission to perform intrusive testing. Wills does not publish a bug-bounty reward or guaranteed response time on this website.'],
      ['Project and payment enquiries', 'Online purchases and payments are currently unavailable. Use the project enquiry channel to discuss a quote, scope or delivery arrangement. Do not send card details, passwords or one-time codes through a website brief or security report.'],
    ],
  },
} as const;

export type PolicyKind = keyof typeof policies;
export const policyRoutes = Object.entries(policies).map(([kind, policy]) => ({ kind: kind as PolicyKind, path: policy.path }));
