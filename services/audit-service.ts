const API_URL = "http://localhost:8082/api/audit"

export type AuditLog = {
  id: string
  userId: string
  username: string
  fileId: string
  fileName: string
  action: "UPLOAD" | "DOWNLOAD" | "DELETE" | "SHARE" | "REVOKE"
  timestamp: string
  ipAddress: string
}

export const auditService = {
  async getAuditLogs(token: string, fileId?: string): Promise<AuditLog[]> {
    const url = fileId ? `${API_URL}/file/${fileId}` : `${API_URL}/user`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch audit logs")
    }

    return response.json()
  },
}
