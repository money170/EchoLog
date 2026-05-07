import { coreCategories, type JournalCategory } from '../types/journal'

interface CategorySelectorProps {
  category: JournalCategory
  customCategory: string
  onCategoryChange: (value: JournalCategory) => void
  onCustomCategoryChange: (value: string) => void
}

export const CategorySelector = ({
  category,
  customCategory,
  onCategoryChange,
  onCustomCategoryChange,
}: CategorySelectorProps) => (
  <div className="stack-sm">
    <label className="field-label" htmlFor="category">
      Category
    </label>
    <select
      id="category"
      value={category}
      onChange={(e) => onCategoryChange(e.target.value as JournalCategory)}
      className="input"
    >
      {coreCategories.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
      <option value="Custom">Custom</option>
    </select>
    {category === 'Custom' && (
      <input
        className="input"
        placeholder="Custom category name"
        value={customCategory}
        onChange={(e) => onCustomCategoryChange(e.target.value)}
      />
    )}
  </div>
)
