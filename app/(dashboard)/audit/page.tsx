"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import type { AuditLog } from "@/services/audit-service"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Search, Filter, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"

// Mock data for audit logs
const mockAuditLogs: AuditLog[] = [
  {
    id: "log-1",
    userId: "user-123",
    username: "johndoe",
    fileId: "file-1",
    fileName: "Project Proposal.pdf",
    action: "UPLOAD",
    timestamp: new Date().toISOString(),
    ipAddress: "192.168.1.1",
  },
  {
    id: "log-2",
    userId: "user-123",
    username: "johndoe",
    fileId: "file-2",
    fileName: "Financial Report.xlsx",
    action: "SHARE",
    timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    ipAddress: "192.168.1.1",
  },
  {
    id: "log-3",
    userId: "user-123",
    username: "johndoe",
    fileId: "file-3",
    fileName: "Meeting Notes.docx",
    action: "DOWNLOAD",
    timestamp: new Date(Date.now() - 129600000).toISOString(), // 1.5 days ago
    ipAddress: "192.168.1.1",
  },
  {
    id: "log-4",
    userId: "user-456",
    username: "janedoe",
    fileId: "file-1",
    fileName: "Project Proposal.pdf",
    action: "DOWNLOAD",
    timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    ipAddress: "192.168.1.2",
  },
  {
    id: "log-5",
    userId: "user-123",
    username: "johndoe",
    fileId: "file-4",
    fileName: "Budget 2023.xlsx",
    action: "DELETE",
    timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    ipAddress: "192.168.1.1",
  },
  {
    id: "log-6",
    userId: "user-789",
    username: "bobsmith",
    fileId: "file-2",
    fileName: "Financial Report.xlsx",
    action: "DOWNLOAD",
    timestamp: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    ipAddress: "192.168.1.3",
  },
  {
    id: "log-7",
    userId: "user-123",
    username: "johndoe",
    fileId: "file-5",
    fileName: "Marketing Plan.pptx",
    action: "UPLOAD",
    timestamp: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    ipAddress: "192.168.1.1",
  },
  {
    id: "log-8",
    userId: "user-123",
    username: "johndoe",
    fileId: "file-5",
    fileName: "Marketing Plan.pptx",
    action: "SHARE",
    timestamp: new Date(Date.now() - 432100000).toISOString(), // 5 days ago
    ipAddress: "192.168.1.1",
  },
  {
    id: "log-9",
    userId: "user-123",
    username: "johndoe",
    fileId: "file-6",
    fileName: "Client List.xlsx",
    action: "REVOKE",
    timestamp: new Date(Date.now() - 518400000).toISOString(), // 6 days ago
    ipAddress: "192.168.1.1",
  },
]

export default function AuditPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState<string>("all")
  const [timeFilter, setTimeFilter] = useState<string>("all")

  useEffect(() => {
    if (user) {
      fetchAuditLogs()
    }
  }, [user])

  useEffect(() => {
    if (auditLogs.length > 0) {
      applyFilters()
    }
  }, [searchTerm, actionFilter, timeFilter, auditLogs])

  const fetchAuditLogs = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Use mock data in preview environment
      setAuditLogs(mockAuditLogs)
      setFilteredLogs(mockAuditLogs)
    } catch (error) {
      toast({
        title: "Error fetching audit logs",
        description: "Please try again later.",
        variant: "destructive",
      })
      console.error("Audit logs error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...auditLogs]

    // Apply search filter
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (log) =>
          log.action.toLowerCase().includes(term) ||
          log.fileName.toLowerCase().includes(term) ||
          log.username.toLowerCase().includes(term) ||
          log.ipAddress.includes(term),
      )
    }

    // Apply action filter
    if (actionFilter !== "all") {
      filtered = filtered.filter((log) => log.action === actionFilter)
    }

    // Apply time filter
    if (timeFilter !== "all") {
      const now = Date.now()
      let timeThreshold = now

      switch (timeFilter) {
        case "today":
          timeThreshold = now - 24 * 60 * 60 * 1000 // 1 day
          break
        case "week":
          timeThreshold = now - 7 * 24 * 60 * 60 * 1000 // 7 days
          break
        case "month":
          timeThreshold = now - 30 * 24 * 60 * 60 * 1000 // 30 days
          break
      }

      filtered = filtered.filter((log) => new Date(log.timestamp).getTime() >= timeThreshold)
    }

    setFilteredLogs(filtered)
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "UPLOAD":
        return "text-green-600 dark:text-green-400"
      case "DOWNLOAD":
        return "text-blue-600 dark:text-blue-400"
      case "DELETE":
        return "text-red-600 dark:text-red-400"
      case "SHARE":
        return "text-purple-600 dark:text-purple-400"
      case "REVOKE":
        return "text-orange-600 dark:text-orange-400"
      default:
        return ""
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setActionFilter("all")
    setTimeFilter("all")
  }

  const exportLogs = () => {
    // Create CSV content
    const headers = ["Action", "File", "User", "IP Address", "Timestamp"]
    const csvRows = [headers]

    filteredLogs.forEach((log) => {
      csvRows.push([log.action, log.fileName, log.username, log.ipAddress, new Date(log.timestamp).toLocaleString()])
    })

    const csvContent = csvRows.map((row) => row.join(",")).join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "audit_logs.csv"
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(a)

    toast({
      title: "Logs exported",
      description: "Audit logs have been exported to CSV.",
    })
  }

  if (!user) return null

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportLogs}>
            Export Logs
          </Button>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex gap-2">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>{actionFilter === "all" ? "All Actions" : actionFilter}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="UPLOAD">UPLOAD</SelectItem>
              <SelectItem value="DOWNLOAD">DOWNLOAD</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
              <SelectItem value="SHARE">SHARE</SelectItem>
              <SelectItem value="REVOKE">REVOKE</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {timeFilter === "all"
                    ? "All Time"
                    : timeFilter === "today"
                      ? "Today"
                      : timeFilter === "week"
                        ? "This Week"
                        : "This Month"}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : filteredLogs.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>File</TableHead>
                <TableHead>User</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className={`font-medium ${getActionColor(log.action)}`}>{log.action}</TableCell>
                  <TableCell>{log.fileName}</TableCell>
                  <TableCell>{log.username}</TableCell>
                  <TableCell>{log.ipAddress}</TableCell>
                  <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No audit logs found</h3>
          <p className="text-sm text-muted-foreground">
            {searchTerm || actionFilter !== "all" || timeFilter !== "all"
              ? "Try adjusting your filters."
              : "Audit logs will appear here as you use the system."}
          </p>
        </div>
      )}
    </div>
  )
}
