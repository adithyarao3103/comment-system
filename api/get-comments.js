import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const styles = `
    <style>
    * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
            font-size: calc(0.55vw + 5px);
        }

        .container {
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
        }

        .comment-form {
            background-color: #f8f9fa;
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        }

        h2{
            font-size: 1.5em;
        }

        .comment-form >h2{
            margin-bottom: 20px;
        }

        .form-group {
            margin-bottom: 15px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 600;
        }

        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 12px;
            background-color: white;
            border: 1px solid #e1e4e8;
            border-radius: 8px;
            transition: all 0.2s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #007bff;
            box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }

        .form-group textarea {
            height: 120px;
            resize: vertical;
        }

        button {
            background-color: #007bff;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s ease;
        }

        button:hover {
            background-color: #0056b3;
            transform: translateY(-1px);
            box-shadow: 0 4px 10px rgba(0, 123, 255, 0.2);
        }

        .comments-list {
            margin-top: 30px;
        }

        .comments-list h2 {
            margin-bottom: 20px;
            color: #2c3e50;
        }

        .comment {
            background-color: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
            transition: transform 0.2s ease;
        }

        .comment:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
        }

        .comment-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }

        .comment-author {
            font-weight: 600;
            color: #2c3e50;
        }

        .comment-date {
            color: #6c757d;
        }

        .comment-content {
            color: #4a5568;
            line-height: 1.6;
        }

        /* Add subtle animation to form inputs */
        .form-group input:focus::placeholder,
        .form-group textarea:focus::placeholder {
            transform: translateY(-3px);
            opacity: 0.7;
            transition: all 0.2s ease;
        }

        @media (max-width: 600px){
            * {
                font-size: calc(1.5vh + 5px);
            }
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

let addform = `
<div class="container">
        <!-- Comment Form -->
        <div class="comment-form">
            <h2>Add a Comment</h2>
            <form id="commentForm">
                <div class="form-group">
                    <label for="name">Name:</label>
                    <input type="text" id="name" name="name" placeholder="Enter your name" required>
                </div>
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" placeholder="Enter your email" required>
                </div>
                <div class="form-group">
                    <label for="comment">Comment:</label>
                    <textarea id="comment" name="comment" placeholder="Write your comment here..." required></textarea>
                </div>
                <button type="submit">Post Comment</button>
            </form>
        </div>`

let commentList = `<div class="comments-list"><h2>Comments</h2>`;
data.forEach(comment => {
    commentList += `<div class="comment">
                <div class="comment-header">
                    <span class="comment-author">${comment.name}</span>
                    <span class="comment-date">${comment.date}</span>
                </div>
                <div class="comment-content">${comment.comment}</div>
            </div>`;
});

const html = `${styles} ${addform} ${commentList}`

res.setHeader('Content-Type', 'text/html');
res.status(200).send(html);
}
