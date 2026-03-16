import React, { useEffect, useState } from "react";
import "./Home.css"
import axios from "axios"
import cross from "../../assets/cross.png"

const SeverityCard = ({ avgSeverity }) => {
     let level = "";
     let color = "";
     let icon = "";
     let message = "";

     if (avgSeverity <= 2) {
          level = "Low Severity";
          color = "green";
          icon = "✅";
          message = "No immediate risk. You're safe.";
     } else if (avgSeverity <= 5) {
          level = "Moderate Severity";
          color = "orange";
          icon = "⚠️";
          message = "Moderate urgency. Seek advice soon.";
     } else {
          level = "High Severity";
          color = "red";
          icon = "🚨";
          message = "High risk. Consult a doctor immediately!";
     }

     return (
          <div className={`severity-card ${color}`}>
               <h2>{icon} {level}</h2>
               <p className="severity-message">{message}</p>
               <p className="severity-score">Severity Score: {avgSeverity.toFixed(2)} / 7</p>
          </div>
     );
};

const Home = () => {
     const [symptoms, setSymptoms] = useState([]);
     const [symptom, setSymptom] = useState("");
     const [allSymp, setAll] = useState([]);
     const [loading, setLoading] = useState(false);
     const [suggest, setSuggest] = useState([]);
     const [diseases, setDiseases] = useState([]);
     const [symLvl, setSympLevel] = useState([]);
     const [shaps, setShaps] = useState([]);
     const [showModal, setShowModal] = useState(false);
     const [freeText, setFreeText] = useState("");

     const availableSymptoms = allSymp.filter(
          (item) => !symptoms.includes(item)
     );

     function handleSelectSymptom(symp) {
          setSymptoms((prev) => [...prev, symp]);
          setShowModal(false);
     }

     const addFromtext = async () => {
          try {
               const resp = await axios.post("https://microtraige.onrender.com/map_Symptoms", {
                    "feeling": freeText
               })
               if (resp.data.success) {
                    for (let i = 0; i < resp.data.symptoms.length; i++) {
                         setSymptoms((prev) => [...prev, resp.data.symptoms[i]]);
                    }
               }
          } catch (e) {
               console.log(e)
          }
     }

     function generateReason(symptoms, disease) {
          if (symptoms.length == 0) {
               return ""
          }
          const templates = [
               `The presence of {symptoms} strongly suggests ${disease}, as these are common indicators.`,
               `{Symptoms} are characteristic symptoms often seen in ${disease}.`,
               `The model predicted ${disease} mainly due to the presence of {symptoms}.`,
               `Because the patient shows {symptoms}, ${disease} is highly likely.`,
               `These symptoms — {symptoms} — are known to be associated with ${disease} in clinical cases.`
          ];

          const symptomStr = symptoms.length > 1
               ? symptoms.slice(0, -1).join(', ') + ' and ' + symptoms[symptoms.length - 1]
               : symptoms[0];

          const template = templates[Math.floor(Math.random() * templates.length)];
          const capitalizedSymptoms = symptomStr.charAt(0).toUpperCase() + symptomStr.slice(1);

          return template
               .replace('{symptoms}', symptomStr)
               .replace('{Symptoms}', capitalizedSymptoms);
     }

     function getData(symps) {
          console.log(symps);
          const symptoms = [];

          for (let i = 0; i < symps.length; i++) {
               if (symps[i].shap_value > 0) {
                    symptoms.push(beautify(symps[i].name));
               }
          }

          console.log(symptoms.slice(0, 3));
          return symptoms.slice(0, 3);
     }


     function filterBySubstring(arr, keyword) {
          if (!Array.isArray(arr)) return [];
          setSuggest(arr.filter(item => item.toLowerCase().includes(keyword.toLowerCase())).slice(0, 6));
     }

     function avgWeight(symLvl) {
          let scores = 0;
          for (let i = 0; i < symLvl.length; i++) {
               scores = scores + (symLvl[i].weight)
          }
          return scores / symLvl.length;
     }


     function beautify(word) {
          return word.replace(/_/g, " ").trim();
     }



     const removeSymptom = (value) => {
          const updatedSymptoms = symptoms.filter(item => item !== value);
          setSymptoms(updatedSymptoms);
     };
     const getAllSymptoms = async () => {
          try {
               const resp = await axios.get("https://microtraige.onrender.com/getSymptoms")
               if (resp.data.success) {
                    setAll(resp.data.Symptoms);
               }
          } catch (e) {
               console.log(e)
          }
     }

     const predict = async () => {
          try {
               setLoading(true); // Start loading
               const resp = await axios.post("https://microtraige.onrender.com/predict",
                    { symptoms: symptoms }
               )
               if (resp.data.success) {
                    setDiseases(resp.data.disease_data.sort((a, b) => b.confidence - a.confidence));
                    setSympLevel(resp.data.symptoms_data);
                    setShaps(resp.data.shap_values);
               }
          } catch (e) {
               console.log(e)
          } finally {
               setLoading(false); // Stop loading
          }
     }



     useEffect(() => {
          getAllSymptoms();
     }, [])
     return <div>
          <div className="Navbar">
               <h1>MicroTraige</h1>
          </div>

          <div className="Container">
               <label htmlFor="free-text" style={{ fontWeight: 600, fontSize: "1.1rem" }}>
                    Describe how you feel (in English)
               </label>
               <textarea
                    id="free-text"
                    className="free-textarea"
                    rows={3}
                    placeholder="e.g. I have a headache and mild fever since morning..."
                    value={freeText}
                    onChange={e => setFreeText(e.target.value)}
                    style={{ width: "100%", marginBottom: 16, borderRadius: 8, border: "2px solid #a78bfa", padding: 10, fontSize: "1rem", resize: "vertical" }}
               />
               <button
                    style={{ marginBottom: 8, background: "#fff", color: "#7c3aed", border: "2px solid #a78bfa" }}
                    onClick={() => {
                         // You can process freeText here, e.g., send to backend for NLP
                         addFromtext();
                         // Optionally clear after submit:
                         setFreeText("");
                    }}
               >
                    Add from Text
               </button>
               <div style={{
                    color: "#a78bfa",
                    background: "#f7f6fd",
                    borderLeft: "4px solid #a78bfa",
                    borderRadius: 6,
                    padding: "8px 12px",
                    marginBottom: 16,
                    fontSize: "0.97rem"
               }}>
                    <b>Note:</b> All symptoms mentioned in your text may not be added automatically. If any are missing, please add them manually below.
               </div>
               <label htmlFor="symptom">Add Symptom</label><br />
               <input type="text" id="symptom" autoComplete="off" value={beautify(symptom)} onChange={(e) => {
                    setSymptom(e.target.value);
                    filterBySubstring(allSymp, e.target.value);
               }} />
               <div className="suggestions">
                    {symptom.length > 0 && suggest.map((item) => {
                         return <div className="SuggestItem" onClick={() => {
                              setSymptom(item);
                         }}>{beautify(item)}</div>
                    })}
               </div>
               <button
                    onClick={() => {
                         setSymptoms((prev) => [...prev, symptom]);
                         setSymptom("");
                    }}
               >Add</button>
               <button
                    type="button"
                    className="open-modal-btn"
                    onClick={() => setShowModal(true)}
                    style={{ marginTop: 8, background: "#fff", color: "#7c3aed", border: "2px solid #a78bfa" }}
               >
                    Show All Symptoms
               </button>

               {/* Modal */}
               {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                         <div className="modal-content" onClick={e => e.stopPropagation()}>
                              <h3>Select a Symptom</h3>
                              <button className="close-modal" onClick={() => setShowModal(false)}>×</button>
                              <div className="modal-list">
                                   {availableSymptoms.length === 0 ? (
                                        <div className="no-symptoms">All symptoms added!</div>
                                   ) : (
                                        availableSymptoms.map((item, idx) => (
                                             <div
                                                  className="modal-symptom"
                                                  key={item}
                                                  onClick={() => handleSelectSymptom(item)}
                                             >
                                                  {beautify(item)}
                                             </div>
                                        ))
                                   )}
                              </div>
                         </div>
                    </div>
               )}
               <div className="List">
                    {symptoms.map((item) => {
                         return <div className="item">
                              <div className="word">{beautify(item)}</div>
                              <span onClick={() => {
                                   removeSymptom(item);
                              }}><img src={cross} width={30} height={30} /></span>
                         </div>
                    })}
               </div>
               {symptoms.length > 0 ? <button
                    onClick={() => {
                         predict();
                         setSymptoms([]);
                    }}

               >Predict</button> : ""}


          </div>

          {symLvl.length > 0 && (
               <SeverityCard avgSeverity={avgWeight(symLvl)} />
          )}

          {diseases.length > 0 && (
               <div className="prediction-section">
                    <h2 className="prediction-heading">Top 3 Predicted Diseases</h2>
                    <div className="prediction">
                         {diseases.map((disease, index) => (
                              <div className="disease-card" key={disease.name}>
                                   <h2>{disease.name}</h2>
                                   <p className="confidence">Confidence: {(disease.confidence * 100).toFixed(2)}%</p>
                                   <p className="description">{disease.description}</p>
                                   {generateReason(getData(shaps[index]), disease.name).length > 0 ?
                                        <p className="explainability">
                                             {generateReason(getData(shaps[index]), disease.name)}
                                        </p> : ""}
                                   <div className="precautions">
                                        <h4>Precautions</h4>
                                        <ul>
                                             {disease.precaution.map((p, idx) => (
                                                  <li key={idx}>{p}</li>
                                             ))}
                                        </ul>
                                   </div>
                              </div>
                         ))}
                    </div>
               </div>
          )}

          {loading && (
               <div className="loading-spinner">
                    <div className="spinner"></div>
                    <div style={{ color: "#7c3aed", marginTop: 8 }}>Predicting...</div>
               </div>
          )}

     </div>
}


export default Home;
