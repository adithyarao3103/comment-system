import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    var { name, email, comment} = req.query;

    if (!name || !comment) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    email = email || '';

    const date =  new Date().toISOString().split('T')[0];

    const { data, error } = await supabase.from('comments').insert([
        { name: name, email: email , comment: comment, date: date, verified: false }
    ]);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: 'Comment added', data });
}
