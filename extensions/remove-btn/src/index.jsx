import {
  Button,
  render,
  useApplyCartLinesChange
} from '@shopify/checkout-ui-extensions-react'
import React from 'react'

render('purchase.checkout.cart-line-item.render-after', (product) => (
  <App product={product} />
))

function App({ product }) {
  const applyCartLinesChange = useApplyCartLinesChange()

  async function handleClick() {
    const id = product.target.current.lines[0].id
    await applyCartLinesChange({
      type: 'removeCartLine',
      id,
      quantity: 1
    })
  }

  return (
    <Button kind='plain' onPress={handleClick}>
      Remove
    </Button>
  )
}
