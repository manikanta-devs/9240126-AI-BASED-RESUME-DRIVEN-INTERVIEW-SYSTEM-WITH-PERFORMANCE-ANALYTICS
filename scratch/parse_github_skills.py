import re

file_path = r"C:\Users\lucky\.gemini\antigravity\brain\5b8c46dc-d05b-40ba-8510-060f8c4820a7\.system_generated\steps\10418\content.md"

with open(file_path, "r", encoding="utf-8") as f:
    html = f.read()

# Look for links in the HTML that match the skill files in GitHub structure
# Typically: href="/nextlevelbuilder/ui-ux-pro-max-skill/tree/main/.claude/skills/..."
matches = re.findall(r'href="[^"]*/\.claude/skills/([^"/]+)"', html)
# Remove duplicates
unique_matches = sorted(list(set(matches)))

print("--- FOUND SKILLS IN REPOSITORY ---")
for match in unique_matches:
    print(match)
print("----------------------------------")
