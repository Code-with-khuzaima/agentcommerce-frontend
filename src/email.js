export function sendTemplateEmail(serviceId, templateId, params, publicKey) {
  const client = window.emailjs;
  if (!client || typeof client.send !== "function") {
    throw new Error("Email service unavailable");
  }

  return client.send(serviceId, templateId, params, publicKey);
}
