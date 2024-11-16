import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
}

try {
    const { name, email, comment } = req.body

    if (!name || !comment) {
    return res.status(400).json({ error: 'Name and comment are required' })
    }

    const { data, error } = await supabase
    .from('comments')
    .insert([
        {
        nam: name,
        email: email? email : null,
        comment: comment,
        created_at: new Date().toISOString(),
        verified: false
        }
    ])

    if (error) throw error

    return res.status(200).json({ message: 'Comment added successfully', data })
} catch (error) {
    return res.status(500).json({ error: error.message })
}
}