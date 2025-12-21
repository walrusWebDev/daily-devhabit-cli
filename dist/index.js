#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const inquirer_1 = __importDefault(require("inquirer"));
const axios_1 = __importDefault(require("axios"));
const conf_1 = __importDefault(require("conf"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// 1. Initialize Configuration Store (Saves to user's computer)
const config = new conf_1.default({ projectName: 'daily-devhabit-cli' });
const program = new commander_1.Command();
// 2. DEFINE THE CONNECTION
const DEFAULT_API_URL = 'https://ddh-core-production.up.railway.app';
const API_URL = process.env.API_URL || DEFAULT_API_URL;
program
    .version('1.1.0')
    .description('Daily Dev Habit: Engineering Intelligence CLI');
// --- COMMAND: LOGIN ---
program
    .command('login')
    .description('Log in to your DDH account')
    .action(async () => {
    console.log(`🔌 Connecting to ${API_URL}...`);
    const credentials = await inquirer_1.default.prompt([
        { type: 'input', name: 'email', message: 'Email:' },
        { type: 'password', name: 'password', message: 'Password:' }
    ]);
    try {
        const response = await axios_1.default.post(`${API_URL}/auth/login`, credentials);
        const token = response.data.token;
        // Save Token and User Info to global config
        config.set('auth.token', token);
        config.set('auth.email', credentials.email);
        console.log('✅ Login Successful! Token saved locally.');
    }
    catch (error) {
        console.error('❌ Login Failed:', error.response?.data?.message || error.message);
    }
});
// --- COMMAND: REGISTER ---
program
    .command('register')
    .description('Create a new DDH account')
    .action(async () => {
    console.log(`🔌 Connecting to ${API_URL}...`);
    const data = await inquirer_1.default.prompt([
        { type: 'input', name: 'email', message: 'Email:' },
        { type: 'password', name: 'password', message: 'Password:' }
    ]);
    try {
        await axios_1.default.post(`${API_URL}/auth/register`, data);
        console.log('✅ Account Created! Please run "ddh login" to sign in.');
    }
    catch (error) {
        console.error('❌ Registration Failed:', error.response?.data?.message || error.message);
    }
});
// --- COMMAND: LOG (The Main Event) ---
program
    .command('log')
    .alias('l')
    .description('Create a new engineering log entry')
    .action(async () => {
    // 1. Get Token from Config (or Env as backup)
    const token = config.get('auth.token') || process.env.DEV_CLI_TOKEN;
    if (!token) {
        console.log('❌ You are not logged in. Please run: ddh login');
        // We don't return here because you might want to log offline even if logged out
    }
    // 2. Interactive Prompt
    const answers = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'scope',
            message: 'What is the scope of this work?',
            choices: ['api', 'cli', 'database', 'docker', 'auth', 'refactor', 'docs', 'feature']
        },
        {
            type: 'input',
            name: 'content',
            message: 'Short Summary (What did you do?):',
            validate: (input) => input ? true : 'Summary cannot be empty.'
        },
        {
            type: 'input',
            name: 'decision',
            message: 'Key Decision (Optional):',
        },
        {
            type: 'input',
            name: 'rationale',
            message: 'Rationale (Why? Optional):',
            when: (answers) => answers.decision
        },
        {
            type: 'input',
            name: 'friction',
            message: 'Friction/Blockers (Optional):',
        },
        {
            type: 'input',
            name: 'tags',
            message: 'Tags (comma separated):'
        }
    ]);
    const payload = {
        ...answers,
        tags: answers.tags ? answers.tags.split(',').map((t) => t.trim()) : [],
        origin: 'cli'
    };
    try {
        // 3. Try to Send to API
        if (!token) {
            throw new Error('No token available (Login required for Cloud Sync).');
        }
        const response = await axios_1.default.post(`${API_URL}/entries`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`\n✅ Log Saved! (ID: ${response.data.id})`);
        console.log(`   Stored in: Cloud Database (${API_URL})`);
    }
    catch (error) {
        // 4. FALLBACK: Handle Offline State
        const isOffline = error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND';
        const isAuthError = !token || (error.response && error.response.status === 401);
        if (isOffline || isAuthError) {
            console.log('\n⚠️  Could not sync to Cloud. Switching to Local Backup...');
            // Format for Markdown
            const timestamp = new Date().toISOString();
            const backupEntry = `
## [OFFLINE] ${timestamp}
- **Scope:** ${payload.scope}
- **Content:** ${payload.content}
- **Decision:** ${payload.decision || 'N/A'}
- **Rationale:** ${payload.rationale || 'N/A'}
- **Friction:** ${payload.friction || 'N/A'}
- **Tags:** ${payload.tags.join(', ')}
---
`;
            // Append to OFFLINE_LOGS.md in project root
            // We use process.cwd() to find the user's current project folder, not the CLI's folder
            const backupPath = path_1.default.join(process.cwd(), 'OFFLINE_LOGS.md');
            fs_1.default.appendFileSync(backupPath, backupEntry);
            console.log(`✅ Log saved locally to: ${backupPath}`);
            if (isAuthError)
                console.log('👉 Reason: You are not logged in.');
            if (isOffline)
                console.log('👉 Reason: Server is unreachable.');
        }
        else {
            // Real Error (e.g. 500 Server Error)
            console.error('❌ Error:', error.response?.data?.message || error.message);
        }
    }
});
program.parse(process.argv);
