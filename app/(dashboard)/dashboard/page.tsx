"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import type { File } from "@/services/file-service"
import type { AuditLog } from "@/services/audit-service"
import type { SharePermission } from "@/services/sharing-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { FileIcon, Share2, Clock, Upload, Database, Users, Download, Trash2, Shield, Activity } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Mock data for when backend services are unavailable
const mockFiles: File[] = [
  {
    id: "file-1",
    name: "Project Proposal.pdf",
    size: 2500000,
    contentType: "application/pdf",
    ipfsHash: "Qm123456789",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerId: "user-123",
  },
  {
    id: "file-2",
    name: "Financial Report.xlsx",
    size: 1800000,
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ipfsHash: "Qm987654321",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    ownerId: "user-123",
  },
  {
    id: "file-3",
    name: "Meeting Notes.docx",
    size: 500000,
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ipfsHash: "Qm456789123",
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    ownerId: "user-123",
  },
]

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
]

const mockSharedWithMe: SharePermission[] = [
  {
    id: "share-1",
    fileId: "file-4",
    userId: "user-456",
    sharedWithId: "user-123",
    sharedWithEmail: "johndoe@example.com",
    permissionType: "READ",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: "share-2",
    fileId: "file-5",
    userId: "user-789",
    sharedWithId: "user-123",
    sharedWithEmail: "johndoe@example.com",
    permissionType: "WRITE",
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [stats, setStats] = useState({
    totalFiles: 0,
    sharedFiles: 0,
    recentActivity: 0,
    storageUsed: 0,
    storageLimit: 10 * 1024 * 1024 * 1024, // 10 GB
  })
  const [recentFiles, setRecentFiles] = useState<File[]>([])
  const [recentAuditLogs, setRecentAuditLogs] = useState<AuditLog[]>([])
  const [sharedWithMe, setSharedWithMe] = useState<SharePermission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileList | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    setIsLoading(true)

    // Always use mock data in v0 preview
    // This ensures we don't make any network requests that could fail
    setRecentFiles(mockFiles)
    setRecentAuditLogs(mockAuditLogs)
    setSharedWithMe(mockSharedWithMe)

    // Calculate total storage used
    const storageUsed = mockFiles.reduce((total, file) => total + file.size, 0)

    setStats({
      totalFiles: mockFiles.length,
      sharedFiles: 2, // Mock number of shared files
      recentActivity: mockAuditLogs.length,
      storageUsed: storageUsed,
      storageLimit: 10 * 1024 * 1024 * 1024, // 10 GB
    })

    setIsLoading(false)
  }

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedFile) return

    setIsUploading(true)
    try {
      const file = selectedFile[0]

      // Mock successful upload with demo data
      const newFile: File = {
        id: `file-${Date.now()}`,
        name: file.name,
        size: file.size,
        contentType: file.type,
        ipfsHash: `Qm${Math.random().toString(36).substring(2, 15)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId: user.id,
      }

      // Update recent files
      setRecentFiles([newFile, ...recentFiles])

      // Update stats
      setStats({
        ...stats,
        totalFiles: stats.totalFiles + 1,
        storageUsed: stats.storageUsed + file.size,
      })

      // Add a new audit log
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        userId: user.id,
        username: user.username,
        fileId: newFile.id,
        fileName: newFile.name,
        action: "UPLOAD",
        timestamp: new Date().toISOString(),
        ipAddress: "192.168.1.1",
      }

      setRecentAuditLogs([newLog, ...recentAuditLogs])

      toast({
        title: "File uploaded",
        description: "Your file has been uploaded successfully.",
      })

      // Close the dialog
      setIsUploadDialogOpen(false)
      // Reset the file input
      setSelectedFile(null)
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Please try again later.",
        variant: "destructive",
      })
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownload = async (file: File) => {
    if (!user) return

    // Create a mock download by creating a blob and downloading it
    const blob = new Blob(["Mock file content for " + file.name], { type: file.contentType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(a)

    // Add a new audit log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userId: user.id,
      username: user.username,
      fileId: file.id,
      fileName: file.name,
      action: "DOWNLOAD",
      timestamp: new Date().toISOString(),
      ipAddress: "192.168.1.1",
    }

    setRecentAuditLogs([newLog, ...recentAuditLogs])
    setStats({
      ...stats,
      recentActivity: stats.recentActivity + 1,
    })

    toast({
      title: "File download",
      description: `${file.name} is being downloaded.`,
    })
  }

  const handleDelete = async (file: File) => {
    if (!user) return

    // Update UI
    setRecentFiles(recentFiles.filter((f) => f.id !== file.id))

    // Update stats
    setStats({
      ...stats,
      totalFiles: stats.totalFiles - 1,
      storageUsed: stats.storageUsed - file.size,
    })

    // Add a new audit log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userId: user.id,
      username: user.username,
      fileId: file.id,
      fileName: file.name,
      action: "DELETE",
      timestamp: new Date().toISOString(),
      ipAddress: "192.168.1.1",
    }

    setRecentAuditLogs([newLog, ...recentAuditLogs])
    setStats({
      ...stats,
      recentActivity: stats.recentActivity + 1,
    })

    toast({
      title: "File deleted",
      description: `${file.name} has been deleted.`,
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getStoragePercentage = () => {
    return Math.min(100, Math.round((stats.storageUsed / stats.storageLimit) * 100))
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

  if (!user) return null

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Welcome, {user.username}</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </Button>
          <Button variant="outline" asChild>
            <Link href="/files">
              <FileIcon className="mr-2 h-4 w-4" />
              My Files
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <>
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Files</CardTitle>
                    <FileIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalFiles}</div>
                    <p className="text-xs text-muted-foreground">Files stored securely on IPFS</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Shared Files</CardTitle>
                    <Share2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.sharedFiles}</div>
                    <p className="text-xs text-muted-foreground">Files shared with others</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.recentActivity}</div>
                    <p className="text-xs text-muted-foreground">Actions in the last 30 days</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatFileSize(stats.storageUsed)}</div>
                    <div className="mt-2">
                      <Progress value={getStoragePercentage()} className="h-2" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getStoragePercentage()}% of {formatFileSize(stats.storageLimit)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your recent file activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentAuditLogs.length > 0 ? (
                      <ul className="space-y-4">
                        {recentAuditLogs.slice(0, 5).map((log) => (
                          <li key={log.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                {log.action === "UPLOAD" && <Upload className="h-4 w-4 text-primary" />}
                                {log.action === "DOWNLOAD" && <Download className="h-4 w-4 text-primary" />}
                                {log.action === "SHARE" && <Share2 className="h-4 w-4 text-primary" />}
                                {log.action === "DELETE" && <Trash2 className="h-4 w-4 text-primary" />}
                                {log.action === "REVOKE" && <Users className="h-4 w-4 text-primary" />}
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  <span className={getActionColor(log.action)}>{log.action}</span> - {log.fileName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(log.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Activity className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No recent activity</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/audit">View All Activity</Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Security Status</CardTitle>
                    <CardDescription>Your account security</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-green-500" />
                          <span className="text-sm">End-to-End Encryption</span>
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded-full">
                          Active
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-green-500" />
                          <span className="text-sm">IPFS Storage</span>
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded-full">
                          Active
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">Two-Factor Auth</span>
                        </div>
                        <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 px-2 py-1 rounded-full">
                          Not Set
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Security Settings
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="files">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-1 md:col-span-2">
                  <CardHeader>
                    <CardTitle>Recent Files</CardTitle>
                    <CardDescription>Your most recently uploaded files</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentFiles.length > 0 ? (
                      <ul className="space-y-4">
                        {recentFiles.map((file) => (
                          <li key={file.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <FileIcon className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleDownload(file)}>
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download</span>
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(file)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No files yet. Upload your first file!</p>
                        <Button className="mt-4" size="sm" onClick={() => setIsUploadDialogOpen(true)}>
                          Upload File
                        </Button>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/files">View All Files</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>Recent actions on your account</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentAuditLogs.length > 0 ? (
                    <ul className="space-y-4">
                      {recentAuditLogs.map((log) => (
                        <li key={log.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              {log.action === "UPLOAD" && <Upload className="h-4 w-4 text-primary" />}
                              {log.action === "DOWNLOAD" && <Download className="h-4 w-4 text-primary" />}
                              {log.action === "SHARE" && <Share2 className="h-4 w-4 text-primary" />}
                              {log.action === "DELETE" && <Trash2 className="h-4 w-4 text-primary" />}
                              {log.action === "REVOKE" && <Users className="h-4 w-4 text-primary" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                <span className={getActionColor(log.action)}>{log.action}</span> - {log.fileName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(log.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">{log.ipAddress}</div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Activity className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No recent activity</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/audit">View All Activity</Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
            <DialogDescription>Upload a file to your secure storage.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFileUpload}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="file">File</Label>
                <Input id="file" type="file" onChange={(e) => setSelectedFile(e.target.files)} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
