"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { type Option } from "@/data/catalog";

export function CustomSelect({
  options,
  defaultValue,
  onChange,
  name,
  className = "",
  searchable = false,
}: {
  options: Option[];
  defaultValue: string;
  onChange?: (val: string) => void;
  name: string;
  className?: string;
  searchable?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === selected) || options[0];

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchTerm) return options;
    return options.filter((o) => o.label.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [options, searchTerm, searchable]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSelected(defaultValue);
  }, [defaultValue]);

  const handleSelect = (val: string) => {
    setSelected(val);
    if (onChange) onChange(val);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <input type="hidden" name={name} value={selected} />
      <div
        className="flex items-center gap-3 p-3 bg-[var(--bg-faint)] border border-[var(--border-light)] rounded-2xl cursor-pointer hover:border-[var(--primary)] transition-all h-[52px]"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption?.img && (
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            {selected === "CUSTOM" ? (
              <Image src="/icons/common/stars.svg" alt="" width={32} height={32} className="object-contain" />
            ) : (
              <Image src={selectedOption.img} alt="" width={32} height={32} className="object-contain" />
            )}
          </div>
        )}
        <span className="flex-1 text-sm font-bold text-[var(--text)]">{selectedOption?.label}</span>
        <span className={`text-[var(--text-gray)] transition-transform ${isOpen ? "rotate-180" : ""}`}>▼</span>
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-[var(--white)] border border-[var(--border-light)] rounded-2xl shadow-xl max-h-80 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
          {searchable && (
            <div className="p-2 border-b border-[var(--border-light)] bg-[var(--bg-faint)]">
              <input
                type="text"
                className="w-full p-2 text-xs rounded-xl border border-[var(--border)] outline-none focus:border-[var(--primary)] bg-[var(--white)]"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <div className="overflow-y-auto max-h-60">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-xs text-[var(--text-gray)] opacity-50 italic">Sin resultados.</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-center gap-3 p-3 hover:bg-[var(--primary)]/10 cursor-pointer transition-colors ${selected === option.value ? "bg-[var(--primary)]/5" : ""}`}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.img && (
                    <div className="w-7 h-7 flex items-center justify-center shrink-0">
                      {option.value === "CUSTOM" ? (
                        <Image src="/icons/common/stars.svg" alt="" width={32} height={32} className="object-contain" />
                      ) : (
                        <Image src={option.img} alt="" width={28} height={28} className="object-contain" />
                      )}
                    </div>
                  )}
                  <span className="text-sm font-medium text-[var(--text)]">{option.label}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
