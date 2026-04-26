# QA Test Runner Skill

Executes frontend and backend tests and generates detailed test reports in markdown format.

## Workflow

1. **Run Frontend E2E Tests (Playwright)**
   - Executes `npm run test:e2e` in `frontend/` directory
   - Runs tests in Chromium and Mobile Chrome
   - Captures test results (passed/failed counts)

2. **Run Backend Tests (Pytest)**
   - Executes `pytest` in `backend/` directory
   - Runs API, unit, and integration tests
   - Captures test results with coverage if available

3. **Generate Combined Report**
   - Creates markdown report in `docs/TEST-REPORT-[DATE].md`
   - Includes both frontend and backend results
   - Follows the format of `docs/FRONTEND-E2E-TEST-REPORT-REAL.md`

## Report Format

The generated report follows this structure:
- Header with date, system, framework, browser info
- Summary table with totals and pass rates
- Detailed test results by category
- Failed tests with error analysis
- Statistics by category
- Conclusion and comparisons

## Usage

When user asks to "executar testes", "rodar testes", "run tests", or similar phrases, load this skill and execute the full test suite.

## Output

Reports are saved to:
- `docs/TEST-REPORT-FRONTEND-[YYYY-MM-DD].md`
- `docs/TEST-REPORT-BACKEND-[YYYY-MM-DD].md`
- `docs/TEST-REPORT-COMBINED-[YYYY-MM-DD].md` (if both)
