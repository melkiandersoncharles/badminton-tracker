export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div
      className="grid gap-2 rounded-2xl bg-[#143328] p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-xl py-2.5 text-sm font-bold ${
            value === option.value ? 'bg-[#f0c14b] text-[#0c1f18]' : 'text-[#9bb5a8]'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
