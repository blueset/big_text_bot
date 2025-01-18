import 'react';

declare module 'react' {
  interface DetailsHTMLAttributes<T> extends HTMLAttributes<T> {
    name?: string;
  }
}