let defaultBlockedSites = [
{ pattern: "*://pjmedia.com/*", enabled: true },
{ pattern: "*://*.pjmedia.com/*", enabled: true },
{ pattern: "*://hotair.com/*", enabled: true },
{ pattern: "*://*.hotair.com/*", enabled: true },
{ pattern: "*://bearingarms.com/*", enabled: true },
{ pattern: "*://*.bearingarms.com/*", enabled: true },
{ pattern: "*://watcher.guru/*", enabled: true },
{ pattern: "*://*.watcher.guru/*", enabled: true },
{ pattern: "*://cdm.com/*", enabled: true },
{ pattern: "*://*.cdm.com/*", enabled: true },
{ pattern: "*://armedforcespress.com/*", enabled: true },
{ pattern: "*://*.armedforcespress.com/*", enabled: true },
{ pattern: "*://revolver.news/*", enabled: true },
{ pattern: "*://*.revolver.news/*", enabled: true },
{ pattern: "*://westernjournal.com/*", enabled: true },
{ pattern: "*://*.westernjournal.com/*", enabled: true },
{ pattern: "*://nysun.com/*", enabled: true },
{ pattern: "*://*.nysun.com/*", enabled: true },
{ pattern: "*://dailywire.com/*", enabled: true },
{ pattern: "*://*.dailywire.com/*", enabled: true },
{ pattern: "*://trishregan.com/*", enabled: true },
{ pattern: "*://*.trishregan.com/*", enabled: true },
{ pattern: "*://sharylattkisson.com/*", enabled: true },
{ pattern: "*://*.sharylattkisson.com/*", enabled: true },
{ pattern: "*://americasvoice.news/*", enabled: true },
{ pattern: "*://*.americasvoice.news/*", enabled: true }
];

let currentListener = null;

function setupListener() {
    if (currentListener) {
        chrome.webRequest.onBeforeRequest.removeListener(currentListener);
        currentListener = null;
    }

    chrome.storage.local.get(["blockedSites", "blockingEnabled"], (data) => {
        let sites = data.blockedSites;
        if (!sites) {
            sites = defaultBlockedSites;
            chrome.storage.local.set({ blockedSites: sites });
        }
        const activePatterns = sites.filter(site => site.enabled).map(site => site.pattern);

        let blockingEnabled = data.blockingEnabled;
        if (blockingEnabled === undefined) {
            blockingEnabled = true;
            chrome.storage.local.set({ blockingEnabled });
        }

        if (blockingEnabled && activePatterns.length > 0) {
            currentListener = function(details) {
                const blockedUrl = encodeURIComponent(details.url);
                logToStorage(`Blocked: ${details.url}`);
                return { redirectUrl: chrome.runtime.getURL(`blocked.html?url=${blockedUrl}`) };
            };

            chrome.webRequest.onBeforeRequest.addListener(
                currentListener,
                { urls: activePatterns },
                ["blocking"]
            );
        }
    });
}

function logToStorage(message) {
    chrome.storage.local.get('siteBlockerLogs', function(data) {
        const logs = data.siteBlockerLogs || [];
        logs.push(message);
        chrome.storage.local.set({ siteBlockerLogs: logs });
    });
}

setupListener();

chrome.storage.onChanged.addListener(function(changes, areaName) {
    if (areaName === "local" && (changes.blockedSites || changes.blockingEnabled)) {
        setupListener();
    }
});
