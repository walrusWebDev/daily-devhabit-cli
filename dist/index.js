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
// 1. Initialize Configuration Store
const config = new conf_1.default({ projectName: 'daily-devhabit-cli' });
const program = new commander_1.Command();
// 2. DEFINE THE CONNECTION
const DEFAULT_API_URL = 'https://ddh-core-production.up.railway.app';
const API_URL = process.env.API_URL || DEFAULT_API_URL;
program
    .version('1.1.1')
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
        // Save Token
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
// --- COMMAND: LOG ---
program
    .command('log')
    .alias('l')
    .description('Create a new engineering log entry')
    .action(async () => {
    const token = config.get('auth.token') || process.env.DEV_CLI_TOKEN;
    const lastProject = config.get('lastProject') || ''; // Memory feature
    if (!token) {
        console.log('❌ You are not logged in. Please run: ddh login');
    }
    const answers = await inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'project',
            message: 'Project Name:',
            default: lastProject, // Saves you typing if working on the same project
            validate: (input) => input ? true : 'Project name is required for analysis.'
        },
        {
            type: 'list',
            name: 'scope',
            message: 'What is the scope of this work?',
            // Expanded list to reduce "choice compromise"
            choices: ['prototype', 'boilerplate', 'feature', 'refactor', 'integration', 'database', 'docker', 'environment', 'auth', 'ui/ux', 'docs']
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
    // Save project for next time to reduce friction
    config.set('lastProject', answers.project);
    const payload = {
        ...answers,
        tags: answers.tags ? answers.tags.split(',').map((t) => t.trim()) : [],
        origin: 'cli'
    };
    try {
        if (!token)
            throw new Error('No token available.');
        const response = await axios_1.default.post(`${API_URL}/entries`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`\n✅ Log Saved! (ID: ${response.data.id})`);
        console.log(`   Stored in: Cloud Database`);
        // 🚀 NEW: Trigger Local Webhook for Instant Notion Sync
        try {
            await axios_1.default.post('http://localhost:3333/webhook/sync', {}, { timeout: 2000 });
            console.log('✨ Notion tables synced via local bridge.');
        }
        catch (e) {
            // Quietly fail if bridge isn't running
        }
    }
    catch (error) {
        // OFFLINE FALLBACK
        const isOffline = error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND';
        const isAuthError = !token || (error.response && error.response.status === 401);
        if (isOffline || isAuthError) {
            console.log('\n⚠️  Could not sync to Cloud. Switching to Local Backup...');
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
            const backupPath = path_1.default.join(process.cwd(), 'OFFLINE_LOGS.md');
            fs_1.default.appendFileSync(backupPath, backupEntry);
            console.log(`✅ Log saved locally to: ${backupPath}`);
            if (isAuthError)
                console.log('👉 Reason: You are not logged in.');
            if (isOffline)
                console.log('👉 Reason: Server is unreachable.');
        }
        else {
            console.error('❌ Error:', error.response?.data?.message || error.message);
        }
    }
});
// --- COMMAND: TOKEN ---
program
    .command('token')
    .description('Show your current API token')
    .action(() => {
    const token = config.get('auth.token');
    if (token) {
        console.log('\n🔑 Your Cloud Token:');
        console.log('---------------------------------------------------');
        console.log(token);
        console.log('---------------------------------------------------');
        console.log('Copy/paste this into your WordPress Settings.\n');
    }
    else {
        console.log('❌ You are not logged in.');
        console.log('Run "ddh login" first to generate a token.');
    }
});
// --- COMMAND: EXPORT ---
program
    .command('export')
    .description('Download all cloud logs to a timestamped Markdown file')
    .action(async () => {
    // 1. Get Token
    const token = config.get('auth.token') || process.env.DEV_CLI_TOKEN;
    if (!token) {
        console.error('❌ Authentication required. Please run "ddh login" first.');
        return;
    }
    try {
        console.log('⏳ Fetching logs from Daily Dev Habit Cloud...');
        const response = await axios_1.default.get(`${API_URL}/entries`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const rows = response.data;
        if (!rows || rows.length === 0) {
            console.log('⚠️ No logs found to export.');
            return;
        }
        // 2. Generate Timestamped Filename
        const now = new Date();
        // Format: YYYY-MM-DD_HH-mm-ss
        const timeString = now.toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-');
        const filename = `ddh_export_${timeString}.md`;
        // 3. Format Markdown
        let markdownContent = '# Daily Dev Habit Export\n\n';
        markdownContent += `> Exported on ${now.toLocaleString()}\n\n`;
        rows.forEach((row) => {
            const date = new Date(row.created_at).toISOString().split('T')[0];
            const scopeBadge = row.scope ? `**[${row.scope.toUpperCase()}]**` : '';
            markdownContent += `## ${date} ${scopeBadge}\n`;
            if (row.decision || row.rationale) {
                // Engineering Log
                if (row.content)
                    markdownContent += `* **Note:** ${row.content}\n`;
                if (row.decision)
                    markdownContent += `* **Decision:** ${row.decision}\n`;
                if (row.rationale)
                    markdownContent += `* **Rationale:** ${row.rationale}\n`;
                if (row.friction)
                    markdownContent += `* **Friction:** ⚠️ ${row.friction}\n`;
                if (row.tags && row.tags.length > 0)
                    markdownContent += `* *Tags:* \`${row.tags}\`\n`;
            }
            else {
                // Journal/Simple Log
                const text = row.content || row.content_html || 'No content';
                markdownContent += `* ${text}\n`;
            }
            markdownContent += '\n---\n\n';
        });
        // 4. Save File
        const outputPath = path_1.default.join(process.cwd(), filename);
        fs_1.default.writeFileSync(outputPath, markdownContent);
        console.log(`✅ Successfully exported ${rows.length} entries.`);
        console.log(`📂 File saved to: ${outputPath}`);
    }
    catch (error) {
        if (error.response && error.response.status === 401) {
            console.error('❌ Unauthorized: Token invalid. Try "ddh login" again.');
        }
        else {
            console.error('❌ Export failed:', error.message);
        }
    }
});
program.parse(process.argv);
