"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Trash2, Eye } from "lucide-react"

export default function SimulationHistory({ history, onLoadSimulation, onDeleteSimulation }) {
  const formatDateTime = (timestamp) => {
    try {
      // Simple local date formatting
      const date = new Date(timestamp)

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid Date"
      }

      const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }

      return date.toLocaleDateString("en-US", options)
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid Date"
    }
  }

  const getAlgorithmDisplayName = (algorithm) => {
    switch (algorithm) {
      case "fcfs":
        return "FCFS"
      case "sjf":
        return "SJF"
      case "priority":
        return "Priority"
      case "rr":
        return "Round Robin"
      default:
        return algorithm.toUpperCase()
    }
  }

  if (history.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Simulation History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No simulations yet</h3>
            <p className="text-gray-500">Run your first CPU scheduling simulation to see it appear here.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Simulation History</CardTitle>
        <p className="text-gray-600">Your last {history.length} scheduling simulations (stored locally)</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date & Time</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Algorithm</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Arrival Times</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Burst Times</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Priority</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Quantum</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map((simulation, index) => (
                <tr key={simulation.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{index + 1}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{formatDateTime(simulation.timestamp)}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getAlgorithmDisplayName(simulation.algorithm)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 font-mono">{simulation.arrivalTimes}</td>
                  <td className="px-4 py-4 text-sm text-gray-700 font-mono">{simulation.burstTimes}</td>
                  <td className="px-4 py-4 text-sm text-gray-700 font-mono">{simulation.priorities || "—"}</td>
                  <td className="px-4 py-4 text-sm text-gray-700 font-mono">{simulation.quantum || "—"}</td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onLoadSimulation(simulation)}
                        className="flex items-center gap-1 hover:bg-blue-50 hover:border-blue-300"
                        title="Load this simulation"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteSimulation(simulation.id)}
                        className="flex items-center gap-1 hover:bg-red-50 hover:border-red-300 text-red-600 hover:text-red-700"
                        title="Delete this simulation"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {history.length === 10 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Only the last 10 simulations are kept in local history. Older simulations are
              automatically removed.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
