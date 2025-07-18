export const formatTimeAgo = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) {
    const value = Math.floor(interval);
    return value === 1 ? value + " year ago" : value + " years ago";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    const value = Math.floor(interval);
    return value === 1 ? value + " month ago" : value + " months ago";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    const value = Math.floor(interval);
    return value === 1 ? value + " day ago" : value + " days ago";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    const value = Math.floor(interval);
    return value === 1 ? value + " hour ago" : value + " hours ago";
  }
  interval = seconds / 60;
  if (interval > 1) {
    const value = Math.floor(interval);
    return value === 1 ? value + " minute ago" : value + " minutes ago";
  }
  const value = Math.floor(seconds);
  return value === 1 ? value + " second ago" : value + " seconds ago";
};
