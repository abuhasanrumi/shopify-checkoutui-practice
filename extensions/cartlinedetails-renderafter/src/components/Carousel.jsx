import { useEffect, useState } from 'react';
import { useExtensionApi, BlockStack, Heading, Button, Icon, Grid, InlineStack, Image, Text, TextBlock, SkeletonImage, SkeletonText } from '@shopify/checkout-ui-extensions-react';

export default function Carousel({ data, includedTrue }) {
  const includedTrueIds = []
  const { i18n, applyCartLinesChange, extensionPoint } = useExtensionApi()
  includedTrue?.current?.filter(i => i.position === extensionPoint)?.forEach(i => includedTrueIds.push(i.id))

  const [products, setProducts] = useState(() => {
    const productsArray = []
    data?.widgets?.at(0).selected_feeds.forEach(i => JSON.parse(i.products)?.forEach(j => productsArray.push(j)))
    return productsArray
  })
  const [filteredProducts, setFilteredProducts] = useState(Array.from({ length: 1 }))
  const [skeleton, setSkeleton] = useState(true)
  const [next, setNext] = useState(0)
  const [loading, setLoading] = useState({})
  const [boughtProducts, setBoughtProducts] = useState([])
  const [isBuying, setIsBuying] = useState(false)

  useEffect(() => {
    let tempNext = next
    if (products.length) {
      const emptyArray = []
      const oldProducts = structuredClone(products)
      function pushFunc() {
        oldProducts.forEach((i, j) => {
          if (j >= tempNext && emptyArray.length < productOnScreen) emptyArray.push(i)
        })
      }
      pushFunc()
      if (!emptyArray.length) {
        tempNext = 0
        setNext(0)
        pushFunc()
      }
      setFilteredProducts(emptyArray)
    }
  }, [products, next])

  useEffect(() => {
    if (skeleton) {
      const timer = setTimeout(() => setSkeleton(false), 500)
      const clearTimer = setTimeout(() => clearTimeout(timer), 500)

      return () => clearTimeout(clearTimer)
    }
  }, [skeleton])

  useEffect(() => {
    const oldProducts = structuredClone(products)
    const allVariants = products.map(product => product?.node?.variants?.nodes?.at(0)?.id)
    const filteredVariants = allVariants.filter(variant => !boughtProducts.includes(variant))
    const filteredOldProducts = oldProducts.filter(product => filteredVariants.includes(product?.node?.variants?.nodes?.at(0)?.id))
    !isBuying && setProducts(filteredOldProducts)
  }, [boughtProducts, isBuying])

  const feeds = []
  data?.widgets?.find(widget => widget?.widget_position === extensionPoint)?.selected_feeds?.forEach(feed => feeds.push(feed?.products))
  const feedsWithId = []
  data?.widgets?.find(widget => widget?.widget_position === extensionPoint)?.selected_feeds?.forEach(feed => JSON.parse(feed?.products).forEach(product => feedsWithId.push({ variantId: product?.node?.variants?.nodes?.at(0)?.id, feedId: feed.id })))

  if (!feeds.length || extensionPoint === 'Checkout::CartLineDetails::RenderAfter') return <></>
  else return (
    <>
      <BlockStack border='base' padding='base' borderRadius='base'>
        {/* heading and buttons */}
        {
          JSON.parse(data?.widgets?.at(0)?.widget_customization)?.scroll_button_visibility ||
            JSON.parse(data?.widgets?.at(0)?.widget_customization)?.title_visibility ?
            <Grid columns={['fill', 'auto']}>
              {
                JSON.parse(data?.widgets.at(0)?.widget_customization)?.title_visibility ?
                  <Heading level={3}>{JSON.parse(data?.widgets?.at(0)?.widget_customization)?.title?.carousel || 'You may also like'}</Heading>
                  : null
              }
              {
                JSON.parse(data?.widgets?.at(0)?.widget_customization)?.scroll_button_visibility ?
                  <InlineStack inlineAlignment='end'>
                  </InlineStack>
                  : null
              }
            </Grid>
            : null
        }

        {/* products */}
        <Grid spacing='base' columns={['auto', 'fill', 'auto']}>
          <Button
            disabled={next === 0}
            onPress={() => {
              setSkeleton(true)
              setNext(state => next === 0 ? state : state - 1)
            }} kind='plain'><Icon source='chevronLeft' /></Button>
          {
            filteredProducts.map((product, _index) => {
              const ids = []
              feedsWithId.filter(feed => product?.node?.variants?.nodes?.at(0)?.id === feed.variantId)?.forEach(id => ids.push(id.feedId))
              return (
                <BlockStack key={product?.node?.id || Math.random()} border='base' padding='base' borderRadius='base' spacing='extraTight'>
                  {
                    skeleton || !product?.node?.featuredImage?.url ?
                      <SkeletonImage inlineSize={300} blockSize={100} />
                      :
                      <Image aspectRatio={1.5} fit='contain' borderRadius='base' source={product?.node?.featuredImage?.url} />
                  }
                  <TextBlock inlineAlignment='center'>
                    {
                      skeleton || !product?.node?.title ?
                        <SkeletonText />
                        :
                        <Text size='small'>{product?.node?.title}</Text>
                    }
                  </TextBlock>
                  <TextBlock inlineAlignment='center'>
                    {
                      skeleton || !product?.node?.variants?.nodes?.at(0)?.price ?
                        <SkeletonText />
                        :
                        <Text appearance='subdued' size='small'>{i18n.formatCurrency(product?.node?.variants?.nodes?.at(0)?.price)}</Text>
                    }
                  </TextBlock>
                  <InlineStack inlineAlignment='center'>
                    {
                      skeleton || !product?.node?.variants?.nodes?.at(0)?.price ?
                        <SkeletonText />
                        :
                        <Button
                          loading={loading[product?.node?.variants?.nodes?.at(0)?.id]}
                          onPress={() => {
                            setIsBuying(true)
                            const oldBoughtProducts = structuredClone(boughtProducts)
                            oldBoughtProducts.push(product?.node?.variants?.nodes?.at(0)?.id)
                            setBoughtProducts(oldBoughtProducts)
                            const newLoading = JSON.parse(JSON.stringify(loading))
                            newLoading[product?.node?.variants?.nodes?.at(0)?.id] = true
                            setLoading(newLoading)
                            applyCartLinesChange({
                              type: 'addCartLine',
                              merchandiseId: product?.node?.variants?.nodes?.at(0)?.id,
                              quantity: 1,
                              attributes: [
                                { key: '__nvd-position', value: extensionPoint },
                                { key: '__nvd-location', value: 'Checkout Page' },
                                { key: '__nvd-feed-id', value: JSON.stringify(ids) },
                                { key: '__nvd-wdg-id', value: data?.widgets?.at(0)?.id?.toString() },
                                { key: '__nvd-sg-id', value: JSON.stringify([...new Set(includedTrueIds)]) }
                              ]
                            })
                              .finally(() => {
                                const newLoading = JSON.parse(JSON.stringify(loading))
                                newLoading[product?.node?.variants?.nodes?.at(0)?.id] = false
                                setLoading(newLoading)
                                setIsBuying(false)
                              })
                          }}
                        >{JSON.parse(data?.widgets?.at(0)?.widget_customization)?.cta || 'Add to cart'}</Button>
                    }
                  </InlineStack>
                </BlockStack>
              )
            })
          }
          <Button
            disabled={products.length - next <= 1}
            onPress={() => {
              setSkeleton(true)
              setNext(state => products.length - next > 1 ? state + 1 : state + products.length - next)
            }} kind='plain'><Icon source='chevronRight' /></Button>
        </Grid>
      </BlockStack>
    </>
  )
}