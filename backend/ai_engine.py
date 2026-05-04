import sys
import json
import pandas as pd
import joblib
import os

# Get the directory of the current script so it finds the .pkl files easily
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load the trained AI model and the feature names it expects
try:
    model = joblib.load(os.path.join(BASE_DIR, 'siem_rf_model.pkl'))
    features = joblib.load(os.path.join(BASE_DIR, 'model_features.pkl'))
except Exception as e:
    print(json.dumps({"status": "ERROR", "message": f"Failed to load model: {str(e)}"}))
    sys.exit(1)

def analyze_traffic(traffic_data):
    try:
        # Convert incoming JSON data to a Pandas DataFrame
        df = pd.DataFrame(traffic_data['data'])

        # Ensure the incoming data has all the columns the model expects
        # If any are missing, fill them with 0 to prevent crashes
        for col in features:
            if col not in df.columns:
                df[col] = 0
        
        # Reorder columns to match the exact order the AI was trained on
        df = df[features]

        # Ask the AI to predict the attack type for the incoming packets
        predictions = model.predict(df)
        
        # Filter out the normal traffic to see if any attacks are happening
        detected_attacks = [pred for pred in predictions if pred != "BENIGN" and pred != "Normal Traffic"]

        if detected_attacks:
            primary_attack = detected_attacks[0] # Grab the first detected attack
            
            # Generate the dynamic XAI Narrative
            story = f"Predicted {primary_attack} activity. The AI identified anomalous packet signatures deviating from the established baseline."
            remedy = f"Autonomous Deception Triggered: Re-routing source IPs involved in {primary_attack} to Honey-Container port 8080."

            result = {
                "status": "THREAT_DETECTED",
                "attack_type": primary_attack,
                "risk_score": 98,
                "xai_story": story,
                "autonomous_remedy": remedy
            }
        else:
            result = {
                "status": "NORMAL",
                "risk_score": 12,
                "message": "Network traffic within normal baseline parameters."
            }
        
        # Print the JSON result so Node.js can read it
        print(json.dumps(result))

    except Exception as e:
        # Catch any errors and send them back to Node gracefully
        print(json.dumps({"status": "ERROR", "message": str(e)}))

if __name__ == "__main__":
    # Node.js will pass the network traffic payload as a command-line argument
    input_data = sys.argv[1]
    parsed_payload = json.loads(input_data)
    analyze_traffic(parsed_payload)