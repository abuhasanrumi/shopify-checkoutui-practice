// @ts-check
import { DiscountApplicationStrategy } from "../generated/api";

// Use JSDoc annotations for type safety
/**
* @typedef {import("../generated/api").InputQuery} InputQuery
* @typedef {import("../generated/api").FunctionResult} FunctionResult
* @typedef {import("../generated/api").Target} Target
* @typedef {import("../generated/api").ProductVariant} ProductVariant
*/

/**
 * @type {FunctionResult}
 */
const EMPTY_DISCOUNT = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

export default /**
 * @param {InputQuery} input
 * @returns {FunctionResult}
 */
  (input) => {
    const targets = input.cart.lines.filter(line => line.merchandise.__typename == "ProductVariant").map(line => {
      const variant = /** @type {ProductVariant} */ (line.merchandise);
      return /** @type {Target} */ ({
        // Use the variant ID to create a discount target
        productVariant: {
          id: variant.id
        }
      });
    })

    if (targets.find(i => i.productVariant.id === 'gid://shopify/ProductVariant/44807032045844')) {
      return {
        discounts: [
          {
            // Apply the discount to the collected targets
            targets,
            // Define a percentage-based discount
            value: {
              percentage: {
                value: "10.0"
              }
            }
          }
        ],
        discountApplicationStrategy: DiscountApplicationStrategy.First
      };
    } else {
      console.error("did not match the variant id");
      return EMPTY_DISCOUNT;
    }
  };
