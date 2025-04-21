"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import type { File } from "@/services/file-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface ShareFileDialogProps {
  file: File | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareFileDialog({ file, open, onOpenChange }: ShareFileDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [permission, setPermission] = useState<"READ" | "WRITE" | "ADMIN">("READ")
  const [isSharing, setIsSharing] = useState(false)

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !file) return

    setIsSharing(true)
    try {
      // Always use mock data in v0 preview
      toast({
        title: "File shared",
        description: `${file.name} has been shared with ${email}.`,
      })

      // Reset form and close dialog
      setEmail("")
      setPermission("READ")
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Sharing failed",
        description: "Please check the email and try again.",
        variant: "destructive",
      })
      console.error("Share error:", error)
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share File</DialogTitle>
          <DialogDescription>
            {file ? `Share "${file.name}" with others.` : "Share this file with others."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleShare}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="permission">Permission</Label>
              <Select value={permission} onValueChange={(value) => setPermission(value as "READ" | "WRITE" | "ADMIN")}>
                <SelectTrigger id="permission">
                  <SelectValue placeholder="Select permission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="READ">Read only</SelectItem>
                  <SelectItem value="WRITE">Read & Write</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSharing}>
              {isSharing ? "Sharing..." : "Share"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
