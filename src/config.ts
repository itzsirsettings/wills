import { brand } from './lib/brand';

// ─── Site ────────────────────────────────────────────────────────────────────

export interface SiteConfig {
  title: string;
  description: string;
  language: string;
}

export const siteConfig: SiteConfig = {
  "title": "Wills Group of Company | Doors, Gates, Metalwork & Interiors",
  "description": "Explore metal doors, gates, window grilles and custom fabrication from Wills Group. Plan a made-to-measure project for your space.",
  "language": "en"
};

// ─── Navigation ──────────────────────────────────────────────────────────────

export interface MenuLink {
  label: string;
  href: string;
}

export interface SocialLink {
  icon: string;
  label: string;
  href: string;
}

export interface NavigationConfig {
  brandName: string;
  brandFullName?: string;
  menuLinks: MenuLink[];
  socialLinks: SocialLink[];
  searchPlaceholder: string;
  menuBackgroundImage: string;
}

export const navigationConfig: NavigationConfig = {
  "brandName": "Wills Group of Company",
  "brandFullName": "Wills Group of Company",
  "menuLinks": [
    {
      "label": "About",
      "href": "#about"
    },
    {
      "label": "Doors & Gates",
      "href": "#products"
    },
    {
      "label": "Fabrication",
      "href": "#services"
    },
    {
      "label": "Design Gallery",
      "href": "#blog"
    },
    {
      "label": "Contact",
      "href": "#contact"
    }
  ],
  "socialLinks": [],
  "searchPlaceholder": "Search metalwork...",
  "menuBackgroundImage": "/media/wills/IMG-20261003-WA0067.webp"
};

// ─── Hero ────────────────────────────────────────────────────────────────────

export interface HeroConfig {
  tagline: string;
  title: string;
  rotatingTitles?: string[];
  tagLineSecondary?: string;
  ctaPrimaryText: string;
  ctaPrimaryTarget: string;
  ctaSecondaryText: string;
  ctaSecondaryTarget: string;
  backgroundImage: string;
}

export const heroConfig: HeroConfig = {
  "tagline": "",
  "title": "Built in steel.\nMade for your space.",
  "rotatingTitles": [
    "Built in steel.\nMade for your space."
  ],
  "tagLineSecondary": "Distinctive doors, gates and metalwork. From your first idea to the final detail.",
  "ctaPrimaryText": "Explore the designs",
  "ctaPrimaryTarget": "#gallery",
  "ctaSecondaryText": "Plan your project",
  "ctaSecondaryTarget": "#contact",
  "backgroundImage": "/media/wills/IMG-20261003-WA0067.webp"
};

// ─── SubHero ─────────────────────────────────────────────────────────────────

export interface Stat {
  value: number;
  suffix: string;
  label: string;
}

export interface SubHeroConfig {
  tag: string;
  heading: string;
  bodyParagraphs: string[];
  linkText: string;
  linkTarget: string;
  image1: string;
  image2: string;
  stats: Stat[];
}

export const subHeroConfig: SubHeroConfig = {
  "tag": "",
  "heading": "An entrance with presence.",
  "bodyParagraphs": [
    "Discover metal doors, entrance gates, security grilles and fabrication designs from Wills Group.",
    "Start with a photograph, a drawing or a space that needs a better solution. Dimensions, materials and finishes are agreed as part of your quote."
  ],
  "linkText": "Explore our work",
  "linkTarget": "#gallery",
  "image1": "/media/wills/IMG-20261003-WA0039.webp",
  "image2": "/media/wills/IMG-20261003-WA0064.webp",
  "stats": []
};

// ─── Video Section ───────────────────────────────────────────────────────────

export interface VideoSectionConfig {
  tag: string;
  heading: string;
  bodyParagraphs: string[];
  ctaText: string;
  ctaTarget: string;
  backgroundImage: string;
}

export const videoSectionConfig: VideoSectionConfig = {
  "tag": "",
  "heading": "Metalwork in detail.",
  "bodyParagraphs": [
    "Explore the supplied doors, gates and fabrication videos.",
    "Every project starts with the opening, the intended use and the design you have in mind."
  ],
  "ctaText": "Plan your project",
  "ctaTarget": "#contact",
  "backgroundImage": "/media/wills/IMG-20261003-WA0054.webp"
};

// ─── Products ────────────────────────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
}

export interface ProductsConfig {
  tag: string;
  heading: string;
  description: string;
  viewAllText: string;
  addToCartText: string;
  addedToCartText: string;
  categories: string[];
  products: Product[];
}

export const productsConfig: ProductsConfig = {
  "tag": "",
  "heading": "Doors, gates & custom metalwork.",
  "description": "Choose a design direction. Material, dimensions, finish, fittings and lead time are confirmed in your individual quote.",
  "viewAllText": "View all designs",
  "addToCartText": "Request a quote",
  "addedToCartText": "Selected",
  "categories": [
    "All",
    "Doors",
    "Gates",
    "Grilles",
    "Fabrication"
  ],
  "products": [
    {
      "id": 1,
      "name": "Decorative entrance door",
      "price": 0,
      "category": "Doors",
      "image": "/media/wills/IMG-20261003-WA0018.webp"
    },
    {
      "id": 2,
      "name": "Contemporary metal door",
      "price": 0,
      "category": "Doors",
      "image": "/media/wills/IMG-20261003-WA0039.webp"
    },
    {
      "id": 3,
      "name": "Double entrance doors",
      "price": 0,
      "category": "Doors",
      "image": "/media/wills/IMG-20261003-WA0044.webp"
    },
    {
      "id": 4,
      "name": "Ornamental entrance gate",
      "price": 0,
      "category": "Gates",
      "image": "/media/wills/IMG-20261003-WA0067.webp"
    },
    {
      "id": 5,
      "name": "Modern panel gate",
      "price": 0,
      "category": "Gates",
      "image": "/media/wills/IMG-20261003-WA0019.webp"
    },
    {
      "id": 6,
      "name": "Window security grille",
      "price": 0,
      "category": "Grilles",
      "image": "/media/wills/IMG-20261003-WA0023.webp"
    },
    {
      "id": 7,
      "name": "Structural steel fabrication",
      "price": 0,
      "category": "Fabrication",
      "image": "/media/wills/IMG-20261003-WA0054.webp"
    },
    {
      "id": 8,
      "name": "Custom metalwork",
      "price": 0,
      "category": "Fabrication",
      "image": "/media/wills/IMG-20261003-WA0046.webp"
    }
  ]
};

// ─── Features ────────────────────────────────────────────────────────────────

export interface Feature {
  icon: "Truck" | "ShieldCheck" | "Leaf" | "Heart";
  title: string;
  description: string;
}

export interface FeaturesConfig {
  features: Feature[];
}

export const featuresConfig: FeaturesConfig = {
  "features": [
    {
      "icon": "Truck",
      "title": "Delivery planning",
      "description": "Ask about transport, access and installation when preparing your quote."
    },
    {
      "icon": "ShieldCheck",
      "title": "Purpose-led design",
      "description": "Discuss the intended use, fittings and material requirements before fabrication."
    },
    {
      "icon": "Leaf",
      "title": "Finish selection",
      "description": "Agree on the surface finish and maintenance requirements for your setting."
    },
    {
      "icon": "Heart",
      "title": "Made to your brief",
      "description": "Share dimensions, reference photos and your preferred style."
    }
  ]
};

// ─── Blog ────────────────────────────────────────────────────────────────────

export interface BlogPost {
  id: number;
  title: string;
  date: string;
  image: string;
  excerpt: string;
}

export interface BlogConfig {
  tag: string;
  heading: string;
  viewAllText: string;
  readMoreText: string;
  posts: BlogPost[];
}

export const blogConfig: BlogConfig = {
  "tag": "",
  "heading": "Design considerations",
  "viewAllText": "Explore the gallery",
  "readMoreText": "Discuss this design",
  "posts": [
    {
      "id": 1,
      "title": "Choosing your entrance design",
      "date": "",
      "image": "/media/wills/IMG-20261003-WA0039.webp",
      "excerpt": "Consider the opening, daily use and the style of the surrounding building."
    },
    {
      "id": 2,
      "title": "Planning a gate project",
      "date": "",
      "image": "/media/wills/IMG-20261003-WA0067.webp",
      "excerpt": "Bring opening dimensions, access requirements and a reference design to the discussion."
    },
    {
      "id": 3,
      "title": "Preparing for fabrication",
      "date": "",
      "image": "/media/wills/IMG-20261003-WA0054.webp",
      "excerpt": "Agree on drawings, material specification, finish and installation scope before work begins."
    }
  ]
};

// ─── FAQ ─────────────────────────────────────────────────────────────────────

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export interface FaqConfig {
  tag: string;
  heading: string;
  ctaText: string;
  ctaTarget: string;
  faqs: FaqItem[];
}

export const faqConfig: FaqConfig = {
  "tag": "",
  "heading": "Before you commission.",
  "ctaText": "Prepare a project brief",
  "ctaTarget": "#contact",
  "faqs": [
    {
      "id": 1,
      "question": "Can I request a custom design?",
      "answer": "Share a sketch or reference photo, the opening dimensions and your preferred finish. Design feasibility and specification are confirmed during quotation."
    },
    {
      "id": 2,
      "question": "How long will my project take?",
      "answer": "A project-specific schedule must be agreed after the design, material and scope are confirmed. There is no fixed lead time published here."
    },
    {
      "id": 3,
      "question": "What affects the price?",
      "answer": "Dimensions, material, metal thickness, design complexity, fittings, finish, transport and installation all affect a quote."
    },
    {
      "id": 4,
      "question": "Can I enquire from outside Nigeria?",
      "answer": "Include your destination country and postcode. Shipping availability, packing, insurance and customs responsibilities must be confirmed in the written quote."
    },
    {
      "id": 5,
      "question": "How should I care for metalwork?",
      "answer": "Ask for care instructions for the agreed material and finish. The maintenance plan should account for weather exposure and your environment."
    }
  ]
};

// ─── About ───────────────────────────────────────────────────────────────────

export interface AboutSection {
  tag: string;
  heading: string;
  paragraphs: string[];
  quote: string;
  attribution: string;
  image: string;
  backgroundColor: string;
  textColor: string;
}

export interface AboutConfig {
  sections: AboutSection[];
}

export const aboutConfig: AboutConfig = {
  "sections": [
    {
      "tag": "",
      "heading": "Metalwork that shapes a space.",
      "paragraphs": [
        "Wills Group brings together metal doors, gates, grilles and fabrication designs.",
        "Explore a design direction, then agree on dimensions, materials, finishes and the project scope in your quote."
      ],
      "quote": "",
      "attribution": "",
      "image": "/media/wills/IMG-20261003-WA0064.webp",
      "backgroundColor": "#191b1a",
      "textColor": "#ffffff"
    },
    {
      "tag": "",
      "heading": "Your project. Your specification.",
      "paragraphs": [
        "Agree on the dimensions, material, finish and installation requirements before commissioning a project."
      ],
      "quote": "",
      "attribution": "",
      "image": "/media/wills/IMG-20261003-WA0046.webp",
      "backgroundColor": "#f2efe8",
      "textColor": "#191b1a"
    }
  ]
};

// ─── Contact ─────────────────────────────────────────────────────────────────

export interface FormFields {
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
}

export interface ContactConfig {
  heading: string;
  description: string;
  locationLabel: string;
  location: string;
  emailLabel: string;
  email: string;
  phoneLabel: string;
  phone: string;
  formFields: FormFields;
  submitText: string;
  submittingText: string;
  submittedText: string;
  successMessage: string;
  backgroundImage: string;
}

export const contactConfig: ContactConfig = {
  "heading": "Let’s shape your project.",
  "description": "Prepare your requirements for a door, gate, grille or custom fabrication project.",
  "locationLabel": "Workshop",
  "location": brand.address,
  "emailLabel": "Email",
  "email": brand.email,
  "phoneLabel": "Phone",
  "phone": brand.phone,
  "formFields": {
    "nameLabel": "Name",
    "namePlaceholder": "Your name",
    "emailLabel": "Email",
    "emailPlaceholder": "you@example.com",
    "messageLabel": "Project brief",
    "messagePlaceholder": "Tell us about your metalwork project..."
  },
  "submitText": "Prepare message",
  "submittingText": "Preparing...",
  "submittedText": "Message prepared",
  "successMessage": "Your messaging app has been opened. Send the message there to deliver your enquiry.",
  "backgroundImage": "/media/wills/IMG-20261003-WA0067.webp"
};

// ─── Beds ────────────────────────────────────────────────────────────────────

export interface BedProduct {
  id: number;
  name: string;
  price: number;
  category: "Luxury" | "Standard";
  image: string;
  description: string;
}

export interface BedsConfig {
  tag: string;
  heading: string;
  description: string;
  heroImage: string;
  categories: string[];
  products: BedProduct[];
  addToCartText: string;
  addedToCartText: string;
}

export const bedsConfig: BedsConfig = {
  "tag": "",
  "heading": "Custom fabrication & finishes.",
  "description": "Explore decorative and functional metalwork. Final material, finish and fabrication specifications are agreed in a project quote.",
  "heroImage": "/media/wills/IMG-20261003-WA0054.webp",
  "categories": [
    "All",
    "Luxury",
    "Standard"
  ],
  "products": [
    {
      "id": 101,
      "name": "Decorative entrance door",
      "price": 0,
      "category": "Luxury",
      "image": "/media/wills/IMG-20261003-WA0018.webp",
      "description": "Material, dimensions, fittings and finish confirmed in your project quote."
    },
    {
      "id": 102,
      "name": "Contemporary metal door",
      "price": 0,
      "category": "Luxury",
      "image": "/media/wills/IMG-20261003-WA0039.webp",
      "description": "Material, dimensions, fittings and finish confirmed in your project quote."
    },
    {
      "id": 103,
      "name": "Double entrance doors",
      "price": 0,
      "category": "Luxury",
      "image": "/media/wills/IMG-20261003-WA0044.webp",
      "description": "Material, dimensions, fittings and finish confirmed in your project quote."
    },
    {
      "id": 104,
      "name": "Ornamental entrance gate",
      "price": 0,
      "category": "Luxury",
      "image": "/media/wills/IMG-20261003-WA0067.webp",
      "description": "Material, dimensions, fittings and finish confirmed in your project quote."
    },
    {
      "id": 105,
      "name": "Modern panel gate",
      "price": 0,
      "category": "Standard",
      "image": "/media/wills/IMG-20261003-WA0019.webp",
      "description": "Material, dimensions, fittings and finish confirmed in your project quote."
    },
    {
      "id": 106,
      "name": "Window security grille",
      "price": 0,
      "category": "Standard",
      "image": "/media/wills/IMG-20261003-WA0023.webp",
      "description": "Material, dimensions, fittings and finish confirmed in your project quote."
    },
    {
      "id": 107,
      "name": "Structural steel fabrication",
      "price": 0,
      "category": "Standard",
      "image": "/media/wills/IMG-20261003-WA0054.webp",
      "description": "Material, dimensions, fittings and finish confirmed in your project quote."
    },
    {
      "id": 108,
      "name": "Custom metalwork",
      "price": 0,
      "category": "Standard",
      "image": "/media/wills/IMG-20261003-WA0046.webp",
      "description": "Material, dimensions, fittings and finish confirmed in your project quote."
    }
  ],
  "addToCartText": "Request a quote",
  "addedToCartText": "Selected"
};

// ─── Footer ──────────────────────────────────────────────────────────────────

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterLinkGroup {
  title: string;
  links: FooterLink[];
}

export interface FooterSocialLink {
  icon: string;
  label: string;
  href: string;
}

export interface FooterConfig {
  brandName: string;
  brandTagline?: string;
  brandDescription: string;
  newsletterHeading: string;
  newsletterDescription: string;
  newsletterPlaceholder: string;
  newsletterButtonText: string;
  newsletterSuccessText: string;
  linkGroups: FooterLinkGroup[];
  legalLinks: FooterLink[];
  copyrightText: string;
  socialLinks: FooterSocialLink[];
}

export const footerConfig: FooterConfig = {
  "brandName": "Wills Group of Company",
  "brandTagline": "Doors. Gates. Metalwork. Interiors.",
  "brandDescription": "Distinctive entrances and purposeful metalwork. Explore doors, gates, grilles and fabrication designs for your next project.",
  "newsletterHeading": "",
  "newsletterDescription": "",
  "newsletterPlaceholder": "Your email",
  "newsletterButtonText": "Prepare enquiry",
  "newsletterSuccessText": "WhatsApp opened. Send your enquiry there.",
  "linkGroups": [
    {
      "title": "Explore",
      "links": [
        {
          "label": "Doors & gates",
          "href": "#services"
        },
        {
          "label": "Grilles",
          "href": "#services"
        },
        {
          "label": "Fabrication",
          "href": "#services"
        },
        {
          "label": "Design gallery",
          "href": "#gallery"
        }
      ]
    },
    {
      "title": "Plan",
      "links": [
        {
          "label": "About Wills Group",
          "href": "#about"
        },
        {
          "label": "Process",
          "href": "#process"
        },
        {
          "label": "Finishes",
          "href": "#finishes"
        },
        {
          "label": "Project brief",
          "href": "#contact"
        }
      ]
    },
    {
      "title": "Information",
      "links": [
        {
          "label": "FAQ",
          "href": "#faq"
        },
        {
          "label": "Design considerations",
          "href": "#blog"
        },
        {
          "label": "Delivery & export",
          "href": "#shipping"
        },
        {
          "label": "Contact",
          "href": "#contact"
        }
      ]
    }
  ],
  "legalLinks": [
    {
      "label": "Privacy Policy",
      "href": "/privacy-policy"
    },
    {
      "label": "Terms of Use",
      "href": "/terms-of-use"
    },
    {
      "label": "Cookie Policy",
      "href": "/cookie-policy"
    },
    {
      "label": "Security & Privacy Requests",
      "href": "/security"
    }
  ],
  "copyrightText": "© 2026 Wills Group of Company. All rights reserved.",
  "socialLinks": []
};
