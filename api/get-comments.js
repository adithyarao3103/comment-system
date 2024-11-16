import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const styles = `
    <style>
        .container-comments> * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
        }

        .container-comments {
            max-width: 1200px;
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

        
        .success-message {
            background-color: #d4edda;
            color: #155724;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
            display: none;
        }

        .error-message {
            background-color: #f8d7da;
            color: #721c24;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
            display: none;
        }

        /* Loading spinner */
        .loading {
            display: none;
            margin-left: 10px;
            width: 20px;
            height: 20px;
            border: 2px solid #ffffff;
            border-top: 2px solid transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .submit-wrapper {
            display: flex;
            align-items: center;
        }


        @media (max-width: 600px){
            * {
                font-size: calc(1.25vh + 5px);
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
<div class="container-comments">
        <div id="successMessage" class="success-message">
            Thank you! Your comment has been submitted and is waiting for review.
        </div>

        <div id="errorMessage" class="error-message">
            Sorry, there was an error submitting your comment. Please try again later.
        </div>

        <!-- Comment Form -->
        <div class="comment-form" id="comment-form">
            <h2>Add a Comment</h2>
            <form id="addCommentForm" onsubmit="return false;">
                <div class="form-group">
                    <label for="name">Name:</label>
                    <input type="text" id="name" name="name" placeholder="Enter your name" required>
                </div>
                <div class="form-group">
                    <label for="email">Email (Optional):</label>
                    <input type="email" id="email" name="email" placeholder="Enter your email">
                </div>
                <div class="form-group">
                    <label for="comment">Comment:</label>
                    <textarea id="comment" name="comment" placeholder="Write your comment here..." required></textarea>
                </div>
                <div class="submit-wrapper">
                    <button type="submit" onclick="submit()">Post Comment</button>
                    <div id="loading" class="loading"></div>
                </div>
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

commentList += `</div></div>`;

let scripts = `
        <script>
        console.log('Script is running'); // Check if the script runs
        const form = document.getElementById('addCommentForm');
        console.log('Form element:', form); // Check if the form element is found
        if (!form) {
            console.error('Form not found');
        }

        function submit(){
            const loading = document.getElementById('loading');
            loading.style.display = 'block';
        
            // Reset error and success messages
            document.getElementById('errorMessage').style.display = 'none';
            document.getElementById('successMessage').style.display = 'none';
        
            // Get form data
            const name = encodeURIComponent(document.getElementById('name').value);
            const email = encodeURIComponent(document.getElementById('email').value);
            const comment = encodeURIComponent(document.getElementById('comment').value);
        
            try {
                // Construct the URL with encoded parameters
                const url = "https://comment-system-adithyarao3103.vercel.app/api/add-comment?name=" + 
                    name + "&comment=" + comment + "&email=" + email;
            
                // Make the request
                const response = await fetch(url);
                const data = await response.json(); // Parse the JSON response
            
                if (response.ok) {
                    // Hide the form
                    document.getElementById('comment-form').style.display = 'none';
                    // Show success message
                    document.getElementById('successMessage').style.display = 'block';
                } else {
                    // Show error message with the error from the server if available
                    const errorMessage = document.getElementById('errorMessage');
                    errorMessage.textContent = data.error || 'An error occurred while submitting the comment.';
                    errorMessage.style.display = 'block';
                }
            } catch (error) {
                // Show error message for network or parsing errors
                const errorMessage = document.getElementById('errorMessage');
                errorMessage.textContent = 'An error occurred while submitting the comment. Please try again.';
                errorMessage.style.display = 'block';
                console.error('Error:', error);
            } finally {
                // Hide loading spinner
                loading.style.display = 'none';
            }
        }
    </script>
`

const html = `
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"> ${styles} ${addform} ${commentList} ${scripts}`

res.setHeader('Content-Type', 'text/html');
res.setHeader('Access-Control-Allow-Origin', '*');  // Or specific origins
res.setHeader('Access-Control-Allow-Methods', 'GET');
res.status(200).send(html);
}
