/**
 * Automatically extracts YouTube Video ID, High-Res Thumbnail URL, and Embed URL
 * from any standard YouTube link, Shorts link, or shortened URL.
 */
export function parseYouTubeUrl(url: string) {
  if (!url) {
    return {
      videoId: "",
      thumbnailUrl: "/circuit-schematic.jpg",
      embedUrl: "",
    };
  }

  let videoId = "";
  
  // Match standard watch?v=, youtu.be/, shorts/, embed/, v/
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  if (match && match[2] && match[2].length === 11) {
    videoId = match[2];
  }

  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : "/circuit-schematic.jpg";

  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1`
    : url;

  return { videoId, thumbnailUrl, embedUrl };
}
