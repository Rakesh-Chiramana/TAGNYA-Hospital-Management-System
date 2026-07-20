import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [k: string]: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

export {};

