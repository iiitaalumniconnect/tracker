import os
import pandas as pd

uploads_dir = "uploads"
for f in os.listdir(uploads_dir):
    if f.endswith(".xlsx"):
        path = os.path.join(uploads_dir, f)
        try:
            df = pd.read_excel(path)
            if "New Company" in df.columns:
                non_null = df[df["New Company"].notna()]
                if not non_null.empty:
                    print(f"File {f} has populated New Company values:")
                    print(non_null[["Name", "New Company", "New Designation", "Updated Location"]].to_dict(orient='records'))
        except Exception as e:
            pass
