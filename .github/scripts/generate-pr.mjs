import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ISSUE_NUMBER = process.argv[2];
const ISSUE_TITLE = process.argv[3];
const ISSUE_BODY = process.argv[4];

const PR_TITLE = `feat: ${ISSUE_TITLE}`;

const PR_BODY = `# ${PR_TITLE}

## Summary
${ISSUE_BODY}

## Commandes
Pour tester localement ce changement :

- 
```bash
npm install
```

- 
```bash
npm run dev
```

- 
```bash
npm test
```

- 
```bash
npm run build
```

- 
```bash
npm run preview
```

Closes #${ISSUE_NUMBER}`;

const PR_BODY_PATH = path.join(__dirname, '/tmp/pr-body.md');

try {
  await fs.writeFile(PR_BODY_PATH, PR_BODY);
  console.log('PR body generated successfully');
} catch (err) {
  console.error('Error generating PR body:', err);
  process.exit(1);
}