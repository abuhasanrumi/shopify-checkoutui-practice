import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import {
  useExtensionApi,
  useApplyCartLinesChange,
  render,
  BlockLayout,
  BlockStack,
  InlineLayout,
  InlineSpacer,
  Button,
  Image,
  BlockSpacer,
  Text,
  Heading,
  Grid,
  View
} from '@shopify/checkout-ui-extensions-react'

render('Checkout::Dynamic::Render', () => <App />)

function App() {
  const { extensionPoint } = useExtensionApi()
  const templateId = 33
  const [widgetData, setWidgetData] = useState('')

  const fetchUrl =
    'https://tom-iron-tracked-chambers.trycloudflare.com/api/dynamatic/checkout-info?shop=mehedi-test-store.myshopify.com&user-email=khmehedi.dev.llc@gmail.com&products=&widget-position=purchase.checkout.block.render&user-phone=undefined'

  useEffect(() => {
    fetch(fetchUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.json()
      })
      .then((data) => {
        data?.campaigns[0]?.widgets?.map((widget) => {
          // console.log(widget)
          if (widget?.template == templateId) {
            // console.log(widget)
            setWidgetData(widget)
          }
        })
      })
      .catch((error) => {
        console.error('Fetch error:', error)
      })
  }, [])

  function getRandomItemFromArray(array) {
    if (Array.isArray(array) && array.length > 0) {
      const randomIndex = Math.floor(Math.random() * array.length)
      return array[randomIndex]
    } else {
      return null
    }
  }

  const productsArray =
    widgetData?.products_in_widget?.products[0]?.product_variants
  const randomlySelectedProduct = getRandomItemFromArray(productsArray)

  console.log(randomlySelectedProduct)

  const applyCartLinesChange = useApplyCartLinesChange()
  const onClickAddToCart = async (product) => {
    let result = await applyCartLinesChange({
      type: 'addCartLine',
      merchandiseId: `gid://shopify/ProductVariant/${product.variant_id}`,
      quantity: 1
    })
  }

  return (
    <BlockLayout
      rows={[20, 'fill']}
      border='base'
      cornerRadius='base'
      padding='base'
      spacing='large500'
      borderRadius='10px'>
      <View>
        <Text size={'extraLarge'}>YOU MAY ALSO LIKE</Text>
      </View>
      {randomlySelectedProduct != null && (
        <Grid
          columns={['30%', 'fill', 'auto']}
          rows={['auto']}
          blockAlignment='center'
          spacing='base'>
          <View>
            <Image
              cornerRadius='base'
              source={
                widgetData?.products_in_widget?.products[0]?.product_image
              }
            />
          </View>
          <View>
            <Heading size={'large'} spacing='loose'>
              {randomlySelectedProduct?.display_name}
            </Heading>
            <BlockSpacer spacing='base' />
            <Text size={'medium'}>
              {`$${randomlySelectedProduct?.variant_price}`}
            </Text>
          </View>

          <View>
            <Button
              onPress={() => {
                onClickAddToCart(randomlySelectedProduct)
              }}>
              {widgetData?.property?.button_text}
            </Button>
          </View>
        </Grid>
      )}
    </BlockLayout>
  )
}
