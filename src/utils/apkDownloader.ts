/**
 * Direct APK & Mobile Companion Downloader Utility for Expert CRM Call Agent
 * Ensures seamless downloads on mobile devices, tablets, and desktop browsers.
 */

export interface DownloadResult {
  success: boolean;
  message: string;
  url: string;
  filename: string;
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
    // 1. Trigger via standard download anchor element
    const link = document.createElement('a');
    link.href = downloadEndpoint;
    link.setAttribute('download', filename);
    link.setAttribute('target', '_self');
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 1500);

    // 2. Dispatch UI toast event for instant in-app notification
    window.dispatchEvent(new CustomEvent('crm-download-notification', {
      detail: {
        success: true,
        type,
        filename,
        message: `Package ${filename} download initiated!`,
        downloadUrl: downloadEndpoint
      }
    }));

    return {
      success: true,
      message: `Downloading ${filename}...`,
      url: downloadEndpoint,
      filename
    };
  } catch (err: any) {
    console.warn("Direct download error, falling back to window location:", err);
    try {
      window.location.href = downloadEndpoint;
    } catch (navErr) {
      console.error("Navigation download error", navErr);
    }

    return {
      success: false,
      message: "Download started. If prompt did not appear, use direct link.",
      url: downloadEndpoint,
      filename
    };
  }
}
