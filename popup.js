document.addEventListener('DOMContentLoaded', () => {
    const siteList = document.getElementById('siteList');
    const addSiteForm = document.getElementById('addSiteForm');
    const newSiteInput = document.getElementById('newSite');
    const toggleGlobalButton = document.getElementById('toggleGlobal');

    function loadSites() {
        chrome.storage.local.get(['blockedSites', 'blockingEnabled'], (data) => {
            let sites = data.blockedSites || [];
            siteList.innerHTML = '';
            sites.forEach((site, index) => {
                const li = document.createElement('li');
                li.textContent = site.pattern;
                const toggle = document.createElement('input');
                toggle.type = 'checkbox';
                toggle.checked = site.enabled;
                toggle.addEventListener('change', () => {
                    sites[index].enabled = toggle.checked;
                    chrome.storage.local.set({ blockedSites: sites });
                });
                li.appendChild(toggle);
                siteList.appendChild(li);
            });

            toggleGlobalButton.textContent = data.blockingEnabled ? 'Disable Blocking' : 'Enable Blocking';
        });
    }

    loadSites();

    addSiteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let newSite = newSiteInput.value.trim();
        if (!newSite) return;

        const basePattern = `*://${newSite}/*`;
        const subdomainPattern = `*://*.${newSite}/*`;

        chrome.storage.local.get('blockedSites', (data) => {
            let sites = data.blockedSites || [];
            [basePattern, subdomainPattern].forEach(pattern => {
                if (!sites.some(s => s.pattern === pattern)) {
                    sites.push({ pattern: pattern, enabled: true });
                }
            });
            chrome.storage.local.set({ blockedSites: sites }, () => {
                newSiteInput.value = '';
                loadSites();
            });
        });
    });

    toggleGlobalButton.addEventListener('click', () => {
        chrome.storage.local.get('blockingEnabled', (data) => {
            const currentState = data.blockingEnabled !== undefined ? data.blockingEnabled : true;
            const newState = !currentState;
            chrome.storage.local.set({ blockingEnabled: newState }, loadSites);
        });
    });
});
