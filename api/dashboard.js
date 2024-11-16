import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
if (req.method !== 'GET') {
    return res.status(405).send('Method Not Allowed');
}

const password = req.headers.authorization;

if (password !== process.env.MODERATOR_PASSWORD) {
    return res.status(403).send('Unauthorized');
}

const { data, error } = await supabase.from('comments').select('*').eq('verified', false);

if (error) {
    return res.status(500).json({ error: error.message });
}

let html = '<html><body><ul>';
data.forEach(comment => {
    html += `<li>${comment.comment} 
            <button onclick="approve('${comment.id}')">Approve</button> 
            <button onclick="deleteComment('${comment.id}')">Delete</button>
            </li>`;
});
html += `
    <script>
    async function approve(id) {
        const res = await fetch('/api/approve', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': '${process.env.MODERATOR_PASSWORD}'
        },
        body: JSON.stringify({ id })
        });
        if (res.ok) location.reload();
    }
    async function deleteComment(id) {
        const res = await fetch('/api/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': '${process.env.MODERATOR_PASSWORD}'
        },
        body: JSON.stringify({ id })
        });
        if (res.ok) location.reload();
    }
    </script>
</ul></body></html>`;

res.setHeader('Content-Type', 'text/html');
res.status(200).send(html);
}
