# FutureTrace: An AI-Agentic Decision Intelligence System for Predictive Career and Life-Path Simulation

## 1. Abstract

FutureTrace is an applied artificial intelligence system designed to address a critical gap in educational technology: the absence of data-driven, personalized decision-support tools for students navigating consequential academic and career choices. The platform enables users to articulate a pending decision, provide structured contextual parameters, and receive a multi-scenario predictive analysis generated through orchestrated AI agents augmented by domain-specific knowledge retrieval. Unlike conventional career guidance tools that rely on static questionnaires or generic recommendations, FutureTrace employs a simulation-based methodology that models multiple plausible futures, each accompanied by quantitative outcome indicators, strategic analysis frameworks, and actionable implementation roadmaps. The system is architected with a trajectory toward full agentic autonomy, wherein specialized AI agents collaborate through a structured workflow to produce outputs grounded in real-world labor market data, educational statistics, and socioeconomic indicators specific to the Vietnamese context.

---

## 2. Problem Statement and Motivation

High school and university students in Vietnam face a decision-making environment characterized by information asymmetry, temporal pressure, and limited access to personalized advisory resources. Key decisions such as university major selection, institution choice, career specialization, and financial planning for education carry long-term consequences that are difficult to reverse. Existing advisory mechanisms, including school counselors, family networks, and online forums, tend to offer anecdotal guidance that lacks empirical grounding and fails to account for the individual's unique profile of capabilities, constraints, and preferences.

The core research question motivating FutureTrace is: Can a system of coordinated AI agents, grounded in domain-specific knowledge and structured simulation methodology, produce decision-support outputs that are simultaneously personalized, empirically informed, and actionable for student populations?

---

## 3. Product Vision and Design Philosophy

FutureTrace operates under the principle that consequential decisions benefit from structured exploration of their outcome space rather than singular recommendations. The system does not prescribe a single optimal path. Instead, it generates a spectrum of three scenario projections (Positive, Neutral, and Risk) that make explicit the trade-offs, contingencies, and downstream implications embedded in each decision.

The design philosophy rests on three pillars:

**Data-Grounded Simulation.** Scenario generation is augmented by a Retrieval-Augmented Generation (RAG) knowledge base containing curated Vietnamese labor market statistics, university admission benchmarks, salary distributions by industry and experience level, and cost-of-living data. This layer constrains the generative model's outputs to align with empirical reality, mitigating the hallucination problem that undermines trust in purely generative systems.

**Structured Analytical Frameworks.** Each scenario is decomposed through established strategic analysis methodologies including SWOT analysis, resource allocation modeling, 90-day sprint planning, risk mitigation strategy formulation, and multi-factor influence assessment (PESTLE-derived). These frameworks impose analytical rigor on the AI's outputs and provide users with structured lenses through which to evaluate their options.

**Adaptive Trajectory Planning.** The system supports longitudinal engagement through a pivot mechanism. As users progress through their chosen path and encounter real-world deviations from the projected scenario, they can report progress and obstacles. The AI then regenerates an updated roadmap that preserves completed milestones while adapting remaining phases to reflect the user's evolved circumstances. This creates a feedback loop that transforms the system from a one-time prediction tool into a continuous advisory companion.

---

## 4. System Architecture

### 4.1 Architectural Overview

FutureTrace is implemented as a client-server web application with the following component layers:

- **Presentation Layer:** A React 19 (TypeScript) single-page application built with Vite, utilizing Framer Motion for interaction animations and Phosphor Icons for the visual system.
- **API Gateway Layer:** An HTTP client module with JWT-based authentication, automatic token refresh, and structured error propagation.
- **Application Server:** A Node.js/Express backend exposing RESTful endpoints for authentication, simulation management, premium analysis, community interaction, payment processing, and administrative operations.
- **AI Orchestration Layer:** A service module that manages prompt construction, RAG context injection, API key rotation across multiple Gemini API keys, model fallback chains, retry logic with exponential backoff, and structured JSON response parsing with automatic repair of truncated outputs.
- **Knowledge Layer (RAG):** A JSON-based knowledge base containing structured Vietnamese labor market data, organized by professional field with metadata for keyword-based retrieval including salary ranges, employment rates, skill requirements, entrance score benchmarks, and market outlook assessments.
- **Persistence Layer:** MongoDB with indexed collections for users, simulations, simulation scenarios, premium analyses, community posts, comments, transactions, and administrative audit logs.
- **External Service Integrations:** Google Gemini API for generative inference, MoMo and VNPay payment gateways for transaction processing.

### 4.2 Data Flow

The end-to-end simulation pipeline proceeds through the following stages:

1. The user provides a natural language description of their decision and adjusts five contextual parameters: psychological stress level, personal financial capacity, risk tolerance, academic performance, and supplementary factors. Additional metadata includes mood state, education level, geographic location, core value orientation, and time horizon for projection.
2. An input readiness agent (pre-check) evaluates whether the user's description contains sufficient specificity for meaningful analysis. If the input is too vague, the system generates clarifying questions with selectable options to elicit the necessary detail before proceeding.
3. The RAG module performs keyword-based field detection against the knowledge base, extracting relevant market data (salary ranges, employment rates, trending specializations, entrance scores) for the identified professional domain.
4. A structured prompt is assembled that combines the user's contextual parameters, the RAG context block, output schema constraints, and behavioral instructions that enforce scenario diversity, data grounding, and analytical depth.
5. The prompt is dispatched through a multi-model fallback chain with retry logic. The system attempts the primary model first, falls back to alternative models on failure, and rotates API keys across attempts.
6. The raw response undergoes JSON extraction, parsing, and automatic repair of truncated structures. A normalization function ensures all required fields are present with appropriate defaults.
7. The validated result is persisted to MongoDB and returned to the client, where it is rendered across scenario cards, timeline visualizations, SWOT matrices, resource allocation displays, and sprint planning interfaces.

---

## 5. AI Methodology

### 5.1 Retrieval-Augmented Generation (RAG)

The knowledge base is structured as a collection of professional field profiles, each containing salary distributions segmented by experience level, employment and unemployment rates, in-demand skills, trending specializations, university entrance score benchmarks, training duration data, and qualitative market outlook assessments. Data sources include annual salary survey reports from Vietnamese recruitment platforms (TopCV, VietnamWorks, ITviec), official statistics from the General Statistics Office, university admission publications, and cost-of-living indices.

Field detection operates through keyword matching against the user's decision text and supplementary factors. When a match is found, the corresponding data profile is serialized into a structured context block and injected into the prompt with explicit instructions requiring the generative model to reference these figures in its outputs. This approach constrains the model's tendency toward fabrication of specific numerical claims.

### 5.2 Structured Output Enforcement

The system employs JSON Schema-based response formatting through the Gemini API's native structured output capability. Each API call specifies a complete schema defining the expected response structure, field types, required properties, and descriptive constraints. This eliminates the need for post-hoc parsing of free-form text and ensures that the frontend receives predictable, type-safe data structures.

Additionally, a multi-layer response recovery pipeline handles edge cases where the model produces malformed output: markdown code block stripping, brace extraction, standard JSON parsing, and a bracket-repair algorithm that closes truncated strings and mismatched brackets.

### 5.3 Multi-Model Fallback and Key Rotation

To ensure availability and manage rate limits, the AI orchestration layer supports:

- Multiple API keys specified as a comma-separated environment variable, cycled through round-robin.
- Ordered model fallback chains where each API call specifies a prioritized list of model identifiers. If the primary model returns an error (rate limit, model unavailable, access denied), the system automatically attempts the next model in the chain.
- Exponential backoff retry logic within each model attempt.

### 5.4 Input Readiness Analysis

Before committing computational resources to a full simulation, a lightweight pre-check agent evaluates the user's input for specificity. This agent uses a smaller, faster model to classify the input as either "ready" (sufficient detail for personalized analysis) or "needs_clarification" (too vague). In the latter case, it generates 1-2 targeted questions with 2-4 selectable options that help the user articulate their situation with greater precision. This mechanism implements a form of Human-in-the-Loop interaction at the input stage, ensuring that downstream simulation quality is not compromised by ambiguous inputs.

---

## 6. Core Functional Modules

### 6.1 Decision Simulation Engine

The primary user-facing workflow guides the user through a four-step process: decision description, contextual parameter adjustment, AI processing with progress indication, and multi-scenario result presentation. Each scenario includes a title, narrative description, three quantitative indicators (career growth potential, happiness projection, return on investment), a SWOT analysis matrix, resource allocation recommendations, a phased sprint plan, critical strategic advice, market fit scoring, and risk mitigation guidance.

### 6.2 Premium Deep Analysis

For subscribed users, the system generates an extended analytical report for any individual scenario. This report includes a detailed chronological narrative structured by time-phase markers, a milestone roadmap with probability-weighted events, a breakdown of influencing factors by category (economic, personal, social, technical) with influence magnitude ratings, strategic pivot point specifications following an if-then conditional format, and a long-term projection extending 3-5 years. Each milestone contains structured sub-tasks with unique identifiers, descriptions, objectives, action items, recommended tools, expected deliverables, and completion tracking.

### 6.3 Adaptive Roadmap Pivot

The pivot mechanism enables longitudinal use of the system. Users mark milestones as completed, provide feedback on encountered difficulties or changed circumstances, and the AI regenerates the remaining roadmap while preserving the history of completed work. The system maintains a feedback history array, enabling subsequent pivots to account for the cumulative trajectory of the user's experience, producing increasingly personalized adjustments over time.

### 6.4 Step Detail Expansion

Individual task steps within the milestone roadmap can be expanded through a dedicated AI call that produces enriched guidance. The expanded output includes detailed task descriptions (80-150 words), 3-5 measurable objectives, 5-8 highly specific action items with explicit references to learning platforms, tools, and resources, a curated list of recommended software and websites, and a concrete expected deliverable that serves as a self-assessment artifact.

### 6.5 Community Knowledge Sharing

Users can publish their simulation scenarios to a community feed, optionally with anonymous attribution. The community module supports categorized filtering, keyword search, pagination, a like/unlike interaction model, and threaded commenting. This creates a collective knowledge base of decision experiences that other users can reference.

### 6.6 Comparison and Progress Tracking

The system provides historical simulation browsing with search and sort capabilities, a comparison matrix for side-by-side scenario evaluation, and a progress tracking interface that visualizes milestone completion status across active roadmaps.

---

## 7. Toward an Agentic Architecture: Research Roadmap

The current system architecture employs a monolithic prompt strategy where a single, comprehensive prompt is dispatched to a generative model. While effective for the current feature set, this approach presents limitations in modularity, debuggability, and output quality control at the component level. The planned architectural evolution decomposes the AI pipeline into a multi-agent workflow, each agent specializing in a distinct analytical function.

### 7.1 Proposed Agent Taxonomy

**Router Agent.** Receives the user's decision input and classifies it into a domain category (Career, Finance, Education, Health). This classification determines which knowledge base partitions and which specialized agents are activated for the downstream pipeline.

**Researcher Agent.** Performs targeted retrieval against a vector database containing embedded Vietnamese market data, educational statistics, and cost-of-living indices. The current keyword-based RAG module would be replaced with semantic vector search using Vietnamese-optimized embedding models (e.g., bkai-foundation-models/vietnamese-bi-encoder) and a vector database (Qdrant or Milvus) supporting hybrid filtering by metadata and vector similarity.

**Simulator Agent.** Consumes the retrieved factual context and the user's profile parameters to generate multi-scenario projections. In the agentic architecture, this agent would operate on an open-source LLM (e.g., Llama-3 or Qwen-2.5) deployed internally, reducing dependency on external API providers and enabling fine-tuning on domain-specific simulation data.

**Critic Agent.** Evaluates the Simulator's outputs for logical consistency, factual alignment with the retrieved data, and plausibility of quantitative projections. If the scenarios contain contradictions or unsupported claims, the Critic rejects the output and triggers a regeneration cycle. This adversarial review mechanism implements a form of self-correction that is absent in single-pass generation.

**Formatter Agent.** Transforms the validated raw analysis into the structured JSON schema required by the frontend. This role, which requires reliable structured output generation, is the designated function for cloud-hosted models (e.g., Gemini) in the agentic architecture, reducing their scope from full analysis to formatting.

### 7.2 Orchestration Framework

The agent workflow would be orchestrated using a graph-based execution framework such as LangGraph or a custom state machine implementation. The execution graph defines agent dependencies, conditional routing based on intermediate outputs, retry policies, and human-in-the-loop interruption points where the system pauses to solicit additional user input when the agents determine that available information is insufficient for reliable projection.

### 7.3 Community Data Flywheel

A secondary research direction involves establishing a feedback loop between community-generated content and the knowledge base. High-engagement community posts with strong outcome data (high ROI, verified milestone completion) would be automatically processed, anonymized, and ingested into the vector database. This creates a data flywheel effect where user-generated experiential knowledge continuously enriches the system's empirical grounding.

### 7.4 Real-Time Agent Transparency

The transition to a multi-agent pipeline introduces latency from sequential agent execution. To maintain user engagement, the frontend would implement Server-Sent Events (SSE) or WebSocket connections to stream agent status updates in real time (e.g., "Researcher Agent is retrieving salary data for Software Engineering...", "Simulator Agent is generating scenarios...", "Critic Agent is validating logical consistency..."). This transparency transforms waiting time into an informative experience that builds user trust in the analytical process.

---

## 8. Technical Specifications

| Component | Technology |
|---|---|
| Frontend Framework | React 19.2.4 (TypeScript) |
| Build System | Vite 6.2.0 |
| Client Routing | React Router DOM 7.13.0 |
| Animation | Framer Motion 11.11.11 |
| Icon System | Phosphor Icons React 2.1.10 |
| Backend Runtime | Node.js with Express |
| Database | MongoDB with Mongoose ODM |
| AI Integration | Google Gemini API (v1.38.0) with multi-model fallback |
| Authentication | JWT with refresh token rotation |
| Payment Gateways | MoMo, VNPay |
| Deployment | Netlify/Vercel (frontend), Render (backend) |
| Knowledge Base | JSON-structured RAG with keyword-based field detection |

---

## 9. User Segmentation and Access Model

The platform implements a tiered access model designed to balance accessibility for the student demographic with sustainable service delivery:

| Capability | Free Tier | Premium Tier | Enterprise Tier |
|---|---|---|---|
| Simulation Generation | Limited quota | Unlimited | Unlimited |
| Scenario Types | 3 scenarios per simulation | 3 scenarios per simulation | 3 scenarios with custom parameters |
| SWOT Analysis | Basic | Advanced with market fit scoring | Custom organizational analysis |
| Sprint Roadmap | Simplified | Detailed with sub-task decomposition | Detailed with pivot and export |
| Premium Deep Analysis | Not available | Full access | Full access with team features |
| Roadmap Pivot | Not available | Available | Available with collaborative feedback |
| Report Export | Not available | Browser print | PDF and Excel generation |
| Community Participation | View and like | Full access including comments | Full access |

---

## 10. Evaluation Considerations

The system's output quality can be assessed along several dimensions that are relevant to both applied AI research and educational technology evaluation:

**Factual Grounding.** The degree to which scenario narratives and quantitative projections align with the injected RAG data, measured by the presence and accuracy of specific figures (salary ranges, employment rates, entrance scores) in the generated outputs.

**Scenario Diversity.** The extent to which the three generated scenarios (Positive, Neutral, Risk) present meaningfully distinct trajectories rather than superficial variations of the same outcome.

**Actionability.** The specificity and implementability of the generated roadmap tasks, evaluated by whether each task contains sufficient detail (method, platform, expected deliverable) for a student to act upon without additional research.

**Personalization Sensitivity.** The degree to which variations in input parameters (stress, finance, academic performance, risk tolerance, education level, location, core values) produce correspondingly differentiated outputs.

**Longitudinal Coherence.** In the pivot workflow, the consistency of regenerated roadmaps with the user's historical trajectory, ensuring that updated plans acknowledge completed work and reported obstacles rather than producing disconnected new plans.

---

## 11. Conclusion

FutureTrace represents an applied research effort at the intersection of large language model orchestration, retrieval-augmented generation, and educational decision support. The current implementation demonstrates a functional pipeline from structured user input through RAG-augmented prompt construction to multi-scenario simulation with strategic analysis frameworks. The planned evolution toward a fully agentic architecture, with specialized agents for routing, retrieval, simulation, adversarial review, and formatting, positions the system to address the fundamental limitations of monolithic prompting while establishing a foundation for continuous improvement through community-driven data enrichment and human-in-the-loop refinement. The overarching objective is to provide Vietnamese students with a decision intelligence tool that combines the analytical depth of AI-driven simulation with the empirical grounding of real-world data, enabling more informed navigation of consequential academic and career choices.
