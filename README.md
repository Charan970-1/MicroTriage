# 🧠 MicroTriage - Rare Disease Prediction via Symptoms

MicroTriage is an intelligent, AI-driven healthcare assistant that identifies **rare diseases** based on a patient’s symptoms. Designed for medical professionals, researchers, and the general public, MicroTriage brings **early diagnosis**, **personalized recommendations**, and **life-saving awareness** to the forefront using a powerful ML+NLP pipeline and modern web technologies.

---

## 🚀 Features

- 🔍 **Rare Disease Prediction** using multi-label classification  
- 💬 **Free-text Symptom Parser** (SPACY-based medical NLP)  
- 🧠 **SHAP Model Interpretability** (Explain why a prediction was made)  
- 📊 **Severity-based Symptom Rating** (0 to 7 scale)  
- 🛡️ **Precaution Recommendations** per disease  
- 🖥️ **Interactive Frontend** (React + CSS)  
- ☁️ **Supabase-integrated Backend** (Flask)  

---

## 🧩 Tech Stack

| Layer         | Tech Used                                 |
| ------------- | ------------------------------------------|
| Frontend      | React, CSS, Vite                          |
| Backend       | Flask, Python                             |
| Machine Learning | Scikit-learn, SHAP, SPACY (Symptom NLP) |
| Deployment    | Vercel (Frontend) + Render (Backend)      |

---

## 🏥 Real-world Use Case

Rare diseases often go undiagnosed for years due to scattered symptoms and low awareness. MicroTriage solves this by:
- Accepting **symptoms in natural language**
- Matching them against a curated, verified dataset
- Predicting **probable rare diseases**
- Providing **relevant precautions** and **risk explanations**

Used by:
- Healthcare startups
- Med students & researchers
- Early diagnosis tools in telemedicine

---
## 🧠 AI Model

- **Model Type:** Multi-label Logistic Regression (Scikit-learn)  
- **Input:** Symptom vector (binary/weighted)  
- **Output:** Probabilities of 40+ rare diseases  
- **Explainability:** SHAP used to show top contributing symptoms  
- **Text Parser:** SPACY model to extract and normalize symptoms from raw user input  

---

## 🛠️ Installation (Local)

### Backend
```bash
cd server
pip install -r req.txt
python app.py
```
### Frontend
```bash
cd client
npm install
npm run dev
```
---

## 🌐 API Endpoints

| Endpoint           | Method | Description                      |
|--------------------|--------|----------------------------------|
| `/predict`         | POST   | Predict diseases from symptoms   |
| `/map_Symptoms`    | POST   | Extract symptoms from text       |
| `/getSymptoms`     | GET    | Return all Symptoms              |


---

## 💡 Future Scope

- Integration with **Electronic Health Records (EHR)**
- **Chatbot-based interface** (LLM-driven)
- **Multilingual symptom parsing**
- Deploy to **hospitals and rural healthcare centers**

---

## 👨‍💻 Developers

| Name                  | Role                      |
|-----------------------|---------------------------|
| Santhosh Reddy Beeram | ML Engineer, Full Stack Dev |
| [LinkedIn](https://linkedin.com/in/santhosh-reddy-beeram-2a5864315/) | [GitHub](https://github.com/santhosh-reddy-126) |

---

## 📜 License

MIT License - feel free to use and contribute.

---

## ⭐ Star the repo if you find it useful!
