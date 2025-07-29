interface Process {
  id: string
  arrivalTime: number
  burstTime: number
  priority?: number
}

interface ScheduledTask {
  id: number
  arrivalTime: number
  burstTime: number
  startTime: number
  completionTime: number
  turnaroundTime: number
  waitingTime: number
  priority?: number
}

interface GanttBlock {
  id: number | null
  startTime: number
  endTime: number
}

interface SchedulingResult {
  scheduledTasks: ScheduledTask[]
  ganttChart: GanttBlock[]
  averageTAT: number
  averageWT: number
}

export function scheduleProcesses(algorithm: string, processes: Process[], quantum = 2): SchedulingResult {
  // Convert process IDs to numbers (A=1, B=2, etc.)
  const numericProcesses = processes.map((p) => ({
    ...p,
    id: p.id.charCodeAt(0) - 64,
  }))

  switch (algorithm) {
    case "fcfs":
      return scheduleFCFS(numericProcesses)
    case "sjf":
      return scheduleSJF(numericProcesses)
    case "priority":
      return schedulePriority(numericProcesses)
    case "rr":
      return scheduleRoundRobin(numericProcesses, quantum)
    default:
      throw new Error(`Unknown algorithm: ${algorithm}`)
  }
}

function scheduleFCFS(processes: any[]): SchedulingResult {
  const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime)
  const scheduledTasks: ScheduledTask[] = []
  const ganttChart: GanttBlock[] = []
  let currentTime = 0

  for (const process of sortedProcesses) {
    // Add idle time if needed
    if (currentTime < process.arrivalTime) {
      ganttChart.push({
        id: null,
        startTime: currentTime,
        endTime: process.arrivalTime,
      })
      currentTime = process.arrivalTime
    }

    const startTime = currentTime
    const completionTime = startTime + process.burstTime
    const turnaroundTime = completionTime - process.arrivalTime
    const waitingTime = turnaroundTime - process.burstTime

    scheduledTasks.push({
      id: process.id,
      arrivalTime: process.arrivalTime,
      burstTime: process.burstTime,
      startTime,
      completionTime,
      turnaroundTime,
      waitingTime,
      priority: process.priority,
    })

    ganttChart.push({
      id: process.id,
      startTime,
      endTime: completionTime,
    })

    currentTime = completionTime
  }

  const averageTAT = scheduledTasks.reduce((sum, task) => sum + task.turnaroundTime, 0) / scheduledTasks.length
  const averageWT = scheduledTasks.reduce((sum, task) => sum + task.waitingTime, 0) / scheduledTasks.length

  return {
    scheduledTasks,
    ganttChart,
    averageTAT,
    averageWT,
  }
}

function scheduleSJF(processes: any[]): SchedulingResult {
  const scheduledTasks: ScheduledTask[] = []
  const ganttChart: GanttBlock[] = []
  const remainingProcesses = [...processes]
  let currentTime = 0

  while (remainingProcesses.length > 0) {
    // Get processes that have arrived
    const availableProcesses = remainingProcesses.filter((p) => p.arrivalTime <= currentTime)

    if (availableProcesses.length === 0) {
      // No process available, jump to next arrival time
      const nextArrival = Math.min(...remainingProcesses.map((p) => p.arrivalTime))
      ganttChart.push({
        id: null,
        startTime: currentTime,
        endTime: nextArrival,
      })
      currentTime = nextArrival
      continue
    }

    // Select process with shortest burst time
    const selectedProcess = availableProcesses.reduce((shortest, current) =>
      current.burstTime < shortest.burstTime ? current : shortest,
    )

    const startTime = currentTime
    const completionTime = startTime + selectedProcess.burstTime
    const turnaroundTime = completionTime - selectedProcess.arrivalTime
    const waitingTime = turnaroundTime - selectedProcess.burstTime

    scheduledTasks.push({
      id: selectedProcess.id,
      arrivalTime: selectedProcess.arrivalTime,
      burstTime: selectedProcess.burstTime,
      startTime,
      completionTime,
      turnaroundTime,
      waitingTime,
      priority: selectedProcess.priority,
    })

    ganttChart.push({
      id: selectedProcess.id,
      startTime,
      endTime: completionTime,
    })

    currentTime = completionTime
    remainingProcesses.splice(remainingProcesses.indexOf(selectedProcess), 1)
  }

  const averageTAT = scheduledTasks.reduce((sum, task) => sum + task.turnaroundTime, 0) / scheduledTasks.length
  const averageWT = scheduledTasks.reduce((sum, task) => sum + task.waitingTime, 0) / scheduledTasks.length

  return {
    scheduledTasks,
    ganttChart,
    averageTAT,
    averageWT,
  }
}

function schedulePriority(processes: any[]): SchedulingResult {
  const scheduledTasks: ScheduledTask[] = []
  const ganttChart: GanttBlock[] = []
  const remainingProcesses = [...processes]
  let currentTime = 0

  while (remainingProcesses.length > 0) {
    // Get processes that have arrived
    const availableProcesses = remainingProcesses.filter((p) => p.arrivalTime <= currentTime)

    if (availableProcesses.length === 0) {
      // No process available, jump to next arrival time
      const nextArrival = Math.min(...remainingProcesses.map((p) => p.arrivalTime))
      ganttChart.push({
        id: null,
        startTime: currentTime,
        endTime: nextArrival,
      })
      currentTime = nextArrival
      continue
    }

    // Select process with highest priority (lower number = higher priority)
    const selectedProcess = availableProcesses.reduce((highest, current) =>
      current.priority < highest.priority ? current : highest,
    )

    const startTime = currentTime
    const completionTime = startTime + selectedProcess.burstTime
    const turnaroundTime = completionTime - selectedProcess.arrivalTime
    const waitingTime = turnaroundTime - selectedProcess.burstTime

    scheduledTasks.push({
      id: selectedProcess.id,
      arrivalTime: selectedProcess.arrivalTime,
      burstTime: selectedProcess.burstTime,
      startTime,
      completionTime,
      turnaroundTime,
      waitingTime,
      priority: selectedProcess.priority,
    })

    ganttChart.push({
      id: selectedProcess.id,
      startTime,
      endTime: completionTime,
    })

    currentTime = completionTime
    remainingProcesses.splice(remainingProcesses.indexOf(selectedProcess), 1)
  }

  const averageTAT = scheduledTasks.reduce((sum, task) => sum + task.turnaroundTime, 0) / scheduledTasks.length
  const averageWT = scheduledTasks.reduce((sum, task) => sum + task.waitingTime, 0) / scheduledTasks.length

  return {
    scheduledTasks,
    ganttChart,
    averageTAT,
    averageWT,
  }
}

function scheduleRoundRobin(processes: any[], quantum: number): SchedulingResult {
  const scheduledTasks: ScheduledTask[] = []
  const ganttChart: GanttBlock[] = []
  const processQueue: any[] = []
  const processInfo = new Map()

  // Initialize process info
  processes.forEach((p) => {
    processInfo.set(p.id, {
      ...p,
      remainingTime: p.burstTime,
      startTime: -1,
      completionTime: -1,
      inQueue: false,
    })
  })

  let currentTime = 0
  let currentProcess = null
  let timeSliceRemaining = 0

  while (processInfo.size > 0 || currentProcess !== null) {
    // Add newly arrived processes to queue
    processes.forEach((p) => {
      const info = processInfo.get(p.id)
      if (
        info &&
        p.arrivalTime <= currentTime &&
        !info.inQueue &&
        info.remainingTime > 0 &&
        p.id !== currentProcess?.id
      ) {
        processQueue.push(p.id)
        info.inQueue = true
      }
    })

    // If no current process, get next from queue
    if (currentProcess === null && processQueue.length > 0) {
      const nextProcessId = processQueue.shift()
      currentProcess = processes.find((p) => p.id === nextProcessId)
      const info = processInfo.get(nextProcessId)
      info.inQueue = false
      timeSliceRemaining = quantum

      if (info.startTime === -1) {
        info.startTime = currentTime
      }
    }

    if (currentProcess === null) {
      // No process to run, advance time to next arrival
      const nextArrival = Math.min(
        ...Array.from(processInfo.values())
          .filter((info) => info.remainingTime > 0)
          .map((info) => processes.find((p) => p.id === info.id)?.arrivalTime || Number.POSITIVE_INFINITY),
      )

      if (nextArrival !== Number.POSITIVE_INFINITY && nextArrival > currentTime) {
        ganttChart.push({
          id: null,
          startTime: currentTime,
          endTime: nextArrival,
        })
        currentTime = nextArrival
      }
      continue
    }

    const info = processInfo.get(currentProcess.id)
    const executeTime = Math.min(timeSliceRemaining, info.remainingTime)

    ganttChart.push({
      id: currentProcess.id,
      startTime: currentTime,
      endTime: currentTime + executeTime,
    })

    currentTime += executeTime
    info.remainingTime -= executeTime
    timeSliceRemaining -= executeTime

    // Process completed
    if (info.remainingTime === 0) {
      info.completionTime = currentTime
      const turnaroundTime = info.completionTime - currentProcess.arrivalTime
      const waitingTime = turnaroundTime - currentProcess.burstTime

      scheduledTasks.push({
        id: currentProcess.id,
        arrivalTime: currentProcess.arrivalTime,
        burstTime: currentProcess.burstTime,
        startTime: info.startTime,
        completionTime: info.completionTime,
        turnaroundTime,
        waitingTime,
        priority: currentProcess.priority,
      })

      processInfo.delete(currentProcess.id)
      currentProcess = null
      timeSliceRemaining = 0
    }
    // Time slice expired
    else if (timeSliceRemaining === 0) {
      processQueue.push(currentProcess.id)
      info.inQueue = true
      currentProcess = null
    }
  }

  const averageTAT = scheduledTasks.reduce((sum, task) => sum + task.turnaroundTime, 0) / scheduledTasks.length
  const averageWT = scheduledTasks.reduce((sum, task) => sum + task.waitingTime, 0) / scheduledTasks.length

  return {
    scheduledTasks,
    ganttChart,
    averageTAT,
    averageWT,
  }
}
