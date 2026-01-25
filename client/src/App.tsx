import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Sidebar from "./components/sidebar/sidebar"
import Ticket from "./ticket"
import YoutubeViewerCheck from "./YoutubeStatsChecker"
import TwitterDataFetcher from "./pages/twitter/index"
import TiktokDataFetcher from "./pages/tiktok/tiktok"
import InstagramDataFetcher from "./pages/instagram/instagram"
import CustomRates from "./pages/customrates/index"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import SiteManagementDashboard from "./pages/siteScraper"
import DropCostCalculator from './pages/serviceOverFlowPrice'
import RefillBatchFrontend from './pages/clickButton'
import YouTubeVideoChecker from './pages/youtubeChecker'

// 🔥 QueryClient oluştur
const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen flex bg-gradient-to-br from-gray-900 to-gray-800">
          <Sidebar />
          <main className="flex-1 p-6 text-white overflow-y-auto">
            <Routes>
              <Route path="/" element={<YoutubeViewerCheck />} />
              <Route path="/ticket" element={<Ticket />} />
              <Route path="/twitter" element={<TwitterDataFetcher />} />
              <Route path="/tiktok" element={<TiktokDataFetcher />} />
              <Route path="/instagram" element={<InstagramDataFetcher />} />
              <Route path="/custom-rates" element={<CustomRates />} />
              <Route path="/all-services" element={<SiteManagementDashboard />} />
              <Route path="/overflow-calculator" element={<DropCostCalculator />} />
              <Route path="/refill-button" element={<RefillBatchFrontend />} />
              <Route path="/youtube-checker" element={<YouTubeVideoChecker />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App
