"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import type { File } from "@/services/file-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { Download, MoreVertical, Share2, Trash2, Upload } from "lucide-react"
import { ShareFileDialog } from "@/components/share-file-dialog"

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

export default function FilesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileList | null>(null)
  const [fileToShare, setFileToShare] = useState<File | null>(null)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  useEffect(() => {
    if (user) {
      fetchFiles()
    }
  }, [user])

  const fetchFiles = async () => {
    if (!user) return

    setIsLoading(true)

    // Always use mock data in v0 preview
    setFiles(mockFiles)
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

      setFiles([newFile, ...files])

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

    // Mock download in demo mode
    toast({
      title: "File download",
      description: `${file.name} is being downloaded.`,
    })

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
  }

  const handleDelete = async (file: File) => {
    if (!user) return

    // Update UI
    setFiles(files.filter((f) => f.id !== file.id))

    toast({
      title: "File deleted",
      description: `${file.name} has been deleted.`,
    })
  }

  const handleShare = (file: File) => {
    setFileToShare(file)
    setIsShareDialogOpen(true)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (!user) return null

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Files</h1>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </Button>
          </DialogTrigger>
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

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : files.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.id}>
                <TableCell className="font-medium">{file.name}</TableCell>
                <TableCell>{formatFileSize(file.size)}</TableCell>
                <TableCell>{file.contentType}</TableCell>
                <TableCell>{new Date(file.createdAt).toLocaleDateString()}</TableCell>
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
                      <DropdownMenuItem onClick={() => handleDownload(file)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShare(file)}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(file)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Upload className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No files yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload your first file to get started with secure storage.
          </p>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </Button>
        </div>
      )}

      <ShareFileDialog file={fileToShare} open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen} />
    </div>
  )
}
