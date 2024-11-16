import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const styles = `
    <style>
    .container{
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        padding: 0 20px
        row-gap: 10px;
    }
    .comment{
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        padding: 0 20px;
        row-gap: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    }
    .name-date{
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        margin: 0 auto;
        padding: 0 20px;

    }
    .name{
        font-weight: bold;
    }
    .date{
        font-style: italic;
    }
    .comment-text{
        width: 100%;
        margin: 0 auto;
        padding: 0 20px;
        row-gap: 10px;
    }
    </style>
`

export default async function handler(req, res) {
if (req.method !== 'GET') {
    return res.status(405).send('Method Not Allowed');
}

const { data, error } = await supabase.from('comments').select('*').eq('verified', true);

if (error) {
    return res.status(500).json({ error: error.message });
}

let html = '<html><body>' + styles + '<div class="container">';
data.forEach(comment => {
    html += `<div class="comment"> <div class="name-date"> <div class="name">${comment.name}</div><div class="date">${comment.date}</div></div><div class="comment-text">${comment.comment}</div></div>`;
});
html += '</ul></body></html>';

res.setHeader('Content-Type', 'text/html');
res.status(200).send(html);
}
