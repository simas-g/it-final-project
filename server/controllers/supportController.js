const DROPBOX_ACCESS_TOKEN = process.env.DROPBOX_ACCESS_TOKEN
const DROPBOX_UPLOAD_PATH = process.env.DROPBOX_UPLOAD_PATH || '/support-tickets'

const uploadToDropbox = async (fileName, fileContent) => {
  if (!DROPBOX_ACCESS_TOKEN) {
    throw new Error('Dropbox access token is not configured')
  }

  let filePath = `${DROPBOX_UPLOAD_PATH}/${fileName}`
  filePath = filePath.replace(/\/+/g, '/')
  if (!filePath.startsWith('/')) {
    filePath = '/' + filePath
  }
  
  const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DROPBOX_ACCESS_TOKEN}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify({
        path: filePath,
        mode: 'add',
        autorename: true,
        mute: false,
      }),
    },
    body: fileContent,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Dropbox upload failed: ${errorText}`)
  }

  return await response.json()
}

export const uploadSupportTicket = async (req, res) => {
  try {
    const { reportedBy, inventory, link, priority, adminEmails, summary } = req.body

    if (!summary || !priority || !adminEmails || !Array.isArray(adminEmails) || adminEmails.length === 0) {
      return res.status(400).json({
        error: 'Missing required fields'
      })
    }

    const ticketData = {
      reportedBy: reportedBy || 'Unknown',
      inventory: inventory || '',
      link: link || '',
      priority,
      adminEmails,
      summary,
      createdAt: new Date().toISOString(),
    }

    const fileName = `ticket_${Date.now()}_${Math.random().toString(36).substring(7)}.json`
    await uploadToDropbox(fileName, JSON.stringify(ticketData, null, 2))

    res.status(200).json({
      message: 'Support ticket uploaded successfully',
      fileName,
    })
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Failed to upload support ticket',
    })
  }
}

