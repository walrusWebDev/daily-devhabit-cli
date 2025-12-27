# Daily Dev Habit CLI (`ddh`) 🚀

### *Your engineering history — searchable, structured, synced.*

The **Daily Dev Habit CLI** is a frictionless command-line tool that helps developers quickly capture:

* what they worked on
* key decisions made
* blockers and friction
* progress and scope
* useful tags for later search

All **without leaving the terminal**.

Use it to build a lightweight engineering journal, generate weekly status reports, or maintain a decision log across projects — with **cloud sync and offline support**.

---

## ✨ Why Daily Dev Habit exists

Developers face real problems:

* You forget what you worked on two days ago
* Status reports take longer than they should
* Decisions aren’t documented and must be re-explained
* Context switching destroys memory
* Performance reviews rely on “remembering everything you did”

**Daily Dev Habit solves this by making logging effortless.**

It prompts you from the terminal and records your work in structured form — to the cloud or locally — so your engineering history is **searchable, exportable, and actually usable**.

---

## ⭐ Key Features

* 🧠 **Structured engineering journal** right in your terminal
* ☁️ **Cloud sync** (with secure auth token)
* ✈️ **Offline-first**: falls back to Markdown logs automatically
* 🏷 **Tagging support** for fast categorization
* 📝 **Markdown export** for reporting & backups
* 🔌 **WordPress plugin integration available**
* 🚀 Minimal setup – works across platforms

---

## 📦 Installation

```bash
npm install -g @walruswebdev/daily-devhabit-cli
```

Verify install:

```bash
ddh --version
```

---

## ⚡ Quick Start

Register:

```bash
ddh register
```

Log in:

```bash
ddh login
```

Create your first log:

```bash
ddh log
```

Alias for speed:

```bash
ddh l
```

---

## 🛠 Commands

### `ddh log` (alias: `l`)

Launches an interactive survey to capture your current work snapshot:

* **Scope** – API, DB, Feature, Refactor, etc.
* **Summary** – What did you do?
* **Key Decisions** – what you chose & why
* **Friction** – blockers / pain points
* **Tags** – comma-separated keywords

---

### `ddh export`

> New in **v1.1.1**

Exports your entire engineering history as Markdown.

* Fetches your logs from the cloud
* Generates a timestamped file like:

```
ddh_export_2025-12-26_20-45.md
```

* Great for:

  * weekly reports
  * retrospectives
  * performance reviews
  * backups

---

### `ddh token`

Displays your current **Cloud API token**.

Used to connect integrations such as the WordPress plugin.

---

### `ddh login`

Authenticates and stores your credentials securely on your machine.

---

### `ddh register`

Creates a new Daily Dev Habit cloud account.

---

## 🔌 WordPress Integration (Optional)

The CLI integrates with the [Daily Dev Habit WordPress Plugin](https://dailydevhabit.com/download/).

1. Run:

```bash
ddh token
```

2. Copy your API token
3. Paste it inside:

> WordPress Admin → Daily Dev Habit → Settings

Your WordPress site can now send engineering metrics from an Admin Dashboard form. 
This is helpful for less technical users and/or capturing different aspects of the project development.

---

## 🛡 Offline Support

No internet? No problem.

* CLI detects connectivity loss automatically
* Switches to **Local Mode**
* Writes entries to:

```
OFFLINE_LOGS.md
```

* Stored in the **current working directory**
* Uses clean Markdown formatting


---

## 🏗 Tech Stack (for contributors and curious devs)

* **Commander** – command routing & argument parsing
* **Inquirer** – interactive CLI questions
* **Axios** – HTTP networking to backend API
* **Conf** – secure local token storage
* **Path** – cross-platform path reliability
* **fs** – file system writing for offline/export support

---

## 🎯 Who this tool is great for

* solo developers and indie hackers
* engineers who context-switch frequently
* freelancers writing client status reports
* teams wanting light-weight telemetry
* devs building a **“brag document”**
* people who hate filling out retro forms Friday afternoon

---

## 🧭 Roadmap

Planned features:

* 🔍 search logs from the CLI
* 📊 metrics dashboards
* 🤝 team workspaces
* 🧩 plugin integration ecosystem
* ⏱ daily reminder option

Contributions & ideas welcome!

---

## 🤝 Contributing

Pull requests are very welcome — especially since this is an early project.

Good first contributions:

* docs improvements
* CLI UX polish
* validation of prompts
* bug reports
* ideas & feature proposals

---

## 📝 License

ISC © Lauren Bridges