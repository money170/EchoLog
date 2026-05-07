interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => (
  <input
    className="input"
    placeholder="Search transcript, title, tags..."
    value={value}
    onChange={(e) => onChange(e.target.value)}
  />
)
