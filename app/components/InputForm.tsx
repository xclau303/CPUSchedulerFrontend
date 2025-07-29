"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function InputForm({
  onSubmit,
  showWork,
  showAnimation,
  onShowWorkChange,
  onShowAnimationChange,
  isLoading = false,
}) {
  const [algorithm, setAlgorithm] = useState("fcfs")
  const [arrivalTimes, setArrivalTimes] = useState("")
  const [burstTimes, setBurstTimes] = useState("")
  const [priorityNumbers, setPriorityNumbers] = useState("")
  const [quantumNumber, setQuantumNumber] = useState("")
  const [error, setError] = useState("")

  const validateInputs = () => {
    const at = arrivalTimes.trim().split(/\s+/)
    const bt = burstTimes.trim().split(/\s+/)
    const pr = priorityNumbers.trim().split(/\s+/)

    if (at.length !== bt.length) {
      setError("Arrival times and burst times must be the same length")
      return false
    }

    if (algorithm === "priority" && pr.length !== at.length) {
      setError("Priority values must match number of processes")
      return false
    }

    if (!at.every((n) => !isNaN(Number(n)))) {
      setError("Arrival times must be valid numbers")
      return false
    }

    if (!bt.every((n) => !isNaN(Number(n)) && Number(n) > 0)) {
      setError("Burst times must be valid numbers")
      return false
    }

    if (algorithm === "priority" && !pr.every((n) => !isNaN(Number(n)))) {
      setError("Priorities must be valid numbers")
      return false
    }

    if (algorithm === "rr") {
      const q = Number(quantumNumber)
      if (isNaN(q) || q <= 0) {
        setError("Quantum must be a positive number")
        return false
      }
    }

    setError("")
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateInputs()) return

    const at = arrivalTimes.trim().split(/\s+/).map(Number)
    const bt = burstTimes.trim().split(/\s+/).map(Number)
    const pr = priorityNumbers.trim().split(/\s+/).map(Number)
    const qn = Number.parseInt(quantumNumber) || 2

    const jobs = at.map((arrivalTime, i) => ({
      id: String.fromCharCode(65 + i),
      arrivalTime,
      burstTime: bt[i] || 0,
      priority: pr[i] || 1,
    }))

    onSubmit(algorithm, jobs, qn)
  }

  return (
    <Card className="w-full max-w-md border border-[#e7e8ea] rounded-xl bg-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Input Parameters</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Algorithm Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="algorithm">Algorithm</Label>
            <Select value={algorithm} onValueChange={setAlgorithm}>
              <SelectTrigger className="w-full border border-[#e7e8ea] rounded-md bg-white">
                <SelectValue placeholder="Select algorithm" />
              </SelectTrigger>
              <SelectContent
                className="bg-white border border-[#e7e8ea] shadow-md min-w-[--radix-select-trigger-width]"
                align="start"
              >
                <SelectItem
                  value="fcfs"
                  className="pl-8 data-[state=checked]:font-semibold data-[state=checked]:text-black relative"
                >
                  First Come First Serve (FCFS)
                </SelectItem>
                <SelectItem
                  value="sjf"
                  className="pl-8 data-[state=checked]:font-semibold data-[state=checked]:text-black relative"
                >
                  Shortest Job First (SJF)
                </SelectItem>
                <SelectItem
                  value="priority"
                  className="pl-8 data-[state=checked]:font-semibold data-[state=checked]:text-black relative"
                >
                  Priority Scheduling
                </SelectItem>
                <SelectItem
                  value="rr"
                  className="pl-8 data-[state=checked]:font-semibold data-[state=checked]:text-black relative"
                >
                  Round Robin
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Arrival Times */}
          <div className="space-y-2">
            <Label htmlFor="arrivalTimes">Arrival Times</Label>
            <Input
              id="arrivalTimes"
              value={arrivalTimes}
              onChange={(e) => setArrivalTimes(e.target.value)}
              placeholder="e.g. 0 2 4 6"
              className="border border-[#e7e8ea] rounded-md"
            />
          </div>

          {/* Burst Times */}
          <div className="space-y-2">
            <Label htmlFor="burstTimes">Burst Times</Label>
            <Input
              id="burstTimes"
              value={burstTimes}
              onChange={(e) => setBurstTimes(e.target.value)}
              placeholder="e.g. 5 3 2 1"
              className="border border-[#e7e8ea] rounded-md"
            />
          </div>

          {/* Priority Numbers */}
          {algorithm === "priority" && (
            <div className="space-y-2">
              <Label htmlFor="priorityNumbers">Priority Numbers</Label>
              <Input
                id="priorityNumbers"
                value={priorityNumbers}
                onChange={(e) => setPriorityNumbers(e.target.value)}
                placeholder="e.g. 1 2 3 4"
                className="border border-[#e7e8ea] rounded-md"
              />
            </div>
          )}

          {/* Quantum Number */}
          {algorithm === "rr" && (
            <div className="space-y-2">
              <Label htmlFor="quantumNumber">Quantum Number</Label>
              <Input
                id="quantumNumber"
                value={quantumNumber}
                onChange={(e) => setQuantumNumber(e.target.value)}
                placeholder="e.g. 2"
                className="border border-[#e7e8ea] rounded-md"
              />
            </div>
          )}

          {/* Run Button */}
          <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white" disabled={isLoading}>
            {isLoading ? "Processing..." : "Run Scheduler"}
          </Button>

          {/* Horizontal Divider */}
          <div className="border-t pt-4 border-[#e7e8ea] space-y-3">
            {/* View Calculations */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showWork"
                checked={showWork}
                onCheckedChange={onShowWorkChange}
                className="data-[state=checked]:bg-[#0275ff] data-[state=checked]:text-white"
              />
              <Label htmlFor="showWork" className="text-sm font-medium">
                View Calculations
              </Label>
            </div>

            {/* View Animation */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showAnimation"
                checked={showAnimation}
                onCheckedChange={onShowAnimationChange}
                className="data-[state=checked]:bg-[#0275ff] data-[state=checked]:text-white"
              />
              <Label htmlFor="showAnimation" className="text-sm font-medium">
                View Animation
              </Label>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
