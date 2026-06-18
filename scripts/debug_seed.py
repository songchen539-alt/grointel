import urllib.request, json

base = "https://grointel.vercel.app"
pid = "991704ac-2711-47be-b79f-4b251dbbbd04"

# Try to insert one minimal record to test what columns work
# Use POST to the Supabase REST API through the passport detail endpoint
# Actually, let's just check the schema via the Supabase introspection
# The /rest/v1/ endpoint with a simple select will tell us

# First try: select with specific columns
cols_to_check = [
    "execution_score", "trust_score", "authority_score", "reach_score",
    "audience_fit_score", "industry_expertise_score", "pricing_score",
    "availability_score", "innovation_score", "roi_score",
    "overall_score", "confidence", "evidence_count", "calculation_version",
    "extra_dimensions", "last_calculated", "passport_id"
]

for col in cols_to_check:
    try:
        # Try a GET with this column selected
        url = base + "/api/seed-cie"  # Use a different approach
        # Just try simple select
        test_url = f"https://uaqshxwhchseasdogkys.supabase.co/rest/v1/growth_capability_dna?select={col}&limit=0"
        # Can't do direct Supabase queries without the key
    except:
        pass

# Better approach: use the capability-dna endpoint which returns null for missing table
# Actually the API already confirmed the table exists (returns null for data)
# The issue is that the columns don't match the migration

# Let me just find what columns DO exist by looking at the Supabase introspection
# I'll use the deployed API with a POST to test column names

# Actually, the simplest approach: just iterate and remove failing columns
print("Need to test column by column")
print("Since I can't test locally, the best approach is to be very conservative")
print("Core columns that should exist: id, passport_id")
print("Just use those and store everything else in extra_dimensions")
