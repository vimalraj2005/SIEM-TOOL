import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib
import time

print("[*] Loading the dataset... (This might take a few seconds)")
dataset_filename = 'cicids2017_cleaned.csv' 
df = pd.read_csv(dataset_filename)

# Strip any invisible spaces from column names just to be safe
df.columns = df.columns.str.strip()

print("[*] Sampling 10% of the data for faster training...")
# Note: For your final college presentation, you can change frac=0.1 to frac=1.0 to train on everything!
df = df.sample(frac=0.1, random_state=42)

# --- THE FIX: Using the correct target column ---
y = df['Attack Type']
X = df.drop('Attack Type', axis=1)
# ------------------------------------------------

print("[*] Splitting data into Training and Testing sets...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("[*] Training the AI-Based Predictive SIEM model... (Please wait)")
start_time = time.time()

# Build the Random Forest AI
model = RandomForestClassifier(n_estimators=50, random_state=42, n_jobs=-1)
model.fit(X_train, y_train)

end_time = time.time()
print(f"[+] Training completed in {round(end_time - start_time, 2)} seconds!")

print("\n[*] Evaluating the Model's Accuracy:")
y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred))

print("\n[*] Saving the AI Brain to disk...")
joblib.dump(model, 'siem_rf_model.pkl')
joblib.dump(list(X.columns), 'model_features.pkl') # Save feature names for the live server

print("[+] SUCCESS: AI Model saved as 'siem_rf_model.pkl'")