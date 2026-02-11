
import { File as MegaFile, Storage as MegaStorage } from 'megajs'

let storage: MegaStorage | null = null

async function getStorage() {
    if (storage) return storage

    return new Promise<MegaStorage>((resolve, reject) => {
        const email = process.env.MEGA_EMAIL
        const password = process.env.MEGA_PASSWORD

        if (!email || !password) {
            reject(new Error("MEGA_EMAIL and MEGA_PASSWORD must be set in env"))
            return
        }

        const newStorage = new MegaStorage({ email, password })

        newStorage.ready.then(() => {
            storage = newStorage
            resolve(newStorage)
        }).catch((err) => {
            reject(err)
        })
    })
}

export async function uploadFileToMega(file: File, folderName: string = "EstateManager"): Promise<{ url: string, name: string, size: number }> {
    const storage = await getStorage()

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return new Promise((resolve, reject) => {
        const name = file.name
        const size = file.size

        // Find or create folder (simplification: upload to root or specific folder)
        // For now, let's keep it simple and upload to root.

        storage.upload({ name, size }, buffer, (err, uploadedFile) => {
            if (err) return reject(err)
            if (!uploadedFile) return reject(new Error("Upload failed"))

            // Pass empty options object to satisfy type definition. 
            // Callback: url can be undefined if link generation fails silently or is async without result?
            uploadedFile.link({}, (err: any, url?: string) => {
                if (err || !url) return reject(err || new Error("Failed to get link"))
                resolve({ url, name, size })
            })
        })
    })
}

export async function deleteFileFromMega(url: string) {
    // Make sure storage is ready
    await getStorage()

    // Deleting by URL via API is tricky if we don't have the file object.
    // For MVP, we might just delete the DB record.
    console.warn("Delete from Mega not implemented yet (requires Node ID storage)")
}
