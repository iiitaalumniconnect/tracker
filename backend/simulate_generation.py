import os
import pandas as pd
import openpyxl
from openpyxl.styles import PatternFill

# Simulate variables
file_path = "uploads/85_testt.xlsx"
df = pd.read_excel(file_path)

orig_cols = [
    c
    for c in df.columns.tolist()
    if c.lower().replace(" ", "").replace("_", "")
    not in ["experience", "organisations"]
]

new_cols = [
    "New Company",
    "New Designation",
    "New Higher Education",
    "Updated Location",
    "Changed",
    "Position Groups",
]

actual_new_cols = [c for c in new_cols if c not in orig_cols]

print("orig_cols:", orig_cols)
print("actual_new_cols:", actual_new_cols)

headers = orig_cols + actual_new_cols
print("headers:", headers)

# Let's see how column_map is built
def normalize_header(name):
    if not name:
        return ""
    return (
        str(name)
        .strip()
        .lower()
        .replace(" ", "")
        .replace("_", "")
        .replace("-", "")
        .replace("/", "")
        .replace("(", "")
        .replace(")", "")
        .replace("&", "")
    )

column_map = {}
for col in df.columns:
    norm = normalize_header(col)
    if norm in ["companyorganizationname", "company", "currentcompany"]:
        column_map["company"] = col
    elif norm in ["designation", "currentdesignation"]:
        column_map["designation"] = col
    elif norm in ["worklocationcitycountry", "location", "worklocation"]:
        column_map["location"] = col
    elif norm in [
        "anyhigherqualificationreceivedafterpassingout",
        "highereducation",
        "higheredu",
        "qualification",
    ]:
        column_map["higher_education"] = col
    elif norm in ["linkedinurl", "linkedinprofileurl"]:
        column_map["linkedin_url"] = col

print("column_map:", column_map)
