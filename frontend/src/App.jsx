import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Home from "./pages/Home";
import Test from "./pages/Test";
import Result from "./pages/Result";
import ProtectedRoute from "./components/ProtectedRoute";
import Performance from "./pages/Performance";
import TopicHistory from "./pages/TopicHistory"
import ReportCard from "./pages/ReportCard";

import "./App.css";
function App() {
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/test" element={<Test />} />
        <Route path="/result" element={<Result />} />       
        <Route path="/performance" element={<Performance />} />
        <Route path="/topic/:topic" element={<TopicHistory />} />
        <Route path="/report" element={<ReportCard />} />
      </Routes>
    </BrowserRouter>

  );
}
export default App;