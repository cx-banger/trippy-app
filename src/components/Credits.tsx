import credits from '../photo-credits.json'
import { img } from '../data'
import { Sheet } from './ui'

/** Attribution for the Wikimedia Commons photos (required by their CC BY / CC BY-SA licences). */
export default function CreditsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose}>
      <h2 className="font-display text-xl font-semibold">Crédits photos</h2>
      <p className="mt-1 text-sm text-neutral-500">Photos de Wikimedia Commons, redimensionnées pour l'appli.</p>
      <ul className="mt-4 space-y-3">
        {credits.map((c) => (
          <li key={c.image} className="flex items-center gap-3 rounded-2xl bg-white p-3 text-sm dark:bg-raised-dark">
            <img src={img(c.image)} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0">
              <a href={c.source} target="_blank" rel="noreferrer" className="block truncate font-medium underline-offset-2 hover:underline">
                {c.title}
              </a>
              <p className="text-neutral-500">
                {c.author} ·{' '}
                {c.licenceUrl ? (
                  <a href={c.licenceUrl} target="_blank" rel="noreferrer" className="text-sky">
                    {c.licence}
                  </a>
                ) : (
                  c.licence
                )}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Sheet>
  )
}
