import React, { useState } from "react";
import Admin from "./Admin";
import Doctor from "./Doctor";
import Auth from "./Auth";

const App = () => {
  const [role, setRole] = useState(null); // Role: null (default), admin, or doctor

  return (
    <div>
      {!role ? (
        <Auth setRole={setRole} />
      ) : role === "Admin" ? (
        <Admin />
      ) : (
        <Doctor />
      )}
    </div>
  );
};

export default App;
