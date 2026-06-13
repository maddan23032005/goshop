# 🛒 GoShop — AI-Powered Multi-Vendor E-Commerce Platform

> Shop smarter with AI. Built with Next.js 15, powered by Llama 4, and deployed on Vercel.

🌐 **Live Demo:** [goshop-xi.vercel.app](https://goshop-xi.vercel.app)

---

## 👋 What is GoShop?

GoShop is a full-stack, production-ready multi-vendor e-commerce platform where multiple sellers can open their own stores, list products, and receive orders — all on one platform. Think of it as a mini Shopify clone, but with cutting-edge AI features that make it stand out from the crowd.

I built this project from scratch to demonstrate end-to-end full-stack development skills, AI/ML integration, and real-world deployment — not just a tutorial project, but something that actually works in production.

---

## ✨ Features

### 🏪 For Customers
- Browse products from multiple sellers
- AI-powered smart search — search by meaning, not just keywords
- Upload a photo to find similar products (AI Image Search)
- Add products to cart and wishlist
- Apply coupon codes at checkout
- Pay via Cash on Delivery or Stripe
- Track orders with a visual timeline
- Rate and review purchased products
- Get personalized product recommendations
- "Customers also bought" suggestions
- Order history with detailed tracking

### 🏬 For Sellers
- Create and manage your own store
- Add products with AI-generated descriptions
- Upload multiple product images (Cloudinary)
- Manage inventory and stock status
- View and update order statuses
- Store analytics dashboard with charts
- Revenue tracking and top product insights

### 👨‍💼 For Admins
- Approve or reject store applications
- Manage all stores on the platform
- Create and manage coupon codes
- Full analytics dashboard
- Revenue, orders, users, and product insights
- Real-time charts powered by Recharts

### 🤖 AI Features (What makes GoShop unique!)
- **GoShop AI Chatbot** — Real-time customer support powered by Groq + Llama 4
- **RAG Order Assistant** — Knows your order history, answers questions about your purchases
- **LangGraph Shopping Agent** — Multi-step AI agent that can search products, check orders, and give recommendations through conversation
- **Semantic Search** — Search by meaning using Cohere embeddings ("gift for my dad", "something warm for winter")
- **AI Image Search** — Upload any product photo and find similar items in the store
- **AI Description Generator** — Sellers can auto-generate product descriptions with one click
- **Personalized Recommendations** — AI learns from your purchase history to recommend products you'll love

### 🌍 Multilingual Support
- English, Tamil (தமிழ்), Hindi (हिंदी)
- Cookie-based language persistence
- AI-powered auto-translation for product descriptions and reviews
- Language switcher in navbar

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 15 (App Router) | Full-stack React framework |
| React 19 | UI library |
| Tailwind CSS 4 | Styling |
| Redux Toolkit | Cart and wishlist state management |
| Recharts | Analytics charts |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|------------|---------|
| Next.js API Routes | Serverless backend |
| Prisma ORM v5 | Database queries |
| PostgreSQL (Supabase) | Production database |
| Upstash Redis | API caching |

### AI & ML
| Technology | Purpose |
|------------|---------|
| Groq + Llama 4 Scout | AI Chatbot, Agent, Translation |
| LangChain + LangGraph | Multi-step AI agent |
| Cohere Embed v3 | Semantic search embeddings |
| Cohere Rerank | RAG document reranking |

### Services
| Service | Purpose |
|---------|---------|
| Clerk | Authentication |
| Cloudinary | Image upload and storage |
| Stripe | Payment processing |
| Resend | Email notifications |
| Vercel | Deployment |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20 or higher
- A Supabase account (free)
- A Clerk account (free)
- A Cloudinary account (free)
- A Groq account (free)
- A Cohere account (free trial)

### 1. Clone the repository

```bash
git clone https://github.com/maddan23032005/goshop.git
cd goshop
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# Database (Supabase)
DATABASE_URL="your-supabase-connection-url"
DIRECT_URL="your-supabase-direct-url"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxx
CLERK_SECRET_KEY=sk_test_xxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CURRENCY_SYMBOL=$
ADMIN_ID=your-clerk-user-id

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# AI
GROQ_API_KEY=your-groq-key
COHERE_API_KEY=your-cohere-key

# Cache
UPSTASH_REDIS_REST_URL=your-upstash-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# Payments
STRIPE_SECRET_KEY=sk_test_xxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx

# Email
RESEND_API_KEY=re_xxxx
```

### 4. Push database schema

```bash
npx prisma db push
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you're good to go!

---

## 📁 Project Structure
goshop/

├── app/

│   ├── (public)/          # Customer-facing pages

│   │   ├── page.jsx       # Homepage

│   │   ├── shop/          # Shop & product pages

│   │   ├── cart/          # Cart page

│   │   ├── orders/        # Order history

│   │   ├── search/        # AI semantic search

│   │   ├── image-search/  # AI image search

│   │   └── wishlist/      # Wishlist page

│   ├── store/             # Seller dashboard

│   │   ├── page.jsx       # Seller home

│   │   ├── add-product/   # Add new product

│   │   ├── manage-product/# Manage products

│   │   ├── orders/        # Store orders

│   │   └── analytics/     # Store analytics

│   ├── admin/             # Admin panel

│   │   ├── page.jsx       # Admin dashboard

│   │   ├── approve/       # Approve stores

│   │   ├── stores/        # Manage stores

│   │   ├── coupons/       # Manage coupons

│   │   └── analytics/     # Admin analytics

│   └── api/               # API routes

│       ├── product/       # Product CRUD

│       ├── order/         # Order management

│       ├── store/         # Store management

│       ├── admin/         # Admin operations

│       ├── ai/            # AI endpoints

│       │   ├── chat/      # AI chatbot

│       │   ├── agent/     # LangGraph agent

│       │   ├── search/    # Semantic search

│       │   ├── image-search/  # Image search

│       │   ├── recommendations/ # Recommendations

│       │   └── also-bought/   # Also bought

│       ├── stripe/        # Payment processing

│       └── upload/        # Image upload

├── components/

│   ├── AIChatbot.jsx      # AI chat widget

│   ├── OrderAssistant.jsx # RAG order assistant

│   ├── AgentChat.jsx      # LangGraph agent UI

│   ├── Recommendations.jsx# Product recommendations

│   ├── AlsoBought.jsx     # Also bought section

│   ├── Navbar.jsx         # Navigation with search

│   ├── ProductCard.jsx    # Product display card

│   └── ...                # Many more components

├── lib/

│   ├── prisma.js          # Prisma client

│   ├── redis.js           # Redis cache

│   ├── embeddings.js      # Cohere embeddings

│   ├── email.js           # Email templates

│   └── agent/

│       └── tools.js       # LangGraph agent tools

├── messages/

│   ├── en.json            # English translations

│   ├── ta.json            # Tamil translations

│   └── hi.json            # Hindi translations

└── prisma/

└── schema.prisma      # Database schema

---

## 🗄️ Database Schema

GoShop uses 8 database models:

- **User** — Customer accounts synced with Clerk
- **Store** — Seller stores with approval status
- **Product** — Products with images and categories
- **Order** — Customer orders with status tracking
- **OrderItem** — Line items in each order
- **Rating** — Product reviews (one per purchase)
- **Address** — Delivery addresses per user
- **Coupon** — Discount codes with expiry

---

## 🤖 AI Architecture
Customer Query

↓

LangGraph Agent (Llama 4 Scout via Groq)

↓

Tool Selection

↓

┌─────────────────────────────────────┐

│  search_products  │  get_orders     │

│  get_product      │  recommendations│

│  get_store_info   │                 │

└─────────────────────────────────────┘

↓

Real Database Queries (Prisma + Supabase)

↓

Cohere Reranking (RAG)

↓

Final AI Response

---

## 🌍 Multilingual Support

GoShop supports 3 languages with cookie-based persistence:

| Language | Code | Status |
|----------|------|--------|
| English | en | ✅ Default |
| Tamil | ta | ✅ Full support |
| Hindi | hi | ✅ Full support |

Product descriptions and reviews are auto-translated using Groq AI when a non-English language is selected.

---

## 📱 PWA Support

GoShop is a Progressive Web App — users can install it on their devices:

- ✅ Works offline (cached pages)
- ✅ Installable on mobile and desktop
- ✅ Push notification ready
- ✅ App shortcuts (Shop, Orders, Cart)

---

## 🔒 Security

- All API routes protected with Clerk authentication
- Admin routes restricted to ADMIN_ID only
- Rate limiting on AI endpoints (Upstash Redis)
- Environment variables for all secrets
- Prisma ORM prevents SQL injection

---

## 📊 Performance

- Redis caching on product API (5 min cache)
- Automatic cache invalidation on product updates
- Next.js Image optimization
- Edge middleware for auth (Clerk)
- Serverless functions on Vercel

---

## 🚀 Deployment

GoShop is deployed on Vercel with:

- **Database** — Supabase (PostgreSQL)
- **Images** — Cloudinary CDN
- **Auth** — Clerk
- **Cache** — Upstash Redis
- **AI** — Groq API + Cohere API

To deploy your own instance:

1. Fork this repository
2. Create a Vercel account
3. Import the repository
4. Add all environment variables
5. Deploy!

---

## 🎯 What I learned building this

Building GoShop taught me a lot about real-world software development:

- How to structure a large Next.js application with multiple user roles
- Integrating multiple third-party services and making them work together
- Building AI features that actually add value — not just gimmicks
- The importance of caching and performance optimization
- How RAG (Retrieval Augmented Generation) works in practice
- Deploying and managing a production application
- Making a website accessible in multiple languages

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Maddan Murugan**
- GitHub: [@maddan23032005](https://github.com/maddan23032005)
- Email: maddan23032005@gmail.com
- Live Project: [goshop-xi.vercel.app](https://goshop-xi.vercel.app)

---

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org) — Amazing full-stack framework
- [Groq](https://groq.com) — Lightning fast AI inference
- [Cohere](https://cohere.com) — Best-in-class embeddings
- [LangChain](https://langchain.com) — AI agent framework
- [Supabase](https://supabase.com) — Open source Firebase alternative
- [Clerk](https://clerk.com) — Best auth solution for Next.js
- [Vercel](https://vercel.com) — Seamless deployment platform

---

⭐ **If you found this project helpful, please give it a star!**

Working link : https://goshop-xi.vercel.app
