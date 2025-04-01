export function isValidTimeFormat(time: string): boolean {
    // Check if the time matches the format HH:MM:SS (24-hour format)
    return /^([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/.test(time);
  }