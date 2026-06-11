import pandas as pd
pd.set_option('display.max_columns', None)
pd.set_option('display.max_rows', None)
pd.set_option('display.width', 1000)

file_path = "uploads/80_testing.xlsx"
df = pd.read_excel(file_path)
print("Shape of DataFrame:", df.shape)
print("\nAll rows:")
print(df)
