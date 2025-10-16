
import  { useState, useMemo } from "react"

export default function DropCostCalculator() {
  const [pricePer1000, setPricePer1000] = useState<number>(1.2)
  const [dropPercent, setDropPercent] = useState<number>(30)
  const [desiredCount, setDesiredCount] = useState<number>(1000)
  const [profitPercent, setProfitPercent] = useState<number>(20)
  

  const unitPrice = useMemo(() => pricePer1000 / 1000, [pricePer1000])

  const requiredQuantity = useMemo(() => {
    const surviveRate = 1 - dropPercent / 100
    if (surviveRate <= 0) return 0
    return Math.ceil(desiredCount / surviveRate)
  }, [desiredCount, dropPercent])

  const totalCost = useMemo(() => {
    return +(requiredQuantity * unitPrice).toFixed(6)
  }, [requiredQuantity, unitPrice])

  const extraCost = useMemo(() => {
    return +(totalCost - pricePer1000).toFixed(6)
  }, [totalCost, pricePer1000])

  const percentIncrease = useMemo(() => {
    if (pricePer1000 === 0) return 0
    return +(((totalCost - pricePer1000) / pricePer1000) * 100).toFixed(2)
  }, [totalCost, pricePer1000])

  const finalPriceWithProfit = useMemo(() => {
    return +(totalCost * (1 + profitPercent / 100)).toFixed(6)
  }, [totalCost, profitPercent])

 

  return (
    <div className="min-h-screen bg-[#0b1020] text-white p-6">
      <div className="max-w-4xl mx-auto bg-[#111324] rounded-2xl shadow-lg border border-[#232636] overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Drop Compensation & Pricing Calculator</h1>
          <p className="text-sm text-gray-300 mb-6">Enter your cost, expected drop rate and desired final units. Calculator shows how many items to send, resulting cost and final price after profit.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col">
              <span className="text-sm text-gray-300 mb-1">Price for 1000 units (USD)</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={pricePer1000}
                onChange={(e) => setPricePer1000(Number(e.target.value))}
                className="bg-[#0f1724] border border-[#2b3040] rounded-md p-2 outline-none"
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-gray-300 mb-1">Expected drop rate (%)</span>
              <input
               
                step="0.1"
                min="0"
                max="99.9"
                value={dropPercent}
                onChange={(e) => setDropPercent(Number(e.target.value))}
                className="bg-[#0f1724] border border-[#2b3040] rounded-md p-2 outline-none"
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-gray-300 mb-1">Desired final units</span>
              <input
              disabled
                type="number"
                step="1"
                min="1"
                value={desiredCount}
                onChange={(e) => setDesiredCount(Number(e.target.value))}
                className="bg-[#0f1724] border border-[#2b3040] rounded-md p-2 outline-none"
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-gray-300 mb-1">Profit margin (%)</span>
              <input
                type="number"
                step="0.1"
                min="0"
                value={profitPercent}
                onChange={(e) => setProfitPercent(Number(e.target.value))}
                className="bg-[#0f1724] border border-[#2b3040] rounded-md p-2 outline-none"
              />
            </label>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0f1724] border border-[#2b3040] rounded-lg p-4">
              <h3 className="font-semibold mb-2">Calculation</h3>
              <div className="text-sm text-gray-300 space-y-2">
                <div className="flex justify-between"><span>Unit price (1 piece)</span><span>${unitPrice.toFixed(6)}</span></div>
                <div className="flex justify-between"><span>Required to send</span><span>{requiredQuantity.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Total cost (based on sent quantity)</span><span>${totalCost.toFixed(6)}</span></div>
                <div className="flex justify-between"><span>Original 1000-cost</span><span>${pricePer1000.toFixed(6)}</span></div>
                <div className="flex justify-between"><span>Extra cost</span><span>${extraCost.toFixed(6)}</span></div>
                <div className="flex justify-between"><span>Increase %</span><span>{percentIncrease}%</span></div>
              </div>

              
            </div>

            <div className="bg-[#0f1724] border border-[#2b3040] rounded-lg p-4">
              <h3 className="font-semibold mb-2">Pricing with Profit</h3>
              <div className="text-sm text-gray-300 space-y-2">
                <div className="flex justify-between"><span>Profit %</span><span>{profitPercent}%</span></div>
                <div className="flex justify-between"><span>Final price (total)</span><span>${finalPriceWithProfit.toFixed(6)}</span></div>
                <div className="flex justify-between"><span>Final price (per 1000 units equivalent)</span>
                  <span>${(finalPriceWithProfit).toFixed(6)}</span>
                </div>
                <div className="flex justify-between"><span>Final price (per unit)</span><span>${(finalPriceWithProfit / requiredQuantity).toFixed(6)}</span></div>
              </div>

              
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
