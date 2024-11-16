import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        var { name, email, comment } = req.body

      // Input validation
        if (!name || !comment) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        const today = new Date()
        const year = today.getFullYear();
        const mes = today.getMonth()+1;
        const dia = today.getDate();
        const date =year+"-"+mes+"-"+dia;

      // Add comment to database
        const { data, error } = await supabase
        .from('comments')
        .insert([
            {
                name: name.trim(),
                email: email? email.trim(): null,
                comment: comment.trim(),
                verified: false,
                created_at: today.toISOString(),
                date: date
            }
        ])

        if (error) throw error
    
        return res.status(200).json({ 
            success: true, 
            message: 'Comment submitted and awaiting moderation' 
        })
    } catch (error) {
        console.error('Error adding comment:', error)
        return res.status(500).json({ error: 'Error adding comment' })
    }
}