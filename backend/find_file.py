import os
import pandas as pd

uploads_dir = "uploads"
for f in os.listdir(uploads_dir):
    if f.endswith(".xlsx"):
        path = os.path.join(uploads_dir, f)
        try:
            df = pd.read_excel(path)
            for col in df.columns:
                if df[col].astype(str).str.contains("Upreti", case=False, na=False).any():
                    print(f"Found in {f}")
                    print("Columns:", df.columns.tolist())
                    # print row
                    matching_rows = df[df[col].astype(str).str.contains("Upreti", case=False, na=False)]
                    print("Matching row data:")
                    print(matching_rows.to_dict(orient='records'))
        except Exception as e:
            pass
