import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
    const commonStyles = `
        <style>
            body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .login-container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 400px;
        }
        h1 { 
            text-align: center;
            color: #333;
            margin-bottom: 30px;
        }
        .error {
            color: #f44336;
            margin-bottom: 20px;
            text-align: center;
        }
        input {
            width: 100%;
            padding: 12px;
            margin-bottom: 20px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
            box-sizing: border-box;
        }
        button {
            width: 100%;
            padding: 12px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.2s;
        }
        button:hover {
            background: #45a049;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        .logout {
            padding: 8px 16px;
            background: #666;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            text-decoration: none;
            font-size: 14px;
        }
        .logout:hover {
            background: #555;
        }
        .comment {
            background: white;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .name { font-weight: bold; color: #333; }
        .email { color: #666; font-size: 0.9em; }
        .date { color: #666; font-size: 0.9em; margin: 5px 0; }
        .content { margin: 10px 0; line-height: 1.5; }
        .actions { margin-top: 10px; }
        button {
            padding: 8px 16px;
            margin-right: 10px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s;
        }
        .approve {
            background: #4CAF50;
            color: white;
        }
        .approve:hover { background: #45a049; }
        .delete {
            background: #f44336;
            color: white;
        }
        .delete:hover { background: #da190b; }
        </style>
    `;

    const renderLoginPage = (error = '') => `
        <html>
            <head>
                <title>Comment System | Dashboard</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <meta nam"author" content="Adithya A Rao"/>
                <meta name="description" content="Dashboard for the Comments for static websites."/>
                <meta name="keywords" content="comments, static websites, dashboard, password"/>
                ${commonStyles}
            </head>
            <body>
                <div class="container">
                    <h1>Comments Moderator Login</h1>
                    ${error ? `<div class="error-box">${error}</div>` : ''}
                    <div class="login-form">
                        <form method="POST">
                            <input type="password" name="password" placeholder="Enter password" class="input" required>
                            <button type="submit" class="button">Login</button>
                        </form>
                    </div>
                </div>
            </body>
        </html>
    `;

    const renderDashboard = async () => {

        const { comments, error } = await supabase
                .from('comments')
                .select('*')
                .eq('verified', false)
                .order('created_at', { ascending: false })


        return `
            <html>
                <head>
                    ${commonStyles}
                    <script>
                        const password = '${password}';

                        function showAlert(message, type = 'success') {
                            const alertDiv = document.createElement('div');
                            alertDiv.className = \`custom-alert \${type}\`;
                            alertDiv.innerHTML = \`
                                <div class="custom-alert-content">\${message}</div>
                                <span class="custom-alert-close" onclick="this.parentElement.remove()">×</span>
                            \`;
                            document.body.appendChild(alertDiv);
                            
                            // Trigger reflow to enable transition
                            alertDiv.offsetHeight;
                            alertDiv.style.opacity = '1';

                            // Auto-remove after 3 seconds
                            setTimeout(() => {
                                alertDiv.style.opacity = '0';
                                setTimeout(() => alertDiv.remove(), 300);
                            }, 3000);
                        }

                        function showConfirmDialog(message, onConfirm) {
                            const overlay = document.createElement('div');
                            overlay.className = 'confirm-dialog-overlay';
                            overlay.innerHTML = \`
                                <div class="confirm-dialog">
                                    <div>\${message}</div>
                                    <div class="confirm-dialog-buttons">
                                        <button class="button" onclick="this.closest('.confirm-dialog-overlay').remove()">Cancel</button>
                                        <button class="button delete-btn" onclick="confirmAction(this)">Confirm</button>
                                    </div>
                                </div>
                            \`;
                            document.body.appendChild(overlay);
                            overlay.style.display = 'flex';

                            // Store the callback
                            overlay.querySelector('.delete-btn').onclick = () => {
                                onConfirm();
                                overlay.remove();
                            };
                        }

                        async function updateCounter(name) {
                            const value = document.getElementById('value-' + name).value;
                            if (value.trim() === "") {
                                window.location.reload();
                                return;
                            }
                            try {
                                const response = await fetch('/set?name=' + name + '&value=' + value + '&password=' + password, {
                                    method: 'POST'
                                });
                                if (response.ok) {
                                    showAlert('Counter updated successfully');
                                    window.location.reload();
                                } else {
                                    showAlert('Failed to update counter', 'error');
                                }
                            } catch (error) {
                                showAlert('An error occurred while updating the counter', 'error');
                            }
                        }

                        async function deleteCounter(name) {
                            showConfirmDialog('Are you sure you want to delete this counter?', async () => {
                                try {
                                    const response = await fetch('/remove?name=' + name + '&password=' + password, {
                                        method: 'POST'
                                    });
                                    if (response.ok) {
                                        showAlert('Counter deleted successfully');
                                        document.getElementById("counter-" + name).outerHTML = "";
                                    } else {
                                        showAlert('Failed to delete counter', 'error');
                                    }
                                } catch (error) {
                                    showAlert('An error occurred while deleting the counter', 'error');
                                }
                            });
                        }
                    </script>
                </head>
                <body>
                    <div class="container">
                        <h1>Counter Dashboard</h1>
                        <div class="counter-list" id="counter-list">
                            <h2>Current Counters</h2>
                            ${comments.length === 0 ? '<p>No comments pending moderation.</p>' : ''}
                            ${comments.map(comment => `
                            <div class="comment" id="comment-${comment.id}" style="transition: opacity 0.3s ease">
                                <div class="name">${comment.name}</div>
                                <div class="email">${comment.email}</div>
                                <div class="date">${new Date(comment.created_at).toLocaleDateString()}</div>
                                <div class="content">${comment.comment}</div>
                                <div class="actions">
                                    <button class="approve" onclick="moderateComment(${comment.id}, 'approve')">Approve</button>
                                    <button class="delete" onclick="moderateComment(${comment.id}, 'delete')">Delete</button>
                                </div>
                            </div>
                            `).join('')}
                        </div>
                    </div>
                </body>
            </html>
        `;
    };

    try {
        if (req.method === 'GET') {
            res.setHeader('Content-Type', 'text/html');
            return res.send(renderLoginPage());
        }
        
        if (req.method === 'POST') {
            const { password } = req.body;

            if (!password) {
                res.setHeader('Content-Type', 'text/html');
                return res.send(renderLoginPage('Password is required'));
            }

            const hashedPassword = crypto
                .createHash('sha256')
                .update(password)
                .digest('hex');

            const correctPasswordHash = process.env.ADMIN_PASSWORD_HASH;

            if (!correctPasswordHash || hashedPassword !== correctPasswordHash) {
                res.setHeader('Content-Type', 'text/html');
                return res.send(renderLoginPage('Invalid password'));
            }

            res.setHeader('Content-Type', 'text/html');
            res.send(await renderDashboard());
        }

    } catch (error) {
        console.error('Dashboard error:', error);
        res.setHeader('Content-Type', 'text/html');
        res.status(500).send(renderLoginPage('An error occurred. Please try again.'));
    }
}