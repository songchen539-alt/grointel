# Test GroIntel Intelligence Engine v1
import sys, json
sys.path.insert(0, r'C:\Users\LENOVO\.openclaw\workspace\grointel')

# We can test via the Node.js module since it's TypeScript
# Let's use python to just validate the directory structure and expected behavior
import subprocess

test_code = """
const { generateReport, getReportById } = require('./src/lib/intelligence/reportGenerator');

// Test 1: stripe.com
const stripe = generateReport('stripe.com');
console.log('Test 1: stripe.com');
console.log('  reportId:', stripe.reportId);
console.log('  companyName:', stripe.companyName);
console.log('  industry:', stripe.industry);
console.log('  overallScore:', stripe.overallScore);
console.log('  growthOpportunities:', stripe.growthOpportunities.length);
console.log('  keyRisks:', stripe.keyRisks.length);
console.log('  next30DaysActionPlan:', stripe.next30DaysActionPlan.length);

// Test 2: Deterministic
const stripe2 = generateReport('stripe.com');
console.log('\\nTest 2: Deterministic');
console.log('  Same reportId:', stripe.reportId === stripe2.reportId);
console.log('  Same overallScore:', stripe.overallScore === stripe2.overallScore);

// Test 3: OpenGradient
const og = generateReport('opengradient.ai');
console.log('\\nTest 3: opengradient.ai');
console.log('  reportId:', og.reportId);
console.log('  companyName:', og.companyName);

// Test 4: Monad
const monad = generateReport('monad.xyz');
console.log('\\nTest 4: monad.xyz');
console.log('  reportId:', monad.reportId);

// Test 5: Unknown domain
const unknown = generateReport('some-startup.io');
console.log('\\nTest 5: some-startup.io (unknown)');
console.log('  reportId:', unknown.reportId);
console.log('  companyName:', unknown.companyName);
console.log('  industry:', unknown.industry);

// Test 6: GroIntel
const grointel = generateReport('grointel.ai');
console.log('\\nTest 6: grointel.ai');
console.log('  reportId:', grointel.reportId);

// Test 7: getReportById
const stripeById = getReportById('stripe-com');
console.log('\\nTest 7: getReportById("stripe-com")');
console.log('  Found:', stripeById !== null);
console.log('  Name:', stripeById?.companyName);

// Test 8: Unknown report
const unknownById = getReportById('unknown-company');
console.log('\\nTest 8: getReportById("unknown-company")');
console.log('  Found:', unknownById === null);
"""

# Write test to temp file
with open(r'C:\Users\LENOVO\.openclaw\workspace\grointel\scripts\test_engine.js', 'w') as f:
    f.write(test_code)

result = subprocess.run(
    ['node', 'scripts/test_engine.js'],
    cwd=r'C:\Users\LENOVO\.openclaw\workspace\grointel',
    capture_output=True, text=True, timeout=30
)

print(result.stdout)
if result.stderr:
    print("STDERR:", result.stderr[:500])
