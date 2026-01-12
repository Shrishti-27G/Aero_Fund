import { Outlet } from "react-router-dom";
import Navbar from "./components/navigation/Navbar";

function App() {
  
  return <div className="w-full min-h-screen bg-[#050A13] text-white ">

    <div className="h-[5rem]">
      <Navbar />
    </div>

    <Outlet />
  </div>;
}

export default App;
