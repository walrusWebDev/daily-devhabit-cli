# Daily Dev Habit CLI 🚀

**Engineering Intelligence for the Busy Developer.**

The **Daily Dev Habit CLI** (`ddh`) is a frictionless command-line tool designed to help software engineers capture decisions, blockers, and progress without leaving the terminal. It serves as the primary data entry point for the Daily Dev Habit ecosystem, syncing your logs to the cloud or saving them locally when offline.

## 📦 Installation

Install the tool globally via NPM:

```bash
npm install -g @walruswebdev/daily-devhabit-cli
```

## ⚡ Quick Start
Register a new account:

```bash
ddh register
```

Log in to sync with the cloud:
```bash
ddh login
```

Create your first log entry:

```bash
ddh log
```

(Or use the alias ddh l for speed)

## 🛠 Commands
`ddh log` (alias: `l`)
The core command. Launches an interactive survey to capture your current work state.

- Scope: API, Database, Refactor, Feature, etc.

- Summary: What did you just do?

- Key Decisions: Did you choose a specific library or pattern? Why?

- Friction: What slowed you down?

- Tags: Comma-separated tags for categorization.

`ddh token`
Displays your current Cloud API Token.

- Use Case: Copy this token to connect your Daily Dev Habit WordPress Plugin to your cloud account.

`ddh login`
Authenticates your session and saves your credentials locally to ~/.config/daily-devhabit-cli/.

`ddh register`
Creates a new user account on the Daily Dev Habit platform.

## 🔌 WordPress Integration
This CLI works hand-in-hand with the Daily Dev Habit WordPress Plugin.

1. Run `ddh token` in your terminal.

2. Copy the output string.

3. Paste it into your WordPress Admin > Daily Dev Habit > Settings.

4. Result: Your WordPress site will now pull in your engineering metrics and logs automatically.

## 🛡️ Offline Support
Bad internet? No problem. If the CLI cannot connect to the server (or if you are not logged in), it automatically falls back to Local Mode.

- Logs are saved to a file named OFFLINE_LOGS.md in your current working directory.

- Markdown formatted for easy reading.

## 📝 License
ISC © Lauren Bridges