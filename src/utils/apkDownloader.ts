/**
 * Direct APK & Mobile Companion Downloader Utility for Expert CRM Call Agent
 */

export interface DownloadResult {
  success: boolean;
  message: string;
  url?: string;
  filename?: string;
}

export function downloadExpertCallAgentApk(
  agentName = 'Rohan Sharma', 
  token = 'EXP-88219',
  type: 'apk' | 'html' = 'apk'
): DownloadResult {
  const filename = type === 'apk' 
    ? 'expert-call-agent-v2.4.2.apk' 
    : 'expert-call-agent-standalone.html';

  const downloadEndpoint = type === 'apk'
    ? `/api/download/expert-call-agent.apk?agent=${encodeURIComponent(agentName)}&token=${encodeURIComponent(token)}`
    : `/api/download/expert-call-agent.html?agent=${encodeURIComponent(agentName)}&token=${encodeURIComponent(token)}`;

  try {
    // 1. Programmatic <a> trigger
    const link = document.createElement('a');
    link.href = downloadEndpoint;
    link.setAttribute('download', filename);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 2. Dispatch UI toast event for instant in-app feedback (avoiding window.alert in iframe)
    window.dispatchEvent(new CustomEvent('crm-download-notification', {
      detail: {
        success: true,
        type,
        filename,
        message: `Download started: ${filename} saved to your device.`,
        downloadUrl: downloadEndpoint
      }
    }));

    return {
      success: true,
      message: `Download started: ${filename}`,
      url: downloadEndpoint,
      filename
    };
  } catch (err: any) {
    console.warn("Direct download trigger error, trying blob fallback:", err);

    // Fallback: fetch blob and download
    fetch(downloadEndpoint)
      .then(res => res.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        const fallbackLink = document.createElement('a');
        fallbackLink.href = blobUrl;
        fallbackLink.download = filename;
        document.body.appendChild(fallbackLink);
        fallbackLink.click();
        document.body.removeChild(fallbackLink);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
      })
      .catch(fetchErr => {
        console.error("Blob fallback download error", fetchErr);
      });

    return {
      success: false,
      message: "Browser blocked automatic download. Please use direct link or install PWA.",
      url: downloadEndpoint,
      filename
    };
  }
}
