/**
 * Smoke test script for local & CI
 * Validates core flows without requiring full app setup
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function smokeTest() {
  const errors: string[] = [];

  // Test 1: Database health check
  try {
    const healthResponse = await fetch(`${BASE_URL}/api/health/db`);
    if (!healthResponse.ok) {
      errors.push(`Health check failed: ${healthResponse.status} ${healthResponse.statusText}`);
    } else {
      const data = await healthResponse.json();
      if (data.status !== "ok") {
        errors.push(`Health check returned error status: ${data.status}`);
      } else {
        console.log("✅ Database health check passed");
      }
    }
  } catch (error) {
    errors.push(`Health check request failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Test 2: Homepage renders (basic check)
  try {
    const homeResponse = await fetch(`${BASE_URL}/`);
    if (!homeResponse.ok) {
      errors.push(`Homepage failed: ${homeResponse.status} ${homeResponse.statusText}`);
    } else {
      const text = await homeResponse.text();
      if (!text.includes("Return Address") && !text.includes("return-address")) {
        errors.push("Homepage content validation failed");
      } else {
        console.log("✅ Homepage renders successfully");
      }
    }
  } catch (error) {
    errors.push(`Homepage request failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Summary
  if (errors.length > 0) {
    console.error("\n❌ Smoke tests failed:");
    errors.forEach((error) => console.error(`  - ${error}`));
    process.exit(1);
  } else {
    console.log("\n✅ All smoke tests passed");
    process.exit(0);
  }
}

smokeTest();

