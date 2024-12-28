import React from "react";
import { Routes, Route } from "react-router-dom";
import Doctor from "./Doctor";

const App = () => {
  return (
    <Routes>
      {/* Default path renders the Doctor interface */}
      <Route path="/" element={<Doctor />} />
    </Routes>
  );
};

export default App;
