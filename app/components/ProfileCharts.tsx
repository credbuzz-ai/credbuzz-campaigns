'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { ChartDataPoint, UserProfileResponse } from '../types'

function ActivityHeatmap({ activityData }: { activityData: UserProfileResponse['result']['activity_data'] }) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const hours = Array.from({ length: 24 }, (_, i) => i)

  const getActivityColor = (tweets: number) => {
    if (tweets === 0) return 'bg-gray-100'
    if (tweets <= 1) return 'bg-green-100'
    if (tweets <= 2) return 'bg-green-200'
    if (tweets <= 3) return 'bg-green-300'
    return 'bg-green-400'
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="flex mb-2">
          <div className="w-24"></div>
          {hours.map(hour => (
            <div key={hour} className="flex-1 text-center text-xs text-gray-500">
              {hour}
            </div>
          ))}
        </div>
        {days.map(day => {
          const dayData = activityData.daily_activity.find(d => d.day === day)
          return (
            <div key={day} className="flex items-center mb-1">
              <div className="w-24 text-sm text-gray-600">{day}</div>
              <div className="flex-1 flex">
                {hours.map(hour => {
                  const hourData = dayData?.activity.find(a => a.hour === hour)
                  return (
                    <div
                      key={hour}
                      className={`flex-1 aspect-square m-0.5 rounded-sm ${getActivityColor(hourData?.avg_tweets || 0)}`}
                      title={`${day} ${hour}:00 - ${hourData?.avg_tweets || 0} tweets`}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function GrowthChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="followers_count"
            stroke="#8884d8"
            name="Total Followers"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="smart_followers_count"
            stroke="#82ca9d"
            name="Smart Followers"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="mindshare"
            stroke="#ffc658"
            name="Mindshare"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ActivityChart({ activityData }: { activityData: UserProfileResponse['result']['activity_data'] }) {
  return (
    <div className="card-pastel !bg-white">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Activity Heatmap</h2>
      <ActivityHeatmap activityData={activityData} />
    </div>
  )
} 