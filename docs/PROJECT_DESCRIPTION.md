# SHOPMIND AI — INTELLIGENT MULTI-AGENT E-COMMERCE ASSISTANT

**Tagline**: *Your Intelligent AI Shopping Companion*

---

## 1. PROJECT OVERVIEW

**ShopMind AI** is a complete, full-stack, web-based AI e-commerce shopping companion designed to solve the complexity of manual product search, comparison, review reading, discount hunting, and inventory checking. 

Rather than functioning as a standard single-prompt chatbot, ShopMind AI uses an **Autonomous Multi-Agent Architecture** where specialized AI agents collaborate under a centralized **Orchestrator** using **LangGraph**, **Retrieval-Augmented Generation (RAG)**, **Deterministic Tool Calling**, and **Session Conversation Memory**.

---

## 2. MAIN PROBLEM SOLVED

Traditional e-commerce platforms force users to manually navigate multiple tabs:
- Filtering categories and price sliders
- Comparing technical specifications across products
- Reading through dozens of user reviews
- Searching for active promo codes and bank discounts
- Checking pincode delivery availability and stock status

Traditional e-commerce chatbots are typically static, single-turn, prone to hallucinations, and unable to perform real tool actions or query multi-source databases.

**ShopMind AI** solves this by accepting natural language requests (e.g., *"I need a phone under ₹20,000 with a good camera, good reviews, discounts, and fast delivery"*), dynamically delegating tasks to specialized agents, executing tool calls against structured data, and returning a single, grounded response.

---

## 3. SYSTEM ARCHITECTURE

```text
                                  USER
                                   │
                                   ▼
                            NEXT.JS FRONTEND
                        (Interactive Chat & UI)
                                   │
                                   ▼
                            FASTAPI BACKEND
                        (REST API & CORS Layer)
                                   │
                                   ▼
                         USER INTERACTION AGENT
                     (Intent & Context Extraction)
                                   │
                                   ▼
                           ORCHESTRATOR AGENT
                     (LangGraph Conditional Router)
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
         ▼                         ▼                         ▼
   RETRIEVAL AGENT       RECOMMENDATION AGENT        PRICING AGENT
 (FAISS + RAG Context)   (Explainable Multi-Score)   (Discounts & Net Price)
         │                         │                         │
         └─────────────────────────┼─────────────────────────┘
                                   │
                                   ▼
                            INVENTORY AGENT
                         (Stock & Delivery)
                                   │
                                   ▼
                           COMBINED CONTEXT
                                   │
                                   ▼
                           HYBRID LLM ENGINE
                     (Ollama / OpenAI / Mock LLM)
                                   │
                                   ▼
                            FINAL RESPONSE
```

---

## 4. THE 6 SPECIALIZED AGENTS

### 1. User Interaction Agent
- **Role**: Accepts raw user queries, extracts structured JSON intent, and handles multi-turn conversation memory.
- **Key Capability**: Resolves ambiguous follow-up requests using previous session context.
  - *Example*: User says *"Show cheaper options"*. The agent looks up previous category ("mobile") and budget (₹20,000), reducing the target budget by 15-20% and re-querying.
  - *Example*: User says *"What about Samsung?"*. The agent filters the active search by brand "Samsung".

### 2. Retrieval Agent (RAG Engine)
- **Role**: Performs semantic search over un-structured product descriptions, customer reviews, store FAQs, and return/shipping policies.
- **Technology**: SentenceTransformer embeddings, TF-IDF/cosine similarity, and FAISS vector indexing.
- **Output**: Retrieves verbatim factual snippets so answers never guess return policies or review sentiment.

### 3. Recommendation Agent
- **Role**: Filters candidate catalog products and computes an **Explainable Multi-Factor Score**:
  $$	ext{Match Score} = 0.35 	imes 	ext{Budget\_Fit} + 0.35 	imes 	ext{Rating\_Score} + 0.30 	imes 	ext{Requirement\_Match}$$
- **Output**: Ranked list of top 3 candidates with transparent match explanations (e.g., *"Budget fit (92%), Rating 4.5/5, Requirement match (2/2)"*).

### 4. Pricing & Offers Agent
- **Role**: Evaluates live catalog pricing, calculates instant promotional discounts, bank offer coupons, and net final payable price.
- **Formula**: $	ext{Final Price} = 	ext{Original Price} - 	ext{Discount Amount}$.

### 5. Inventory & Delivery Agent
- **Role**: Checks real-time warehouse inventory (`In Stock` / `Out of Stock`) and computes shipping delivery timelines (`1-3 business days`).

### 6. Orchestrator Agent (LangGraph Workflow)
- **Role**: Central intelligence brain of the application.
- **Conditional Routing**: Determines which agents are required based on intent without forcing simple queries through all agents.
  - *Stock Query*: Calls **Inventory Agent** only.
  - *Discount Query*: Calls **Pricing Agent** only.
  - *Review Query*: Calls **Retrieval Agent** only.
  - *Complex Shopping Query*: Runs the complete 5-agent pipeline.

---

## 5. DETERMINISTIC TOOL CALLING SYSTEM

Agents interact with data strictly through validated python functions:

1. `search_products(query, category, max_budget, min_rating, brand)`: Filters products in SQLite DB.
2. `get_product_details(product_id)`: Fetches full specs and pricing.
3. `search_reviews(product_id, query)`: Queries customer reviews table.
4. `recommend_products(requirements, budget, category)`: Runs recommendation algorithm.
5. `get_discount(product_id)`: Calculates active discounts and offers.
6. `check_stock(product_id)`: Checks real-time stock availability.
7. `get_delivery_estimate(product_id)`: Calculates estimated delivery dates.

---

## 6. ANTI-HALLUCINATION GUARDRAILS

To prevent LLM hallucination:
1. **No Invented Specs/Prices**: Prices, stock, discounts, and delivery dates are produced strictly by deterministic tool functions and database rows.
2. **Grounded Prompts**: The LLM prompt instructs the model to answer *only* using supplied tool outputs and retrieved RAG context.
3. **Explicit Missing Data Handling**: If a product or specification is missing, the assistant explicitly states it is unavailable rather than fabricating information.

---

## 7. USER INTERFACE & OBSERVABILITY

- **Modern Dark Glassmorphism UI**: Built with Next.js 14, Tailwind CSS, and Lucide icons.
- **Agent Execution Timeline**: Collapsible visual accordion showing real-time agent execution steps (*"✓ Understanding request"*, *"✓ Recommendation Agent"*, *"✓ Pricing Agent"*, etc.).
- **Product Cards**: Includes price strike-throughs, discount savings badges, ratings, stock tags, and action buttons.
- **Side-by-Side Comparison**: Enables users to compare up to 3 products across price, ratings, specs, stock, and delivery.
- **Product Details Drawer**: Opens full technical specifications and one-click AI query options.

---

## 8. API SPECIFICATION

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | System health & LLM provider status |
| `/api/chat` | `POST` | Primary multi-agent conversational endpoint |
| `/api/products` | `GET` | List/filter product catalog |
| `/api/products/{id}` | `GET` | Get detailed product specifications |
| `/api/products/search` | `POST` | Filter products by budget, category, brand, rating |
| `/api/products/compare` | `POST` | Compare multiple product IDs |
| `/api/products/{id}/reviews` | `GET` | Fetch customer reviews for a product |
| `/api/products/{id}/offers` | `GET` | Fetch discounts and active promotions |
| `/api/products/{id}/inventory` | `GET` | Fetch stock status and delivery estimates |

---

## 9. TECH STACK

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: FastAPI, Python 3.14, SQLite, Pydantic V2, SQLAlchemy, Uvicorn
- **AI & RAG**: LangGraph, LangChain Core, SentenceTransformers, FAISS Vector Engine
- **Testing**: Pytest, Pytest-Asyncio
