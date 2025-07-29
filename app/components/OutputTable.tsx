const OutputTable = ({ algorithm, results, ganttChart, showWork, averages }) => {
  if (!results || results.length === 0) return null

  // Use averages from backend if available, otherwise calculate locally
  const avgTurnaround =
    averages?.averageTAT || results.reduce((sum, job) => sum + job.turnaroundTime, 0) / results.length
  const avgWaiting = averages?.averageWT || results.reduce((sum, job) => sum + job.waitingTime, 0) / results.length

  const totalTurnaround = results.reduce((sum, job) => sum + job.turnaroundTime, 0)
  const totalWaiting = results.reduce((sum, job) => sum + job.waitingTime, 0)

  // Adjust table header labels for RR since finish times are not simply start + burst
  const finishLabel =
    algorithm === "rr" ? (showWork ? "Finish (F)" : "Finish Time") : showWork ? "Finish (F = S + B)" : "Finish Time"

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center p-6 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">{showWork ? "Calculations" : "Scheduling Results"}</h2>
        <div className="bg-gray-100 px-4 py-2 rounded-full">
          <span className="text-sm font-medium text-gray-700 uppercase">{algorithm}</span>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="px-6 pb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Gantt Chart</h3>
        <div className="p-4">
          <div className="flex mb-2 relative rounded-lg overflow-hidden border border-gray-200">
            {ganttChart.map((block, index) => {
              const totalTime = ganttChart[ganttChart.length - 1].endTime
              const segmentWidth = ((block.endTime - block.startTime) / totalTime) * 100

              // Check for idle blocks
              const isIdle = block.processId === "IDLE" || block.id === null || block.processId === null

              return (
                <div
                  key={`${block.processId || block.id || "IDLE"}-${index}`}
                  className="flex items-center justify-center border-r border-gray-300"
                  style={{
                    width: `${segmentWidth}%`,
                    height: "60px",
                    backgroundColor: isIdle ? "#f3f4f6" : "#eff6ff",
                    borderRight: index === ganttChart.length - 1 ? "none" : "1px solid #d1d5db",
                  }}
                >
                  <span
                    className="font-semibold text-sm"
                    style={{
                      color: isIdle ? "#7c828f" : "#000000",
                    }}
                  >
                    {isIdle ? "IDLE" : block.processId || String.fromCharCode(64 + block.id)}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Time markers */}
          <div className="relative w-full text-xs font-medium text-gray-600 mt-1">
            <div className="absolute left-0 -top-1">0</div>
            {ganttChart.map((block, index) => {
              const totalTime = ganttChart[ganttChart.length - 1].endTime
              const leftOffset = (block.endTime / totalTime) * 100
              return (
                <div
                  key={`time-${block.processId}-${index}`}
                  className="absolute -top-1"
                  style={{ left: `${leftOffset}%`, transform: "translateX(-50%)" }}
                >
                  {block.endTime}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Process Details */}
      <div className="px-6 pb-2">
        <h3 className="text-lg font-semibold text-gray-900">Process Details</h3>
      </div>

      {/* Table */}
      <div className="px-6 pb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-gray-700">
                <th className="px-4 py-3 text-left text-sm font-semibold">Job</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Arrival {showWork ? "(A)" : "Time"}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Burst {showWork ? "(B)" : "Time"}</th>
                {algorithm === "priority" && <th className="px-4 py-3 text-left text-sm font-semibold">Priority</th>}
                {showWork && <th className="px-4 py-3 text-left text-sm font-semibold">Start (S)</th>}
                <th className="px-4 py-3 text-left text-sm font-semibold">{finishLabel}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  {showWork ? "TAT (F - A)" : "Turnaround Time"}
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  {showWork ? "WT (TAT - B)" : "Waiting Time"}
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((job) => (
                <tr key={job.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{job.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{job.arrivalTime}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{job.burstTime}</td>
                  {algorithm === "priority" && <td className="px-4 py-3 text-sm text-gray-700">{job.priority}</td>}
                  {showWork && <td className="px-4 py-3 text-sm text-gray-700">{job.startTime}</td>}
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {showWork
                      ? algorithm === "rr"
                        ? job.finishTime
                        : `${job.startTime} + ${job.burstTime} = ${job.finishTime}`
                      : job.finishTime}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {showWork ? `${job.finishTime} - ${job.arrivalTime} = ${job.turnaroundTime}` : job.turnaroundTime}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {showWork ? `${job.turnaroundTime} - ${job.burstTime} = ${job.waitingTime}` : job.waitingTime}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-gray-300 bg-gray-50">
                <td
                  colSpan={showWork ? (algorithm === "priority" ? 6 : 5) : algorithm === "priority" ? 5 : 4}
                  className="px-4 py-4 text-right text-sm font-semibold text-gray-700"
                >
                  Average
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                  {totalTurnaround} / {results.length} = {avgTurnaround.toFixed(2)}
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                  {totalWaiting} / {results.length} = {avgWaiting.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default OutputTable
