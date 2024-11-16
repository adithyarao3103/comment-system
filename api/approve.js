import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
}

const password = req.headers.authorization;
const { id } = req.body;

if (password !== process.env.MODERATOR_PASSWORD || !id) {
    return res.status(403).send('Unauthorized or missing fields');
}

const { error } = await supabase.from('comments').update({ verified: true }).eq('id', id);

if (error) {
    return res.status(500).json({ error: error.message });
}

res.status(200).json({ message: 'Comment approved' });
}
    