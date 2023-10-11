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
  const fetchUrl =
    'https://orange-anthony-jones-vintage.trycloudflare.com/api/dynamatic/checkout-info?shop=mehedi-test-store.myshopify.com&user-email=khmehedi.dev.llc@gmail.com&products=&widget-position=purchase.checkout.block.render&user-phone=undefined'

  const [widgetData, setWidgetData] = useState('')
  const [added, setAdded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [btnLoading, setBtnLoading] = useState(false)
  const [products, setProducts] = useState(false)
  const [currentProductIndex, setCurrentProductIndex] = useState(0)
  const [variantId, setVariantId] = useState('')
  const applyCartLinesChange = useApplyCartLinesChange()
  const cartLines = useCartLines()

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
          if (widget?.template === templateId) {
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

  // Declare currentDisplayedProduct
  const currentDisplayedProduct = products[currentProductIndex]

  const options = currentDisplayedProduct?.product_variants.map(
    (variant, index) => ({
      value: `${variant.variant_id}`,
      label: `$${variant.variant_price}`
    })
  )

  function getGid(id) {
    console.log('getgid', id)
    return `gid://shopify/ProductVariant/${id}`
  }

  function getCartLineItemId(variantId) {
    const cartLine = cartLines?.find(
      (item) => item?.merchandise.id === variantId
    )
    return cartLine?.id || ''
  }

  const handleNextProduct = () => {
    if (products?.length > 0) {
      const nextIndex = (currentProductIndex + 1) % products.length
      setCurrentProductIndex(nextIndex)
    }
  }

  const handlePrevProduct = () => {
    if (products?.length > 0) {
      const prevIndex =
        currentProductIndex === 0
          ? products.length - 1
          : currentProductIndex - 1
      setCurrentProductIndex(prevIndex)
    }
  }

  const onClickAddToCart = async (product) => {
    setBtnLoading(true)
    let merchandiseId = ''
    if (variantId) {
      merchandiseId = getGid(variantId)
    } else {
      const selectedVariant = product?.product_variants[0]
      merchandiseId = getGid(selectedVariant?.variant_id)
    }

    if (merchandiseId) {
      console.log(merchandiseId)
      const result = await applyCartLinesChange({
        type: 'addCartLine',
        merchandiseId,
        quantity: 1
      })
      setAdded(true)
      setVariantId('')
    }

    setBtnLoading(false)
  }

  return (
    !added && (
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
                {currentDisplayedProduct?.product_variants?.length == 1 ? (
                  <Text
                    size={
                      'medium'
                    }>{`$${currentDisplayedProduct?.product_variants[0]?.variant_price}`}</Text>
                ) : (
                  <Select
                    label='Variants'
                    value={variantId}
                    options={options}
                    onChange={(e) => {
                      setVariantId(e)
                    }}
                  />
                )}
              </View>
            </View>

            <View>
              <Button
                loading={btnLoading}
                onPress={() => {
                  onClickAddToCart(currentDisplayedProduct)
                }}>
                {widgetData?.property?.button_text}
              </Button>
            </View>
            <Button appearance='accent' onPress={() => handleNextProduct()}>
              <Icon appearance='interactive' source='chevronRight' />
            </Button>
          </Grid>
        )}
      </BlockLayout>
    )
  )
}
