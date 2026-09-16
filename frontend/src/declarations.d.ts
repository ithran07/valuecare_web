// Fixes the issue for your CSS imports
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

// Fixes the issue for your PNG image imports
declare module "*.png" {
  const value: string;
  export default value;
}
