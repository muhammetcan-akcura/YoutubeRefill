import { useState } from "react"
import axios from "axios"

export default function BulkTicket() {
    const [staffName, setStaffName] = useState("support")
    const [usernames, setUsernames] = useState("")
    const [subject, setSubject] = useState("")
    const [message, setMessage] = useState("")
    const [logs, setLogs] = useState<{ username: string; status: "success" | "error"; msg: string }[]>([])
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0)

    const handleSend = async () => {
        const userList = usernames.split("\n").map((u) => u.trim()).filter((u) => u.length > 0)
        if (userList.length === 0) {
            alert("Please enter at least one username.")
            return
        }
        if (!subject || !message) {
            alert("Please fill in all fields.")
            return
        }

        setLoading(true)
        setLogs([])
        setProgress(0)

        for (let i = 0; i < userList.length; i++) {
            const user = userList[i]
            try {
                const response = await axios.post(
                    "https://youtuberefill-1.onrender.com/tickets/add",
                    {
                        username: user,
                        subject: subject,
                        message: message,
                        ...(staffName && { staff_name: staffName }),
                    }
                )

                if (response.data?.error_message) { // Check if API returns logic error in 200 OK
                    setLogs((prev) => [
                        ...prev,
                        { username: user, status: "error", msg: response.data.error_message },
                    ])
                } else {
                    setLogs((prev) => [
                        ...prev,
                        { username: user, status: "success", msg: "Ticket created successfully" },
                    ])
                }

            } catch (error: any) {
                const errorMessage = error.response?.data?.error_message || error.message || "Unknown Error";
                setLogs((prev) => [
                    ...prev,
                    { username: user, status: "error", msg: errorMessage },
                ])
            }
            setProgress(((i + 1) / userList.length) * 100)
            // Add a small delay to avoid rate limits if necessary, though not specified.
            await new Promise((resolve) => setTimeout(resolve, 200))
        }
        setLoading(false)
    }

    return (
        <div className="container mx-auto p-6 max-w-5xl text-gray-100">
            <div className="bg-[#1e2130] rounded-xl shadow-2xl overflow-hidden border border-[#2a2c3c]">

                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-b border-[#2a2c3c]">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Bulk Ticket Sender
                    </h1>
                    <p className="text-gray-400 mt-2">Send tickets to multiple users at once.</p>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Form Section */}
                    <div className="space-y-6">

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Staff Name (Optional)</label>
                            <input
                                type="text"
                                value={staffName}
                                onChange={(e) => setStaffName(e.target.value)}
                                placeholder="Admin Name"
                                className="w-full bg-[#151725] border border-[#2a2c3c] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Subject</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Ticket Subject"
                                className="w-full bg-[#151725] border border-[#2a2c3c] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Message</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Ticket Message Content..."
                                rows={4}
                                className="w-full bg-[#151725] border border-[#2a2c3c] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Usernames (One per line)</label>
                            <textarea
                                value={usernames}
                                onChange={(e) => setUsernames(e.target.value)}
                                placeholder={"john\nalice\nbob123"}
                                rows={8}
                                className="w-full bg-[#151725] border border-[#2a2c3c] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono"
                            />
                        </div>

                        <button
                            onClick={handleSend}
                            disabled={loading}
                            className={`w-full py-3 px-6 rounded-lg font-bold text-lg shadow-lg transform transition-all duration-200
                ${loading
                                    ? "bg-gray-600 cursor-not-allowed opacity-70"
                                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 hover:scale-[1.02] active:scale-[0.98]"
                                }`}
                        >
                            {loading ? "Processing..." : "Send Tickets"}
                        </button>

                        {loading && (
                            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4 overflow-hidden">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        )}

                    </div>

                    {/* Logs Section */}
                    <div className="flex flex-col h-full bg-[#151725] rounded-xl border border-[#2a2c3c] overflow-hidden">
                        <div className="p-4 border-b border-[#2a2c3c] bg-[#1e2130]">
                            <h3 className="font-semibold text-white">Process Log</h3>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto max-h-[600px] space-y-2 font-mono text-sm">
                            {logs.length === 0 ? (
                                <div className="text-gray-500 text-center mt-10">No logs yet...</div>
                            ) : (
                                logs.map((log, index) => (
                                    <div
                                        key={index}
                                        className={`p-3 rounded border-l-4 ${log.status === 'success' ? 'bg-green-900/20 border-green-500 text-green-200' : 'bg-red-900/20 border-red-500 text-red-200'}`}
                                    >
                                        <span className="font-bold">{log.username}:</span> {log.msg}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
