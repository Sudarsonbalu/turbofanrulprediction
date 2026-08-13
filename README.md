# TurbofanAI — Turbomachinery Predictive Maintenance & Hermes AI Platform

**TurbofanAI** is a unified, production-ready aviation propulsion analytics platform that combines dataset management (Phase 1), machine learning Remaining Useful Life (RUL) prediction (Phase 2), and **Hermes / Nous AI** agentic reasoning (Phase 3).

---

## 🏗️ System Architecture

```
                                  +-------------------+
                                  |    User Browser   |
                                  +---------+---------+
                                            |
                                            v (HTTP / REST)
                                  +---------+---------+
                                  | Phase 1 React UI  |
                                  +---------+---------+
                                            |
                                            v (Internal Express API)
                                  +---------+---------+
                                  |  Phase 2 Backend  |
                                  |    ML Engine      |
                                  +---------+---------+
                                            |
                                            v
                                  +---------+---------+
                                  |  Hermes Service   |
                                  |  Tool Controller  |
                                  +---------+---------+
                                            |
                                            v (OpenAI-compatible)
                                  +---------+---------+
                                  | Local Hermes Proxy|
                                  | (http://127.0.0.1:8650/v1)
                                  +---------+---------+
                                            |
                                            v
                                  +---------+---------+
                                  |    Nous Portal    |
                                  | Upstage Solar Pro4|
                                  +-------------------+
```

---

## 🚀 Key Capabilities

### Phase 1: Dataset Workspace & Quality
* Upload and parse NASA C-MAPSS benchmark text datasets (`train_FD001.txt`).
* Dataset profiling, missing value checks, and row previewing.

### Phase 2: ML RUL Predictive Pipeline
* Feature engineering: Rolling telemetry statistics, cumulative degradation, trend rates.
* Automatic model selection between **Random Forest** and **Linear Regression**.
* Metric evaluation: Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), R² score.
* Configurable risk thresholds (Critical ≤ 30 cycles, Warning ≤ 70 cycles).

### Phase 3: Hermes / Nous AI Agentic Intelligence
* **Nous Portal & Upstage Solar Pro 4 Integration**: Natural language diagnostic reasoning.
* **Read-Only Tool Protocol**: Hermes Agent accesses Phase 1 datasets and Phase 2 predictions strictly via authenticated tool calls (`get_engine_details`, `compare_engines`, `get_model_metrics`, etc.).
* **Conversation Management**: Session history persistence per `conversation_id`.
* **Deterministic Fallback**: In offline mode or proxy disconnection, deterministic tools populate structured responses safely.

---

## ⚙️ Environment Configuration

Define the following variables in `.env` (refer to `.env.example`):

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `HERMES_ENABLED` | Enable or disable Hermes AI backend | `true` |
| `HERMES_BASE_URL` | Hermes Local Proxy OpenAI-compatible URL | `http://127.0.0.1:8650/v1` |
| `HERMES_API_KEY` | Hermes API Key | `sk-unused` |
| `HERMES_MODEL` | AI Model Alias | `upstage/solar-pro4` |
| `HERMES_TIMEOUT` | Request timeout in milliseconds | `60000` |
| `HERMES_MAX_RETRIES` | Max retry attempts on transient network errors | `2` |

---

## 🛠️ Local Hermes Proxy Setup

To run the local Hermes AI proxy targeting Nous Portal:

```bash
# Start Hermes local proxy
hermes proxy start --provider nous --port 8650
```

Verify connection:
```bash
curl http://127.0.0.1:8650/v1/models
```

---

## 💻 Running the Application

```bash
# 1. Install dependencies
npm install

# 2. Run backend and Vite dev server
npm run dev

# 3. Build for production
npm run build

# 4. Start production CJS server
npm run start
```

---

## 🧪 Testing Suite

Run the full end-to-end integration test suite covering Phase 1, Phase 2, and Phase 3:

```bash
npm run test
```

---

## 🛡️ Security & Production Guidelines

1. **Server-Side Proxying**: Browsers communicate exclusively with `/api/hermes/*` backend routes. Private API keys and Hermes proxy credentials are never exposed client-side.
2. **Read-Only Tools**: AI agent tools are restricted to read-only operations. Agent cannot modify, delete, or alter raw dataset records.
3. **Error Masking**: Stack traces and internal server paths are masked before sending user-facing error messages.
