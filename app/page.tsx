"use client"

import { useState, useEffect } from "react"
import InputForm from "./components/InputForm"
import OutputTable from "./components/OutputTable"
import AnimatedSection from "./components/AnimatedSection"
import SimulationHistory from "./components/SimulationHistory"
import { scheduleProcesses } from "./utils/schedulingAlgorithms"
import "./index.css"

export default function App() {
  const [currentPage, setCurrentPage] = useState("simulator")
  const [simulationHistory, setSimulationHistory] = useState([])
  const [results, setResults] = useState([])
  const [algorithm, setAlgorithm] = useState("fcfs")
  const [showWork, setShowWork] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [ganttChart, setGanttChart] = useState([])
  const [averages, setAverages] = useState({ averageTAT: 0, averageWT: 0 })
  const [quantum, setQuantum] = useState(2)
  const [userSessionId, setUserSessionId] = useState<string | null>(null)

  // Initialize userSessionId on client only
  useEffect(() => {
    let sessionId = localStorage.getItem("userSessionId")
    if (!sessionId) {
      sessionId = "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
      localStorage.setItem("userSessionId", sessionId)
    }
    setUserSessionId(sessionId)
  }, [])

  // Load simulation history from localStorage on userSessionId change
  useEffect(() => {
    if (!userSessionId) return

    try {
      const localHistory = localStorage.getItem(`simulationHistory_${userSessionId}`)
      if (localHistory) {
        const parsedHistory = JSON.parse(localHistory)
        setSimulationHistory(parsedHistory)
      }
    } catch (error) {
      console.error("Failed to load local simulation history:", error)
    }
  }, [userSessionId])

  // Save simulation history to localStorage
  const saveToLocalHistory = (newSimulation) => {
    try {
      const currentHistory = JSON.parse(localStorage.getItem(`simulationHistory_${userSessionId}`) || "[]")
      const updatedHistory = [newSimulation, ...currentHistory].slice(0, 10) // Keep only last 10
      localStorage.setItem(`simulationHistory_${userSessionId}`, JSON.stringify(updatedHistory))
      setSimulationHistory(updatedHistory)
    } catch (error) {
      console.error("Failed to save to local history:", error)
    }
  }

  const handleSubmit = async (selectedAlgorithm, jobs, quantum) => {
    setError(null)
    setIsLoading(true)
    setAlgorithm(selectedAlgorithm)
    setQuantum(quantum)

    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      const result = scheduleProcesses(selectedAlgorithm, jobs, quantum)

      const transformedResults = result.scheduledTasks.map((task) => {
        const pid = String.fromCharCode(64 + task.id)
        return {
          id: pid,
          arrivalTime: task.arrivalTime,
          burstTime: task.burstTime,
          startTime: task.startTime,
          finishTime: task.completionTime,
          turnaroundTime: task.turnaroundTime,
          waitingTime: task.waitingTime,
          priority: task.priority || undefined,
        }
      })

      const transformedGanttChart = result.ganttChart.map((segment) => ({
        processId: segment.id === null ? "IDLE" : String.fromCharCode(64 + segment.id),
        startTime: segment.startTime,
        endTime: segment.endTime,
        id: segment.id,
      }))

      setResults(transformedResults)
      setGanttChart(transformedGanttChart)
      setAverages({
        averageTAT: result.averageTAT,
        averageWT: result.averageWT,
      })

      // Save to local history with current timestamp
      const newSimulation = {
        id: Date.now(), // Use timestamp as ID
        timestamp: new Date().toISOString(), // Current local time
        algorithm: selectedAlgorithm,
        arrivalTimes: jobs.map((job) => job.arrivalTime).join(" "),
        burstTimes: jobs.map((job) => job.burstTime).join(" "),
        priorities: selectedAlgorithm === "priority" ? jobs.map((job) => job.priority).join(" ") : null,
        quantum: selectedAlgorithm === "rr" ? quantum : null,
        averages: {
          averageTAT: result.averageTAT,
          averageWT: result.averageWT,
        },
        ganttChart: transformedGanttChart,
        results: transformedResults,
      }

      saveToLocalHistory(newSimulation)
    } catch (e) {
      console.error("Scheduling failed:", e)
      setError("Failed to process scheduling: " + e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const loadFromHistory = (entry) => {
    setAlgorithm(entry.algorithm)
    setResults(entry.results)
    setGanttChart(entry.ganttChart)
    setAverages(entry.averages)
    setShowAnimation(true)
    setShowWork(true)
    setCurrentPage("simulator")
    setQuantum(entry.quantum)
  }

  const deleteFromHistory = (id) => {
    try {
      const updatedHistory = simulationHistory.filter((sim) => sim.id !== id)
      localStorage.setItem(`simulationHistory_${userSessionId}`, JSON.stringify(updatedHistory))
      setSimulationHistory(updatedHistory)
    } catch (error) {
      console.error("Failed to delete simulation:", error)
    }
  }

  if (!userSessionId) {
    // Render loading state while userSessionId initializes on client
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-6 bg-white min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">CPU Scheduling Simulator</h1>
        <button
          onClick={() => setCurrentPage(currentPage === "simulator" ? "history" : "simulator")}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          {currentPage === "simulator" ? "History" : "Back to Simulator"}
        </button>
      </div>

      {currentPage === "simulator" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <InputForm
                onSubmit={handleSubmit}
                showWork={showWork}
                showAnimation={showAnimation}
                onShowWorkChange={setShowWork}
                onShowAnimationChange={setShowAnimation}
                isLoading={isLoading}
              />
            </div>
            <div className="md:col-span-2">
              {results.length > 0 && (
                <OutputTable
                  algorithm={algorithm}
                  results={results}
                  showWork={showWork}
                  ganttChart={ganttChart}
                  averages={averages}
                />
              )}
            </div>
          </div>
          {results.length > 0 && showAnimation && (
            <div className="mt-8 -mx-6 px-0">
              <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
                <div className="px-6">
                  <AnimatedSection
                    results={results}
                    algorithm={algorithm}
                    quantum={quantum}
                    ganttChart={ganttChart}
                    hasRunSimulation={true}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <SimulationHistory
          history={simulationHistory}
          onLoadSimulation={loadFromHistory}
          onDeleteSimulation={deleteFromHistory}
        />
      )}
      {error && <p className="text-red-600 text-center mt-4">{error}</p>}
    </div>
  )
}
