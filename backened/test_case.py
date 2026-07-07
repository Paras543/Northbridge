from app.services.case_service import start_Case

result = start_Case(
    "We're a mid-size SaaS company considering expanding into the "
    "Southeast Asian market. Should we do it, and how?"
)
print(result["status"])
print(result["thread_id"])
print(result["data"])



