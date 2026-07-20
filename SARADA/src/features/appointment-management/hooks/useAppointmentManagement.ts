export const generateSlots = (start, end) => {
  const slots = [];
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);

  let currentMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  while (currentMinutes < endMinutes) {
    const h = Math.floor(currentMinutes / 60)
      .toString()
      .padStart(2, "0");
    const m = (currentMinutes % 60).toString().padStart(2, "0");
    slots.push(`${h}:${m}`);
    currentMinutes += 30;
  }
  return slots;
};

export const getFormattedTime = (time24) => {
  if (!time24) return { time12: "", suffix: "", meridiem: "" };
  const [h, m] = time24.split(":");
  const hours = parseInt(h);
  const suffix = hours >= 12 ? "PM" : "AM";
  const meridiem = hours >= 12 ? "Post Mer." : "Ante Mer.";
  const h12 = hours % 12 || 12;
  const time12 = `${h12}:${m}`;
  return { time12, suffix, meridiem };
};
