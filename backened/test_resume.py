"""
Quick manual test: resumes a paused case (thread_id from test_case.py's
output) with an approval, and prints whether it completes or pauses again.
"""
import sys

from app.services.case_service import resume_Case

if len(sys.argv) < 2:
    print("Usage: python3 test_resume.py <thread_id>")
    sys.exit(1)

thread_id = sys.argv[1]

result = resume_Case(thread_id, approved=True)

print(result["status"])
print(result["data"])

