import Sidebar from "./components/sidebar/sidebar"
import Ticket from "./ticket"
import YoutubeViewerCheck from "./YoutubeStatsChecker"
import TwitterDataFetcher from "./twitter/twitter"
import TiktokDataFetcher from "./tiktok/tiktok"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

function App() {
  return (
    <Router>
      {/* Full height screen, flex row */}
      <div className="min-h-screen flex bg-gradient-to-br from-gray-900 to-gray-800">
        <Sidebar /> {/* Sol kısım */}
        <main className="flex-1 p-6 text-white overflow-y-auto">
          <Routes>
            <Route path="/" element={<YoutubeViewerCheck />} />
            <Route path="/ticket" element={<Ticket />} />
            <Route path="/twitter" element={<TwitterDataFetcher />} />
            <Route path="/tiktok" element={<TiktokDataFetcher />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
