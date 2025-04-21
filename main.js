function displayQParameter() {
    const urlParams = new URLSearchParams(window.location.search);

    // Check for 'q', then 'search', then 'text', then 'p'
    const searchQuery = urlParams.get('q') || urlParams.get('search') || urlParams.get('text') || urlParams.get('p');

    if (searchQuery) {
        const decodedQuery = decodeURIComponent(searchQuery);

        // Create styles for the container
        const style = document.createElement('style');
        style.textContent = `
            #q-parameter-container {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 400px;
                border: 1px solid #dfe1e5;
                border-radius: 8px;
                padding: 16px;
                background: #fff;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                font-family: Arial, sans-serif;
                z-index: 1000;
                max-height: 80vh;
                overflow-y: auto;
            }
            #q-parameter-container h2 {
                font-size: 18px;
                color: #202124;
                margin: 0 0 12px 0;
                padding: 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            #q-parameter-container .content {
                font-size: 14px;
                color: #3c4043;
                line-height: 1.5;
            }
            #q-parameter-container .loading {
                color: #70757a;
                font-style: italic;
            }
            .close-btn {
                cursor: pointer;
                border: none;
                background: none;
                font-size: 24px;
                color: #70757a;
                padding: 0 8px;
                line-height: 1;
            }
            .close-btn:hover {
                color: #202124;
            }
            .open-tab-btn {
                display: block;
                margin: 16px 0 0 0; /* Space between the button and other elements */
                padding: 12px 16px;
                width: calc(100% - 32px); /* Full width minus padding (16px on each side) */
                font-size: 14px;
                color: #fff;
                background-color: #1a73e8;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                text-align: center;
            }
            .open-tab-btn:hover {
                background-color: #1558b0;
            }
        `;
        document.head.appendChild(style);

        // Create container elements
        const container = document.createElement('div');
        container.id = 'q-parameter-container';

        const title = document.createElement('h2');
        title.textContent = 'AI Search';

        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => {
            container.style.display = 'none';
        };

        const content = document.createElement('div');
        content.className = 'content loading';
        content.textContent = 'Loading...';

        // Create "Open in ChatGPT" button
        const openTabBtn = document.createElement('button');
        openTabBtn.className = 'open-tab-btn';
        openTabBtn.textContent = 'Open in ChatGPT';
        openTabBtn.onclick = () => {
            const newTabUrl = `https://chatgpt.com/?q=${encodeURIComponent(`This query was searched on Google and then a human opened it in ChatGPT: ${decodedQuery}`)}`;
            window.open(newTabUrl, '_blank');
        };

        // Add elements to container
        title.appendChild(closeBtn);
        container.appendChild(title);
        container.appendChild(content);
        container.appendChild(openTabBtn);

        // Add to document body
        document.body.appendChild(container);

        // Fetch AI response
        fetch("https://ai.aerioncloud.com/v1/chat/completions", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are AiSearch. You are a bookmarklet that works on Google to answer questions using AI. Respond ONLY with the answer, no introductions. Don't use any markdown (bold text, italic text etc.)"
                    },
                    {
                        role: "user",
                        content: decodedQuery
                    }
                ]
            })
        })
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                content.className = 'content';
                content.textContent = data.choices[0].message.content;
            })
            .catch(error => {
                container.style.display = 'none';
                alert('AiSearch isn\'t available on this website.');
            });
    } else {
        alert('AiSearch isn\'t available on this website.');
    }
}

// Initial call
displayQParameter();
