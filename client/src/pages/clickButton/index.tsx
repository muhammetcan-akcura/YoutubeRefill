// RefillBatchFrontend.tsx
import React, { useState } from "react";
import axios from "axios";

type ResultItem = {
  id: number | string;
  ok: boolean;
  status?: number | null;
  data?: any;
  error?: any;
};

export default function RefillBatchFrontend(): JSX.Element {
  const [idsText, setIdsText] = useState<string>("1219873,1200667");
  const [domain, setDomain] = useState<string>("olsmm.com");
  const [cookie, setCookie] = useState<string>("");
  const [minDelay, setMinDelay] = useState<number>(0);
  const [maxDelay, setMaxDelay] = useState<number>(0);
  const [concurrency, setConcurrency] = useState<number>(1);

  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "" }>({ msg: "", type: "" });

  const parseIds = (raw: string): number[] => {
    const parts = raw
      .split(/[\s,;\n\r]+/)
      .map((p) => p.trim())
      .filter(Boolean);
    const nums = parts.map((p) => Number(p)).filter((n) => !Number.isNaN(n));
    return nums;
  };

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3000);
  };

  

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);

    const ids = parseIds(idsText);
    if (!ids.length) {
      setError("Please enter at least 1 valid ID.");
      showToast("Please enter at least 1 valid ID.", "error");
      return;
    }
    if (!domain.trim()) {
      setError("Domain cannot be empty.");
      showToast("Domain cannot be empty.", "error");
      return;
    }
    if (!cookie.trim()) {
      setError("Cookie cannot be empty.");
      showToast("Cookie cannot be empty.", "error");
      return;
    }

    try {
      setLoading(true);
      setResults([]);
      showToast("Request is being sent...", "success");

      const payload = {
        ids,
        domain: domain.trim(),
        cookie: cookie.trim(),
        minDelay: Math.max(0, Math.floor(minDelay)),
        maxDelay: Math.max(0, Math.floor(maxDelay)),
        concurrency: Math.max(1, Math.floor(concurrency)),
      };

      const res = await axios.post("http://localhost:5000/refill-batch", payload, { timeout: 120000 });

      const data = res.data ?? {};
      const normalized: ResultItem[] = (data.results ?? []).map((r: any) => ({
        id: r.id,
        ok: !!r.ok,
        status: r.status ?? null,
        data: r.data ?? null,
        error: r.error ?? null,
      }));

      setResults(normalized);
      showToast("Operation completed.", "success");
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.error ?? err.message ?? String(err));
      showToast("An error occurred during the request.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Toast */}
      {toast.msg && (
        <div
          className={`fixed top-4 right-4 p-3 rounded-md z-50 shadow-lg ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Send Refill Request</h1>
          </div>
          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => {
                setIdsText("");
                setDomain("");
                setCookie("");
                setResults([]);
                setError(null);
                showToast("Form temizlendi.", "success");
              }}
              className="border border-slate-700 px-4 py-2 rounded-md text-slate-200"
            >
              Clear
            </button>
           
          </div>
        </div>

        <form onSubmit={onSubmit} className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">IDs</label>
            <textarea
              value={idsText}
              onChange={(e) => setIdsText(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm resize-none text-slate-100"
              placeholder="1219873,1200667"
            />
          </div>

          <div className="">
            <div >
              <label className="block text-sm text-slate-300 mb-1">Domain</label>
              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                placeholder="oldsmm.com"
              />
            </div>

            {/* <div>
              <label className="block text-sm text-slate-300 mb-1">Concurrency</label>
              <input
                type="number"
                value={concurrency}
                onChange={(e) => setConcurrency(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                min={1}
              />
            </div> */}
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Cookie</label>
            <input
              value={cookie}
              onChange={(e) => setCookie(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              placeholder="cookie "
            />
          </div>

          {/* <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1">minDelay (ms)</label>
              <input
                type="number"
                value={minDelay}
                onChange={(e) => setMinDelay(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">maxDelay (ms)</label>
              <input
                type="number"
                value={maxDelay}
                onChange={(e) => setMaxDelay(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                min={0}
              />
            </div>
          </div> */}

          {error && <div className="text-sm text-red-500">{error}</div>}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white disabled:opacity-60"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeWidth={2} d="M12 5v14m7-7H5" />
                </svg>
              )}
              Send
            </button>

            
          </div>
        </form>

        {/* Results
        <div className="mt-6 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Results</h2>
              <p className="text-xs text-slate-400">Total: {results.length}</p>
            </div>
            <div className="text-xs text-slate-400">Status: {loading ? "Working..." : "Ready"}</div>
          </div>

          <div className="p-4 max-h-[60vh] overflow-auto">
            {results.length === 0 ? (
              <div className="text-slate-400 text-sm">No Results Yet</div>
            ) : (
              <div className="space-y-3">
                {results.map((r) => (
                  <div key={String(r.id)} className="p-3 bg-slate-900 rounded-md border border-slate-700">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium">ID: {String(r.id)}</div>
                        <div className="text-xs text-slate-400">{r.ok ? "Success" : "Error"}</div>
                      </div>

                      <div className="text-right">
                        <div className={`inline-block px-2 py-1 rounded text-xs ${r.ok ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
                          {r.ok ? `OK ${r.status ?? ""}` : `ERR ${r.status ?? ""}`}
                        </div>
                      </div>
                    </div>

                    <pre className="mt-3 text-xs whitespace-pre-wrap bg-slate-800 border border-slate-700 p-2 rounded text-slate-200">
                      {r.ok ? JSON.stringify(r.data, null, 2) : JSON.stringify(r.error, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div> */}
      </div>
    </div>
  );
}
