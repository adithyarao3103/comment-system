import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
}

// Handle login
if (req.method === 'POST') {
    const { password } = req.body
    const isValid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH)
    
    if (!isValid) {
    return res.status(401).json({ error: 'Invalid password' })
    }

    // Return the dashboard HTML with the password embedded in forms
    return generateDashboardHtml(password, res)
}

// Show login form for GET requests
const loginHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Comments Dashboard</title>
        <style>
        body { font-family: system-ui; max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
        .login-form { max-width: 400px; margin: 2rem auto; }
        input, button { width: 100%; padding: 0.5rem; margin: 0.5rem 0; }
        button { background: #0070f3; color: white; border: none; border-radius: 4px; cursor: pointer; }
        </style>
    </head>
    <body>
        <div class="login-form">
        <h1>Login to Dashboard</h1>
        <form id="loginForm">
            <input type="password" name="password" placeholder="Enter password" required>
            <button type="submit">Login</button>
        </form>
        </div>
        <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault()
            const password = e.target.password.value
            const res = await fetch('/api/dashboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
            })
            if (res.ok) {
            document.body.innerHTML = await res.text()
            } else {
            alert('Invalid password')
            }
        })
        </script>
    </body>
    </html>
`

res.setHeader('Content-Type', 'text/html')
return res.status(200).send(loginHtml)
}

async function generateDashboardHtml(password, res) {
try {
    const { data: comments, error } = await supabase
    .from('comments')
    .select('*')
    .eq('verified', false)
    .order('created_at', { ascending: false })

    if (error) throw error

    const commentsHtml = comments.map(comment => `
    <div class="comment">
        <h3>${escapeHtml(comment.name)}</h3>
        <small>${new Date(comment.created_at).toLocaleDateString()}</small>
        ${comment.email ? `<p>Email: ${escapeHtml(comment.email)}</p>` : ''}
        <p>${escapeHtml(comment.comment)}</p>
        <div class="actions">
        <form onsubmit="return handleAction(this, 'approve')">
            <input type="hidden" name="id" value="${comment.id}">
            <input type="hidden" name="password" value="${password}">
            <button type="submit">Approve</button>
        </form>
        <form onsubmit="return handleAction(this, 'delete')">
            <input type="hidden" name="id" value="${comment.id}">
            <input type="hidden" name="password" value="${password}">
            <button type="submit" class="delete">Delete</button>
        </form>
        </div>
    </div>
    `).join('')

    const dashboardHtml = `
    <!DOCTYPE html>
    <html>
        <head>
        <title>Comments Dashboard</title>
        <style>
            body { font-family: system-ui; max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
            .comment { border: 1px solid #eee; padding: 1rem; margin: 1rem 0; border-radius: 4px; }
            .actions { display: flex; gap: 1rem; margin-top: 1rem; }
            button { padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; }
            button[type="submit"] { background: #0070f3; color: white; }
            button.delete { background: #ff0000; color: white; }
        </style>
        </head>
        <body>
        <h1>Pending Comments</h1>
        ${comments.length === 0 ? '<p>No pending comments</p>' : commentsHtml}
        <script>
            async function handleAction(form, action) {
            try {
                const formData = new FormData(form)
                const res = await fetch(\`/api/\${action}\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: formData.get('id'),
                    password: formData.get('password')
                })
                })
                if (!res.ok) throw new Error('Action failed')
                location.reload()
            } catch (err) {
                alert('Error: ' + err.message)
            }
            return false
            }
        </script>
        </body>
    </html>
    `

    res.setHeader('Content-Type', 'text/html')
    return res.status(200).send(dashboardHtml)
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