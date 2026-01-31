export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}


export function formatCurrency(amount) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date) {
  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getStatusColor(status) {
  const colors = {
    pendiente: "bg-yellow-100 text-yellow-800",
    "en-proceso": "bg-blue-100 text-blue-800",
    finalizado: "bg-green-100 text-green-800",
    entregado: "bg-purple-100 text-purple-800",
    cancelado: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-stone-100 text-stone-800";
}

export function getStatusText(status) {
  const texts = {
    pendiente: "Pendiente",
    "en-proceso": "En Proceso",
    finalizado: "Finalizado",
    entregado: "Entregado",
    cancelado: "Cancelado",
  };
  return texts[status] || status;
}
