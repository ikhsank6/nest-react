import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Shield, TrendingUp, Activity, UserPlus, FileText, ArrowUpRight, ArrowDownRight, MoreHorizontal, Sparkles } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Dashboard() {
  const { user } = useAuthStore();

  const stats = [
    {
      title: "Total Users",
      value: "1,248",
      change: "+12%",
      trend: "up",
      icon: Users,
      gradient: "from-blue-500 to-cyan-400",
      bgGlow: "bg-blue-500/20",
    },
    {
      title: "Active Roles",
      value: "12",
      change: "+2",
      trend: "up",
      icon: Shield,
      gradient: "from-violet-500 to-purple-400",
      bgGlow: "bg-violet-500/20",
    },
    {
      title: "New Signups",
      value: "48",
      change: "+8%",
      trend: "up",
      icon: UserPlus,
      gradient: "from-emerald-500 to-teal-400",
      bgGlow: "bg-emerald-500/20",
    },
    {
      title: "System Logs",
      value: "15.4k",
      change: "-3%",
      trend: "down",
      icon: FileText,
      gradient: "from-orange-500 to-amber-400",
      bgGlow: "bg-orange-500/20",
    },
  ];

  const activities = [
    { user: "John D.", action: "Updated profile settings", time: "2m", avatar: "J", color: "bg-blue-500" },
    { user: "Sarah M.", action: "Created new role: Manager", time: "15m", avatar: "S", color: "bg-pink-500" },
    { user: "Admin", action: "Completed database backup", time: "1h", avatar: "A", color: "bg-violet-500" },
    { user: "System", action: "Security scan completed", time: "2h", avatar: "⚡", color: "bg-amber-500" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <span className="text-sm font-medium text-primary">Dashboard Overview</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Welcome back, <span className="text-primary">{user?.name?.split(' ')[0]}</span>! 👋
            </h1>
            <p className="text-muted-foreground max-w-lg">
              Here's what's happening with your system today. Everything looks great!
            </p>
          </div>
          <Button size="lg" className="w-fit shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
            <TrendingUp className="size-4 mr-2" />
            View Reports
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card/80 backdrop-blur-sm"
          >
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${stat.bgGlow} blur-2xl`} />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                  <stat.icon className="size-5 text-white" />
                </div>
                <Badge 
                  variant="outline" 
                  className={`px-2 py-0.5 text-xs font-medium ${
                    stat.trend === 'up' 
                      ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' 
                      : 'text-rose-600 bg-rose-500/10 border-rose-500/20'
                  }`}
                >
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="size-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="size-3 mr-0.5" />
                  )}
                  {stat.change}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Chart Area */}
        <Card className="lg:col-span-4 border-0 shadow-lg bg-card/80 backdrop-blur-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Activity className="size-5 text-primary" />
                Analytics Overview
              </CardTitle>
              <CardDescription>
                Real-time performance metrics
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreHorizontal className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[280px] flex items-center justify-center rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-dashed border-muted-foreground/10">
              <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="size-8 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Chart Coming Soon</p>
                  <p className="text-xs text-muted-foreground">Interactive analytics dashboard</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="lg:col-span-3 border-0 shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="space-y-1">
              <CardTitle className="text-xl">Recent Activity</CardTitle>
              <CardDescription>Latest system events</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="rounded-full h-8">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity, i) => (
                <div 
                  key={i} 
                  className="group flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <Avatar className="size-10 ring-2 ring-background shadow-md">
                    <AvatarFallback className={`${activity.color} text-white text-sm font-bold`}>
                      {activity.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                      {activity.user}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.action}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-full">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="flex-1 space-y-2 text-center md:text-left">
              <h3 className="text-lg font-semibold">Need help getting started?</h3>
              <p className="text-sm text-muted-foreground">
                Explore our documentation and tutorials to make the most of your admin panel.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-full">
                View Docs
              </Button>
              <Button className="rounded-full shadow-lg shadow-primary/25">
                Get Started
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
