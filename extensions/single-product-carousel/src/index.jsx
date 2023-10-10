import {
  BlockLayout,
  BlockSpacer,
  Button,
  Heading,
  Grid,
  SkeletonImage,
  SkeletonText,
  Image,
  Text,
  Select,
  Icon,
  View,
  render,
  useApplyCartLinesChange,
  useCartLines,
  useExtensionApi
} from '@shopify/checkout-ui-extensions-react'
import React, { useEffect, useState } from 'react'
// import ProductSkeleton from './utils/productSkeleton'

render('Checkout::Dynamic::Render', () => <App />)

function App() {
  const { extensionPoint } = useExtensionApi()
  const templateId = 31
  const [widgetData, setWidgetData] = useState('')
  const [added, setAdded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [btnLoading, setBtnLoading] = useState(false)
  const [products, setProducts] = useState(false)
  const applyCartLinesChange = useApplyCartLinesChange()
  const cartLines = useCartLines()

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
            setProducts(widget?.products_in_widget?.products)
          }
        })
        setLoading(false)
      })
      .catch((error) => {
        setLoading(false)
        console.error('Fetch error:', error)
      })
  }, [])

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

  const [currentProductIndex, setCurrentProductIndex] = useState(0)

  // Function to handle clicking the right arrow button
  const handleNextProduct = () => {
    if (products?.length > 0) {
      const nextIndex = (currentProductIndex + 1) % products.length
      setCurrentProductIndex(nextIndex)
    }
  }

  // Function to handle clicking the left arrow button
  const handlePrevProduct = () => {
    if (products?.length > 0) {
      const prevIndex =
        currentProductIndex === 0
          ? products.length - 1
          : currentProductIndex - 1
      setCurrentProductIndex(prevIndex)
    }
  }

  const currentDisplayedProduct = products[currentProductIndex]

  return (
    <BlockLayout
      rows={['auto', 'fill']}
      border='base'
      cornerRadius='base'
      padding='base'
      spacing='large200'
      borderRadius='10px'>
      <View>
        <Text size={'extraLarge'}>You may also like</Text>
      </View>
      {loading && (
        <Grid
          columns={['5%', '20%', 'fill', 'auto', '5%']}
          rows={['auto']}
          blockAlignment='center'
          spacing='base'>
          <SkeletonImage inlineSize={10} blockSize={20} />
          <SkeletonImage inlineSize={100} blockSize={100} />
          <View>
            <SkeletonImage inlineSize={150} blockSize={20} />
            <BlockSpacer spacing='base' />
            <SkeletonText />
          </View>
          <SkeletonImage inlineSize={100} blockSize={35} />
          <SkeletonImage inlineSize={10} blockSize={20} />
        </Grid>
      )}
      {currentDisplayedProduct != null && !loading && (
        <Grid
          columns={['5%', '20%', 'fill', 'auto', '5%']}
          rows={['auto', 'auto']}
          blockAlignment='center'
          spacing='base'>
          <Button appearance='accent' onPress={() => handlePrevProduct()}>
            <Icon appearance='interactive' source='chevronLeft' />
          </Button>
          <View>
            <Image
              cornerRadius='base'
              source={currentDisplayedProduct?.product_image}
            />
          </View>
          <View>
            <Heading size={'large'} spacing='loose'>
              {currentDisplayedProduct?.product_title}
            </Heading>
            <BlockSpacer spacing='base' />
            <View>
              {console.log(currentDisplayedProduct?.product_variants)}
              {currentDisplayedProduct?.product_variants?.length == 1 ? (
                <Text
                  size={
                    'medium'
                  }>{`$${currentDisplayedProduct?.product_variants[0]?.variant_price}`}</Text>
              ) : (
                <Select
                  label='Country'
                  value='1'
                  options={[
                    {
                      value: '1',
                      label: 'Australia'
                    },
                    {
                      value: '2',
                      label: 'Canada'
                    },
                    {
                      value: '3',
                      label: 'France'
                    },
                    {
                      value: '4',
                      label: 'Japan'
                    },
                    {
                      value: '5',
                      label: 'Nigeria'
                    },
                    {
                      value: '6',
                      label: 'United States'
                    }
                  ]}
                />
              )}
            </View>
          </View>

          <View>
            {added == false ? (
              <Button
                loading={btnLoading}
                onPress={() => {
                  onClickAddToCart(currentDisplayedProduct)
                }}>
                {widgetData?.property?.button_text}
              </Button>
            ) : (
              <Button
                loading={btnLoading}
                appearance='critical'
                onPress={() => {
                  onClickRemoveFromCart(currentDisplayedProduct)
                }}>
                Remove
              </Button>
            )}
          </View>
          <Button appearance='accent' onPress={() => handleNextProduct()}>
            <Icon appearance='interactive' source='chevronRight' />
          </Button>
        </Grid>
      )}
    </BlockLayout>
  )
}
