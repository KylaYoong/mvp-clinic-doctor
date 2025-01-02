import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, getDocs, query, where, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import "./Doctor.css";
import SKPLogo from "./SKP-logo.jpg";

function Doctor() {
    const [patients, setPatients] = useState([]);
    const [awaitingCount, setAwaitingCount] = useState(0);
    const [endedCount, setEndedCount] = useState(0);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [sickConditions, setSickConditions] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [selectedConditions, setSelectedConditions] = useState([]);
    const [selectedMedicines, setSelectedMedicines] = useState([]);
    const [notes, setNotes] = useState("");
    const [timeIn, setTimeIn] = useState(null);
    const [timeOut, setTimeOut] = useState(null);

    useEffect(() => {
      // Fetch patients
      const patientsRef = collection(db, "queue");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      const q = query(
          patientsRef,
          where("timestamp", ">=", today),
          orderBy("timestamp", "asc")
      );
  
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedPatients = snapshot.docs.map((doc) => {
            const data = doc.data();
            console.log("Document data:", data); // Log each document for debugging
            return {
                id: doc.id,
                name: data.name, // Explicitly map `name`
                gender: data.gender, // Explicitly map `gender`
                ...data, // Include all other fields
            };
        });

        console.log("Fetched patients:", fetchedPatients); // Debug log
        setPatients(fetchedPatients);

        // Update counts
        const awaiting = fetchedPatients.filter((p) => p.status === "waiting" || p.status === "being attended").length;
        const ended = fetchedPatients.filter((p) => p.status === "completed").length;
        setAwaitingCount(awaiting);
        setEndedCount(ended);
    });

    return () => unsubscribe();
}, []);


    useEffect(() => {
        // Fetch conditions and medicines
        const fetchOptions = async () => {
            try {
                const conditionsSnapshot = await getDocs(collection(db, "sickConditions"));
                const medicinesSnapshot = await getDocs(collection(db, "medicines"));

                setSickConditions(conditionsSnapshot.docs.map((doc) => doc.data().name));
                setMedicines(medicinesSnapshot.docs.map((doc) => doc.data().name));
            } catch (error) {
                console.error("Error fetching options:", error);
            }
        };

        fetchOptions();
    }, []);

    const handleSelectPatient = (patient) => {
        console.log("Selected patient details:", patient);
        setSelectedPatient(patient); // No need for default values since data is always present
        console.log("Patient state updated:", patient);
        setTimeIn(patient.timeIn || null);
        setTimeOut(patient.timeOut || null);
        setSelectedConditions([]);
        setSelectedMedicines([]);
        setNotes(""); // Clear notes for new patient
    };

    const handleTimeIn = async () => {
        if (!selectedPatient) return;

        const currentTime = new Date();
        const formattedTime = formatDateWithTimeZone(currentTime);

        setTimeIn(formattedTime);

        try {
            const patientRef = doc(db, "queue", selectedPatient.id);
            await updateDoc(patientRef, { timeIn: formattedTime });
        } catch (error) {
            console.error("Failed to set Time In:", error);
        }
    };

    const handleTimeOut = async () => {
        if (!selectedPatient) return;

        const currentTime = new Date();
        const formattedTime = formatDateWithTimeZone(currentTime);

        setTimeOut(formattedTime);

        try {
            const patientRef = doc(db, "queue", selectedPatient.id);
            await updateDoc(patientRef, { timeOut: formattedTime });
        } catch (error) {
            console.error("Failed to set Time Out:", error);
        }
    };

    const formatDateWithTimeZone = (date) => {
        const options = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: "Asia/Kuala_Lumpur",
            timeZoneName: "short",
            hour12: true,
        };
        return new Intl.DateTimeFormat("en-US", options).format(date);
    };

    const handleSaveNotes = async () => {
        if (!selectedPatient) return;

        try {
            const patientRef = doc(db, "queue", selectedPatient.id);
            await updateDoc(patientRef, {
                conditions: selectedConditions,
                medicines: selectedMedicines,
                notes,
            });

            alert("Notes saved successfully!");
        } catch (error) {
            alert("Failed to save notes. Try again.");
            console.error(error);
        }
    };

    const handleMarkAsCompleted = async () => {
        if (!selectedPatient) return;

        try {
            const patientRef = doc(db, "queue", selectedPatient.id);
            await updateDoc(patientRef, { status: "completed" });
            alert("Patient marked as completed!");
            setSelectedPatient(null); // Close popup window after marking as completed
        } catch (error) {
            alert("Failed to update status. Try again.");
            console.error(error);
        }
    };

    const handleSelectCondition = (condition) => {
        setSelectedConditions((prev) =>
            prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition]
        );
    };

    const handleSelectMedicine = (medicine) => {
        setSelectedMedicines((prev) =>
            prev.includes(medicine) ? prev.filter((m) => m !== medicine) : [...prev, medicine]
        );
    };

    return (
        <div className="doctor-container">
            <div className="header">
                <img src={SKPLogo} alt="SKP Logo" className="logo" />
                <h2 className="header-title">Doctor Interface</h2>
            </div>

            <div className="summary-section">
                <div className="summary-box awaiting">
                    <h3>Awaiting Visits</h3>
                    <p>{awaitingCount}</p>
                </div>
                <div className="summary-box ended">
                    <h3>Ended Visits</h3>
                    <p>{endedCount}</p>
                </div>
            </div>

            <div className="patients-section">
                {patients.length > 0 ? (
                    <div className="table-wrapper">
                        <table className="patient-table">
                            <thead>
                                <tr>
                                    <th>Queue No.</th>
                                    <th>Employee ID</th>
                                    <th>Status</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patients.map((patient) => (
                                    <tr key={patient.id}>
                                        <td>{patient.queueNumber}</td>
                                        <td>{patient.employeeID}</td>
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
                        <p><strong>Gender:</strong> {selectedPatient.gender}</p>
                        <p><strong>Time In:</strong> {timeIn || "Not set"}</p>
                        <p><strong>Time Out:</strong> {timeOut || "Not set"}</p>

                        <button onClick={handleTimeIn}>Record Time In</button>
                        <button onClick={handleTimeOut}>Record Time Out</button>

                        <h4>Select Conditions:</h4>
                        {sickConditions.map((condition) => (
                            <label key={condition}>
                                <input
                                    type="checkbox"
                                    value={condition}
                                    checked={selectedConditions.includes(condition)}
                                    onChange={() => handleSelectCondition(condition)}
                                />
                                {condition}
                            </label>
                        ))}

                        <h4>Select Medicines:</h4>
                        {medicines.map((medicine) => (
                            <label key={medicine}>
                                <input
                                    type="checkbox"
                                    value={medicine}
                                    checked={selectedMedicines.includes(medicine)}
                                    onChange={() => handleSelectMedicine(medicine)}
                                />
                                {medicine}
                            </label>
                        ))}

                        <h4>Additional Notes:</h4>
                        <textarea
                            placeholder="Enter additional notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        ></textarea>

                        <button onClick={handleSaveNotes}>Save</button>
                        <button onClick={handleMarkAsCompleted}>Mark as Completed</button>
                        <button onClick={() => setSelectedPatient(null)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Doctor;
