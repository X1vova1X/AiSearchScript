javascript:(function() {
  function summarizePage() {
    if (!window.marked) {
      const markedScript = document.createElement('script');
      markedScript.src = 'https://unpkg.com/marked@15.0.12/marked.min.js';
      markedScript.onload = initializeSummary;
      markedScript.onerror = () => {
        alert('Error loading Markdown parser. Please try again later.');
      };
      document.head.appendChild(markedScript);
    } else {
      initializeSummary();
    }

    function initializeSummary() {
      const style = document.createElement('style');
      style.textContent = `
        #summary-container {
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
          color: #000 !important;
        }
        #summary-container h1, #summary-container h2, #summary-container h3 {
          margin: 16px 0 8px 0;
          color: #000;
        }
        #summary-container h1 { font-size: 1.5em; }
        #summary-container h2 { font-size: 1.3em; }
        #summary-container h3 { font-size: 1.1em; }
        #summary-container .content {
          font-size: 14px;
          line-height: 1.6;
          color: #000;
        }
        #summary-container code {
          background: #f6f8fa;
          color: #000;
          padding: 2px 4px;
          border-radius: 4px;
          font-family: monospace;
        }
        #summary-container pre {
          background: #f6f8fa;
          padding: 12px;
          border-radius: 6px;
          overflow-x: auto;
          margin: 12px 0;
        }
        #summary-container pre code {
          background: none;
          padding: 0;
          font-size: 0.9em;
        }
        #summary-container blockquote {
          border-left: 4px solid #dfe1e5;
          margin: 12px 0;
          padding: 4px 12px;
          color: #333;
        }
        #summary-container table {
          border-collapse: collapse;
          margin: 16px 0;
          width: 100%;
          color: #000;
        }
        #summary-container td, #summary-container th {
          border: 1px solid #dfe1e5;
          padding: 8px;
          text-align: left;
        }
        #summary-container th {
          background: #f8f9fa;
          font-weight: 600;
        }
        #summary-container ul, #summary-container ol {
          padding-left: 24px;
          margin: 8px 0;
          color: #000;
        }
        #summary-container li {
          margin: 4px 0;
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
        .open-chatgpt-btn {
          margin-top: 16px;
          padding: 8px 12px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .open-chatgpt-btn:hover {
          background-color: #0056b3;
        }
      `;
      document.head.appendChild(style);

      const container = document.createElement('div');
      container.id = 'summary-container';

      const title = document.createElement('h2');
      title.textContent = '📄 AiSearch';
      
      const closeBtn = document.createElement('button');
      closeBtn.className = 'close-btn';
      closeBtn.innerHTML = '&times;';
      closeBtn.onclick = () => container.remove();

      const content = document.createElement('div');
      content.className = 'content';
      content.textContent = 'Analyzing page content...';

      const chatGptButton = document.createElement('button');
      chatGptButton.className = 'open-chatgpt-btn';
      chatGptButton.textContent = 'Open in ChatGPT';
      chatGptButton.onclick = () => {
        const query = new URLSearchParams(window.location.search).get('q');
        window.open(`https://chatgpt.com/?q=This question was Googled by user, and then asked you about it: ${encodeURIComponent(query)}`, '_blank');
      };

      title.appendChild(closeBtn);
      container.appendChild(title);
      container.appendChild(content);
      container.appendChild(chatGptButton);
      document.body.appendChild(container);

      const pageContent = document.body.innerText;
      const truncatedContent = pageContent.slice(0, 12000);

      fetch("https://ai.aerioncloud.com/v1/chat/completions", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "o1-mini",
          messages: [
            {
              role: "system",
              content: "Generate a comprehensive Markdown summary of this webpage. Use:\n" +
                      "- **Bold** for key terms\n" +
                      "- Lists for important points\n" +
                      "- Code blocks for technical content\n" +
                      "- Tables where appropriate\n" +
                      "- Keep under 500 words\n" +
                      "- Black text formatting" +
                      "- Ignore AI overview."
            },
            {
              role: "user",
              content: `Summarize: ${truncatedContent}`
            }
          ]
        })
      })
      .then(response => response.json())
      .then(data => {
        content.innerHTML = marked.parse(data.choices[0].message.content, {
          gfm: true,
          breaks: true,
          tables: true
        });
      })
      .catch(error => {
        content.textContent = 'Error generating summary. Please try another page.';
        console.error('Summary error:', error);
      });
    }
  }

  if (document.querySelector('#summary-container')) {
    document.querySelector('#summary-container').remove();
  } else {
    summarizePage();
  }
})();
