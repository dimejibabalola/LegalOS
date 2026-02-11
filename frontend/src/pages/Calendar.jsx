import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns'

const eventTypes = {
  meeting: { color: 'bg-blue-500', label: 'Meeting' },
  hearing: { color: 'bg-red-500', label: 'Hearing' },
  deadline: { color: 'bg-amber-500', label: 'Deadline' },
  reminder: { color: 'bg-green-500', label: 'Reminder' },
}

const sampleEvents = [
  { id: 1, title: 'Client Meeting - Smith', date: new Date(), type: 'meeting', time: '10:00 AM' },
  { id: 2, title: 'Court Hearing', date: new Date(), type: 'hearing', time: '2:00 PM' },
  { id: 3, title: 'Filing Deadline', date: new Date(Date.now() + 86400000), type: 'deadline', time: '5:00 PM' },
  { id: 4, title: 'Team Standup', date: new Date(Date.now() + 172800000), type: 'meeting', time: '9:00 AM' },
]

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState('month')

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const startingDayIndex = getDay(monthStart)
  const emptyDays = Array(startingDayIndex).fill(null)

  const getEventsForDate = (date) => {
    return sampleEvents.filter((event) => isSameDay(new Date(event.date), date))
  }

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      setCurrentDate(subMonths(currentDate, 1))
    } else {
      setCurrentDate(addMonths(currentDate, 1))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
          <p className="text-slate-500">Manage your schedule and events</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border bg-white p-1">
            <Button
              variant={view === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('month')}
              className={view === 'month' ? 'bg-blue-600' : ''}
            >
              Month
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('week')}
              className={view === 'week' ? 'bg-blue-600' : ''}
            >
              Week
            </Button>
            <Button
              variant={view === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('day')}
              className={view === 'day' ? 'bg-blue-600' : ''}
            >
              Day
            </Button>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                New Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-slate-500">Event creation form would go here.</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle>{format(currentDate, 'MMMM yyyy')}</CardTitle>
            <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
        </CardHeader>
        <CardContent>
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-px bg-slate-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="bg-slate-50 p-2 text-center text-sm font-medium text-slate-600">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-slate-200">
            {emptyDays.map((_, index) => (
              <div key={`empty-${index}`} className="min-h-[100px] bg-white p-2" />
            ))}
            {daysInMonth.map((date) => {
              const events = getEventsForDate(date)
              const isSelected = isSameDay(date, selectedDate)
              const isCurrentMonth = isSameMonth(date, currentDate)
              const isToday = isSameDay(date, new Date())

              return (
                <div
                  key={date.toISOString()}
                  className={`min-h-[100px] bg-white p-2 cursor-pointer hover:bg-slate-50 transition-colors ${
                    isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''
                  } ${!isCurrentMonth ? 'text-slate-400' : ''}`}
                  onClick={() => setSelectedDate(date)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm font-medium ${
                        isToday
                          ? 'h-6 w-6 flex items-center justify-center rounded-full bg-blue-600 text-white'
                          : ''
                      }`}
                    >
                      {format(date, 'd')}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {events.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs px-1.5 py-0.5 rounded text-white truncate ${
                          eventTypes[event.type].color
                        }`}
                      >
                        {event.title}
                      </div>
                    ))}
                    {events.length > 3 && (
                      <div className="text-xs text-slate-500">+{events.length - 3} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Events for {format(selectedDate, 'MMMM d, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {getEventsForDate(selectedDate).length === 0 ? (
            <p className="text-slate-500 text-center py-4">No events scheduled</p>
          ) : (
            <div className="space-y-3">
              {getEventsForDate(selectedDate).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50"
                >
                  <div className={`w-3 h-3 rounded-full ${eventTypes[event.type].color}`} />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{event.title}</p>
                    <p className="text-sm text-slate-500">{event.time}</p>
                  </div>
                  <Badge variant="outline">{eventTypes[event.type].label}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {Object.entries(eventTypes).map(([key, { color, label }]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <span className="text-sm text-slate-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
