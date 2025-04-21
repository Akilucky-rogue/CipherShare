const API_URL = "http://localhost:8081/api/files"

export type File = {
  id: string
  name: string
  size: number
  contentType: string
  ipfsHash: string
  createdAt: string
  updatedAt: string
  ownerId: string
}

export const fileService = {
  async getFiles(token: string): Promise<File[]> {
    const response = await fetch(`${API_URL}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch files")
    }

    return response.json()
  },

  async uploadFile(token: string, file: Blob, fileName: string): Promise<File> {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("fileName", fileName)

    const response = await fetch(`${API_URL}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to upload file")
    }

    return response.json()
  },

  async downloadFile(token: string, fileId: string): Promise<Blob> {
    const response = await fetch(`${API_URL}/${fileId}/download`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to download file")
    }

    return response.blob()
  },

  async deleteFile(token: string, fileId: string): Promise<void> {
    const response = await fetch(`${API_URL}/${fileId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to delete file")
    }
  },
}
