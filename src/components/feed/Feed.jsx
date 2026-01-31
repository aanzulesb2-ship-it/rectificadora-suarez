'use client'
import TareaCard from '../../components/TareaCard'

export default function Feed({ ordenes }) {
  if (!Array.isArray(ordenes)) return null

  return (
    <div className='feed'>
      {ordenes.map(o => (
        <TareaCard key={o.id} orden={o} />
      ))}
    </div>
  )
}

