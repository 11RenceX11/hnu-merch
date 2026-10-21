/**
 * When an admin creates a product, its web address does not exist yet.
 * A pin can use this special value to mean "this product", and the server
 * replaces it with the real slug when the product is saved.
 */
export const SELF_PIN_TARGET = "__self__";
