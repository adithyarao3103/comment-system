import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
if (req.method !== 'GET') {
    return res.status(405).send('Method Not Allowed');
}

const { data, error } = await supabase.from('comments').select('*').eq('verified', true);

if (error) {
    return res.status(500).json({ error: error.message });
}

let html = '<html><body><ul>';
data.forEach(comment => {
    html += `<li><strong>${comment.name}:</strong> ${comment.comment} <em>(${comment.date})</em></li>`;
});
html += '</ul></body></html>';

res.setHeader('Content-Type', 'text/html');
res.status(200).send(html);
}
