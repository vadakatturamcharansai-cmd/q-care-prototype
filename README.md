# Q-CARE: Predictive Hospital Resource Replanning

## Problem
Hospital operational bottlenecks (like ICU overcrowding, bed shortages, and staff imbalances) often cascade, disrupting multiple departments simultaneously. By the time an overload is detected, reactive measures are expensive, stressful, and reduce the quality of care. 

## Solution
Q-CARE anticipates near-future resource pressure and generates a feasible resource reallocation plan BEFORE the bottleneck occurs. Instead of reacting to an overload, administrators can proactively shift resources, adhering to all operational constraints simultaneously.

**Disclaimer:** Q-CARE is strictly an operational decision-support system. Clinical diagnoses, treatment recommendations, and autonomous clinical decisions are explicitly **out of scope**.

## Prototype Features
- **Live Resource State Dashboard**: High-level view of beds, ICU occupancy, staff, OR, and emergency reserve.
- **6-Hour Predictive Forecast**: Deterministic timeline forecasting when capacity will breach safe operating thresholds.
- **Automated Bottleneck Detection**: Early-warning alerts specifying the expected pressure window and severity.
- **Feasible Replanning Generator**: Evaluates candidates and suggests optimal resource shifts (e.g., reassigning staff, reserving beds, delaying procedures).
- **Interactive Scenario Simulator**: Test dynamic environments like ICU Surges, Staff Shortages, or Emergency Spikes instantly.
- **Impact Summary (Before & After)**: Visualize the immediate operational impact of accepting the recommended plan.

## Architecture
**Current Prototype:**
- Next.js (App Router)
- TypeScript
- Tailwind CSS & Framer Motion (for dynamic UI)
- Deterministic simulation logic and synthetic state generation
- Hosted on Vercel

**Future Production Architecture:**
- Python FastAPI Backend
- XGBoost / LightGBM Forecasting
- OR-Tools (Classical MILP) for optimization baseline
- D-Wave Ocean SDK (QUBO) for hybrid quantum-assisted search
- Real-time EMR / HL7 data ingestion

*Note: This prototype utilizes deterministic simulation and synthetic operational data for immediate hackathon demonstration.*

## How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vadakatturamcharansai-cmd/q-care-prototype.git
   cd q-care-prototype
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **View the app:**
   Open `http://localhost:3000` in your browser.

## Demo Scenarios
Navigate to the "Scenario Simulator" to test predefined states. The **RUN DEMO** button in the top right will automatically trigger a complete end-to-end presentation flow featuring an **ICU SURGE** detection and subsequent plan generation.

## Deployment
The live demo is seamlessly deployed to Vercel via automatic branch deployments on `main`.

**Important:** This repository and Vercel project represent the permanent production URLs. All future updates are pushed directly to `main` for automatic redeployment to the original URL.
