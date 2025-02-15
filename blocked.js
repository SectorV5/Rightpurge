document.addEventListener('DOMContentLoaded', () => {
    const urlDisplay = document.getElementById('url');

    try {
        const rawQuery = window.location.search.split('#')[0];
        const urlParam = new URLSearchParams(rawQuery).get('url');

        if(urlParam) {
            let decodedUrl;
            try {
                decodedUrl = decodeURIComponent(urlParam);
            } catch(e) {
                decodedUrl = urlParam;
            }

            try {
                // Handle extension URLs differently
                if(decodedUrl.startsWith('moz-extension://')) {
                    urlDisplay.textContent = new URL(decodedUrl).searchParams.get('url') || decodedUrl;
                } else {
                    const urlObj = new URL(decodedUrl);
                    urlDisplay.textContent = urlObj.hostname || decodedUrl;
                }
            } catch {
                urlDisplay.textContent = decodedUrl;
            }
        }
    } catch(e) {
        urlDisplay.textContent = '[Invalid URL]';
        urlDisplay.style.color = 'var(--accent-red)';
    }
});
