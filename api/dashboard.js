import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
// Check moderator password
const authHeader = req.headers.authorization
if (!authHeader || `Bearer ${process.env.MODERATOR_PASSWORD}` !== authHeader) {
    return res.status(401).json({ error: 'Unauthorized' })
}

if (req.method === 'GET') {
    try {
    // Fetch unverified comments
    const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('verified', false)
        .order('created_at', { ascending: false })

    if (error) throw error

    // Return moderator interface
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Comment Moderation</title>
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
            .name { font-weight: bold; color: #333; }
            .email { color: #666; font-size: 0.9em; }
            .date { color: #666; font-size: 0.9em; margin: 5px 0; }
            .content { margin: 10px 0; line-height: 1.5; }
            .actions { margin-top: 10px; }
            button {
                padding: 8px 16px;
                margin-right: 10px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: background-color 0.2s;
            }
            .approve {
                background: #4CAF50;
                color: white;
            }
            .approve:hover { background: #45a049; }
            .delete {
                background: #f44336;
                color: white;
            }
            .delete:hover { background: #da190b; }
            </style>
            <script>
            async function moderateComment(id, action) {
                try {
                const response = await fetch('/api/moderator', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ${process.env.MODERATOR_PASSWORD}'
                    },
                    body: JSON.stringify({ id, action })
                });
                
                if (response.ok) {
                    const comment = document.getElementById('comment-' + id);
                    comment.style.opacity = '0';
                    setTimeout(() => comment.remove(), 300);
                } else {
                    alert('Error: ' + (await response.json()).error);
                }
                } catch (error) {
                console.error('Error:', error);
                alert('Error processing request');
                }
            }
            </script>
        </head>
        <body>
            <h1>Comment Moderation</h1>
            ${data.length === 0 ? '<p>No comments pending moderation.</p>' : ''}
            ${data.map(comment => `
            <div class="comment" id="comment-${comment.id}" style="transition: opacity 0.3s ease">
                <div class="name">${comment.name}</div>
                <div class="email">${comment.email}</div>
                <div class="date">${new Date(comment.created_at).toLocaleDateString()}</div>
                <div class="content">${comment.comment}</div>
                <div class="actions">
                <button class="approve" onclick="moderateComment(${comment.id}, 'approve')">Approve</button>
                <button class="delete" onclick="moderateComment(${comment.id}, 'delete')">Delete</button>
                </div>
            </div>
            `).join('')}
        </body>
        </html>
    `
    res.setHeader('Content-Type', 'text/html')
    return res.status(200).send(html)
    } catch (error) {
    console.error('Error fetching comments:', error)
    return res.status(500).json({ error: 'Error fetching comments' })
    }
}

if (req.method === 'POST') {
    try {
    const { id, action } = req.body

    if (action === 'approve') {
        const { error } = await supabase
        .from('comments')
        .update({ verified: true })
        .eq('id', id)

        if (error) throw error
    } else if (action === 'delete') {
        const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id)

        if (error) throw error
    }

    return res.status(200).json({ success: true })
    } catch (error) {
    console.error('Error moderating comment:', error)
    return res.status(500).json({ error: 'Error moderating comment' })
    }
}

return res.status(405).json({ error: 'Method not allowed' })
}