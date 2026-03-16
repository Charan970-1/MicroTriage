from flask import Flask, render_template,jsonify, request, redirect, url_for,Response
import numpy as np
import pandas as pd
from flask_cors import CORS
import joblib
import scispacy
from spacy.matcher import PhraseMatcher
import spacy
import shap
import json
import subprocess
import importlib.util



app = Flask(__name__)
CORS(app)

def install_sci_model():
    try:
        spacy.load("en_core_sci_md")
    except OSError:
        url = "https://s3-us-west-2.amazonaws.com/ai2-s2-scispacy/releases/v0.5.4/en_core_sci_md-0.5.4.tar.gz"
        subprocess.run(["pip", "install", url], check=True)

install_sci_model()

severity = pd.read_csv("./data/Symptom-severity.csv")
desc = pd.read_csv("./data/symptom_Description.csv")
prec = pd.read_csv("./data/symptom_precaution.csv")
log_model = joblib.load("./data/model.pkl")
le = joblib.load("./data/dis.pkl")
mlb = joblib.load("./data/sym.pkl")
X_train = np.load("./data/shap_background.npy")
nlp = spacy.load("en_core_sci_md")


explainer = shap.Explainer(log_model.predict_proba, X_train)


# Home route
@app.route('/')
def home():
    return "<h1>Welcome to Flask!</h1><p>Go to <a href='/about'>About</a> or <a href='/submit'>Submit Form</a></p>"

@app.route('/getSymptoms', methods=['GET'])
def getAll():
    return {"success": True,"Symptoms":list(mlb.classes_)}




def convert(o):
    if isinstance(o, np.integer): return int(o)
    if isinstance(o, np.floating): return float(o)
    if isinstance(o, np.ndarray): return o.tolist()
    if isinstance(o, bytes): return o.decode()
    raise TypeError(f"Object of type {type(o)} is not JSON serializable")

def get_pred(symps, log_model, le, mlb, severity, desc, prec):
    sympy = np.array([symps])
    test = mlb.transform(sympy)
    probs = log_model.predict_proba(test.reshape(1, -1))
    shap_values = explainer(test.reshape(1, -1)) 
    top3_indices = np.argsort(probs, axis=1)[:, -3:][:, ::-1]
    top3_diseases_flat = le.inverse_transform(top3_indices.flatten())
    top3_diseases = top3_diseases_flat.reshape(top3_indices.shape)
    top3_confidences = np.take_along_axis(probs, top3_indices, axis=1)
    all_shap=[]
    for pred_class in top3_indices[0]:
        shap_for_class = shap_values.values[0][:, pred_class] 

        feature_names = np.array(mlb.classes_)
        x_sample = np.array(test[0])
        shap_data=[]

        for i in range(len(x_sample)):
            if x_sample[i] == 1:
                shap_data.append({"name": feature_names[i],"shap_value": round(float(shap_for_class[i]), 4)})


        shap_data.sort(key=lambda k: k['shap_value'], reverse=True)
        all_shap.append(shap_data)
    
    data = []

    for dis, conf in zip(top3_diseases[0], top3_confidences[0]):
        dis_clean = dis.strip()

        # Get description
        desc_row = desc[desc["Disease"].str.strip() == dis_clean]
        if not desc_row.empty:
            description = desc_row["Description"].iloc[0]
        else:
            description = "No description found for this disease"

        # Get precautions
        precautions = []
        prec_row = prec[prec["Disease"].str.strip() == dis_clean]
        if not prec_row.empty:
            for k in range(1, 5):
                col_name = f"Precaution_{k}"
                if col_name in prec_row.columns:
                    val = prec_row[col_name].iloc[0]
                    if pd.notna(val):  # Only add non-NaN values
                        precautions.append(val)

        data.append({
            "name": dis_clean,
            "confidence": float(conf),
            "description": description,
            "precaution": precautions
        })

    # Process symptoms with severity
    symptoms = []
    for k in symps:
        symp1 = k.strip()
        sev_row = severity[severity["Symptom"].str.strip() == symp1]
        if not sev_row.empty:
            weight = sev_row["weight"].iloc[0]
            symptoms.append({"name": symp1, "weight": weight})
        else:
            symptoms.append({"name": symp1, "weight": 0})  # fallback for missing severity

    return [data, symptoms, all_shap]


# Form route (GET and POST)
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    syms = data.get('symptoms', [])
    pred_data=get_pred(syms,log_model,le,mlb,severity,desc,prec)
    response_json = json.dumps({
        "success": True,
        "disease_data": pred_data[0],
        "symptoms_data": pred_data[1],
        "shap_values": pred_data[2]
    }, default=convert)

    return Response(response_json, mimetype='application/json')


def beautify(word):
    return word.replace("_", " ").strip()

# Original + beautified symptoms
SYMPTOMS = list(mlb.classes_)
beautify_map = {beautify(sym): sym for sym in SYMPTOMS}  # beautified → original

# Setup matcher
matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
patterns = [nlp.make_doc(beautify(sym)) for sym in SYMPTOMS]
matcher.add("SYMPTOM", patterns)

def extract_symptoms(text):
    doc = nlp(text)
    matches = matcher(doc)
    extracted = {doc[start:end].text.lower().strip() for _, start, end in matches}
    
    # Map back to original symptom names with underscores
    mapped = [beautify_map[sym] for sym in extracted if sym in beautify_map]
    return mapped

@app.route('/map_Symptoms', methods=['POST'])
def maps():
    data = request.get_json()
    text = data.get("feeling", "")
    extracted = extract_symptoms(text)
    return jsonify({"success": True, "symptoms": extracted})


# Run the app
if __name__ == '__main__':
    app.run(debug=False, use_reloader=False)
