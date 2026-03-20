import pandas as pd
import json
import os

file_path = r'd:\rcssp\Downloads\scripts\ShopHeroes\Shop Heroes equips.xlsx'
output_path = r'c:\Users\rcssp\.gemini\antigravity\playground\binary-sagan\tmp\spreadsheet_data.json'

os.makedirs(os.path.dirname(output_path), exist_ok=True)

data = {}

try:
    xl = pd.ExcelFile(file_path)
    data['sheet_names'] = xl.sheet_names
    
    # Extract Time 1 (handling spaces)
    time_sheet = next((s for s in xl.sheet_names if s.replace(" ", "").lower() == "time1"), None)
    if time_sheet:
        df_time = pd.read_excel(file_path, sheet_name=time_sheet)
        data['time1'] = df_time.to_dict(orient='records')
        print(f"Extracted {time_sheet}")
    
    # Extract Skills and Habilidades
    for s in xl.sheet_names:
        if any(x in s.lower() for x in ['skill', 'habili']):
            df_s = pd.read_excel(file_path, sheet_name=s)
            data[s] = df_s.to_dict(orient='records')
            print(f"Extracted {s}")

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Successfully updated data to {output_path}")

except Exception as e:
    print(f"Error: {str(e)}")
