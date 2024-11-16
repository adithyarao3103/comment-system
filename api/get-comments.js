import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
}

try {
    const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('verified', true)
    .order('created_at', { ascending: false })

    if (error) throw error

    // Generate HTML for the comments
    const commentsHtml = data.map(comment => `
    <div class="comment">
        <h3>${escapeHtml(comment.name)}</h3>
        <small>${new Date(comment.created_at).toLocaleDateString()}</small>
        <p>${escapeHtml(comment.comment)}</p>
    </div>
    `).join('')

    const html = `
    <div class="comments-container">
        <style>
        .comment { border-bottom: 1px solid #eee; padding: 1rem 0; }
        .comment h3 { margin: 0; color: #333; }
        .comment small { color: #666; }
        .comment p { margin-top: 0.5rem; }
        </style>
        ${commentsHtml}
    </div>
    `

    res.setHeader('Content-Type', 'text/html')
    return res.status(200).send(html)
} catch (error) {
    return res.status(500).json({ error: error.message })
}
}

function escapeHtml(unsafe) {
return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}