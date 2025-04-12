declare namespace NodeJS {
  interface Timeout {}
}

// In case needed for JSX attributes in style elements
declare namespace JSX {
  interface IntrinsicElements {
    style: React.DetailedHTMLProps<React.StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement> & {
      jsx?: boolean;
    };
  }
} 