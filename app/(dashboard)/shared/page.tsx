"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import type { SharePermission } from "@/services/sharing-service"
import type { File } from "@/services/file-service"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { Download, MoreVertical, Share2, UserMinus, Eye, FileText, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Mock data for when backend services are unavailable
const mockFiles: Record<string, File> = {
  "file-1": {
    id: "file-1",
    name: "Project Proposal.pdf",
    size: 2500000,
    contentType: "application/pdf",
    ipfsHash: "Qm123456789",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerId: "user-123",
  },
  "file-2": {
    id: "file-2",
    name: "Financial Report.xlsx",
    size: 1800000,
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ipfsHash: "Qm987654321",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    ownerId: "user-123",
  },
  "file-3": {
    id: "file-3",
    name: "Meeting Notes.docx",
    size: 500000,
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ipfsHash: "Qm456789123",
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    ownerId: "user-123",
  },
  "file-4": {
    id: "file-4",
    name: "Product Roadmap.pdf",
    size: 3200000,
    contentType: "application/pdf",
    ipfsHash: "Qm789123456",
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
    ownerId: "user-456",
  },
  "file-5": {
    id: "file-5",
    name: "Marketing Plan.pptx",
    size: 4500000,
    contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ipfsHash: "Qm321654987",
    createdAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    updatedAt: new Date(Date.now() - 345600000).toISOString(),
    ownerId: "user-789",
  },
}

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

const mockMySharedFiles: SharePermission[] = [
  {
    id: "share-3",
    fileId: "file-1",
    userId: "user-123",
    sharedWithId: "user-789",
    sharedWithEmail: "alice@example.com",
    permissionType: "READ",
    createdAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
  },
  {
    id: "share-4",
    fileId: "file-2",
    userId: "user-123",
    sharedWithId: "user-456",
    sharedWithEmail: "bob@example.com",
    permissionType: "ADMIN",
    createdAt: new Date(Date.now() - 129600000).toISOString(), // 1.5 days ago
  },
  {
    id: "share-5",
    fileId: "file-3",
    userId: "user-123",
    sharedWithId: "user-789",
    sharedWithEmail: "charlie@example.com",
    permissionType: "WRITE",
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
]

export default function SharedPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [sharedWithMe, setSharedWithMe] = useState<SharePermission[]>([])
  const [mySharedFiles, setMySharedFiles] = useState<SharePermission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredSharedWithMe, setFilteredSharedWithMe] = useState<SharePermission[]>([])
  const [filteredMySharedFiles, setFilteredMySharedFiles] = useState<SharePermission[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isFileDetailsOpen, setIsFileDetailsOpen] = useState(false)

  useEffect(() => {
    if (user) {
      fetchSharedFiles()
    }
  }, [user])

  useEffect(() => {
    if (sharedWithMe.length > 0 || mySharedFiles.length > 0) {
      applyFilters()
    }
  }, [searchTerm, sharedWithMe, mySharedFiles])

  const fetchSharedFiles = async () => {
    if (!user) return

    setIsLoading(true)

    try {
      // Use mock data in preview environment
      setSharedWithMe(mockSharedWithMe)
      setMySharedFiles(mockMySharedFiles)
      setFilteredSharedWithMe(mockSharedWithMe)
      setFilteredMySharedFiles(mockMySharedFiles)
    } catch (error) {
      toast({
        title: "Error fetching shared files",
        description: "Please try again later.",
        variant: "destructive",
      })
      console.error("Shared files error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    if (searchTerm.trim() === "") {
      setFilteredSharedWithMe(sharedWithMe)
      setFilteredMySharedFiles(mySharedFiles)
      return
    }

    const term = searchTerm.toLowerCase()

    // Filter shared with me
    setFilteredSharedWithMe(
      sharedWithMe.filter((share) => {
        const file = mockFiles[share.fileId]
        return file && file.name.toLowerCase().includes(term)
      }),
    )

    // Filter my shared files
    setFilteredMySharedFiles(
      mySharedFiles.filter((share) => {
        const file = mockFiles[share.fileId]
        return file && (file.name.toLowerCase().includes(term) || share.sharedWithEmail.toLowerCase().includes(term))
      }),
    )
  }

  const handleDownload = async (fileId: string) => {
    if (!user) return

    const file = mockFiles[fileId]
    if (!file) {
      toast({
        title: "File not found",
        description: "The file you're trying to download could not be found.",
        variant: "destructive",
      })
      return
    }

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

    toast({
      title: "File download",
      description: `${file.name} is being downloaded.`,
    })
  }

  const handleRevokeAccess = async (permissionId: string, email: string) => {
    if (!user) return

    // Update UI
    setMySharedFiles(mySharedFiles.filter((p) => p.id !== permissionId))
    setFilteredMySharedFiles(filteredMySharedFiles.filter((p) => p.id !== permissionId))

    toast({
      title: "Access revoked",
      description: `Access for ${email} has been revoked.`,
    })
  }

  const handleViewFileDetails = (fileId: string) => {
    const file = mockFiles[fileId]
    if (file) {
      setSelectedFile(file)
      setIsFileDetailsOpen(true)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getPermissionBadge = (permission: string) => {
    switch (permission) {
      case "READ":
        return <Badge variant="secondary">Read Only</Badge>
      case "WRITE":
        return <Badge variant="outline">Read & Write</Badge>
      case "ADMIN":
        return <Badge variant="default">Admin</Badge>
      default:
        return <Badge variant="secondary">{permission}</Badge>
    }
  }

  if (!user) return null

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Shared Files</h1>

      <div className="relative mb-6">
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search files or users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <Tabs defaultValue="shared-with-me">
          <TabsList className="mb-4">
            <TabsTrigger value="shared-with-me">Shared with me</TabsTrigger>
            <TabsTrigger value="my-shared-files">My shared files</TabsTrigger>
          </TabsList>

          <TabsContent value="shared-with-me">
            {filteredSharedWithMe.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File</TableHead>
                      <TableHead>Shared By</TableHead>
                      <TableHead>Permission</TableHead>
                      <TableHead>Shared On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSharedWithMe.map((share) => {
                      const file = mockFiles[share.fileId]
                      return file ? (
                        <TableRow key={share.id}>
                          <TableCell className="font-medium">{file.name}</TableCell>
                          <TableCell>{share.userId}</TableCell>
                          <TableCell>{getPermissionBadge(share.permissionType)}</TableCell>
                          <TableCell>{new Date(share.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleViewFileDetails(share.fileId)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownload(share.fileId)}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ) : null
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Share2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No files shared with you</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm
                    ? "No files match your search."
                    : "When someone shares a file with you, it will appear here."}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-shared-files">
            {filteredMySharedFiles.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File</TableHead>
                      <TableHead>Shared With</TableHead>
                      <TableHead>Permission</TableHead>
                      <TableHead>Shared On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMySharedFiles.map((share) => {
                      const file = mockFiles[share.fileId]
                      return file ? (
                        <TableRow key={share.id}>
                          <TableCell className="font-medium">{file.name}</TableCell>
                          <TableCell>{share.sharedWithEmail}</TableCell>
                          <TableCell>{getPermissionBadge(share.permissionType)}</TableCell>
                          <TableCell>{new Date(share.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleViewFileDetails(share.fileId)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRevokeAccess(share.id, share.sharedWithEmail)}>
                                  <UserMinus className="mr-2 h-4 w-4" />
                                  Revoke Access
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ) : null
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Share2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">You haven't shared any files</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm
                    ? "No shared files match your search."
                    : "When you share a file with someone, it will appear here."}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* File Details Dialog */}
      <Dialog open={isFileDetailsOpen} onOpenChange={setIsFileDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>File Details</DialogTitle>
            <DialogDescription>Detailed information about the selected file.</DialogDescription>
          </DialogHeader>
          {selectedFile && (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Name:</div>
                <div>{selectedFile.name}</div>

                <div className="font-medium">Size:</div>
                <div>{formatFileSize(selectedFile.size)}</div>

                <div className="font-medium">Type:</div>
                <div>{selectedFile.contentType}</div>

                <div className="font-medium">Created:</div>
                <div>{new Date(selectedFile.createdAt).toLocaleString()}</div>

                <div className="font-medium">Last Modified:</div>
                <div>{new Date(selectedFile.updatedAt).toLocaleString()}</div>

                <div className="font-medium">IPFS Hash:</div>
                <div className="truncate">{selectedFile.ipfsHash}</div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsFileDetailsOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => handleDownload(selectedFile.id)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
