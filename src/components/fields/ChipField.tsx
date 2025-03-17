import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChipFieldConfig } from '../../types/form';

interface ChipFieldProps {
  config: ChipFieldConfig;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  disabled?: boolean;
}

export const ChipField = React.memo<ChipFieldProps>(({
  config,
  value = [],
  onChange,
  error,
  disabled
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const fieldId = useMemo(() => `chip-${config.id}`, [config.id]);
  const listboxId = useMemo(() => `${fieldId}-listbox`, [fieldId]);

  // Memoize filtered suggestions
  const suggestions = useMemo(() => {
    if (!inputValue.trim()) return [];
    
    const searchTerm = inputValue.toLowerCase();
    return config.options.filter(
      option => 
        option.toLowerCase().includes(searchTerm) &&
        !value.includes(option)
    );
  }, [inputValue, config.options, value]);

  // Update dropdown state when suggestions change
  useEffect(() => {
    setIsOpen(suggestions.length > 0);
    setHighlightedIndex(-1);
  }, [suggestions]);

  // Memoize click outside handler
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      suggestionsRef.current &&
      !suggestionsRef.current.contains(event.target as Node) &&
      !inputRef.current?.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  }, []);

  // Setup click outside listener
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  // Announce changes for screen readers
  const announceForScreenReader = useCallback((message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  // Memoize input change handler
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  // Memoize key down handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      const newValue = value.slice(0, -1);
      onChange(newValue);
      announceForScreenReader(`Removed ${value[value.length - 1]}`);
      return;
    }

    if (e.key === 'ArrowDown' && suggestions.length > 0) {
      e.preventDefault();
      setHighlightedIndex(prev => {
        const newIndex = prev < suggestions.length - 1 ? prev + 1 : prev;
        announceForScreenReader(`${suggestions[newIndex]} highlighted`);
        return newIndex;
      });
      return;
    }

    if (e.key === 'ArrowUp' && suggestions.length > 0) {
      e.preventDefault();
      setHighlightedIndex(prev => {
        const newIndex = prev > 0 ? prev - 1 : prev;
        if (newIndex >= 0) {
          announceForScreenReader(`${suggestions[newIndex]} highlighted`);
        }
        return newIndex;
      });
      return;
    }

    if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      const newChip = suggestions[highlightedIndex];
      if (!value.includes(newChip) && (!config.maxItems || value.length < config.maxItems)) {
        const newValue = [...value, newChip];
        onChange(newValue);
        setInputValue('');
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.focus();
        announceForScreenReader(`Added ${newChip}`);
      }
      return;
    }

    if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
      announceForScreenReader('Suggestions closed');
    }
  }, [inputValue, value, suggestions, highlightedIndex, config.maxItems, onChange, announceForScreenReader]);

  // Memoize add chip handler
  const addChip = useCallback((chip: string) => {
    if (!value.includes(chip) && (!config.maxItems || value.length < config.maxItems)) {
      const newValue = [...value, chip];
      onChange(newValue);
      setInputValue('');
      setIsOpen(false);
      setHighlightedIndex(-1);
      inputRef.current?.focus();
      announceForScreenReader(`Added ${chip}`);
    }
  }, [value, config.maxItems, onChange, announceForScreenReader]);

  // Memoize remove chip handler
  const removeChip = useCallback((chipToRemove: string, index: number) => {
    const newValue = value.filter(chip => chip !== chipToRemove);
    onChange(newValue);
    announceForScreenReader(`Removed ${chipToRemove}`);
  }, [value, onChange, announceForScreenReader]);

  // Memoize computed values
  const fieldLabel = useMemo(() => config.label || 'items', [config.label]);
  const isMaxItemsReached = useMemo(() => 
    config.maxItems ? value.length >= config.maxItems : false,
    [config.maxItems, value.length]
  );
  const showMinItemsMessage = useMemo(() => 
    config.minItems && value.length < config.minItems,
    [config.minItems, value.length]
  );

  return (
    <div className="w-full">
      <label 
        id={`${fieldId}-label`}
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {config.label}
        {config.required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>
      <div className="space-y-2">
        {/* Input field */}
        <div className="relative">
          <input
            ref={inputRef}
            id={fieldId}
            type="text"
            className={`w-full px-3 py-2 border rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder={!isMaxItemsReached ? config.placeholder : ''}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={disabled || isMaxItemsReached}
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-activedescendant={highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined}
            aria-labelledby={`${fieldId}-label`}
            aria-required={config.required || undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${fieldId}-error` : undefined}
          />
          {/* Suggestions dropdown */}
          {isOpen && suggestions.length > 0 && !disabled && (
            <div
              ref={suggestionsRef}
              id={listboxId}
              role="listbox"
              className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
              aria-label={`Suggestions for ${config.label}`}
            >
              {suggestions.map((suggestion, index) => (
                <div
                  id={`${listboxId}-option-${index}`}
                  key={suggestion}
                  role="option"
                  aria-selected={index === highlightedIndex}
                  className={`px-4 py-2 cursor-pointer text-sm ${
                    index === highlightedIndex
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => addChip(suggestion)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chips display */}
        {value.length > 0 && (
          <div 
            className="flex flex-wrap gap-2 mt-2"
            role="list"
            aria-label={`Selected ${fieldLabel}`}
          >
            {value.map((chip, index) => (
              <div
                key={chip}
                role="listitem"
                className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm group hover:bg-blue-200 transition-colors"
              >
                <span>{chip}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeChip(chip, index)}
                    className="text-blue-600 hover:text-blue-800 focus:outline-none opacity-75 group-hover:opacity-100"
                    aria-label={`Remove ${chip}`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Helper text and errors */}
        {error && (
          <p 
            id={`${fieldId}-error`}
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
        {showMinItemsMessage && (
          <p className="mt-1 text-sm text-gray-500">
            Please select at least {config.minItems} {fieldLabel.toLowerCase()}
          </p>
        )}
        {isMaxItemsReached && (
          <p className="mt-1 text-sm text-gray-500">
            Maximum {config.maxItems} {fieldLabel.toLowerCase()} reached
          </p>
        )}
      </div>
    </div>
  );
});

ChipField.displayName = 'ChipField';