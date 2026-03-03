export function getTrackingDetails() {
    if (typeof window === 'undefined') return {};

    const urlParams = new URLSearchParams(window.location.search);
    const utm_source = urlParams.get('utm_source');
    const utm_campaign = urlParams.get('utm_campaign');
    const referrer = document.referrer;

    return {
        utm_source,
        utm_campaign,
        referrer
    };
}
