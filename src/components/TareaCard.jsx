export default function TareaCard({ orden }) {
  return (
    <div className='tarea-card'>
      <h3>{orden?.motor || 'Motor sin nombre'}</h3>

      <p><b>Cliente:</b> {orden?.cliente || '-'}</p>
      <p><b>Mecánico:</b> {orden?.mecanico || '-'}</p>
      <p><b>Entrega:</b> {orden?.fecha_entrega || '-'}</p>

      <a href={'/gestor/' + orden?.id}>Ver detalle →</a>
    </div>
  )
}
