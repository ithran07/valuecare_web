// Vite environment types
/// <reference types="vite/client" />

// CSS imports
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

// PNG image imports
declare module "*.png" {
  const value: string;
  export default value;
}
