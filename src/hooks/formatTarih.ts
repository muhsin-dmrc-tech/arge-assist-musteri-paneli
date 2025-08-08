export default function formatTarih(isoDateString:string) {
  const now:any = new Date();
  const date:any = new Date(isoDateString);
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const saat = date.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diffMinutes < 1) {
    return "Az önce";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} dk. önce`;
  } else if (diffHours < 5) {
    return `${diffHours} saat önce`;
  } else if (isToday) {
    return saat;
  } else if (isYesterday) {
    return `Dün ${saat}`;
  } else {
    const nowYear = now.getFullYear();
    const dateYear = date.getFullYear();

    const gun = date.getDate();
    const ay = date.toLocaleDateString("tr-TR", { month: "long" });
    const gunAdi = date.toLocaleDateString("tr-TR", { weekday: "long" });

    if (nowYear === dateYear) {
      return `${gun} ${ay} ${gunAdi}`;
    } else {
      return `${gun} ${ay} ${dateYear}`;
    }
  }
}
