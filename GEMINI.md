# Maid Project Context & Engineering Standards (V0.1)

## 1. Project Overview
**Maid (Mobile Artificial Intelligence Distribution)** is a React Native (Expo) application serving as a unified interface for local and remote Agent systems.

### Core Technologies
- **Framework**: React Native with **Expo SDK 53**.
- **Agent Gateway**: **Hermes Agent** Integration (Remote Backend Mode).
- **Data Persistence**: `expo-sqlite` and Supabase.

---

## 2. Hermes Agent Integration Roadmap (Mandatory)
Based on the **"Maid 对接 Hermes Agent 集成需求说明 V0.1"**, all development must follow these phases:

### Phase 1: Foundation (Current)
- Establish stable remote integration via `POST /api/maid/hermes/message`.
- Support user identity (`user_id`), session persistence (`session_id`), and trace tracking (`trace_id`).
- Implement secure pairing and basic command/text messaging.

### Phase 2: Dynamic Capability (Next)
- **Server-Driven UI (SDUI)**: Implement `mode: "settings_schema"` to pull 68+19 tool configurations from Hermes.
- **Auto-Provisioning**: Support remote `#` config toggling and gateway reboot logic.
- **Rich Rendering**: Specialized views for tool execution logs and subagent status.

---

## 3. Engineering Directory Standards
- `context/language-model/`: Contains **API & Data Mapping Specs**. See local `GEMINI.md`.
- `components/groups/`: Contains **UI Component Specs** for the dynamic settings renderer. See local `GEMINI.md`.
- `utilities/`: Standard for database, logging, and haptics.
