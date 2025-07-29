"use client"

import { useRef, useState, useEffect, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, Html, Box, Sphere, Cylinder } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

function ProcessAvatar({ position, process, isActive, algorithm, currentTime, quantum, isMoving, ganttChart }) {
  const group = useRef()

  useFrame((state) => {
    if (!group.current) return

    if (isActive) {
      group.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1)
    } else {
      group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.05
    }

    if (isMoving) {
      const targetX = position[0]
      const targetZ = position[2]
      const currentX = group.current.position.x
      const currentZ = group.current.position.z
      const speed = 0.08

      group.current.position.x += (targetX - currentX) * speed
      group.current.position.z += (targetZ - currentZ) * speed
    } else {
      group.current.position.x = position[0]
      group.current.position.z = position[2]
    }
  })

  const getTagContent = () => {
    switch (algorithm) {
      case "fcfs":
        return `Player ${process.id}\nBurst: ${process.burstTime}s`
      case "rr":
        const processBlocks = ganttChart.filter((block) => block.processId === process.id)
        let executedTime = 0
        for (const block of processBlocks) {
          if (block.startTime >= currentTime) {
            continue
          }
          if (currentTime > block.endTime) {
            executedTime += block.endTime - block.startTime
          } else if (currentTime >= block.startTime) {
            executedTime += currentTime - block.startTime
          }
        }
        const remainingBurstTime = Math.max(0, process.burstTime - executedTime)
        return `Player ${process.id}\n Time Left: ${remainingBurstTime}s`
      case "priority":
        return `Player ${process.id}\nBurst: ${process.burstTime}s`
      case "sjf":
        return `Player ${process.id}\nBurst: ${process.burstTime}s`
      default:
        return `Player ${process.id}\nReady`
    }
  }

  const getProcessColor = (processId) => {
    const colorMap = {
      A: "#f87171",
      B: "#fb923c",
      C: "#facc15",
      D: "#4ade80",
      E: "#60a5fa",
      F: "#a78bfa",
      G: "#f472b6",
      H: "#818cf8",
      I: "#34d399",
      J: "#fbbf24",
    }
    return colorMap[process.id] || "#9ca3af"
  }

  const processColor = getProcessColor(process.id)

  return (
    <group ref={group} position={position}>
      <Cylinder args={[0.15, 0.2, 0.6]} position={[0, 0, 0]}>
        <meshStandardMaterial color={processColor} />
      </Cylinder>
      <Sphere args={[0.15]} position={[0, 0.45, 0]}>
        <meshStandardMaterial color={processColor} />
      </Sphere>
      <Html position={[0, 0.9, 0]} center>
        <div
          className="bg-white bg-opacity-95 px-2 py-1 rounded shadow-lg border border-gray-200 text-center font-bold whitespace-pre-line"
          style={{ fontSize: "10px", lineHeight: "1.2", width: "85px" }}
        >
          {getTagContent()}
        </div>
      </Html>
    </group>
  )
}

function DynamicGanttChart({ ganttChart, currentTime, visualTime, isSimulationComplete, maxTime: propMaxTime }) {
  if (!ganttChart || ganttChart.length === 0) return null

  const maxTime = propMaxTime || Math.max(...ganttChart.map((block) => block.endTime))

  const generateTimeMarkers = () => {
    const markers = new Set()
    markers.add(0)
    ganttChart.forEach((block) => {
      markers.add(block.startTime)
      markers.add(block.endTime)
    })
    return Array.from(markers).sort((a, b) => a - b)
  }

  const timeMarkers = generateTimeMarkers()

  const getProcessColor = (processId) => {
    if (processId === "IDLE") return { bg: "bg-gray-100", progress: "bg-gray-400", text: "text-black" }
    const colorMap = {
      A: { bg: "bg-red-200", progress: "bg-red-600", text: "text-black" },
      B: { bg: "bg-orange-200", progress: "bg-orange-600", text: "text-black" },
      C: { bg: "bg-yellow-200", progress: "bg-yellow-600", text: "text-black" },
      D: { bg: "bg-green-200", progress: "bg-green-600", text: "text-black" },
      E: { bg: "bg-blue-200", progress: "bg-blue-600", text: "text-black" },
      F: { bg: "bg-purple-200", progress: "bg-purple-600", text: "text-black" },
      G: { bg: "bg-pink-200", progress: "bg-pink-600", text: "text-black" },
      H: { bg: "bg-indigo-200", progress: "bg-indigo-600", text: "text-black" },
      I: { bg: "bg-teal-200", progress: "bg-teal-600", text: "text-black" },
      J: { bg: "bg-cyan-200", progress: "bg-cyan-600", text: "text-black" },
    }
    return colorMap[processId] || { bg: "bg-gray-200", progress: "bg-gray-600", text: "text-black" }
  }

  const timeForProgress = Math.max(
    0,
    isSimulationComplete ? maxTime : visualTime !== undefined ? visualTime : currentTime,
  )

  return (
    <div className="w-full mx-auto p-3 bg-white rounded-lg border shadow-sm">
      <h4 className="text-sm font-semibold mb-2">Gantt Chart</h4>
      <div className="relative">
        <div className="overflow-x-auto">
          <div
            className="flex border rounded overflow-hidden h-8 bg-gray-50"
            style={{ minWidth: `${Math.max(800, maxTime * 60)}px`, width: "100%" }}
          >
            {ganttChart.map((block, index) => {
              const duration = block.endTime - block.startTime
              const blockWidth = (duration / maxTime) * 100

              let visibleWidth = 0
              if (timeForProgress >= block.endTime) {
                visibleWidth = blockWidth
              } else if (timeForProgress > block.startTime) {
                const progressInBlock = timeForProgress - block.startTime
                visibleWidth = (progressInBlock / maxTime) * 100
              }

              const colors = getProcessColor(block.processId)

              return (
                <div
                  key={`${block.processId}-${index}`}
                  className="relative border-r border-gray-300 flex-shrink-0"
                  style={{
                    width: `${blockWidth}%`,
                    minWidth: `${Math.max(40, duration * 40)}px`,
                  }}
                >
                  <div className={`absolute inset-0 ${colors.bg}`} />
                  <div
                    className={`absolute inset-0 transition-all duration-300 ${colors.progress}`}
                    style={{ width: `${Math.min(100, (visibleWidth / blockWidth) * 100)}%` }}
                  />
                  <div
                    className={`absolute inset-0 flex items-center justify-center text-sm font-bold z-10 ${colors.text}`}
                  >
                    {block.processId}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="overflow-x-auto">
          <div
            className="relative h-6"
            style={{
              minWidth: `${Math.max(800, maxTime * 60)}px`,
              paddingLeft: "12px",
              paddingRight: "12px",
            }}
          >
            {timeMarkers.map((time, index) => {
              let leftPosition = `${(time / maxTime) * 100}%`
              let transform = "translateX(-50%)"

              if (index === 0) {
                leftPosition = "0px"
                transform = "translateX(0%)"
              } else if (index === timeMarkers.length - 1) {
                leftPosition = "100%"
                transform = "translateX(-100%)"
              }

              return (
                <div
                  key={`time-${time}`}
                  className="absolute text-sm font-medium text-gray-800"
                  style={{ left: leftPosition, transform: transform, top: 0 }}
                >
                  {time}
                </div>
              )
            })}
          </div>
        </div>
        <div className="relative mt-2 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-700">Current Time: {timeForProgress}s</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ArcadeMachine({ position, currentProcess, algorithm, isSimulationComplete, hasStarted, isIdle, quantum }) {
  const group = useRef()

  const getDisplayContent = () => {
    if (!hasStarted) {
      return "ARCADE"
    }
    if (isSimulationComplete) {
      return "GAME OVER"
    }
    if (isIdle) {
      return "IDLE"
    }
    if (currentProcess && currentProcess.id) {
      if (algorithm === "rr") {
        return `Player Turn: ${currentProcess.id}\nQuantum: ${quantum}`
      }
      return `Player Turn: ${currentProcess.id}`
    }
    return "ARCADE"
  }

  return (
    <group ref={group} position={position}>
      <Box args={[1.2, 2.2, 0.8]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#2d3748" />
      </Box>
      <Box args={[0.9, 0.7, 0.1]} position={[0, 0.5, 0.45]}>
        <meshStandardMaterial color="#1a202c" />
      </Box>
      <Html position={[0, 0.5, 0.5]} center>
        <div
          className="relative bg-gray-900 rounded border border-green-500 overflow-hidden flex items-center justify-center"
          style={{ width: "160px", height: "160px" }}
        >
          {isIdle ? (
            <div className="w-full h-full bg-black"></div>
          ) : isSimulationComplete ? (
            <div className="w-full h-full bg-black relative flex items-center justify-center">
              <img
                src="/game-over.gif"
                alt="Game Over"
                className="w-full h-full object-contain"
                style={{
                  imageRendering: "pixelated",
                }}
              />
            </div>
          ) : (
            <div className="w-full h-full bg-black flex items-center justify-center">
              <img
                src="/playing.gif"
                alt="Playing"
                className="w-full h-full object-fill"
                style={{
                  imageRendering: "pixelated",
                }}
              />
            </div>
          )}
        </div>
      </Html>
      <Html position={[0, 1.8, 0.5]} center>
        <div
          className="bg-gray-900 text-green-400 p-2 rounded border border-green-500 text-center font-bold"
          style={{
            fontSize: "16px",
            lineHeight: "1.2",
            width: "180px",
            fontWeight: "bold",
            fontFamily: "'Courier New', monospace",
            textShadow: "0 0 10px #4ade80",
            whiteSpace: "pre-line",
            overflow: "hidden",
          }}
        >
          {getDisplayContent()}
        </div>
      </Html>
      <Box args={[1.0, 0.25, 0.4]} position={[0, -0.3, 0.6]}>
        <meshStandardMaterial color="#1a202c" />
      </Box>
      <group position={[-0.3, -0.3, 0.8]}>
        <Cylinder args={[0.05, 0.05, 0.1]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#111111" />
        </Cylinder>
        <Sphere args={[0.03]} position={[0, 0.08, 0]}>
          <meshStandardMaterial color="#dc2626" />
        </Sphere>
      </group>
      {[0.1, 0.25, 0.4].map((x, i) => (
        <Cylinder key={i} args={[0.04, 0.04, 0.02]} position={[x, -0.3, 0.8]}>
          <meshStandardMaterial color={["#dc2626", "#16a34a", "#2563eb"][i]} />
        </Cylinder>
      ))}
      <Box args={[1.4, 0.3, 1.0]} position={[0, -1.25, 0]}>
        <meshStandardMaterial color="#374151" />
      </Box>
    </group>
  )
}

function SchedulingScene({ results, algorithm, quantum, onTimeChange, currentTime, isPaused, ganttChart }) {
  const [processQueue, setProcessQueue] = useState([])
  const [currentProcess, setCurrentProcess] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isSimulationComplete, setIsSimulationComplete] = useState(false)
  const [maxTime, setMaxTime] = useState(0)
  const [simulationStarted, setSimulationStarted] = useState(false)

  useEffect(() => {
    if (results && results.length > 0) {
      const queue = results.map((process) => ({
        ...process,
        hasArrived: false,
        isCompleted: false,
      }))
      setProcessQueue(queue)
      setIsRunning(true)
      setIsSimulationComplete(false)
      setSimulationStarted(false)

      const lastFinishTime = Math.max(...results.map((r) => r.finishTime))
      setMaxTime(lastFinishTime)
    }
  }, [results, algorithm, quantum])

  useEffect(() => {
    if (!results || results.length === 0 || !ganttChart) return

    // Add a 2-second delay before starting the simulation
    if (currentTime >= 2 && !simulationStarted) {
      setSimulationStarted(true)
    }

    const adjustedTime = simulationStarted ? currentTime - 2 : 0

    setProcessQueue((prevQueue) => {
      return prevQueue.map((process) => ({
        ...process,
        hasArrived: process.arrivalTime <= adjustedTime,
        isCompleted: process.finishTime <= adjustedTime,
      }))
    })

    const currentBlock = ganttChart.find((block) => block.startTime <= adjustedTime && adjustedTime < block.endTime)

    if (currentBlock && currentBlock.processId !== "IDLE" && simulationStarted) {
      const process = results.find((p) => p.id === currentBlock.processId)
      setCurrentProcess(process)
    } else {
      setCurrentProcess(null)
    }

    const allProcessesCompleted = results.every((process) => process.finishTime <= adjustedTime)
    setIsSimulationComplete(allProcessesCompleted && adjustedTime >= maxTime && simulationStarted)
  }, [currentTime, results, ganttChart, maxTime, simulationStarted])

  useEffect(() => {
    if (!isRunning || isPaused || isSimulationComplete) return

    const timer = setInterval(() => {
      onTimeChange((prevTime) => {
        const adjustedMaxTime = maxTime + 2 // Add 2 seconds for initial delay
        if (prevTime >= adjustedMaxTime) {
          return prevTime
        }
        return prevTime + 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning, isPaused, maxTime, onTimeChange, isSimulationComplete])

  const getProcessPosition = (index, isActive, process) => {
    if (isActive) {
      return [0, 0.5, 1.8]
    }
    // Bring the queue closer to the arcade machine and reduce spacing
    const spacing = 0.6 // Reduced from 0.8
    const startX = -1.8 // Moved closer from -2.5
    return [startX - index * spacing, 0.5, 0]
  }

  const getQueueOrder = () => {
    if (!simulationStarted) {
      return processQueue.filter((p) => p.hasArrived && !p.isCompleted)
    }

    const adjustedTime = currentTime - 2

    if (algorithm === "rr") {
      const arrivedProcesses = processQueue.filter((p) => p.hasArrived && !p.isCompleted)
      if (arrivedProcesses.length === 0) return []

      const upcomingBlocks = ganttChart
        .filter((block) => block.startTime > adjustedTime && block.processId !== "IDLE")
        .sort((a, b) => a.startTime - b.startTime)

      const queueOrder = []
      const processesInQueue = new Set()

      for (const block of upcomingBlocks) {
        if (!processesInQueue.has(block.processId)) {
          const process = arrivedProcesses.find((p) => p.id === block.processId)
          if (process && process.id !== currentProcess?.id) {
            queueOrder.push(process)
            processesInQueue.add(block.processId)
          }
        }
      }

      for (const process of arrivedProcesses) {
        if (!processesInQueue.has(process.id) && process.id !== currentProcess?.id) {
          queueOrder.push(process)
        }
      }

      return queueOrder
    } else {
      return processQueue.filter((p) => p.hasArrived && !p.isCompleted && p.id !== currentProcess?.id)
    }
  }

  const queuedProcesses = getQueueOrder()
  const isIdle = !currentProcess && processQueue.some((p) => !p.hasArrived && !p.isCompleted)
  const hasStarted = results && results.length > 0 && algorithm

  return (
    <>
      <color attach="background" args={["#f1f5f9"]} />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <ArcadeMachine
        position={[0, 0.5, 0]}
        currentProcess={currentProcess}
        algorithm={algorithm}
        isSimulationComplete={isSimulationComplete}
        hasStarted={hasStarted}
        isIdle={isIdle}
        quantum={quantum}
      />

      {currentProcess && (
        <ProcessAvatar
          key={`active-${currentProcess.id}`}
          position={getProcessPosition(0, true, currentProcess)}
          process={currentProcess}
          isActive={true}
          algorithm={algorithm}
          currentTime={simulationStarted ? currentTime - 2 : 0}
          quantum={quantum}
          isMoving={true}
          ganttChart={ganttChart}
        />
      )}

      {queuedProcesses.map((process, index) => (
        <ProcessAvatar
          key={process.id}
          position={getProcessPosition(index, false, process)}
          process={process}
          isActive={false}
          algorithm={algorithm}
          currentTime={simulationStarted ? currentTime - 2 : 0}
          quantum={quantum}
          isMoving={true}
          ganttChart={ganttChart}
        />
      ))}

      <mesh position={[0, -0.7, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#f1f5f9" transparent opacity={0.5} />
      </mesh>

      <Environment preset="city" />

      <Html position={[0, -3, 0]} center>
        <DynamicGanttChart
          ganttChart={ganttChart}
          currentTime={simulationStarted ? currentTime - 2 : 0}
          visualTime={simulationStarted ? currentTime - 2 : 0}
          isSimulationComplete={isSimulationComplete}
          maxTime={maxTime}
        />
      </Html>
    </>
  )
}

function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center text-blue-500 bg-white bg-opacity-80 p-5 rounded-lg">
        <div>Loading CPU Scheduling Visualization...</div>
        <div className="w-8 h-8 mt-2 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    </Html>
  )
}

export default function AnimatedSection({
  results = [],
  algorithm = "",
  quantum = 2,
  hasRunSimulation = false,
  ganttChart = [],
}) {
  const [currentTime, setCurrentTime] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [maxTime, setMaxTime] = useState(0)
  const [timeSteps, setTimeSteps] = useState([])
  const [sceneKey, setSceneKey] = useState(0)

  useEffect(() => {
    if (ganttChart && ganttChart.length > 0) {
      const times = new Set([0])
      ganttChart.forEach((block) => {
        times.add(block.startTime)
        times.add(block.endTime)
      })
      const sortedTimes = Array.from(times).sort((a, b) => a - b)
      setTimeSteps(sortedTimes)
    }
  }, [ganttChart])

  useEffect(() => {
    if (results && results.length > 0) {
      const lastFinishTime = Math.max(...results.map((r) => r.finishTime))
      setMaxTime(lastFinishTime)
      setCurrentTime(0)
      setIsPaused(false)
    }
  }, [results])

  useEffect(() => {
    const handleKeyPress = (event) => {
      const activeElement = document.activeElement
      const isInputFocused =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.tagName === "SELECT")

      if (!hasRunSimulation || isInputFocused) return

      switch (event.code) {
        case "Space":
          event.preventDefault()
          setIsPaused((prev) => !prev)
          break
        case "ArrowLeft":
          event.preventDefault()
          handleStepBack()
          break
        case "ArrowRight":
          event.preventDefault()
          handleStepForward()
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [hasRunSimulation, timeSteps, currentTime, maxTime])

  const handlePauseToggle = () => {
    setIsPaused((prev) => !prev)
  }

  const handleStepBack = () => {
    if (timeSteps.length === 0) return

    const adjustedCurrentTime = Math.max(0, currentTime - 2)
    const previousSteps = timeSteps.filter((time) => time < adjustedCurrentTime)
    if (previousSteps.length > 0) {
      const previousTime = Math.max(...previousSteps)
      setCurrentTime(previousTime + 2)
    } else {
      setCurrentTime(0)
    }
  }

  const handleStepForward = () => {
    if (timeSteps.length === 0) return

    const adjustedCurrentTime = Math.max(0, currentTime - 2)
    const nextSteps = timeSteps.filter((time) => time > adjustedCurrentTime)
    if (nextSteps.length > 0) {
      const nextTime = Math.min(...nextSteps)
      setCurrentTime(nextTime + 2)
    } else if (adjustedCurrentTime < maxTime) {
      setCurrentTime(maxTime + 2)
    }
  }

  const handleRestart = () => {
    setCurrentTime(0)
    setIsPaused(false)
    setSceneKey((prev) => prev + 1)
  }

  const getAlgorithmDisplayName = () => {
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
        return "Ready"
    }
  }

  const getSimulationStatus = () => {
    const adjustedMaxTime = maxTime + 2
    const isComplete = currentTime >= adjustedMaxTime && adjustedMaxTime > 2
    if (isComplete) {
      return "Completed"
    } else if (isPaused) {
      return "Paused"
    } else {
      return "Running"
    }
  }

  return (
    <Card className="p-6 border border-[#e4e4ec] bg-white rounded-lg w-full">
      <div className="mb-0">
        <h3 className="text-2xl font-semibold mb-0">Animation</h3>
      </div>

      <div className="w-full h-[600px] md:h-[700px] lg:h-[800px] border-2 rounded-lg relative focus:outline-none bg-[#f9f9fc] border-[#e4e4ec]">
        <Canvas shadows camera={{ position: [0, 3, 5], fov: 50 }} className="rounded-lg">
          <Suspense fallback={<Loader />}>
            <SchedulingScene
              key={sceneKey}
              results={results}
              algorithm={algorithm}
              quantum={quantum}
              onTimeChange={setCurrentTime}
              currentTime={currentTime}
              isPaused={isPaused}
              ganttChart={ganttChart}
            />
          </Suspense>
        </Canvas>

        <div className="absolute top-4 left-4 flex gap-2">
          <Button
            variant="outline"
            className="border-[#e4e4ec] text-black bg-transparent"
            size="sm"
            onClick={handleStepBack}
            title="Previous Process Turn (Left Arrow)"
            disabled={timeSteps.length === 0}
          >
            ⬅️
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-[#e4e4ec] text-black bg-transparent"
            onClick={handlePauseToggle}
            title={isPaused ? "Play (Spacebar)" : "Pause (Spacebar)"}
            disabled={!hasRunSimulation}
          >
            {isPaused ? "▶️" : "⏸️"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-[#e4e4ec] text-black bg-transparent"
            onClick={handleStepForward}
            title="Next Process Turn (Right Arrow)"
            disabled={timeSteps.length === 0}
          >
            ➡️
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestart}
            title="Restart"
            disabled={!hasRunSimulation}
            className="border-[#e4e4ec] bg-transparent"
          >
            🔄
          </Button>
        </div>

        <div className="absolute top-4 right-4 bg-white bg-opacity-90 p-2 rounded-lg shadow-lg border border-gray-200">
          <div className="text-sm font-medium">{getAlgorithmDisplayName()}</div>
          <div className="text-xs text-gray-500">{getSimulationStatus()}</div>
        </div>
      </div>
    </Card>
  )
}
