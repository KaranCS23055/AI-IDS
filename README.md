# AI-Based Intrusion Detection System (IDS)

🚀 **Live Demo:** [https://ai-ids-system.vercel.app/](https://ai-ids-system.vercel.app/)

An AI-powered Intrusion Detection System built using Machine Learning and a Flask web backend. It analyzes network packet features to predict whether the traffic is "Normal" or a potential "Attack".

## Features
- **Real-Time Prediction**: Accepts network traffic features and predicts the class (Attack/Normal).
- **Machine Learning**: Uses a trained Scikit-Learn model to analyze connection details (`duration`, `src_bytes`, `dst_bytes`, `count`, `serror_rate`).
- **Interactive UI**: A web interface built with HTML, CSS, and JavaScript for easy interaction and tracking of recent predictions.

## Project Structure
- `app.py`: The main Flask application server that hosts the web endpoints.
- `train_model.py`: Script to train the intrusion detection machine learning model.
- `models/`: Directory holding the saved model weights (`ids_model.pkl`) and scaler (`scaler.pkl`).
- `templates/`: Directory containing the frontend HTML (`index.html`).
- `static/`: Contains frontend static assets (`app.js`, `style.css`).

## Setup and Installation

1. **Install Dependencies**:
   Ensure you have Python installed. Install the necessary packages via pip:
   ```bash
   pip install flask joblib numpy scikit-learn
   ```

2. **Train the Model** (if not already trained):
   ```bash
   python train_model.py
   ```
   *This requires the dataset to be present in the `data/` directory.*

3. **Run the Application**:
   Start the Flask development server:
   ```bash
   python app.py
   ```

4. **Access the Web UI**:
   Open your browser and navigate to:
   ```
   http://127.0.0.1:5000/
   ```

## Usage
1. Provide network packet details (e.g., Duration, Source Bytes, Destination Bytes) in the web interface.
2. Click "Predict" (or equivalent button) to evaluate the network traffic.
3. The system will return the result ("Intervention Required" / "Attack" or "Normal Traffic") along with its confidence percentage.
