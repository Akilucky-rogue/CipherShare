const API_URL = "http://localhost:8083/api/sharing"

export type SharePermission = {
  id: string
  fileId: string
  userId: string
  sharedWithId: string
  sharedWithEmail: string
  permissionType: "READ" | "WRITE" | "ADMIN"
  createdAt: string
}

export const sharingService = {
  async getSharedFiles(token: string): Promise<SharePermission[]> {
    const response = await fetch(`${API_URL}/shared-with-me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch shared files")
    }

    return response.json()
  },

  async getMySharedFiles(token: string): Promise<SharePermission[]> {
    const response = await fetch(`${API_URL}/my-shared-files`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch my shared files")
    }

    return response.json()
  },

  async shareFile(
    token: string,
    fileId: string,
    email: string,
    permissionType: "READ" | "WRITE" | "ADMIN",
  ): Promise<SharePermission> {
    const response = await fetch(`${API_URL}/share`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileId,
        email,
        permissionType,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to share file")
    }

    return response.json()
  },

  async revokeAccess(token: string, permissionId: string): Promise<void> {
    const response = await fetch(`${API_URL}/${permissionId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to revoke access")
    }
  },
}
