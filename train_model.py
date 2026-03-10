import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
import joblib
import os

# Create data directory if not exists
os.makedirs('data', exist_ok=True)
os.makedirs('models', exist_ok=True)

def generate_synthetic_data(n_samples=1000):
    np.random.seed(42)
    
    # Features: duration, src_bytes, dst_bytes, count, serror_rate
    # Labels: 0 (Normal), 1 (Attack)
    
    # Normal traffic
    normal_samples = n_samples // 2
    normal_data = {
        'duration': np.random.exponential(scale=1.5, size=normal_samples),
        'src_bytes': np.random.normal(loc=1500, scale=800, size=normal_samples),
        'dst_bytes': np.random.normal(loc=1500, scale=800, size=normal_samples),
        'count': np.random.randint(1, 50, size=normal_samples),
        'serror_rate': np.random.uniform(0, 0.4, size=normal_samples),
        'label': 0
    }
    
    # Attack traffic (e.g., DoS)
    attack_samples = n_samples // 2
    attack_data = {
        'duration': np.random.exponential(scale=0.5, size=attack_samples),
        'src_bytes': np.random.normal(loc=5000, scale=2500, size=attack_samples),
        'dst_bytes': np.random.normal(loc=500, scale=300, size=attack_samples),
        'count': np.random.randint(30, 300, size=attack_samples),
        'serror_rate': np.random.uniform(0.3, 1.0, size=attack_samples),
        'label': 1
    }
    
    df_normal = pd.DataFrame(normal_data)
    df_attack = pd.DataFrame(attack_data)
    
    df = pd.concat([df_normal, df_attack]).sample(frac=1).reset_index(drop=True)
    df.to_csv('data/kdd_synthetic.csv', index=False)
    print("Synthetic data generated.")
    return df

def train():
    df = generate_synthetic_data()
    
    X = df.drop('label', axis=1)
    y = df['label']
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=50, max_depth=5, min_samples_leaf=5, random_state=42)
    model.fit(X_train, y_train)
    
    accuracy = model.score(X_test, y_test)
    print(f"Model trained with accuracy: {accuracy:.4f}")
    
    # Save model and scaler
    joblib.dump(model, 'models/ids_model.pkl')
    joblib.dump(scaler, 'models/scaler.pkl')
    print("Model and scaler saved to models/ directory.")

if __name__ == "__main__":
    train()
