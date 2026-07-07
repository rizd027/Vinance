/**
 * Cloudinary Upload Service
 * 
 * Provides client-side image uploading directly to Cloudinary using Unsigned Uploads.
 */

export async function uploadToCloudinary(fileOrDataUrl: File | string): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dlnd3fzty';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

  if (!cloudName) {
    throw new Error('Cloudinary Cloud Name is not configured.');
  }

  const formData = new FormData();
  formData.append('file', fileOrDataUrl);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.error?.message || `HTTP ${response.status} ${response.statusText}`;
      
      if (message.toLowerCase().includes('preset') || response.status === 400) {
        throw new Error(`Upload gagal: Pastikan Anda telah membuat Unsigned Upload Preset bernama "${uploadPreset}" di dashboard Cloudinary Anda.`);
      }
      throw new Error(`Cloudinary Error: ${message}`);
    }

    const data = await response.json();
    return data.secure_url || data.url;
  } catch (err: any) {
    console.error('[Cloudinary] Upload failed:', err);
    throw err;
  }
}
