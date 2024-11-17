import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    const commonStyles = `
        <style>
        body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                background-color: #f5f5f5;
                padding: 10px;
            }

        .container {
                max-width: 50vw;
                margin: 0 auto;
                padding: 0 15px;
                width: 100%;
                box-sizing: border-box;
            }

        h1, h2 {
                color: #333;
                font-size: 24px;
                margin: 10px 0;
            }
        
        .input {
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                margin: 5px 0;
                width: 100%;
                box-sizing: border-box;
                font-size: 16px; /* Prevents zoom on iOS */
                max-width: 100%;
            }

        .error-box {
                padding: 15px;
                border: 1px solid #ff4444;
                background-color: #ffeeee;
                border-radius: 4px;
                margin: 15px 0;
                word-wrap: break-word;
            }

            .login-form {
                background: white;
                padding: 15px;
                border-radius: 4px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                margin-bottom: 20px;
            }


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
            margin-top: 30px;
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
        .comment-card {
            background-color: white;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .comment-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }

        .user-info {
            flex: 1;
        }

        .name {
            font-weight: 600;
            color: #333;
        }

        .date {
            color: #666;
            font-size: 0.9em;
        }

        .comment-text {
            color: #444;
            margin-bottom: 16px;
        }

        .action-buttons {
            display: flex;
            gap: 8px;
        }

        button {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            transition: background-color 0.2s;
        }

        .approve-btn {
            background-color: #34d399;
            color: white;
        }

        .approve-btn:hover {
            background-color: #059669;
        }

        .delete-btn {
            background-color: #ef4444;
            color: white;
        }

        .delete-btn:hover {
            background-color: #dc2626;
        }

        /* Custom Alert Styles */
            .custom-alert {
                position: fixed;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                padding: 12px 20px;
                border-radius: 4px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 90%;
                max-width: 500px;
                opacity: 0;
                transition: opacity 0.3s ease-in-out;
                box-sizing: border-box;
            }

            .custom-alert.success {
                background-color: #d4edda;
                border: 1px solid #c3e6cb;
                color: #155724;
            }

            .custom-alert.error {
                background-color: #f8d7da;
                border: 1px solid #f5c6cb;
                color: #721c24;
            }

            .custom-alert.warning {
                background-color: #fff3cd;
                border: 1px solid #ffeeba;
                color: #856404;
            }

            .custom-alert-content {
                flex-grow: 1;
                margin-right: 12px;
                font-size: 14px;
            }

            .custom-alert-close {
                cursor: pointer;
                font-weight: bold;
                opacity: 0.7;
                padding: 8px;
                font-size: 18px;
            }

            /* Confirmation Dialog Styles */
            .confirm-dialog-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                padding: 15px;
            }

            .confirm-dialog {
                background: white;
                padding: 20px;
                border-radius: 4px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                width: 90%;
                max-width: 400px;
                margin: 0 auto;
                box-sizing: border-box;
            }

            .confirm-dialog-buttons {
                margin-top: 20px;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                flex-wrap: wrap;
            }
        </style>
    `;

    const renderLoginPage = (error = '') => `
        <html>
            <head>
                <title>Comments Manager | Dashboard</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <meta nam"author" content="Adithya A Rao"/>
                <meta name="description" content="Dashboard for the Visitor Counter App for static websites."/>
                <meta name="keywords" content="visitor counter, static websites, dashboard, password"/>
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

    const renderDashboard = async (password) => {
        const { data, error } = await supabase.from('comments').select('*').eq('verified', false);

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

                        async function approveComment(id) {
                            try {
                                const response = await fetch('/api/approve?id=' + id + '&password=' + password, {
                                    method: 'POST'
                                });
                                if (response.ok) {
                                    showAlert('Comment approved successfully');
                                    window.location.reload();
                                } else {
                                    showAlert('Failed to approve comment', 'error');
                                }
                            } catch (error) {
                                showAlert('An error occurred while approving the commentr', 'error');
                            }
                        }

                        async function deleteComment(id) {
                            showConfirmDialog('Are you sure you want to delete this comment?', async () => {
                                try {
                                    const response = await fetch('/api/delete?id=' + id + '&password=' + password, {
                                        method: 'POST'
                                    });
                                    if (response.ok) {
                                        showAlert('Comment deleted successfully');
                                        window.location.reload();
                                    } else {
                                        showAlert('Failed to delete comment', 'error');
                                    }
                                } catch (error) {
                                    showAlert('An error occurred while deleting the comment', 'error');
                                }
                            });
                        }
                    </script>
                </head>
                <body>
                    <div class="container">
                        <h1>Comments Dashboard</h1>
                        <div class="counter-list" id="counter-list">
                            <h2>Comments to be moderated</h2>
                            ${data.length === 0 ? '<p>No comments to be moderated</p>' : ''}
                            ${data.map(comment => `
                                <div class="comment-card">
                                <div class="comment-header">
                                    <div class="user-info">
                                        <span class="name">${comment.name}</span>
                                        <span class="date">${comment.date}</span>
                                    </div>
                                    <div class="action-buttons">
                                        <button class="approve-btn" onclick="approveComment(${comment.id})">Approve</button>
                                        <button class="delete-btn" onclick="deleteComment(${comment.id})">Delete</button>
                                    </div>
                                </div>
                                <div class="comment-text">
                                    ${comment.comment}
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
            res.send(await renderDashboard(password));
        }

    } catch (error) {
        console.error('Dashboard error:', error);
        res.setHeader('Content-Type', 'text/html');
        res.status(500).send(renderLoginPage('An error occurred. Please try again.'));
    }
}