import pandas as pd
import os

file_path = "uploads/76_test.xlsx"
if os.path.exists(file_path):
    df = pd.read_excel(file_path)
    print("Columns in file:", df.columns.tolist())
    print("Shape:", df.shape)
    print("First row:")
    print(df.iloc[0].to_dict())
else:
    print("File not found")
