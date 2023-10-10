import {
  BlockLayout,
  BlockSpacer,
  Button,
  Heading,
  Grid,
  Image,
  Text,
  View,
  render,
  useApplyCartLinesChange,
  useCartLines,
  useExtensionApi
} from '@shopify/checkout-ui-extensions-react'
import React, { useEffect, useState } from 'react'
import ProductSkeleton from './utils/productSkeleton'

render('Checkout::Dynamic::Render', () => <App />)

function App() {
  const { extensionPoint } = useExtensionApi()
  const templateId = 33
  const [widgetData, setWidgetData] = useState('')
  const [added, setAdded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [btnLoading, setBtnLoading] = useState(false)
  // const currencyCode = useCurrency()
  // console.log(currencyCode)

  const fetchUrl =
    'https://tom-iron-tracked-chambers.trycloudflare.com/api/dynamatic/checkout-info?shop=mehedi-test-store.myshopify.com&user-email=khmehedi.dev.llc@gmail.com&products=&widget-position=purchase.checkout.block.render&user-phone=undefined'

  useEffect(() => {
    setLoading(true)
    fetch(fetchUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.json()
      })
      .then((data) => {
        data?.campaigns[0]?.widgets?.map((widget) => {
          if (widget?.template == templateId) {
            setWidgetData(widget)
          }
        })
        setLoading(false)
      })
      .catch((error) => {
        setLoading(false)
        console.error('Fetch error:', error)
      })
  }, [])

  // function getRandomItemFromArray(array) {
  //   if (Array.isArray(array) && array.length > 0) {
  //     const randomIndex = Math.floor(Math.random() * array.length)
  //     return array[randomIndex]
  //   } else {
  //     return null
  //   }
  // }

  const product =
    widgetData?.products_in_widget?.products[0]?.product_variants[0]

  const applyCartLinesChange = useApplyCartLinesChange()
  const cartLines = useCartLines()

  function getGid(id) {
    return `gid://shopify/ProductVariant/${id}`
  }

  function getCartLineItemId(variantId) {
    const cartLine = cartLines?.find(
      (item) => item?.merchandise.id === variantId
    )
    return cartLine?.id || ''
  }

  const onClickAddToCart = async (product) => {
    setBtnLoading(true)
    const merchandiseId = getGid(product.variant_id)
    const result = await applyCartLinesChange({
      type: 'addCartLine',
      merchandiseId,
      quantity: 1
    })
    setAdded(true)
    setBtnLoading(false)
  }

  const onClickRemoveFromCart = async (product) => {
    setBtnLoading(true)
    const variantId = getGid(product?.variant_id)
    const cartLineId = getCartLineItemId(variantId)
    const result = await applyCartLinesChange({
      type: 'removeCartLine',
      id: getGid(cartLineId),
      quantity: 1
    })
    setAdded(false)
    setBtnLoading(false)
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
        <Text size={'extraLarge'}>You may also like</Text>
      </View>
      {loading && <ProductSkeleton />}
      {product != null && !loading && (
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
              {product?.display_name}
            </Heading>
            <BlockSpacer spacing='base' />
            <Text size={'medium'}>{`$${product?.variant_price}`}</Text>
          </View>

          <View>
            {added == false ? (
              <Button
                loading={btnLoading}
                onPress={() => {
                  onClickAddToCart(product)
                }}>
                {widgetData?.property?.button_text}
              </Button>
            ) : (
              <Button
                loading={btnLoading}
                appearance='critical'
                onPress={() => {
                  onClickRemoveFromCart(product)
                }}>
                Remove
              </Button>
            )}
          </View>
        </Grid>
      )}
    </BlockLayout>
  )
}
