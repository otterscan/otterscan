import React, { FormEvent, useState } from "react";

interface BlockNumberInputProps {
  onSearch: (blockNumber: string) => void;
  placeholder?: string;
}

const BlockNumberInput: React.FC<BlockNumberInputProps> = ({
  onSearch,
  placeholder,
}) => {
  const [blockNumber, setBlockNumber] = useState("");

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (blockNumber.trim()) {
      onSearch(blockNumber.trim());
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center">
      <input
        type="number"
        min="0"
        className="w-48 rounded-sm border px-2 py-1 text-sm text-gray-600"
        value={blockNumber}
        onChange={(e) => setBlockNumber(e.target.value)}
        placeholder={placeholder}
      />
      <button
        type="submit"
        className="ml-2 rounded-sm border bg-skin-button-fill px-3 py-1 text-left text-sm text-skin-button hover:bg-skin-button-hover-fill"
      >
        Go
      </button>
    </form>
  );
};

export default BlockNumberInput;
