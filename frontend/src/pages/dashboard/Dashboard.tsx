import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Users, Shield, Database, Activity } from "lucide-react"

export default function Dashboard() {
  const stats = [
    {
      title: "Total Users",
      value: "1,234",
      description: "+12% from last month",
      icon: Users,
    },
    {
      title: "Active Roles",
      value: "12",
      description: "Across all departments",
      icon: Shield,
    },
    {
      title: "Menu Items",
      value: "48",
      description: "Organized in 8 groups",
      icon: Database,
    },
    {
      title: "System Status",
      value: "99.9%",
      description: "Uptime last 30 days",
      icon: Activity,
    },
  ]

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              A snapshot of your application metrics.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[200px] flex items-center justify-center border-t">
            <span className="text-muted-foreground text-sm">Chart Placeholder</span>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              You've made 128 updates this week.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[200px] flex items-center justify-center border-t">
            <span className="text-muted-foreground text-sm">Activity Placeholder</span>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
