"use client"

import { type MouseEventHandler, type ReactNode } from "react";

export type NavigationButtonProps = {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  children?: ReactNode;
};

export type CustomNavigationProps = {
  onPreviousClick?: () => void;
  onNextClick?: () => void;
  goToMonth?: (date: Date) => void;
  currentMonth: Date;
};

export function NavigationButton(props: NavigationButtonProps) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={props.className}
    >
      {props.children}
    </button>
  );
}

export function CustomNavigation(props: CustomNavigationProps) {
  return (
    <div className="space-x-1 flex items-center">
      <NavigationButton
        onClick={() => props.onPreviousClick?.()}
        className="absolute left-1 h-7 w-7 p-0 opacity-50 hover:opacity-100"
      >
        <svg 
          className="h-4 w-4" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <title>Önceki Ay</title>
          <path d="m15 18-6-6 6-6" />
        </svg>
      </NavigationButton>
      <NavigationButton
        onClick={() => props.onNextClick?.()}
        className="absolute right-1 h-7 w-7 p-0 opacity-50 hover:opacity-100"
      >
        <svg 
          className="h-4 w-4" 
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <title>Sonraki Ay</title>
          <path d="m9 18 6-6-6-6" />
        </svg>
      </NavigationButton>
    </div>
  );
}
