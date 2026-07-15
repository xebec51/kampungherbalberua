export function createWhatsAppUrl(phoneNumber: string | null, message: string) {
  if (!phoneNumber) {
    return null;
  }

  const normalizedNumber = phoneNumber.replace(/\D/g, "");

  if (!normalizedNumber) {
    return null;
  }

  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
}
