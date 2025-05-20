"use client"

import { useState } from "react"
import axios from "axios"

export default function TicketDashboard() {
  const [data, setData] = useState({
    refill: [],
    refund: [],
    speed_up: [],
    delayed_refund: [],
    others: [],
  })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("categories")
  const [toast, setToast] = useState({ show: false, message: "", type: "" })

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const res = await axios.get("https://youtuberefill-1.onrender.com/ticket")
      setData(res.data)
      showToast("Tickets loaded successfully", "success")
    } catch (err) {
      console.error("Error fetching data:", err)
      showToast("Failed to load tickets", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (ids:any) => {
    const text = ids.join(", ")
    navigator.clipboard.writeText(text)
    showToast(`${ids.length} IDs copied to clipboard`, "success")
  }

  const showToast = (message:any, type:any) => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000)
  }

  const getCardColor = (type:any) => {
    switch (type) {
      case "refill":
        return "bg-[#2563eb] text-[#fffff]"
      case "refund":
        return "bg-[#2563eb] text-[#fffff]"
      case "speed_up":
        return "bg-[#2563eb] text-[#fffff]"
      case "delayed_refund":
        return "bg-[#2563eb] text-[#fffff]"
      default:
        return "bg-gray-200 text-[#fffff]"
    }
  }

  const renderTicketCard = (title:any, items:any, type:any) => {
    const colorClass = getCardColor(type)

    return (
      <div className="rounded-lg overflow-hidden h-full flex flex-col bg-[#1e2130] border border-[#2a2c3c]">
        <div className={`p-4 flex justify-between items-center ${colorClass}`}>
          <h2 className="font-bold text-lg">{title}</h2>
          <span className="bg-white/20 text-sm px-2 py-1 rounded-full">{items.length}</span>
        </div>
       <div className="p-4 flex-grow">
 <div className="p-2 flex flex-wrap gap-0.5 max-w-[300px] max-h-[300px] overflow-y-auto leading-tight">
  {items.length > 0 ? (
    items.map((item:any, idx:any) => (
      <span
        key={idx}
        className="inline-block whitespace-nowrap"
        style={{ wordBreak: 'normal' }}
      >
        {item}
        {idx < items.length - 1 && <span>,</span>}
      </span>
    ))
  ) : (
    <p className="text-gray-400 italic p-4 text-center">No data found</p>
  )}
</div>



</div>

        <div className="p-4 border-t border-[#2a2c3c]">
          <button
            onClick={() => handleCopy(items)}
            disabled={items.length === 0}
            className={`w-full py-2 px-4 rounded-md border border-[#2a2c3c] flex items-center justify-center gap-2 text-white
              ${items.length === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-[#2a2c3c]"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
            Copy IDs
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Toast notification */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-md shadow-md z-50 transition-all duration-300 
          ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Ticket Dashboard</h1>
        <button
          onClick={fetchTickets}
          disabled={loading}
          className={`py-2 px-4 rounded-md bg-blue-600 text-white min-w-[140px] flex items-center justify-center gap-2
            ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"}`}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading...
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Get Tickets
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-[#2a2c3c]">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("categories")}
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm flex-1
                ${
                  activeTab === "categories"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500"
                }`}
            >
              Ticket Categories
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm flex-1
                ${
                  activeTab === "messages"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500"
                }`}
            >
               Other Messages {" "}
           { data.others.length > 0 ? <span className="bg-red-600 text-white py-2 px-4 text-center rounded-full">{ data.others.length }</span>:""}  
            </button>
          </nav>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {renderTicketCard("Refill", data.refill, "refill")}
          {renderTicketCard("Refund", data.refund, "refund")}
          {renderTicketCard("Speed Up", data.speed_up, "speed_up")}
          {renderTicketCard("No Yet Refund", data.delayed_refund, "delayed_refund")}
        </div>
      )}

      {activeTab === "messages" && (
        <div className="rounded-lg overflow-hidden bg-[#1e2130] border border-[#2a2c3c]">
          <div className="bg-[#2a2c3c] p-4">
            <h2 className="font-bold text-lg text-white">Other Messages</h2>
            <p className="text-sm text-gray-300">Messages that don't fit into standard categories</p>
          </div>
          <div className="p-4">
            <div className="max-h-[300px] overflow-y-auto space-y-2 border border-gray-700 rounded-md p-3 bg-[#1e2130] text-white">
  {data.others && data.others.length > 0 ? (
    data.others.map((msg, idx) => (
      <div
  key={idx}
  className="bg-[#2a2c3c] p-3 rounded-md text-sm text-white break-words whitespace-pre-wrap"
>
  {msg}
</div>

    ))
  ) : (
    <p className="text-gray-400 italic text-center p-4">
      No messages found
    </p>
  )}
</div>

          </div>
        </div>
      )}
    </div>
  )
}
