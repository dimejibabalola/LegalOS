import { useState } from 'react'
import { Play, Pause, Square, Clock, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTimer } from '@/hooks/useTimer'
import { formatDuration } from '@/lib/utils'

export function TimerWidget({ matters = [], className }) {
  const { isRunning, elapsedTime, startTimer, stopTimer, resetTimer } = useTimer()
  const [selectedMatter, setSelectedMatter] = useState('')
  const [description, setDescription] = useState('')

  const handleStart = () => {
    startTimer({ matterId: selectedMatter, description })
  }

  const handleStop = () => {
    stopTimer()
  }

  const handleReset = () => {
    resetTimer()
    setDescription('')
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4" />
          Time Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer Display */}
        <div className="flex items-center justify-center">
          <div
            className={cn(
              'text-4xl font-mono font-bold tracking-wider',
              isRunning ? 'text-blue-600' : 'text-slate-600'
            )}
          >
            {formatDuration(elapsedTime)}
          </div>
        </div>

        {/* Matter Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Matter</label>
          <Select value={selectedMatter} onValueChange={setSelectedMatter}>
            <SelectTrigger>
              <SelectValue placeholder="Select a matter" />
            </SelectTrigger>
            <SelectContent>
              {matters.map((matter) => (
                <SelectItem key={matter.id} value={matter.id}>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-slate-400" />
                    {matter.title}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Description
          </label>
          <input
            type="text"
            placeholder="What are you working on?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isRunning}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              disabled={!selectedMatter}
              className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Play className="h-4 w-4" />
              Start Timer
            </Button>
          ) : (
            <>
              <Button
                onClick={handleStop}
                variant="default"
                className="flex-1 gap-2 bg-amber-500 hover:bg-amber-600"
              >
                <Pause className="h-4 w-4" />
                Pause
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="gap-2"
              >
                <Square className="h-4 w-4" />
                Stop
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
