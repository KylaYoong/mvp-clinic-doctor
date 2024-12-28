import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import "./Doctor.css";
import SKPLogo from "./SKP-logo.jpg";

function Doctor() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedNote, setSelectedNote] = useState("");
  const [customNote, setCustomNote] = useState("");

  useEffect(() => {
    const patientsRef = collection(db, "queue");
    const q = query(
      patientsRef,
      where("status", "in", ["waiting", "being attended"]),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPatients = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPatients(fetchedPatients);
    });

    return () => unsubscribe();
  }, []);

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setSelectedNote("");
    setCustomNote("");
  };

  const handleSaveNotes = async () => {
    if (!selectedPatient) return;

    try {
      const notes = selectedNote === "Others" ? customNote : selectedNote || "No Notes";
      const patientRef = doc(db, "queue", selectedPatient.id);
      await updateDoc(patientRef, { notes });

      alert("Notes updated successfully!");
      setSelectedPatient(null);
      setSelectedNote("");
      setCustomNote("");
    } catch (error) {
      alert("Failed to update notes. Try again.");
    }
  };

  const handleMarkAsCompleted = async () => {
    if (!selectedPatient) return;

    try {
      const patientRef = doc(db, "queue", selectedPatient.id);
      await updateDoc(patientRef, { status: "completed" });
      alert("Patient marked as completed!");
      setSelectedPatient(null);
      setSelectedNote("");
      setCustomNote("");
    } catch (error) {
      alert("Failed to update status. Try again.");
    }
  };

  return (
    <div className="doctor-container">
      <div className="header">
        <img src={SKPLogo} alt="SKP Logo" className="logo" />
        <h2 className="header-title">Doctor Interface</h2>
      </div>

      <div className="patients-section">
        {patients.length > 0 ? (
          <div className="table-wrapper">
            <table className="patient-table">
              <thead>
                <tr>
                  <th>Queue No.</th>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td>{patient.queueNumber}</td>  { /*I think issue is here */}
                    <td>{patient.employeeID}</td>
                    <td>{patient.name}</td>
                    <td>{patient.status}</td>
                    <td>
                      <button onClick={() => handleSelectPatient(patient)}>Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No patients found.</p>
        )}
      </div>

      {selectedPatient && (
        <div className="popup">
          <div className="popup-content">
            <h3>Details for {selectedPatient.name}</h3>
            <p><strong>Employee ID:</strong> {selectedPatient.employeeID}</p>
            <p><strong>Name:</strong> {selectedPatient.name}</p>
            <label htmlFor="notes">Select Medical Notes:</label>
            <select
              id="notes"
              value={selectedNote}
              onChange={(e) => setSelectedNote(e.target.value)}
            >
              <option value="">Select a note</option>
              <option value="Flu">Flu</option>
              <option value="Cough">Cough</option>
              <option value="Headache">Headache</option>
              <option value="Others">Others</option>
            </select>
            {selectedNote === "Others" && (
              <textarea
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Enter custom medical notes"
              ></textarea>
            )}
            <button className="save-button" onClick={handleSaveNotes}>Save Notes</button>
            <button className="mark-completed-button" onClick={handleMarkAsCompleted}>Mark as Completed</button>
            <button className="close-popup" onClick={() => setSelectedPatient(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Doctor;
