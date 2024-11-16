import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
// Enable CORS
res.setHeader('Access-Control-Allow-Origin', '*')
res.setHeader('Access-Control-Allow-Methods', 'GET')

if (req.method !== 'GET') {
return res.status(405).json({ error: 'Method not allowed' })
}

try {
// Fetch only verified comments
const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('verified', true)
    .order('created_at', { ascending: false })

if (error) throw error

// Format date helper function
const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
    })
}

// Return comments as HTML if requested
if (req.headers.accept?.includes('text/html')) {
    const html = `
    <!DOCTYPE html>
    <html>
        <head>
        <title>Comments</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
            }
            .comment {
            background: white;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .name {
            font-weight: bold;
            color: #333;
            }
            .date {
            color: #666;
            font-size: 0.9em;
            margin: 5px 0;
            }
            .content {
            margin-top: 10px;
            line-height: 1.5;
            color: #444;
            }
        </style>
        </head>
        <body>
        ${data.map(comment => `
            <div class="comment">
            <div class="name">${comment.name}</div>
            <div class="date">${formatDate(comment.created_at)}</div>
            <div class="content">${comment.comment}</div>
            </div>
        `).join('')}
        </body>
    </html>
    `
    res.setHeader('Content-Type', 'text/html')
    return res.status(200).send(html)
}

// Return JSON by default
return res.status(200).json(data)
} catch (error) {
console.error('Error fetching comments:', error)
return res.status(500).json({ error: 'Error fetching comments' })
}
}