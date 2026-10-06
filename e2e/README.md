# Browser E2E tests

Playwright tests covering the browser cases in `olympus-core/Docs/END_TO_END_TEST_CASES.md`.

## Run

1. Start the API against a disposable database (no Docker needed):

   ```bash
   cd olympus-core/ProjectNamePlaceholder.Api
   ASPNETCORE_ENVIRONMENT=Development ASPNETCORE_URLS=http://localhost:5091 \
   ConnectionStrings__PostgresConnection="Host=localhost;Port=5432;Database=olympus_e2e;Username=postgres;Password=postgres" \
   dotnet run --no-launch-profile
   ```

2. Run the tests (the Vite dev server is started automatically on port 5173 and pointed at the API):

   ```bash
   cd olympus-react
   npm run test:e2e
   ```

Set `E2E_API_URL` if the API is not on `http://localhost:5091/api/v1`.
`global-setup.ts` creates the test accounts (`admin-test`, `manager-test`, `user-test`, `norole-test`) and assigns their roles; it is safe to re-run.
The HTML report is written to `e2e-report/`.

The API-level suite lives in `olympus-core/tests/e2e` (see its README); both can run against the same database.

`external-signin.spec.ts` runs a mock OAuth provider on port 5099 (`E2E_MOCK_OAUTH_PORT`); start the API with the
mock settings from `olympus-core/tests/e2e/README.md`, otherwise the full sign-in journey is skipped.
