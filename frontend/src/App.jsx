import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Result from "./pages/Result";
import ReportCard from "./pages/ReportCard";
import Test from "./pages/Test";
import Performance from "./pages/Performance";
import TopicHistory from "./pages/TopicHistory";
import History from "./pages/History";
import Profile from "./pages/Profile";
import NewAssessment from "./pages/NewAssessment";

export default function App() {
  return (
    <Routes>

      
      <Route path="/" element={<Login />} />

      {/* ALL APP PAGES INSIDE LAYOUT */}
      <Route element={<MainLayout />}>

        <Route path="/home" element={<Dashboard />} />
        <Route path="/result" element={<Result />} />
        <Route path="/report" element={<ReportCard />} />
        <Route path="/test" element={<Test />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/topic/:topic" element={<TopicHistory />} />
        <Route path="/newassessment" element={<NewAssessment />} />
        

      </Route>
      <Route path="/admin" element={<Admin />} />

    </Routes>
  );
}