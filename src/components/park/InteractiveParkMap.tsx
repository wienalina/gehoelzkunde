/**
 * Platzhalter. Die echte Karte kommt in einer eigenen Phase und wird aus dem
 * Gehölzkundeführer entwickelt. Bis dahin: keine erfundenen Koordinaten,
 * keine Fantasiekarte, die später schwer zu ersetzen wäre.
 */
export default function InteractiveParkMap() {
  return (
    <div className="aspect-[4/3] border border-dashed border-line rounded-xl2 grid place-items-center text-center px-6 bg-mist">
      <div>
        <p className="text-[16px] font-medium">Interaktive Karte</p>
        <p className="text-[14px] text-muted mt-1">
          Wird aus dem Gehölzkundeführer entwickelt, sobald die Standorte
          Blatt für Blatt übertragen sind.
        </p>
      </div>
    </div>
  )
}
