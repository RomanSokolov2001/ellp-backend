class HtmlResponses {
    getSuccessHtml(firstName, lastName) {
        return `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Member Status</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background: #f0f0f0;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            height: 100vh;
                        }
                        .card {
                            background: white;
                            padding: 2rem;
                            border-radius: 10px;
                            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                            text-align: center;
                        }
                        .name {
                            font-size: 1.5rem;
                            font-weight: bold;
                            margin-bottom: 0.5rem;
                        }
                        .status {
                            font-size: 1.2rem;
                            color: green;
                        }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="name">${firstName} ${lastName}</div>
                        <div class="status">Status: Active ✅</div>
                    </div>
                </body>
                </html>
            `;
    }

    getNotFoundHtml(email) {
            return `
            <!DOCTYPE html>
        <html>
        <head>
        <title>${email} Not Found</title>
        <style>
            body {
            font-family: 'Segoe UI', sans-serif;
            background: #fff4f4;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            color: #b00020;
        }
            .message-box {
            text-align: center;
            background: #fff;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
            .title {
            font-size: 1.8rem;
            margin-bottom: 1rem;
        }
        </style>
    </head>
        <body>
        <div class="message-box">
            <div class="title">🚫 Member Not Found</div>
            <p>We couldn't locate a member with email: ${email}.</p>
        </div>
        </body>
    </html>`

    }

    getErrorHtml() {
        return `
            <!DOCTYPE html>
        <html>
        <head>
        <title>Interntal server error</title>
        <style>
            body {
            font-family: 'Segoe UI', sans-serif;
            background: #fff4f4;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            color: #b00020;
        }
            .message-box {
            text-align: center;
            background: #fff;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
            .title {
            font-size: 1.8rem;
            margin-bottom: 1rem;
        }
        </style>
    </head>
        <body>
        <div class="message-box">
            <p>Something went wrong on the server :(</p>
        </div>
        </body>
    </html>`

    }

    getNotActiveHtml(firstName, lastName) {
        return `<!DOCTYPE html>
        <html>
        <head>
        <title>Activation Required</title>
        <style>
            body {
            font-family: 'Segoe UI', sans-serif;
            background: #fffbe6;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            color: #ff9800;
        }
            .message-box {
            text-align: center;
            background: #fff;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
            .title {
            font-size: 1.8rem;
            margin-bottom: 1rem;
        }
        </style>
    </head>
        <body>
        <div class="message-box">
            <div class="title">🕒 Activation Needed</div>
            <p>${firstName} ${lastName} isn't active yet.<br/>Please complete activation to proceed.</p>
        </div>
        </body>
    </html>`
    }
}

export const htmlResponses = new HtmlResponses();
