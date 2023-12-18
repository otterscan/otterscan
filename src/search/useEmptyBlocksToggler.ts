import {useState} from "react";

export enum EmptyBlocksDisplay {
  SHOW_EMPTY_BLOCKS = 0,
  HIDE_EMPTY_BLOCKS = 1,
}

export const useEmptyBlocksToggler = (): [ EmptyBlocksDisplay, () => void] => {
  const [ emptyBlocksDisplay, setEmptyBlocksDisplay ] = useState<EmptyBlocksDisplay>(EmptyBlocksDisplay.HIDE_EMPTY_BLOCKS);
  const emptyBlocksDisplayToggler = () => {
    if (emptyBlocksDisplay === EmptyBlocksDisplay.HIDE_EMPTY_BLOCKS) {
      setEmptyBlocksDisplay(EmptyBlocksDisplay.SHOW_EMPTY_BLOCKS);
    } else {
      setEmptyBlocksDisplay(EmptyBlocksDisplay.HIDE_EMPTY_BLOCKS);
    }
  };
  return [ emptyBlocksDisplay, emptyBlocksDisplayToggler ]
};


