import { readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const configPath = join(process.cwd(), '.github/ai/config.yml');
const config = JSON.parse(execSync(`node -e "console.log(JSON.stringify(require('js-yaml').load(require('fs').readFileSync('${configPath}', 'utf8'))))"`));

const issueNumber = process.env.GITHUB_ISSUE_NUMBER;
const issue = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
const comments = issue.comments ? issue.comments.map(c => c.body).join('\n') : '';

const files = execSync(`git diff --name-only HEAD~1 HEAD`).toString().split('\n').filter(f => f && !config.file_filters.exclude.includes(f));
const fileContents = files.map(f => ({
  path: f,
  content: readFileSync(f, 'utf8')
}));

const systemPrompt = readFileSync('.github/ai/prompts/generate-pr.system.md', 'utf8');
const userPrompt = readFileSync('.github/ai/prompts/generate-pr.user.md', 'utf8')
  .replace('{{issue}}', issue.body)
  .replace('{{files}}', JSON.stringify(fileContents))
  .replace('{{comments}}', comments);

const prompt = `${systemPrompt}\n\n${userPrompt}`;

const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
  },
  body: JSON.stringify({
    model: 'mistral-large-latest',
    messages: [
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' }
  })
});

const data = await response.json();
const result = JSON.parse(data.choices[0].message.content);

console.log(JSON.stringify(result));
