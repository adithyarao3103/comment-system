import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
}

const { name, email, comment, date } = req.body;

if (!name || !comment || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
}

const { data, error } = await supabase.from('comments').insert([
    { name, email, comment, date, created_at: new Date(), verified: false }
]);

if (error) {
    return res.status(500).json({ error: error.message });
}

res.status(200).json({ message: 'Comment added', data });
}
