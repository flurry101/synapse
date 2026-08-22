# Synapse

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.12%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.1-61DAFB.svg?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248.svg?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg?logo=docker&logoColor=white)](https://www.docker.com/)
[![Hugging Face](https://img.shields.io/badge/Hugging%20Face-Ecosystem-FFD21E.svg?logo=huggingface&logoColor=black)](https://huggingface.co/)

**A trusted AI model marketplace and deployment platform that connects AI model creators with developers, startups, and enterprises.**

[Live Demo](https://synapse-hub-web.onrender.com/) • [API Documentation](https://synapse-ai-hub.onrender.com/docs) • [Report Issue](https://github.com/flurry101/synapse/issues) • [Contribution Guidelines](CONTRIBUTING.md)

</div>

---

## Table of Contents

- [Synapse](#synapse)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Key Features \& Workflows](#key-features--workflows)
    - [1. Developer Experience](#1-developer-experience)
    - [2. Model Owner Experience](#2-model-owner-experience)
    - [3. Hugging Face Integration \& Seeding](#3-hugging-face-integration--seeding)
    - [4. Authentication \& Role Isolation (RBAC)](#4-authentication--role-isolation-rbac)
  - [Developer Setup \& Contributing](#developer-setup--contributing)
  - [License](#license)

---

## Overview

**Synapse** simplifies the discovery, evaluation, monetisation, and deployment of AI models. It bridges the gap between open-source model creators and developers by providing:

1. **Model Discovery & Semantic Search**: Find models by specific task, NLP requirements, trust scores, parameter sizes, or benchmark performance.
2. **Side-by-Side Model Comparison**: Compare accuracy, precision, recall, F1 scores, latency, throughput, and pricing models side-by-side.
3. **Interactive Browser Playground**: Test prompt inference in real-time with latency tracking, token counts, and cost estimation directly in the browser.
4. **1-Click Deployment & API Generation**: Provision instant API keys, endpoint configurations, and pre-generated SDK client code (Python & cURL).
5. **Model Owner Portal & Monetization**: Publish model profiles, link Hugging Face models, configure per-request / per-token pricing schemes, publish benchmark results, and monitor usage analytics in real-time.

---

## Key Features & Workflows

### 1. Developer Experience
Developers searching for AI capabilities benefit from an integrated workflow:
- **Smart Model Search & Filter**: Filter models by task category (*Text Generation*, *Summarization*, *Code Generation*, *Vision*, etc.), pricing brackets, minimum trust score, or latency thresholds.
- **Semantic Recommendation Engine** (`/developer/recommendations`): Describe a natural-language use-case (e.g. *"Fast code completion under 200ms latency"*), and receive ranked model suggestions with compatibility scores.
- **Side-by-Side Comparison Arena** (`/developer/compare`): Select 2 to 5 models to inspect side-by-side matrices of benchmark metrics (MMLU, HumanEval, GSM8K), throughput, latency, and cost per million tokens.
- **In-Browser Playground** (`/developer/playground`): Send sample prompts directly to models with configurable `temperature` and `max_tokens`. The playground executes real-time inference via Hugging Face or fallback mock simulation, capturing prompt tokens, completion tokens, latency, and estimated cost.
- **1-Click API Deployment** (`/developer/deployments`): Instantly provision dedicated API endpoints with generated bearer API keys, rate limit controls, and pre-rendered Python (`requests`/`openai` style) and cURL code snippets.

### 2. Model Owner Experience
Model creators, labs, and hosting providers have access to a dedicated dashboard:
- **Model Catalog Registration**: Register open-source or proprietary models by connecting their Hugging Face Repository ID or defining custom architecture specifications.
- **Automated & Custom Benchmarks**: Upload or record benchmark evaluations across industry datasets with metric tracking for Accuracy, Precision, Recall, F1 Score, Latency (ms), and Throughput (RPS).
- **Flexible Monetization & Pricing**: Define multi-tier pricing strategies:
  - *Per-Request Pricing* (e.g., \$0.001 / query)
  - *Per-1K Token Pricing* (e.g., \$0.015 / 1K tokens)
  - *Input / Output Token Pricing* (e.g., \$0.15 / \$0.60 per million tokens)
  - *Monthly Flat Subscription*
- **Real-Time Telemetry & Analytics**: Monitor total query volume, successful vs. failed requests, latency distributions, and revenue earned across all developer integrations.

### 3. Hugging Face Integration & Seeding
Synapse seamlessly integrates with Hugging Face Hub:
- **Startup Auto-Sync**: When configured (`HF_AUTO_SYNC_ON_STARTUP=true`), Synapse queries Hugging Face Hub on backend startup and seeds top downloaded/trending models into MongoDB.
- **Live Search & Import**: Model owners can query Hugging Face Hub directly from the Synapse UI to auto-populate model architectures, parameter sizes, license details, and tags.
- **Inference Proxying**: Live inference requests from the Developer Playground route directly to Hugging Face's serverless Inference API using your configured `HF_TOKEN`.

### 4. Authentication & Role Isolation (RBAC)
- **Multi-Role RBAC**: Users can possess `developer`, `owner`, or both roles simultaneously.
- **Strict Role Isolation**:
  - Developer endpoints (`/api/v1/developer/*`) require the `developer` role.
  - Model Owner endpoints (`/api/v1/owner/*`) require the `owner` role.
  - Role switching is supported dynamically via `/api/v1/users/me`.
- **Authentication Methods**:
  - Standard Email/Password registration with bcrypt hashing and JWT Bearer tokens.
  - Google OAuth 2.0 Single Sign-On (SSO) with automated profile creation and callback handling.

---

## Developer Setup & Contributing

For full technical documentation, architecture diagrams, database schemas, REST API references, local development instructions, and contribution guidelines, please see [CONTRIBUTING.md](CONTRIBUTING.md):

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
