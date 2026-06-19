import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Test from "./pages/Test/Test";
import Result from "./pages/Result/Result";
import Performance from "./pages/Performance/Performance";
import ReportCard from "./pages/ReportCard/ReportCard";

import "./App.css";
function App() {
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<Test />} />
        <Route path="/result" element={<Result />} />       
        <Route path="/performance" element={<Performance />} />
        <Route path="/report" element={<ReportCard />} />
      </Routes>
    </BrowserRouter>

  );
}
export default App;