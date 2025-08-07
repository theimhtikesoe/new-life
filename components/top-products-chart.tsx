"use client"

import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const data = [
  { name: "Coffee", value: 35, fill: "hsl(var(--chart-1))" },
  { name: "Sandwich", value: 25, fill: "hsl(var(--chart-2))" },
  { name: "Water", value: 20, fill: "hsl(var(--chart-3))" },
  { name: "Chips", value: 12, fill: "hsl(var(--chart-4))" },
  { name: "Others", value: 8, fill: "hsl(var(--chart-5))" },
]

const chartConfig = {
  value: {
    label: "Sales",
  },
} satisfies ChartConfig

export function TopProductsChart() {
  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[250px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          strokeWidth={5}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
