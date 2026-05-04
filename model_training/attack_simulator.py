import pandas as pd
import requests
import json

print("[*] Arming Simulator: Loading Kaggle Dataset...")
# Load the dataset
df = pd.read_csv('cicids2017_cleaned.csv')
df.columns = df.columns.str.strip()

# Find all the rows that are specifically DDoS attacks
ddos_traffic = df[df['Attack Type'] == 'DDoS']

if ddos_traffic.empty:
    print("[-] Error: Could not find 'DDoS' in the dataset. Checking available attacks...")
    print(df['Attack Type'].unique())
    exit()

print(f"[*] Found {len(ddos_traffic)} real DDoS packets. Isolating one payload...")

# Pick exactly 1 random DDoS packet from the dataset
attack_sample = ddos_traffic.sample(n=1).to_dict(orient='records')[0]

# CRITICAL: We must delete the 'Attack Type' answer key before sending it!
# The AI has to predict this on its own.
del attack_sample['Attack Type']

# Format it exactly how your Node.js server expects it
payload = {
    "source": "Kaggle-DDoS-Simulator",
    "data": [attack_sample]
}

print("\n[!] 🚀 FIRING DDOS PAYLOAD AT SIEM BACKEND (localhost:3000)...")

try:
    # Fire the packet at your Node.js ingestion API
    response = requests.post('https://api.vimalrajs.in/api/logs/ingest', json=payload, timeout=30)
    print(f"[+] Direct Hit! Server responded with status code: {response.status_code}")
except Exception as e:
    print(f"[-] Connection failed. Is your Node.js backend running? Error: {e}")