# Admin Development & Verification Workflow

This guide outlines the standard development, verification, and code quality workflows for the admin dashboard.

## 1. Local Development
To run the local development server:
```bash
npm run dev
```

## 2. Dependency Audit & Security
Verify that dependencies do not introduce vulnerabilities:
```bash
npm audit
```

## 3. Strict Verification & Rules
Before staging or committing any changes:
1. **Compilation Check**: Verify building successfully:
   ```bash
   npm run build
   ```
2. **Lint & Code Patterns**: Verify formatting and style rules:
   ```bash
   npm run lint
   ```
3. **Max Line Length Limit**:
   - Strictly ensure no line exceeds **150 characters**.
   - Split long class name lists, extract styles to helpers, and format text content to keep lines short and clean.
